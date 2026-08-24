import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

declare global {
  var _postgresPool: Pool | undefined;
  var _postgresTested: boolean | undefined;
  var _postgresAvailable: boolean | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    const port = process.env.SQL_PORT ? parseInt(process.env.SQL_PORT, 10) : 5432;
    global._postgresPool = new Pool({
      host: process.env.SQL_HOST || undefined,
      port: isNaN(port) ? 5432 : port,
      user: process.env.SQL_USER || undefined,
      password: process.env.SQL_PASSWORD || undefined,
      database: process.env.SQL_DB_NAME || undefined,
      max: 10,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 20000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
      allowExitOnIdle: false,
    });

    // Handle idle connection drops gracefully (e.g., Cloud SQL proxy idle timeouts, scale-to-zero, or admin shutdown)
    global._postgresPool.on('error', (err: any) => {
      const message = err?.message || '';
      const code = err?.code || '';
      if (
        message.includes('Connection terminated unexpectedly') ||
        message.includes('terminating connection due to administrator command') ||
        message.includes('terminating connection') ||
        message.includes('server closed the connection unexpectedly') ||
        message.includes('ECONNRESET') ||
        message.includes('ECONNREFUSED') ||
        message.includes('EPIPE') ||
        message.includes('ETIMEDOUT') ||
        message.includes('57P01') ||
        message.includes('57P02') ||
        message.includes('57P03') ||
        message.includes('socket closed') ||
        message.includes('Connection reset by peer') ||
        code === '57P01' ||
        code === '57P02' ||
        code === '57P03' ||
        code === '08006' ||
        code === '08001' ||
        code === '08004'
      ) {
        // Normal behavior when Cloud SQL proxy or Postgres closes an idle connection; pool automatically discards it and reconnects
        return;
      }
      console.error('[DB Pool] Error on SQL client:', err);
    });
  }
  return global._postgresPool;
};

const pool = createPool();
export const db = drizzle(pool, { schema });

/**
 * Checks if PostgreSQL connection is configured and actively reachable
 */
export async function isPostgresAvailable(): Promise<boolean> {
  // If no host or connection string is configured in environment, don't attempt connection
  if (!process.env.SQL_HOST && !process.env.DATABASE_URL) {
    return false;
  }

  if (global._postgresTested && global._postgresAvailable !== undefined) {
    return global._postgresAvailable;
  }

  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    global._postgresTested = true;
    global._postgresAvailable = true;
    return true;
  } catch (err: any) {
    global._postgresTested = true;
    global._postgresAvailable = false;
    return false;
  }
}

/**
 * Executes a database operation with exponential backoff retry on transient connection drops
 */
export async function withDbRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: any;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      const errCode = err?.code || '';
      const isTransient =
        errMsg.includes('Connection terminated unexpectedly') ||
        errMsg.includes('terminating connection due to administrator command') ||
        errMsg.includes('terminating connection') ||
        errMsg.includes('server closed the connection unexpectedly') ||
        errMsg.includes('ECONNRESET') ||
        errMsg.includes('ECONNREFUSED') ||
        errMsg.includes('EPIPE') ||
        errMsg.includes('ETIMEDOUT') ||
        errMsg.includes('57P01') ||
        errMsg.includes('57P02') ||
        errMsg.includes('57P03') ||
        errMsg.includes('socket closed') ||
        errMsg.includes('Connection reset by peer') ||
        errMsg.includes('timeout') ||
        errCode === '57P01' ||
        errCode === '57P02' ||
        errCode === '57P03' ||
        errCode === '08006' ||
        errCode === '08001' ||
        errCode === '08004';

      if (isTransient && attempt < maxRetries) {
        const delayMs = attempt * 200;
        console.warn(`[DB Retry] Transient DB error on attempt ${attempt}/${maxRetries} (${errMsg}). Retrying in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

