export class MultipleChoice {
  readonly choices: ReadonlyArray<string>
  readonly correctChoiceIndex: number

  constructor(choices: ReadonlyArray<string>, correctIndex: number) {
    this.validateChoices(choices)

    this.choices = choices
    this.correctChoiceIndex = correctIndex
  }

  private validateChoices(choices: ReadonlyArray<string>): void {
    if (new Set(choices).size !== choices.length) {
      throw new MultipleChoiceError(
        'MultipleChoice cannot have duplicate choices',
        'DUPLICATE_CHOICES',
      )
    }
  }
}

type MultipleChoiceErrorCode = 'DUPLICATE_CHOICES'

export interface MultipleChoiceErrorOptions extends ErrorOptions {
  cause: {
    code: MultipleChoiceErrorCode
  }
}

export class MultipleChoiceError extends Error {
  readonly cause!: MultipleChoiceErrorOptions['cause']

  constructor(message: string, code: MultipleChoiceErrorCode) {
    super(message, { cause: { code } })
  }
}
