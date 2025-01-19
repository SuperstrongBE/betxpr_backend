# BetXPR Backend

A microservices-based backend system for monitoring blockchain events from Ethereum and XPR Network.

## Architecture

The system consists of three main services:

1. **Ethereum Listener** (Port 3001)
   - Monitors Ethereum smart contract events
   - Formats and forwards events to the Data Processor

2. **XPR Network Listener** (Port 3003)
   - Monitors XPR Network contract actions
   - Formats and forwards events to the Data Processor

3. **Data Processor** (Port 3002)
   - Receives events from blockchain listeners
   - Processes and stores data in PostgreSQL and Supabase

## Prerequisites

- Docker and Docker Compose
- Node.js 18 or higher
- npm

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/betxpr_backend.git
   cd betxpr_backend
   ```

2. Copy environment files:
   ```bash
   cp .env.example .env
   cp eth-listener/.env.example eth-listener/.env
   cp xpr-listener/.env.example xpr-listener/.env
   cp data-processor/.env.example data-processor/.env
   ```

3. Update the environment files with your configuration:
   - Add your Ethereum RPC URL and contract details in `eth-listener/.env`
   - Add your XPR Network contract details in `xpr-listener/.env`
   - Configure your Supabase credentials in `data-processor/.env`

4. Install dependencies:
   ```bash
   npm run install:all
   ```

## Running the Services

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run start:prod
```

### Stop Services
```bash
npm run stop
```

### View Logs
```bash
npm run logs
```

### Clean Up (removes volumes)
```bash
npm run clean
```

## API Documentation

### Event Format

All blockchain events are standardized to the following format:

```typescript
{
  eventName: string;
  args: any;
  blockNumber: number;
  transactionHash: string;
  timestamp: Date;
  network: 'ethereum' | 'xpr';
}
```

## Database Schema

The system uses a PostgreSQL database with the following main table:

```sql
CREATE TABLE blockchain_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  eventName VARCHAR NOT NULL,
  args JSONB NOT NULL,
  blockNumber BIGINT NOT NULL,
  transactionHash VARCHAR NOT NULL,
  network VARCHAR NOT NULL,
  timestamp TIMESTAMP NOT NULL
);
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

MIT