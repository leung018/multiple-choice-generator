import { MultipleChoiceBuilder, MultipleChoice } from './mc'

export interface QuestionSet {
  name: string
  questions: ReadonlyArray<{
    title: string
    mc: MultipleChoice
  }>
}

export class QuestionSetBuilderForTest {
  private name: string = 'Dummy question set'
  private questions: {
    title: string
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
      title: title,
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
