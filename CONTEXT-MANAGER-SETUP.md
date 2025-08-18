# Context Manager Agent Infrastructure Setup for Claude Code

Complete infrastructure setup for the context-manager agent with Redis, Elasticsearch, and Qdrant vector database, configured for Claude Code CLI.

## Services Overview

### 1. Redis (Port 6379)
- **Purpose**: In-memory data store for fast context retrieval
- **Persistence**: RDB snapshots + AOF for durability
- **Data**: Stored in `./redis-data/`
- **MCP Server**: Official Redis MCP from github.com/redis/mcp-redis

### 2. Elasticsearch (Port 9200)
- **Purpose**: Full-text search and analytics
- **Version**: 8.11.0
- **Data**: Stored in `./elasticsearch-data/`
- **Security**: Disabled for local development
- **MCP Server**: Official Elastic MCP via Docker

### 3. Qdrant (Port 6333/6334)
- **Purpose**: Vector database for semantic search
- **Ports**: 
  - 6333: REST API & Web UI
  - 6334: gRPC API
- **Data**: Stored in `./qdrant-data/`
- **Web UI**: http://localhost:6333/dashboard
- **MCP Server**: mcp-server-qdrant from PyPI

## Quick Start

### 1. Start all services
```bash
docker-compose up -d
```

### 2. Verify services are running
```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### 3. Test connectivity
```bash
# Redis
docker exec redis-persistent redis-cli ping

# Elasticsearch
curl http://localhost:9200/_cluster/health

# Qdrant
curl http://localhost:6333/readyz
```

### 4. Check MCP servers in Claude Code
```bash
claude mcp list
```

Expected output should show all servers connected:
- redis: ✓ Connected
- elasticsearch: ✓ Connected
- qdrant: ✓ Connected

## MCP Server Configuration in Claude Code

The MCP servers have been configured using the Claude Code CLI:

```bash
# Redis MCP
claude mcp add redis uvx -- --from git+https://github.com/redis/mcp-redis.git redis-mcp-server --url redis://localhost:6379/0

# Elasticsearch MCP
claude mcp add elasticsearch docker -- run -i --rm --network host -e ES_URL=http://localhost:9200 docker.elastic.co/mcp/elasticsearch stdio

# Qdrant MCP
claude mcp add qdrant uvx mcp-server-qdrant -e QDRANT_URL=http://localhost:6333 -e COLLECTION_NAME=context-manager -e EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
```

### Managing MCP Servers

```bash
# List all configured servers
claude mcp list

# Get details about a specific server
claude mcp get redis

# Remove a server
claude mcp remove redis

# Add a server with environment variables
claude mcp add <name> <command> [args...] -e KEY=value
```

## Using MCP Tools in Claude Code

Once configured, you can use these MCP tools in your Claude Code sessions:

### Redis Operations
- Key-value storage and retrieval
- Session management
- Caching operations
- Real-time data operations

### Elasticsearch Operations
- Full-text search queries
- Index management
- Document operations
- Aggregations and analytics

### Qdrant Operations
- Vector similarity search
- Collection management
- Point operations (add, update, delete)
- Semantic search capabilities

## Data Persistence

All data is persisted locally in:
- `./redis-data/` - Redis RDB snapshots and AOF logs
- `./elasticsearch-data/` - Elasticsearch indices
- `./qdrant-data/` - Qdrant collections and vectors

## Monitoring

### Redis
```bash
# Monitor Redis operations in real-time
docker exec -it redis-persistent redis-cli monitor

# Check Redis info
docker exec redis-persistent redis-cli info
```

### Elasticsearch
```bash
# Check cluster health
curl http://localhost:9200/_cluster/health?pretty

# List indices
curl http://localhost:9200/_cat/indices?v

# Check node stats
curl http://localhost:9200/_nodes/stats?pretty
```

### Qdrant
```bash
# Web UI
open http://localhost:6333/dashboard

# List collections via API
curl http://localhost:6333/collections

# Check cluster info
curl http://localhost:6333/cluster
```

## Troubleshooting

### Service won't start
```bash
# Check logs
docker logs [container-name]

# Restart specific service
docker-compose restart [service-name]

# Full restart
docker-compose down && docker-compose up -d
```

### MCP server connection issues
```bash
# Check MCP server status
claude mcp list

# Test MCP server directly (Redis example)
uvx --from git+https://github.com/redis/mcp-redis.git redis-mcp-server --url redis://localhost:6379/0

# Re-add MCP server if needed
claude mcp remove [server-name]
claude mcp add [server-name] [command] [args...]
```

### Port conflicts
If ports are already in use, modify the port mappings in `docker-compose.yml`

### Disk space
Monitor data directories size:
```bash
du -sh redis-data elasticsearch-data qdrant-data
```

## Security Notes

⚠️ **For Development Only**: Current configuration has security disabled for ease of development. For production:
- Enable Redis password authentication (uncomment in redis.conf)
- Enable Elasticsearch security features
- Configure Qdrant API keys
- Use proper network isolation
- Configure firewall rules

## Context Manager Agent Usage

The context-manager agent (located at `~/.claude/agents/meta-orchestration/context-manager.md`) can now utilize:

### Redis
- Fast retrieval of recent context and session data
- Real-time state management
- Temporary context caching
- Session persistence

### Elasticsearch
- Complex queries on historical context
- Full-text search across all stored contexts
- Aggregations and analytics on usage patterns
- Time-based context retrieval

### Qdrant
- Semantic similarity search for related context
- Vector embeddings of conversation history
- Intelligent context clustering
- Finding similar past interactions

## Architecture Overview

```
┌─────────────────────────────────────────┐
│         Claude Code CLI                  │
├─────────────────────────────────────────┤
│           MCP Servers Layer              │
│  ┌─────────┐ ┌──────────┐ ┌─────────┐  │
│  │  Redis  │ │  Elastic │ │ Qdrant  │  │
│  │   MCP   │ │    MCP   │ │   MCP   │  │
│  └────┬────┘ └────┬─────┘ └────┬────┘  │
└───────┼───────────┼────────────┼────────┘
        │           │            │
┌───────┼───────────┼────────────┼────────┐
│       │   Docker Services      │        │
│  ┌────▼────┐ ┌───▼────┐ ┌────▼────┐   │
│  │  Redis  │ │Elastic-│ │ Qdrant  │   │
│  │Container│ │ search │ │Container│   │
│  └─────────┘ └────────┘ └─────────┘   │
└─────────────────────────────────────────┘
```

## Next Steps

1. **Test the setup**: Try using the MCP tools in a Claude Code session
2. **Configure collections**: Set up appropriate Qdrant collections for your use case
3. **Create indices**: Configure Elasticsearch indices for your data structure
4. **Implement context storage**: Start storing and retrieving context using the MCP tools
5. **Monitor performance**: Use the monitoring tools to ensure optimal performance

All three services work together to provide comprehensive context management capabilities for the multi-agent system in Claude Code.