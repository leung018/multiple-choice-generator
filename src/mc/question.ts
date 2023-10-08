interface MultipleChoiceQuestion<T extends SelectorIdType> {
  title: string
  mc: MultipleChoice<T>
}

interface MultipleChoice<T extends SelectorIdType> {
  choices: Record<T, Choice>
  answer: T
}

type SelectorIdType = string | number

interface Choice {
  description: string
}
