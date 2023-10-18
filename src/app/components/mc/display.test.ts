import { MultipleChoice } from '../../../mc/mc'
import {
  MultipleChoiceQuestion,
  MultipleChoiceQuestionFactory,
} from '../../../mc/question'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import MultipleChoicePage from './display'

describe('MultipleChoicePage', () => {
  it("should render MultipleChoiceQuestion's title and choices", () => {
    const question: MultipleChoiceQuestion = {
      title: 'Sample Question?',
      mc: MultipleChoice.createTestInstance({
        choices: ['Answer 1', 'Answer 2'],
      }),
    }
    const { getByText, getByLabelText } = render(
      MultipleChoicePage({ questions: [question] }),
    )
    expect(getByText('Sample Question?')).toBeInTheDocument()
    expect(getByLabelText('Answer 1')).toBeInTheDocument()
    expect(getByLabelText('Answer 2')).toBeInTheDocument()
  })

  it('should render multiple questions', () => {
    const { getByText } = render(
      MultipleChoicePage({
        questions: [
          MultipleChoiceQuestionFactory.createTestInstance({
            title: 'Question 1',
          }),
          MultipleChoiceQuestionFactory.createTestInstance({
            title: 'Question 2',
          }),
        ],
      }),
    )
    expect(getByText('Question 1')).toBeInTheDocument()
    expect(getByText('Question 2')).toBeInTheDocument()
  })
})
