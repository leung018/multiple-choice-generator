import { MultipleChoiceQuestion } from './question'

export interface QuestionSet {
  name: string
  questions: ReadonlyArray<MultipleChoiceQuestion>
}
