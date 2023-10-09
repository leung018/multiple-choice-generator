export class MultipleChoice {
  readonly choices: ReadonlyArray<string>
  readonly correctChoiceIndex: number

  constructor(choices: ReadonlyArray<string>, correctIndex: number) {
    this.choices = choices
    this.correctChoiceIndex = correctIndex
  }
}
