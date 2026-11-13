import type { BaseEntity, EntityInput } from '@/types/common.types';
import { generateId } from '@/utils/helpers';

const STORAGE_PREFIX = 'oneengine-mock:';

/**
 * In-browser collection used only by the mock API. Data is persisted to localStorage so demo
 * edits survive reloads; it never contains credentials.
 */
export class MockCollection<T extends BaseEntity> {
  private items: T[];

  constructor(
    private readonly name: string,
    seed: T[],
  ) {
    this.items = this.load() ?? structuredClone(seed);
  }

  private load(): T[] | null {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + this.name);
      return raw ? (JSON.parse(raw) as T[]) : null;
    } catch {
      return null;
    }
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_PREFIX + this.name, JSON.stringify(this.items));
    } catch {
      // Storage full or unavailable: keep working in memory.
    }
  }

  all(): T[] {
    return structuredClone(this.items);
  }

  find(id: string): T | undefined {
    const item = this.items.find((i) => i.id === id);
    return item ? structuredClone(item) : undefined;
  }

  some(predicate: (item: T) => boolean): boolean {
    return this.items.some(predicate);
  }

  /** `id` is generated unless given (e.g. the int id the real API would assign). */
  create(input: EntityInput<T>, user: string, id?: string): T {
    const item = {
      ...input,
      id: id ?? generateId(this.name),
      modifiedBy: user,
      modifiedOn: new Date().toISOString(),
    } as T;
    this.items.unshift(item);
    this.persist();
    return structuredClone(item);
  }

  update(id: string, input: EntityInput<T>, user: string): T | undefined {
    const index = this.items.findIndex((i) => i.id === id);
    if (index < 0) return undefined;
    const item = {
      ...this.items[index],
      ...input,
      modifiedBy: user,
      modifiedOn: new Date().toISOString(),
    };
    this.items[index] = item;
    this.persist();
    return structuredClone(item);
  }

  remove(id: string): boolean {
    const before = this.items.length;
    this.items = this.items.filter((i) => i.id !== id);
    this.persist();
    return this.items.length < before;
  }
}

export function resetMockDb() {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(STORAGE_PREFIX))
    .forEach((k) => localStorage.removeItem(k));
}
