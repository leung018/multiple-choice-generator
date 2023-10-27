import { CustomBaseError } from '../utils/err'

interface MultipleChoiceInput {
  choices: ReadonlyArray<string>
  correctChoiceIndex: number
}

export class MultipleChoice {
  readonly choices: ReadonlyArray<string>
  readonly correctChoiceIndex: number

  static createTestInstance({
    choices = ['a', 'b'],
    correctChoiceIndex = 0,
  } = {}): MultipleChoice {
    return new MultipleChoice({ choices, correctChoiceIndex })
  }

  constructor(input: MultipleChoiceInput) {
    this.validateInput(input)

    this.choices = input.choices
    this.correctChoiceIndex = input.correctChoiceIndex
  }

  private validateInput(input: MultipleChoiceInput) {
    this.validateChoices(input.choices)

    if (
      input.correctChoiceIndex < 0 ||
      input.correctChoiceIndex >= input.choices.length
    ) {
      throw new MultipleChoiceError(
        'INVALID_INDEX',
        'MultipleChoice correctChoiceIndex must be within range of choices',
      )
    }
  }

  private validateChoices(choices: ReadonlyArray<string>): void {
    if (choices.length < 2) {
      throw new MultipleChoiceError(
        'INVALID_NUMBER_OF_CHOICES',
        'MultipleChoice must have at least 2 choices',
      )
    }
    if (new Set(choices).size !== choices.length) {
      throw new MultipleChoiceError(
        'DUPLICATE_CHOICES',
        'MultipleChoice cannot have duplicate choices',
      )
    }
  }
}

type MultipleChoiceErrorCode =
  | 'DUPLICATE_CHOICES'
  | 'INVALID_INDEX'
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

// TODO: Migrate MultipleChoice to NewVersionMultipleChoice
export class NewVersionMultipleChoice {
  choices: ReadonlyArray<Choice>

  correctChoiceIndex: number

  constructor({
    choices,
    correctChoiceIndex,
  }: {
    choices: ReadonlyArray<Choice>
    correctChoiceIndex: number
  }) {
    this.choices = choices
    this.correctChoiceIndex = correctChoiceIndex
  }
}

export class MultipleChoiceBuilder {
  private choices: Choice[] = []

  private correctChoiceIndex: number = -1

  addFixedChoice(answer: string): MultipleChoiceBuilder {
    return this.addChoice({ answer, isFixedPosition: true })
  }

  addNonFixedChoice(answer: string): MultipleChoiceBuilder {
    return this.addChoice({ answer, isFixedPosition: false })
  }

  addChoice(choice: Choice): MultipleChoiceBuilder {
    this.choices.push(choice)
    return this
  }

  setCorrectChoiceIndex(index: number): MultipleChoiceBuilder {
    this.correctChoiceIndex = index
    return this
  }

  build(): NewVersionMultipleChoice {
    return new NewVersionMultipleChoice({
      choices: this.choices,
      correctChoiceIndex: this.correctChoiceIndex,
    })
  }
}
