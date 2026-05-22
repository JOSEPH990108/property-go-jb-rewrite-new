# AI Agent and MCP Setup

This document defines a professional baseline for Copilot agents and MCP servers in this repository.

## What Is Configured

### Custom agents
Located in .github/agents/:
- codebase-analyst.agent.md
- database.agent.md
- tester.agent.md
- frontend.agent.md
- auth.agent.md
- server-actions.agent.md

Use these when you want specialized behavior instead of a general-purpose coding mode.

### MCP servers
Workspace MCP config is in .vscode/mcp.json.
Configured servers:
- github: GitHub MCP server via @modelcontextprotocol/server-github
- googleStitch: Google Stitch MCP proxy via google-stitch-mcp

## Secure Setup

### 1) GitHub PAT
When prompted for github-pat, use a token with least privilege.
Recommended scopes:
- repo read access only unless you need write actions
- no admin scopes

### 2) Validate MCP server startup
In VS Code:
- Open Command Palette
- Run MCP: List Servers
- Confirm github and googleStitch are healthy

If a server fails, open the MCP output channel and verify package availability:
- npx -y @modelcontextprotocol/server-github --help
- npx -y google-stitch-mcp proxy --help

## Prompting Rules for Better Control

To avoid unnecessary tool or MCP calls, be explicit in prompts:
- "Conceptual answer only, do not use tools"
- "Use workspace tools only, do not call MCP"
- "Check real files and verify with tools"

## Recommended Team Practice

- Keep all project-specific AI behavior in .github/ and .vscode/
- Review agent files in PRs like normal code
- Keep each agent narrow and role-based
- Prefer explicit constraints over broad instructions
- Rotate PATs periodically and revoke unused tokens

## Maintenance Checklist

- Keep .github/copilot-instructions.md updated with architecture changes
- Keep .github/instructions/*.instructions.md aligned with current code patterns
- Re-test MCP servers after Node/npm upgrades
- Remove unused agent files to avoid mode confusion
