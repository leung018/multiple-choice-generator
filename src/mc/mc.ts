export class MultipleChoice {
  readonly choices: ReadonlyArray<string>
  readonly correctIndex: number

  constructor(choices: string[], correctIndex: number) {
    this.choices = choices
    this.correctIndex = correctIndex
  }
}
