# Redis Server with Persistent Memory

## Quick Start

```bash
# Start Redis
docker-compose up -d

# Stop Redis
docker-compose down

# View logs
docker logs redis-persistent

# Connect to Redis CLI
docker exec -it redis-persistent redis-cli
```

## Configuration

- **Port**: 6379 (exposed to host)
- **Data Directory**: `./redis-data` (persisted on host)
- **Persistence**: Both RDB snapshots and AOF enabled
  - RDB: Saves snapshots at intervals (900s/1 change, 300s/10 changes, 60s/10000 changes)
  - AOF: Append-only file for better durability

## Test Connection

```bash
# Test if Redis is running
docker exec redis-persistent redis-cli ping

# Set a test key
docker exec redis-persistent redis-cli SET mykey "Hello World"

# Get the test key
docker exec redis-persistent redis-cli GET mykey
```

## Data Persistence

Data is persisted in two ways:
1. **RDB snapshots** saved to `./redis-data/dump.rdb`
2. **AOF file** saved to `./redis-data/appendonly.aof`

Your data will survive container restarts and recreations.

## Security Note

For production use, uncomment and set the `requirepass` option in `redis.conf`.