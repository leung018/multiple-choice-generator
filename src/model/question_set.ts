import { MultipleChoiceBuilder, NewVersionMultipleChoice } from './mc'

export interface QuestionSet {
  name: string
  questions: ReadonlyArray<{
    title: string
    mc: NewVersionMultipleChoice
  }>
}

export class QuestionSetTestBuilder {
  private name: string = 'Dummy question set'
  private questions: {
    title: string
    mc: NewVersionMultipleChoice
  }[] = []

  appendQuestion({
    title = 'dummy title',
    mc = new MultipleChoiceBuilder()
      .setCorrectChoiceIndex(0)
      .addNonFixedChoice('dummy choice 1')
      .addNonFixedChoice('dummy choice 2')
      .build(),
  } = {}): QuestionSetTestBuilder {
    this.questions.push({
      title: title,
      mc: mc,
    })
    return this
  }

  buildTestInstance(): QuestionSet {
    return {
      name: this.name,
      questions: this.questions,
    }
  }
}
