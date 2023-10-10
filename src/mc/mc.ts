import { CustomBaseError } from '../utils/err'

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
        'DUPLICATE_CHOICES',
        'MultipleChoice cannot have duplicate choices',
      )
    }
  }
}

type MultipleChoiceErrorCode = 'DUPLICATE_CHOICES'

export class MultipleChoiceError extends CustomBaseError {
  constructor(code: MultipleChoiceErrorCode, message?: string) {
    super(code, message)
  }
}
