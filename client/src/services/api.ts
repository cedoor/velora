import { Client } from '@modelcontextprotocol/sdk/client';
    import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";


const client = new Client(
      {
        name: 'velora-client',
        version: '0.1.0'
      }
    );


    const transport = new StreamableHTTPClientTransport(new URL('/api/mcp', window.location.origin));


    console.log('Connecting to MCP server...');
    await client.connect(transport);
    console.log('Connected successfully!');

//await client.close();

export async function sendMessage(message: string): Promise<string> {


    
    // List tools
    console.log('Listing tools...');
    const tools = await client.listTools();
    console.log('Available tools:', tools.tools.map(t => t.name));
    
    // Call a tool
    console.log('Calling reader_send tool...');
    const result = await client.callTool({
      name: 'reader_send',
      arguments: { message }
    });
    
    return result.content[0].text
    
  }
