export class MultipleChoice {
  readonly choices: ReadonlyArray<string>
  readonly correctIndex: number

  constructor(choices: ReadonlyArray<string>, correctIndex: number) {
    this.choices = choices
    this.correctIndex = correctIndex
  }
}
