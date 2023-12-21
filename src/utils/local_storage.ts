export interface LocalStorageOperator {
  getItem(key: string): string | null

  setItem(key: string, value: string): void

  removeItem(key: string): void

  clear(): void
}

export class FakeLocalStorageOperator implements LocalStorageOperator {
  private readonly storage: Map<string, string> = new Map()

  getItem(key: string): string | null {
    return this.storage.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value)
  }

  removeItem(key: string): void {
    this.storage.delete(key)
  }

  clear(): void {
    this.storage.clear()
  }
}

export class LocalStorageOperatorImpl implements LocalStorageOperator {
  getItem(key: string): string | null {
    return localStorage.getItem(key)
  }

  setItem(key: string, value: string): void {
    localStorage.setItem(key, value)
  }

  removeItem(key: string): void {
    localStorage.removeItem(key)
  }

  clear(): void {
    localStorage.clear()
  }
}
