export class SetRandomDrawer {
  private random: () => number

  static create() {
    return new SetRandomDrawer(Math.random)
  }

  /**
   * @param random - a function that returns a number n that n >= 0 and n < 1
   * @returns
   */
  static createNull({ random = Math.random }: { random?: () => number }) {
    return new SetRandomDrawer(random)
  }

  private constructor(random: () => number) {
    this.random = random
  }

  draw<E>(inputSet: Set<E>): E {
    const randomIndex = Math.floor(this.random() * inputSet.size)
    return Array.from(inputSet)[randomIndex]
  }
}
