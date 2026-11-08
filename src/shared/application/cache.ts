// Port: what the application needs from a cache. Infrastructure provides the
// implementation (Valkey today); use cases never know which one.
export interface Cache {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
  delete(key: string): Promise<void>;
}
