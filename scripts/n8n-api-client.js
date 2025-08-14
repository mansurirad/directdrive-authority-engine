#!/usr/bin/env node

/**
 * n8n Cloud API Client
 * Connects to n8n cloud instance and manages workflows
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.n8n') });

const N8N_API_KEY = process.env.N8N_API_KEY;
const N8N_BASE_URL = process.env.N8N_BASE_URL;

if (!N8N_API_KEY || !N8N_BASE_URL) {
  console.error('❌ Missing n8n credentials. Please check .env.n8n file');
  process.exit(1);
}

/**
 * Make API request to n8n cloud
 */
function makeN8nRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, N8N_BASE_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Authorization': `Bearer ${N8N_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const jsonData = JSON.parse(responseData);
            resolve(jsonData);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
          }
        } catch (error) {
          reject(new Error(`Parse error: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

/**
 * Get all workflows from n8n cloud
 */
async function getWorkflows() {
  try {
    console.log('🔍 Fetching workflows from n8n cloud...');
    const response = await makeN8nRequest('/api/v1/workflows');
    
    console.log(`✅ Found ${response.data.length} workflows:`);
    
    response.data.forEach((workflow, index) => {
      console.log(`${index + 1}. ${workflow.name} (ID: ${workflow.id})`);
      console.log(`   Active: ${workflow.active ? '✅' : '❌'}`);
      console.log(`   Nodes: ${workflow.nodes?.length || 0}`);
      console.log(`   Created: ${new Date(workflow.createdAt).toLocaleDateString()}`);
      console.log('');
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching workflows:', error.message);
    throw error;
  }
}

/**
 * Get specific workflow details
 */
async function getWorkflow(workflowId) {
  try {
    console.log(`🔍 Fetching workflow ${workflowId}...`);
    const response = await makeN8nRequest(`/api/v1/workflows/${workflowId}`);
    
    console.log(`✅ Workflow: ${response.name}`);
    console.log(`   Nodes: ${response.nodes?.length || 0}`);
    console.log(`   Connections: ${Object.keys(response.connections || {}).length}`);
    
    return response;
  } catch (error) {
    console.error('❌ Error fetching workflow:', error.message);
    throw error;
  }
}

/**
 * Download all workflows to local files
 */
async function downloadWorkflows() {
  try {
    const workflows = await getWorkflows();
    const downloadDir = path.join(__dirname, '..', 'n8n-cloud-workflows');
    
    // Create download directory
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }
    
    console.log(`📥 Downloading ${workflows.length} workflows...`);
    
    for (const workflow of workflows) {
      const fullWorkflow = await getWorkflow(workflow.id);
      const filename = `${workflow.name.replace(/[^a-zA-Z0-9]/g, '-')}-${workflow.id}.json`;
      const filepath = path.join(downloadDir, filename);
      
      fs.writeFileSync(filepath, JSON.stringify(fullWorkflow, null, 2));
      console.log(`✅ Downloaded: ${filename}`);
    }
    
    console.log(`🎉 All workflows downloaded to: ${downloadDir}`);
    
  } catch (error) {
    console.error('❌ Error downloading workflows:', error.message);
    throw error;
  }
}

// Command line interface
const command = process.argv[2];

async function main() {
  try {
    switch (command) {
      case 'list':
        await getWorkflows();
        break;
      case 'download':
        await downloadWorkflows();
        break;
      case 'get':
        const workflowId = process.argv[3];
        if (!workflowId) {
          console.error('❌ Please provide workflow ID');
          process.exit(1);
        }
        await getWorkflow(workflowId);
        break;
      default:
        console.log('📋 n8n Cloud API Client');
        console.log('');
        console.log('Commands:');
        console.log('  list      - List all workflows');
        console.log('  download  - Download all workflows');
        console.log('  get <id>  - Get specific workflow');
        console.log('');
        console.log('Examples:');
        console.log('  node n8n-api-client.js list');
        console.log('  node n8n-api-client.js download');
        console.log('  node n8n-api-client.js get 123');
    }
  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  }
}

main();