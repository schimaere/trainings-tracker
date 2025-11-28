import { neon } from '@neondatabase/serverless';

// Lazy initialization of database connection
// This prevents errors during build time when DATABASE_URL might not be available
let sqlInstance: ReturnType<typeof neon> | null = null;

function getSql() {
  // Lazy initialization - only create connection when actually needed at runtime
  // This prevents build-time errors when DATABASE_URL might not be available
  if (!sqlInstance) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set');
    }
    sqlInstance = neon(process.env.DATABASE_URL);
  }
  return sqlInstance;
}

// Create a Proxy that lazily initializes the connection
// The neon() function returns a template tag function, so we need to proxy it correctly
export const sql = new Proxy(function() {} as ReturnType<typeof neon>, {
  apply(_target, _thisArg, argumentsList) {
    // Handle template tag function calls: sql`SELECT ...`
    // Template tag functions receive (strings, ...values) as arguments
    const instance = getSql();
    return (instance as any)(...argumentsList);
  },
  get(_target, prop) {
    // Handle property access (though neon instances typically don't have properties)
    const instance = getSql();
    return (instance as any)[prop];
  },
});

