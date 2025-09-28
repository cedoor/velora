# agent.py
import asyncio
from fast_agent import FastAgent

fast = FastAgent("FS Agent")

@fast.agent(
    name="reader",
    instruction=(
        "If the user asks for file contents, ALWAYS use the `read_text` tool "
        "with relative path to the workspace (e.g. './README.md'). "
        "By default return only the first 3 lines, unless the user asks otherwise."
    ),
    servers=["fs"],
    use_history=True
)
async def run():
    pass

async def main():
    await fast.start_server(
        transport="http",
        host="0.0.0.0",
        port=8000,
        server_name="FS-Agent-Server",
        server_description="Fast-agent with Ollama + MCP",
    )

if __name__ == "__main__":
    asyncio.run(main())
