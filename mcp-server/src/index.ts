import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpError } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import fs from "node:fs/promises";
import path from "node:path";

// Sandbox directory for secure file operations
const WORKSPACE_ROOT = path.resolve(process.cwd(), "..", "workspace");

// Helper function to normalize file paths
function normalizeRelativePath(relpath: string): string {
  // Remove 'workspace/' prefix if present
  if (relpath.startsWith('workspace/')) {
    return relpath.substring(10);
  }
  // Remove '/workspace/' prefix if present
  if (relpath.startsWith('/workspace/')) {
    return relpath.substring(11);
  }
  return relpath;
}

const server = new McpServer(
  { name: "velora-mpc-server", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

// Echo tool for basic communication testing
server.tool(
  "echo",
  "Returns the provided text",
  { text: z.string() },
  async ({ text }) => ({ content: [{ type: "text", text }] })
);

// File reading tool with sandbox security
server.tool(
  "read_text",
  "Reads a text file from the workspace directory",
  { relpath: z.string() },
  async ({ relpath }) => {
    const cleanPath = normalizeRelativePath(relpath);
    const fullPath = path.normalize(path.join(WORKSPACE_ROOT, cleanPath));
    
    // Security check: ensure path is within workspace
    if (!fullPath.startsWith(WORKSPACE_ROOT)) {
      throw new McpError(-32602, "Path outside workspace not allowed");
    }
    
    const data = await fs.readFile(fullPath, "utf8");
    return { content: [{ type: "text", text: data }] };
  }
);

// Start server with stdio transport
const transport = new StdioServerTransport();
server.connect(transport);
