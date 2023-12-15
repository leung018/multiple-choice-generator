import { MultipleChoiceBuilder, MultipleChoice } from './mc'
import { v4 as uuidv4 } from 'uuid'
export class QuestionSet {
  readonly name: string

  readonly questions: ReadonlyArray<Question>

  readonly id: string

  constructor({
    name,
    questions,
  }: {
    name: string
    questions: ReadonlyArray<Question>
  }) {
    this.name = name
    this.questions = questions
    this.id = uuidv4()
  }
}

export interface Question {
  description: string
  mc: MultipleChoice
}

export class QuestionSetBuilderForTest {
  private name: string = 'Dummy question set'
  private questions: {
    description: string
    mc: MultipleChoice
  }[] = []

  appendQuestion({
    description = 'dummy title',
    mc = new MultipleChoiceBuilder()
      .setCorrectChoiceIndex(0)
      .appendNonFixedChoice('dummy choice 1')
      .appendNonFixedChoice('dummy choice 2')
      .build(),
  } = {}): QuestionSetBuilderForTest {
    this.questions.push({
      description,
      mc: mc,
    })
    return this
  }

  build(): QuestionSet {
    return new QuestionSet({
      name: this.name,
      questions: this.questions,
    })
  }
}
