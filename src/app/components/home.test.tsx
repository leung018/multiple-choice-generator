import {
  QuestionSet,
  QuestionSetBuilderForTest,
} from '../../model/question_set'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { HomePageUIService } from './home'
import { LocalStorageQuestionSetRepo } from '../../repo/question_set'

describe('HomePage', () => {
  // Detail of testing of the navigation of this page should be in larger scope tests like e2e tests

  it('should render single question set', () => {
    const { getByText } = renderHomePage({
      questionSets: [
        new QuestionSetBuilderForTest().setName('Question Set').build(),
      ],
    })
    expect(getByText('Question Set')).toBeInTheDocument()
  })

  it('should render multiple question sets in alphabetical order', () => {
    const { getByText } = renderHomePage({
      questionSets: [
        new QuestionSetBuilderForTest().setName('Banana').build(),
        new QuestionSetBuilderForTest().setName('Apple').build(),
        new QuestionSetBuilderForTest().setName('Orange').build(),
        new QuestionSetBuilderForTest().setName('durian').build(), // should be case insensitive
      ],
    })

    const apple = getByText('Apple')
    const banana = getByText('Banana')
    const durian = getByText('durian')
    const orange = getByText('Orange')

    expect(apple.compareDocumentPosition(banana)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
    expect(banana.compareDocumentPosition(durian)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
    expect(durian.compareDocumentPosition(orange)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
  })
})

function renderHomePage({
  questionSets,
}: {
  questionSets: readonly QuestionSet[]
}) {
  const questionSetRepo = LocalStorageQuestionSetRepo.createNull()
  questionSets.forEach((set) => questionSetRepo.addQuestionSet(set))
  return render(HomePageUIService.createNull({ questionSetRepo }).getElement())
}
