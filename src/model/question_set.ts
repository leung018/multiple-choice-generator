import { MultipleChoiceBuilder, MultipleChoice } from './mc'
import { v4 as uuidv4 } from 'uuid'
export class QuestionSet {
  readonly name: string

  readonly questions: ReadonlyArray<Question>

  readonly id: string

  static create({
    name,
    questions,
  }: {
    name: string
    questions: ReadonlyArray<Question>
  }) {
    const id = uuidv4()
    return new QuestionSet({ id, name, questions })
  }

  constructor({
    id,
    name,
    questions,
  }: {
    id: string
    name: string
    questions: ReadonlyArray<Question>
  }) {
    this.id = id
    this.name = name
    this.questions = questions
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

  setName(name: string): QuestionSetBuilderForTest {
    this.name = name
    return this
  }

  appendQuestion({
    description = 'dummy question',
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
    return QuestionSet.create({
      name: this.name,
      questions: this.questions,
    })
  }
}
