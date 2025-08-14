/**
 * n8n Workflow Validation Script
 * DirectDrive Authority Engine
 */

const fs = require('fs');
const path = require('path');

class WorkflowValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Validate all workflows in the workflows directory
   */
  validateAll() {
    console.log('🔍 Validating n8n Workflows');
    console.log('============================');

    const workflowsDir = path.join(__dirname, '../workflows');
    
    if (!fs.existsSync(workflowsDir)) {
      this.errors.push('Workflows directory not found');
      return this.getResults();
    }

    const workflowFiles = fs.readdirSync(workflowsDir)
      .filter(file => file.endsWith('.json'));

    if (workflowFiles.length === 0) {
      this.warnings.push('No workflow files found');
      return this.getResults();
    }

    workflowFiles.forEach(file => {
      console.log(`\nValidating ${file}...`);
      this.validateWorkflow(path.join(workflowsDir, file));
    });

    return this.getResults();
  }

  /**
   * Validate individual workflow file
   */
  validateWorkflow(filePath) {
    try {
      const workflowData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Basic structure validation
      this.validateBasicStructure(workflowData, filePath);
      
      // Node validation
      this.validateNodes(workflowData.nodes || [], filePath);
      
      // Connection validation
      this.validateConnections(workflowData.connections || {}, workflowData.nodes || [], filePath);
      
      // Credential validation
      this.validateCredentials(workflowData.nodes || [], filePath);
      
      // DirectDrive specific validation
      this.validateDirectDriveSpecific(workflowData, filePath);
      
      console.log('✅ Basic validation passed');
      
    } catch (error) {
      this.errors.push(`${path.basename(filePath)}: Failed to parse JSON - ${error.message}`);
    }
  }

  /**
   * Validate basic workflow structure
   */
  validateBasicStructure(workflow, filePath) {
    const fileName = path.basename(filePath);
    
    if (!workflow.name) {
      this.errors.push(`${fileName}: Missing workflow name`);
    }

    if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
      this.errors.push(`${fileName}: Missing or invalid nodes array`);
      return;
    }

    if (workflow.nodes.length === 0) {
      this.warnings.push(`${fileName}: Workflow has no nodes`);
    }

    // Check for required DirectDrive workflow properties
    if (fileName === 'citation-monitoring.json') {
      if (!workflow.active) {
        this.warnings.push(`${fileName}: Workflow is not set to active`);
      }

      if (workflow.nodes.length < 10) {
        this.warnings.push(`${fileName}: Expected at least 10 nodes for citation monitoring workflow`);
      }
    }
  }

  /**
   * Validate workflow nodes
   */
  validateNodes(nodes, filePath) {
    const fileName = path.basename(filePath);
    const nodeTypes = new Set();
    const nodeIds = new Set();

    nodes.forEach((node, index) => {
      // Basic node validation
      if (!node.id) {
        this.errors.push(`${fileName}: Node ${index} missing ID`);
      } else if (nodeIds.has(node.id)) {
        this.errors.push(`${fileName}: Duplicate node ID: ${node.id}`);
      } else {
        nodeIds.add(node.id);
      }

      if (!node.name) {
        this.warnings.push(`${fileName}: Node ${node.id || index} missing name`);
      }

      if (!node.type) {
        this.errors.push(`${fileName}: Node ${node.id || index} missing type`);
      } else {
        nodeTypes.add(node.type);
      }

      if (!node.position || !Array.isArray(node.position) || node.position.length !== 2) {
        this.warnings.push(`${fileName}: Node ${node.id || index} has invalid position`);
      }

      // DirectDrive specific node validation
      this.validateDirectDriveNode(node, fileName);
    });

    // Check for required node types in citation monitoring workflow
    if (fileName === 'citation-monitoring.json') {
      const requiredTypes = [
        'n8n-nodes-base.scheduleTrigger',
        'n8n-nodes-base.supabase',
        'n8n-nodes-base.if',
        'n8n-nodes-base.openAi',
        'n8n-nodes-base.code'
      ];

      requiredTypes.forEach(type => {
        if (!nodeTypes.has(type)) {
          this.warnings.push(`${fileName}: Missing required node type: ${type}`);
        }
      });
    }
  }

  /**
   * Validate DirectDrive specific node configurations
   */
  validateDirectDriveNode(node, fileName) {
    // Validate Supabase nodes
    if (node.type === 'n8n-nodes-base.supabase') {
      if (!node.credentials || !node.credentials.supabaseApi) {
        this.errors.push(`${fileName}: Supabase node ${node.name} missing credentials`);
      }

      if (node.parameters) {
        if (node.parameters.operation === 'select' && !node.parameters.table) {
          this.errors.push(`${fileName}: Supabase select node ${node.name} missing table parameter`);
        }
      }
    }

    // Validate OpenAI nodes
    if (node.type === 'n8n-nodes-base.openAi') {
      if (!node.credentials || !node.credentials.openAiApi) {
        this.errors.push(`${fileName}: OpenAI node ${node.name} missing credentials`);
      }

      if (node.parameters && node.parameters.model) {
        if (!['gpt-4', 'gpt-3.5-turbo'].includes(node.parameters.model)) {
          this.warnings.push(`${fileName}: OpenAI node ${node.name} using non-standard model: ${node.parameters.model}`);
        }
      }
    }

    // Validate Code nodes for DirectDrive logic
    if (node.type === 'n8n-nodes-base.code' && node.name === 'Analyze Citation Results') {
      if (!node.parameters || !node.parameters.jsCode) {
        this.errors.push(`${fileName}: Citation analysis code node missing JavaScript code`);
      } else {
        const code = node.parameters.jsCode;
        if (!code.includes('directdrive') && !code.includes('DirectDrive')) {
          this.warnings.push(`${fileName}: Citation analysis code may not include DirectDrive detection logic`);
        }
      }
    }

    // Validate Schedule Trigger
    if (node.type === 'n8n-nodes-base.scheduleTrigger') {
      if (!node.parameters || !node.parameters.rule) {
        this.errors.push(`${fileName}: Schedule trigger ${node.name} missing rule configuration`);
      }
    }
  }

  /**
   * Validate node connections
   */
  validateConnections(connections, nodes, filePath) {
    const fileName = path.basename(filePath);
    const nodeIds = new Set(nodes.map(n => n.name));

    Object.keys(connections).forEach(sourceName => {
      if (!nodeIds.has(sourceName)) {
        this.errors.push(`${fileName}: Connection from non-existent node: ${sourceName}`);
        return;
      }

      const sourceConnections = connections[sourceName];
      if (sourceConnections.main) {
        sourceConnections.main.forEach((outputConnections, outputIndex) => {
          if (outputConnections) {
            outputConnections.forEach(connection => {
              if (!nodeIds.has(connection.node)) {
                this.errors.push(`${fileName}: Connection to non-existent node: ${connection.node}`);
              }
            });
          }
        });
      }
    });

    // Check for isolated nodes (no connections)
    const connectedNodes = new Set();
    Object.values(connections).forEach(sourceConnections => {
      if (sourceConnections.main) {
        sourceConnections.main.forEach(outputConnections => {
          if (outputConnections) {
            outputConnections.forEach(connection => {
              connectedNodes.add(connection.node);
            });
          }
        });
      }
    });

    nodes.forEach(node => {
      if (!connections[node.name] && !connectedNodes.has(node.name)) {
        // Skip trigger nodes as they don't need incoming connections
        if (!node.type.includes('trigger')) {
          this.warnings.push(`${fileName}: Node ${node.name} appears to be isolated (no connections)`);
        }
      }
    });
  }

  /**
   * Validate credential references
   */
  validateCredentials(nodes, filePath) {
    const fileName = path.basename(filePath);
    const requiredCredentials = new Set();

    nodes.forEach(node => {
      if (node.credentials) {
        Object.keys(node.credentials).forEach(credType => {
          requiredCredentials.add(node.credentials[credType].name || node.credentials[credType].id);
        });
      }
    });

    // Check if credential files exist
    const credentialsDir = path.join(__dirname, '../credentials');
    if (fs.existsSync(credentialsDir)) {
      const credentialFiles = fs.readdirSync(credentialsDir)
        .filter(file => file.endsWith('.json'))
        .map(file => path.basename(file, '.json'));

      requiredCredentials.forEach(credName => {
        if (!credentialFiles.some(file => file.includes(credName.toLowerCase()))) {
          this.warnings.push(`${fileName}: Referenced credential '${credName}' not found in credentials directory`);
        }
      });
    }
  }

  /**
   * Validate DirectDrive specific workflow requirements
   */
  validateDirectDriveSpecific(workflow, filePath) {
    const fileName = path.basename(filePath);

    if (fileName === 'citation-monitoring.json') {
      // Check for DirectDrive specific nodes
      const nodeNames = workflow.nodes.map(n => n.name.toLowerCase());
      
      const requiredNodes = [
        'schedule',
        'keyword',
        'citation',
        'supabase',
        'ai',
        'monitor'
      ];

      requiredNodes.forEach(required => {
        if (!nodeNames.some(name => name.includes(required))) {
          this.warnings.push(`${fileName}: Missing expected DirectDrive node type containing '${required}'`);
        }
      });

      // Check for performance monitoring
      if (!nodeNames.some(name => name.includes('performance') || name.includes('monitor'))) {
        this.warnings.push(`${fileName}: Missing performance monitoring nodes`);
      }

      // Check for error handling
      if (!nodeNames.some(name => name.includes('error') || name.includes('handle'))) {
        this.warnings.push(`${fileName}: Missing error handling nodes`);
      }
    }
  }

  /**
   * Get validation results
   */
  getResults() {
    const hasErrors = this.errors.length > 0;
    const hasWarnings = this.warnings.length > 0;

    console.log('\n📋 Validation Results');
    console.log('====================');

    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach(error => console.log(`  • ${error}`));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️ Warnings:');
      this.warnings.forEach(warning => console.log(`  • ${warning}`));
    }

    if (!hasErrors && !hasWarnings) {
      console.log('\n✅ All workflows passed validation!');
    } else if (!hasErrors) {
      console.log('\n✅ No critical errors found, but please review warnings.');
    }

    return {
      success: !hasErrors,
      errors: this.errors,
      warnings: this.warnings,
      errorCount: this.errors.length,
      warningCount: this.warnings.length
    };
  }
}

// CLI execution
if (require.main === module) {
  const validator = new WorkflowValidator();
  const results = validator.validateAll();
  
  process.exit(results.success ? 0 : 1);
}

module.exports = WorkflowValidator;