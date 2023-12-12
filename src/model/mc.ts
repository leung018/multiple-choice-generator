import { CustomBaseError } from '../utils/err'

type MultipleChoiceErrorCode =
  | 'DUPLICATE_CHOICES'
  | 'INVALID_CORRECT_CHOICE_INDEX'
  | 'INVALID_NUMBER_OF_CHOICES'

export class MultipleChoiceError extends CustomBaseError {
  constructor(code: MultipleChoiceErrorCode, message?: string) {
    super(code, message)
  }
}

export interface Choice {
  answer: string
  isFixedPosition: boolean
}

interface MultipleChoiceInput {
  choices: ReadonlyArray<Choice>
  correctChoiceIndex: number
}

export class MultipleChoice {
  readonly choices: ReadonlyArray<Choice>

  readonly correctChoiceIndex: number

  constructor({ choices, correctChoiceIndex }: MultipleChoiceInput) {
    this.validateInput({ choices, correctChoiceIndex })
    this.choices = choices
    this.correctChoiceIndex = correctChoiceIndex
  }

  private validateInput(input: MultipleChoiceInput) {
    this.validateChoices(input.choices)

    if (
      input.correctChoiceIndex < 0 ||
      input.correctChoiceIndex >= input.choices.length
    ) {
      throw new MultipleChoiceError(
        'INVALID_CORRECT_CHOICE_INDEX',
        'MultipleChoice correctChoiceIndex must be within range of choices',
      )
    }
  }

  private validateChoices(choices: ReadonlyArray<Choice>): void {
    if (choices.length < 2) {
      throw new MultipleChoiceError(
        'INVALID_NUMBER_OF_CHOICES',
        'MultipleChoice must have at least 2 choices',
      )
    }
    if (new Set(choices.map((c) => c.answer)).size !== choices.length) {
      throw new MultipleChoiceError(
        'DUPLICATE_CHOICES',
        'MultipleChoice cannot have duplicate choices',
      )
    }
  }
}

export class MultipleChoiceBuilder {
  private choices: Choice[] = []

  private correctChoiceIndex: number = -1

  appendFixedChoice(answer: string): MultipleChoiceBuilder {
    return this.appendChoice({ answer, isFixedPosition: true })
  }

  appendNonFixedChoice(answer: string): MultipleChoiceBuilder {
    return this.appendChoice({ answer, isFixedPosition: false })
  }

  appendChoice(choice: Choice): MultipleChoiceBuilder {
    this.choices.push(choice)
    return this
  }

  setCorrectChoiceIndex(index: number): MultipleChoiceBuilder {
    this.correctChoiceIndex = index
    return this
  }

  build(): MultipleChoice {
    return new MultipleChoice({
      choices: this.choices,
      correctChoiceIndex: this.correctChoiceIndex,
    })
  }
}
