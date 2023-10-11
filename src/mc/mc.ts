import { CustomBaseError } from '../utils/err'

export class MultipleChoice {
  readonly choices: ReadonlyArray<string>
  readonly correctChoiceIndex: number

  static createTestInstance({
    choices = ['a', 'b'],
    correctChoiceIndex = 0,
  } = {}): MultipleChoice {
    return new MultipleChoice(choices, correctChoiceIndex)
  }

  constructor(choices: ReadonlyArray<string>, correctIndex: number) {
    this.validateInput(choices, correctIndex)

    this.choices = choices
    this.correctChoiceIndex = correctIndex
  }

  private validateInput(
    choices: ReadonlyArray<string>,
    correctChoiceIndex: number,
  ) {
    this.validateChoices(choices)

    if (correctChoiceIndex < 0 || correctChoiceIndex >= choices.length) {
      throw new MultipleChoiceError(
        'INVALID_INDEX',
        'MultipleChoice correctChoiceIndex must be within range of choices',
      )
    }
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

type MultipleChoiceErrorCode = 'DUPLICATE_CHOICES' | 'INVALID_INDEX'

export class MultipleChoiceError extends CustomBaseError {
  constructor(code: MultipleChoiceErrorCode, message?: string) {
    super(code, message)
  }
}
