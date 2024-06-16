import { MultipleChoiceBuilder, MultipleChoice } from './mc'
import { v4 as uuidv4 } from 'uuid'
export class QuestionSet {
  readonly name: string

  readonly questions: ReadonlyArray<Question>

  readonly id: string

  constructor({
    name,
    questions,
    id = uuidv4(),
  }: {
    name: string
    questions: ReadonlyArray<Question>
    id?: string
  }) {
    this.name = name
    this.questions = questions
    this.id = id
  }
}

export interface Question {
  readonly description: string
  readonly mc: MultipleChoice
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
    return new QuestionSet({
      name: this.name,
      questions: this.questions,
    })
  }
}
