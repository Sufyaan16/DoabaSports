/**
 * Chainable mock for Drizzle ORM (queue-based).
 *
 * Routes use patterns like:
 *   db.select().from(table).where(...).limit(1)
 *   db.select({count}).from(table).where(...)  // count query
 *   db.insert(table).values({...}).returning()
 *   db.update(table).set({...}).where(...).returning()
 *   db.delete(table).where(...).returning()
 *   db.transaction(async (tx) => { ... })
 *
 * Each call to mockSelectResult() etc. pushes onto a queue.
 * Queries consume results in FIFO order. If the queue is empty, [] is returned.
 */
import { vi } from "vitest";

// ─── Result Queues ──────────────────────────────────────────────
let _selectQueue: unknown[][] = [];
let _insertQueue: unknown[][] = [];
let _updateQueue: unknown[][] = [];
let _deleteQueue: unknown[][] = [];

function nextSelect(): unknown[] {
  return _selectQueue.shift() || [];
}
function nextInsert(): unknown[] {
  return _insertQueue.shift() || [];
}
function nextUpdate(): unknown[] {
  return _updateQueue.shift() || [];
}
function nextDelete(): unknown[] {
  return _deleteQueue.shift() || [];
}

/** Queue a result for the next SELECT query */
export function mockSelectResult(result: unknown[]) {
  _selectQueue.push(result);
}

/** Queue a result for the next INSERT ... RETURNING */
export function mockInsertResult(result: unknown[]) {
  _insertQueue.push(result);
}

/** Queue a result for the next UPDATE ... RETURNING */
export function mockUpdateResult(result: unknown[]) {
  _updateQueue.push(result);
}

/** Queue a result for the next DELETE ... RETURNING */
export function mockDeleteResult(result: unknown[]) {
  _deleteQueue.push(result);
}

/** Convenience: queue a count result (shorthand for mockSelectResult([{count: n}])) */
export function mockCountResult(count: number) {
  _selectQueue.push([{ count }]);
}

/** Reset all mock queues */
export function resetDbMocks() {
  _selectQueue = [];
  _insertQueue = [];
  _updateQueue = [];
  _deleteQueue = [];
}

// ─── Chainable Builders ─────────────────────────────────────────

function createSelectChain() {
  const chain: Record<string, any> = {};
  chain.from = vi.fn().mockReturnValue(chain);
  chain.where = vi.fn().mockReturnValue(chain);
  chain.orderBy = vi.fn().mockReturnValue(chain);
  chain.limit = vi.fn().mockReturnValue(chain);
  chain.offset = vi.fn().mockReturnValue(chain);
  chain.leftJoin = vi.fn().mockReturnValue(chain);
  chain.innerJoin = vi.fn().mockReturnValue(chain);
  // Terminal: when the chain is awaited, consume the next queued result
  chain.then = (resolve: (v: unknown) => void, reject?: (e: unknown) => void) => {
    try {
      resolve(nextSelect());
    } catch (e) {
      reject?.(e);
    }
  };
  return chain;
}

function createInsertChain() {
  const chain: Record<string, any> = {};
  chain.values = vi.fn().mockReturnValue(chain);
  chain.returning = vi.fn(() => Promise.resolve(nextInsert()));
  chain.onConflictDoNothing = vi.fn().mockReturnValue(chain);
  chain.onConflictDoUpdate = vi.fn().mockReturnValue(chain);
  return chain;
}

function createUpdateChain() {
  const chain: Record<string, any> = {};
  chain.set = vi.fn().mockReturnValue(chain);
  chain.where = vi.fn().mockReturnValue(chain);
  chain.returning = vi.fn(() => Promise.resolve(nextUpdate()));
  return chain;
}

function createDeleteChain() {
  const chain: Record<string, any> = {};
  chain.where = vi.fn().mockReturnValue(chain);
  chain.returning = vi.fn(() => Promise.resolve(nextDelete()));
  return chain;
}

// ─── Mock DB ────────────────────────────────────────────────────

export const mockDb = {
  select: vi.fn(() => createSelectChain()),
  insert: vi.fn(() => createInsertChain()),
  update: vi.fn(() => createUpdateChain()),
  delete: vi.fn(() => createDeleteChain()),
  // Transaction: tx has the same API shape as db, sharing the same queues
  transaction: vi.fn(async (fn: (tx: any) => Promise<any>) => {
    const tx = {
      select: vi.fn(() => createSelectChain()),
      insert: vi.fn(() => createInsertChain()),
      update: vi.fn(() => createUpdateChain()),
      delete: vi.fn(() => createDeleteChain()),
    };
    return fn(tx);
  }),
};

export default mockDb;
