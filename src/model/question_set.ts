import { NewVersionMultipleChoice } from './mc'

export interface QuestionSet {
  name: string
  questions: ReadonlyArray<{
    title: string
    mc: NewVersionMultipleChoice
  }>
}
