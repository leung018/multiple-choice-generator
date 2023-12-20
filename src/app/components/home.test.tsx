import {
  QuestionSet,
  QuestionSetBuilderForTest,
} from '../../model/question_set'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { HomePageUIService } from './home'
import { QuestionSetRepoFactory } from '../../repo/question_set'

describe('HomePage', () => {
  // Detail of testing of the navigation of this page should be in the integration test combine with saving question set

  it('should render single question set', () => {
    const { getByText } = renderHomePage({
      questionSets: [
        new QuestionSetBuilderForTest().setName('Question Set').build(),
      ],
    })
    expect(getByText('Question Set')).toBeInTheDocument()
  })
})

function renderHomePage({
  questionSets,
}: {
  questionSets: readonly QuestionSet[]
}) {
  const questionSetRepo = QuestionSetRepoFactory.createTestInstance()
  questionSets.forEach((set) => questionSetRepo.createQuestionSet(set))
  return render(
    HomePageUIService.createTestInstance({ questionSetRepo }).getElement(),
  )
}
