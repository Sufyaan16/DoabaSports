/**
 * Global test setup
 * Mocks external dependencies so unit tests run without real services
 */
import { vi } from "vitest";

// Set test environment
(process.env as any).NODE_ENV = "test";

// Suppress console.log/warn in tests (keep errors visible)
vi.spyOn(console, "log").mockImplementation(() => {});
vi.spyOn(console, "warn").mockImplementation(() => {});
