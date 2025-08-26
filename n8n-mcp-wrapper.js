#!/usr/bin/env node

/**
 * Custom n8n MCP Server Wrapper
 * This wrapper ensures proper API communication with n8n Cloud
 */

const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const axios = require('axios');

// Environment variables
const N8N_BASE_URL = process.env.N8N_BASE_URL || process.env.N8N_HOST;
const N8N_API_KEY = process.env.N8N_API_KEY;

if (!N8N_BASE_URL || !N8N_API_KEY) {
  console.error('Missing required environment variables: N8N_BASE_URL and N8N_API_KEY');
  process.exit(1);
}

// Ensure the base URL includes /api/v1
const apiUrl = N8N_BASE_URL.endsWith('/api/v1') ? N8N_BASE_URL : `${N8N_BASE_URL}/api/v1`;

// Create axios instance with proper headers
const n8nApi = axios.create({
  baseURL: apiUrl,
  headers: {
    'X-N8N-API-KEY': N8N_API_KEY,
    'Content-Type': 'application/json'
  }
});

class N8nMcpServer {
  constructor() {
    this.server = new Server(
      {
        name: 'n8n-mcp-wrapper',
        version: '1.0.0'
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // List workflows
    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'list_workflows':
            return await this.listWorkflows();
          
          case 'get_workflow':
            return await this.getWorkflow(args.id);
          
          case 'create_workflow':
            return await this.createWorkflow(args.workflow);
          
          case 'update_workflow':
            return await this.updateWorkflow(args.id, args.workflow);
          
          case 'delete_workflow':
            return await this.deleteWorkflow(args.id);
          
          case 'activate_workflow':
            return await this.activateWorkflow(args.id);
          
          case 'deactivate_workflow':
            return await this.deactivateWorkflow(args.id);
          
          case 'execute_workflow':
            return await this.executeWorkflow(args.id);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error: ${error.message}`
          }],
          isError: true
        };
      }
    });

    // List available tools
    this.server.setRequestHandler('tools/list', async () => {
      return {
        tools: [
          {
            name: 'list_workflows',
            description: 'List all workflows from n8n instance',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'get_workflow',
            description: 'Get a workflow by ID',
            inputSchema: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Workflow ID' }
              },
              required: ['id']
            }
          },
          {
            name: 'create_workflow',
            description: 'Create a new workflow in n8n',
            inputSchema: {
              type: 'object',
              properties: {
                workflow: {
                  type: 'object',
                  description: 'Workflow configuration',
                  properties: {
                    name: { type: 'string', description: 'Name of the workflow' },
                    nodes: { type: 'array', description: 'Array of workflow nodes' },
                    connections: { type: 'object', description: 'Node connections' },
                    settings: { type: 'object', description: 'Workflow settings' },
                    tags: { type: 'array', description: 'Workflow tags' }
                  },
                  required: ['name', 'nodes']
                }
              },
              required: ['workflow']
            }
          },
          {
            name: 'update_workflow',
            description: 'Update an existing workflow by ID',
            inputSchema: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Workflow ID' },
                workflow: {
                  type: 'object',
                  description: 'Updated workflow configuration'
                }
              },
              required: ['id', 'workflow']
            }
          },
          {
            name: 'delete_workflow',
            description: 'Delete a workflow by ID',
            inputSchema: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Workflow ID' }
              },
              required: ['id']
            }
          },
          {
            name: 'activate_workflow',
            description: 'Activate a workflow by ID',
            inputSchema: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Workflow ID' }
              },
              required: ['id']
            }
          },
          {
            name: 'deactivate_workflow',
            description: 'Deactivate a workflow by ID',
            inputSchema: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Workflow ID' }
              },
              required: ['id']
            }
          },
          {
            name: 'execute_workflow',
            description: 'Execute a workflow manually',
            inputSchema: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Workflow ID' }
              },
              required: ['id']
            }
          }
        ]
      };
    });
  }

  async listWorkflows() {
    const response = await n8nApi.get('/workflows');
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data, null, 2)
      }]
    };
  }

  async getWorkflow(id) {
    const response = await n8nApi.get(`/workflows/${id}`);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data, null, 2)
      }]
    };
  }

  async createWorkflow(workflow) {
    const response = await n8nApi.post('/workflows', workflow);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data, null, 2)
      }]
    };
  }

  async updateWorkflow(id, workflow) {
    const response = await n8nApi.put(`/workflows/${id}`, workflow);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data, null, 2)
      }]
    };
  }

  async deleteWorkflow(id) {
    const response = await n8nApi.delete(`/workflows/${id}`);
    return {
      content: [{
        type: 'text',
        text: 'Workflow deleted successfully'
      }]
    };
  }

  async activateWorkflow(id) {
    const response = await n8nApi.post(`/workflows/${id}/activate`);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data, null, 2)
      }]
    };
  }

  async deactivateWorkflow(id) {
    const response = await n8nApi.post(`/workflows/${id}/deactivate`);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data, null, 2)
      }]
    };
  }

  async executeWorkflow(id) {
    const response = await n8nApi.post(`/workflows/${id}/execute`);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data, null, 2)
      }]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

// Run the server
if (require.main === module) {
  const server = new N8nMcpServer();
  server.run().catch(console.error);
}

module.exports = N8nMcpServer;