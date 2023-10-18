import { MultipleChoice } from './mc'

export interface MultipleChoiceQuestion {
  title: string
  mc: MultipleChoice
}

export class MultipleChoiceQuestionFactory {
  static createTestInstance({
    title = 'Sample',
    mc = MultipleChoice.createTestInstance(),
  } = {}): MultipleChoiceQuestion {
    return {
      title,
      mc,
    }
  }
}
