// Valkey (Amazon ElastiCache Serverless) client, used as an optional cache.
//
// Design rule: the cache must never break the app. If it's not configured,
// unreachable, or slow, every helper quietly returns "miss" and the caller
// falls back to Aurora.

import { GlideClusterClient, Logger, TimeUnit } from "@valkey/valkey-glide";
import { createCacheAuthToken } from "@/lib/cache-token";

const HOST = process.env.VALKEY_HOST; // unset = caching disabled
const PORT = Number(process.env.VALKEY_PORT ?? 6379);
const CACHE_NAME = process.env.VALKEY_CACHE_NAME ?? "";
const USER_ID = process.env.VALKEY_USER ?? "default.iam-user";
const REGION = process.env.AWS_REGION ?? "us-east-1";

const OP_TIMEOUT_MS = 1000; // a cache call slower than this counts as a miss
const RETRY_COOLDOWN_MS = 60_000; // after a failed connect, don't retry for a minute
const TOKEN_REFRESH_MS = 10 * 60_000; // tokens live 15 min; renew every 10

type CacheState = {
  client?: Promise<GlideClusterClient>;
  failedAt?: number;
  refreshTimer?: NodeJS.Timeout;
};
// Kept on globalThis so `next dev` hot reloads reuse one client and one timer.
const state: CacheState = ((globalThis as { __valkey?: CacheState }).__valkey ??=
  {});

const newToken = () =>
  createCacheAuthToken({ cacheName: CACHE_NAME, userId: USER_ID, region: REGION });

async function connect(): Promise<GlideClusterClient> {
  Logger.setLoggerConfig("warn");
  const client = await GlideClusterClient.createClient({
    addresses: [{ host: HOST!, port: PORT }],
    useTLS: true, // public endpoints require TLS 1.3
    // IAM auth: our own signed token as the password (see cache-token.ts).
    credentials: { username: USER_ID, password: await newToken() },
    requestTimeout: OP_TIMEOUT_MS,
    advancedConfiguration: { connectionTimeout: 20_000 },
  });

  // Keep a fresh token on hand for when GLIDE reconnects.
  clearInterval(state.refreshTimer);
  state.refreshTimer = setInterval(async () => {
    try {
      await client.updateConnectionPassword(await newToken(), false);
    } catch (err) {
      console.warn("[cache] token refresh failed:", (err as Error).message);
    }
  }, TOKEN_REFRESH_MS);
  state.refreshTimer.unref();

  return client;
}

async function getClient(): Promise<GlideClusterClient | null> {
  if (!HOST || !CACHE_NAME) return null;
  if (state.failedAt && Date.now() - state.failedAt < RETRY_COOLDOWN_MS) return null;

  state.client ??= connect().catch((err) => {
    console.warn("[cache] connect failed, using DB only:", (err as Error).message);
    state.client = undefined;
    state.failedAt = Date.now();
    throw err;
  });
  try {
    return await state.client;
  } catch {
    return null;
  }
}

export async function cacheGet(key: string): Promise<string | null> {
  try {
    const client = await getClient();
    const value = await client?.get(key);
    return value == null ? null : String(value);
  } catch (err) {
    console.warn("[cache] get failed:", (err as Error).message);
    return null;
  }
}

export async function cacheSet(key: string, value: string, ttlSeconds: number) {
  try {
    const client = await getClient();
    await client?.set(key, value, { expiry: { type: TimeUnit.Seconds, count: ttlSeconds } });
  } catch (err) {
    console.warn("[cache] set failed:", (err as Error).message);
  }
}

export async function cacheDelete(key: string) {
  try {
    const client = await getClient();
    await client?.del([key]);
  } catch (err) {
    console.warn("[cache] delete failed:", (err as Error).message);
  }
}
