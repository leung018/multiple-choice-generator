export interface LocalStorageOperator {
  getItem(key: string): string | null

  setItem(key: string, value: string): void

  // TODO: add other methods (can refer to commit:0d3d2b that have drafted those before)
}

export class FakeLocalStorageOperator implements LocalStorageOperator {
  private readonly storage: Map<string, string> = new Map()

  getItem(key: string): string | null {
    return this.storage.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value)
  }
}

export class LocalStorageOperatorImpl implements LocalStorageOperator {
  getItem(key: string): string | null {
    return localStorage.getItem(key)
  }

  setItem(key: string, value: string): void {
    localStorage.setItem(key, value)
  }
}
