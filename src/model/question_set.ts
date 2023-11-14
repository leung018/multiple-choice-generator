import { MultipleChoiceBuilder, MultipleChoice } from './mc'

export interface QuestionSet {
  name: string
  questions: ReadonlyArray<{
    description: string
    mc: MultipleChoice
  }>
}

export class QuestionSetBuilderForTest {
  private name: string = 'Dummy question set'
  private questions: {
    description: string
    mc: MultipleChoice
  }[] = []

  appendQuestion({
    title = 'dummy title',
    mc = new MultipleChoiceBuilder()
      .setCorrectChoiceIndex(0)
      .appendNonFixedChoice('dummy choice 1')
      .appendNonFixedChoice('dummy choice 2')
      .build(),
  } = {}): QuestionSetBuilderForTest {
    this.questions.push({
      description: title,
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
