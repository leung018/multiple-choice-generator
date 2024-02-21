interface LocalStorageWrapper {
  getItem(key: string): string | null

  setItem(key: string, value: string): void

  // TODO: add other methods (can refer to commit:0d3d2b that have drafted those before)
}
class FakeLocalStorageWrapper implements LocalStorageWrapper {
  private readonly storage: Map<string, string> = new Map()

  getItem(key: string): string | null {
    return this.storage.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value)
  }
}

class LocalStorageWrapperImpl implements LocalStorageWrapper {
  getItem(key: string): string | null {
    return localStorage.getItem(key)
  }

  setItem(key: string, value: string): void {
    localStorage.setItem(key, value)
  }
}

export class LocalStorageObjectOperator<T> {
  static create<T>(storagePath: string): LocalStorageObjectOperator<T> {
    return new LocalStorageObjectOperator(
      new LocalStorageWrapperImpl(),
      storagePath,
    )
  }

  static createNull<T>(storagePath: string): LocalStorageObjectOperator<T> {
    return new LocalStorageObjectOperator(
      new FakeLocalStorageWrapper(),
      storagePath,
    )
  }

  private constructor(
    private readonly localStorageOperator: LocalStorageWrapper,
    private readonly storagePath: string,
  ) {}

  add(value: T): void {
    const values = this.getAll()
    values.push(value)
    this.localStorageOperator.setItem(this.storagePath, JSON.stringify(values))
  }

  getAll(): T[] {
    const values = this.localStorageOperator.getItem(this.storagePath)
    if (!values) {
      return []
    }
    return JSON.parse(values)
  }

  findOneByFilter(filter: (value: T) => boolean): T | null {
    const values = this.getAll()
    for (const value of values) {
      if (filter(value)) {
        return value
      }
    }
    return null
  }
}
