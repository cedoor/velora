# Setup the project for new users
setup:
	@echo "Setting up MCP Lab..."
	cd fast-agent && uv sync
	cd mcp-server && npm install
	cd client && npm install
	@echo "Setup complete! Run 'make ollama-pull' to download the Ollama model."

# Pull the default Ollama model.
ollama-pull:
	ollama pull mistral-nemo:12b

# Build the MCP server.
mcp-build:
	cd mcp-server && npm run build

# Start Python agent as MCP server.
agent-serve: mcp-build
	cd fast-agent && uv run agent.py

# Start the web client in development mode.
client-serve:
	cd client && npm run dev

# Show the list of available commands. 
help:
	@echo "Available targets:"
	@echo "  setup         - Initial setup for new users (install dependencies)"
	@echo "  ollama-pull   - Download the required Ollama model"
	@echo "  mcp-build     - Build the MCP server"
	@echo "  agent-serve   - Start the agent server (builds MCP server first)"
	@echo "  client-serve    - Start the web client in development mode"
	@echo ""
	@echo "  help          - Show this help message"
