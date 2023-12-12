import { MultipleChoiceBuilder, MultipleChoice } from './mc'

export interface QuestionSet {
  name: string
  questions: ReadonlyArray<Question>
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
    return {
      name: this.name,
      questions: this.questions,
    }
  }
}
