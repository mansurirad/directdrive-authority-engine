/**
 * Deploy Citation Monitoring Workflow to n8n
 * DirectDrive Authority Engine
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

class N8nWorkflowDeployer {
  constructor(config) {
    this.n8nUrl = config.n8nUrl || process.env.N8N_BASE_URL;
    this.apiKey = config.apiKey || process.env.N8N_API_KEY;
    
    if (!this.n8nUrl || !this.apiKey) {
      throw new Error('N8N_BASE_URL and N8N_API_KEY environment variables are required');
    }

    this.client = axios.create({
      baseURL: `${this.n8nUrl}/api/v1`,
      headers: {
        'X-N8N-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Deploy workflow to n8n instance
   */
  async deployWorkflow(workflowPath) {
    try {
      console.log(`Deploying workflow from: ${workflowPath}`);
      
      // Read workflow file
      const workflowData = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
      
      // Check if workflow already exists
      const existingWorkflow = await this.findWorkflowByName(workflowData.name);
      
      if (existingWorkflow) {
        console.log(`Updating existing workflow: ${workflowData.name}`);
        await this.updateWorkflow(existingWorkflow.id, workflowData);
      } else {
        console.log(`Creating new workflow: ${workflowData.name}`);
        await this.createWorkflow(workflowData);
      }
      
      console.log('Workflow deployment completed successfully');
      
    } catch (error) {
      console.error('Workflow deployment failed:', error.message);
      throw error;
    }
  }

  /**
   * Find workflow by name
   */
  async findWorkflowByName(name) {
    try {
      const response = await this.client.get('/workflows');
      const workflows = response.data.data || [];
      return workflows.find(w => w.name === name);
    } catch (error) {
      console.error('Failed to fetch workflows:', error.message);
      return null;
    }
  }

  /**
   * Create new workflow
   */
  async createWorkflow(workflowData) {
    const response = await this.client.post('/workflows', workflowData);
    console.log(`Created workflow with ID: ${response.data.id}`);
    return response.data;
  }

  /**
   * Update existing workflow
   */
  async updateWorkflow(workflowId, workflowData) {
    const response = await this.client.put(`/workflows/${workflowId}`, workflowData);
    console.log(`Updated workflow ID: ${workflowId}`);
    return response.data;
  }

  /**
   * Deploy credentials
   */
  async deployCredentials(credentialsDir) {
    try {
      console.log(`Deploying credentials from: ${credentialsDir}`);
      
      const credentialFiles = fs.readdirSync(credentialsDir)
        .filter(file => file.endsWith('.json'));

      for (const file of credentialFiles) {
        const credentialPath = path.join(credentialsDir, file);
        const credentialData = JSON.parse(fs.readFileSync(credentialPath, 'utf8'));
        
        // Replace environment variable placeholders
        const processedData = this.processCredentialData(credentialData);
        
        const existingCredential = await this.findCredentialByName(processedData.name);
        
        if (existingCredential) {
          console.log(`Updating credential: ${processedData.name}`);
          await this.updateCredential(existingCredential.id, processedData);
        } else {
          console.log(`Creating credential: ${processedData.name}`);
          await this.createCredential(processedData);
        }
      }
      
      console.log('Credentials deployment completed');
      
    } catch (error) {
      console.error('Credentials deployment failed:', error.message);
      throw error;
    }
  }

  /**
   * Process credential data to replace environment variables
   */
  processCredentialData(credentialData) {
    const processed = JSON.parse(JSON.stringify(credentialData));
    
    // Replace environment variable placeholders
    const replaceEnvVars = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = obj[key].replace(/\{\{\s*process\.env\.(\w+)\s*\}\}/g, (match, envVar) => {
            return process.env[envVar] || match;
          });
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          replaceEnvVars(obj[key]);
        }
      }
    };

    replaceEnvVars(processed.data);
    return processed;
  }

  /**
   * Find credential by name
   */
  async findCredentialByName(name) {
    try {
      const response = await this.client.get('/credentials');
      const credentials = response.data.data || [];
      return credentials.find(c => c.name === name);
    } catch (error) {
      console.error('Failed to fetch credentials:', error.message);
      return null;
    }
  }

  /**
   * Create new credential
   */
  async createCredential(credentialData) {
    const response = await this.client.post('/credentials', credentialData);
    console.log(`Created credential: ${credentialData.name}`);
    return response.data;
  }

  /**
   * Update existing credential
   */
  async updateCredential(credentialId, credentialData) {
    const response = await this.client.put(`/credentials/${credentialId}`, credentialData);
    console.log(`Updated credential: ${credentialData.name}`);
    return response.data;
  }

  /**
   * Activate workflow
   */
  async activateWorkflow(workflowName) {
    try {
      const workflow = await this.findWorkflowByName(workflowName);
      if (!workflow) {
        throw new Error(`Workflow not found: ${workflowName}`);
      }

      await this.client.post(`/workflows/${workflow.id}/activate`);
      console.log(`Activated workflow: ${workflowName}`);
      
    } catch (error) {
      console.error('Failed to activate workflow:', error.message);
      throw error;
    }
  }

  /**
   * Test workflow execution
   */
  async testWorkflow(workflowName) {
    try {
      const workflow = await this.findWorkflowByName(workflowName);
      if (!workflow) {
        throw new Error(`Workflow not found: ${workflowName}`);
      }

      const response = await this.client.post(`/workflows/${workflow.id}/execute`);
      console.log(`Test execution started for: ${workflowName}`);
      console.log(`Execution ID: ${response.data.executionId}`);
      
      return response.data;
      
    } catch (error) {
      console.error('Failed to test workflow:', error.message);
      throw error;
    }
  }
}

// CLI Usage
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const deployer = new N8nWorkflowDeployer({});

  try {
    switch (command) {
      case 'deploy':
        const workflowPath = args[1] || './workflows/citation-monitoring.json';
        await deployer.deployWorkflow(workflowPath);
        break;

      case 'credentials':
        const credentialsDir = args[1] || './credentials';
        await deployer.deployCredentials(credentialsDir);
        break;

      case 'activate':
        const workflowName = args[1] || 'DirectDrive Citation Monitoring';
        await deployer.activateWorkflow(workflowName);
        break;

      case 'test':
        const testWorkflowName = args[1] || 'DirectDrive Citation Monitoring';
        await deployer.testWorkflow(testWorkflowName);
        break;

      case 'full-deploy':
        console.log('Starting full deployment...');
        await deployer.deployCredentials('./credentials');
        await deployer.deployWorkflow('./workflows/citation-monitoring.json');
        await deployer.activateWorkflow('DirectDrive Citation Monitoring');
        console.log('Full deployment completed successfully');
        break;

      default:
        console.log('Usage:');
        console.log('  node deploy-workflow.js deploy [workflow-path]');
        console.log('  node deploy-workflow.js credentials [credentials-dir]');
        console.log('  node deploy-workflow.js activate [workflow-name]');
        console.log('  node deploy-workflow.js test [workflow-name]');
        console.log('  node deploy-workflow.js full-deploy');
        process.exit(1);
    }
  } catch (error) {
    console.error('Deployment failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = N8nWorkflowDeployer;