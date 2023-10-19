import { MultipleChoice } from '../../../mc/mc'
import {
  MultipleChoiceQuestion,
  MultipleChoiceQuestionFactory,
} from '../../../mc/question'
import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import MultipleChoicePage from './display'

describe('MultipleChoicePage', () => {
  it('should render title and choices of a question', () => {
    const { getByText, getByLabelText } = renderMultipleChoicePage({
      questions: [
        {
          title: 'Sample Question?',
          mc: MultipleChoice.createTestInstance({
            choices: ['Answer 1', 'Answer 2'],
          }),
        },
      ],
    })
    expect(getByText('Sample Question?')).toBeInTheDocument()
    expect(getByLabelText('Answer 1')).toBeInTheDocument()
    expect(getByLabelText('Answer 2')).toBeInTheDocument()
  })

  it('should render multiple questions', () => {
    const { getByText } = renderMultipleChoicePage({
      questions: [
        MultipleChoiceQuestionFactory.createTestInstance({
          title: 'Question 1',
        }),
        MultipleChoiceQuestionFactory.createTestInstance({
          title: 'Question 2',
        }),
      ],
    })
    expect(getByText('Question 1')).toBeInTheDocument()
    expect(getByText('Question 2')).toBeInTheDocument()
  })

  it('should select one choice in a question will uncheck other selected', () => {
    const { getByLabelText } = renderMultipleChoicePage({
      questions: [
        MultipleChoiceQuestionFactory.createTestInstance({
          mc: MultipleChoice.createTestInstance({
            choices: ['Choice 1', 'Choice 2'],
          }),
        }),
      ],
    })
    const choice1 = getByLabelText('Choice 1')
    const choice2 = getByLabelText('Choice 2')

    fireEvent.click(choice1)
    expect(choice1).toBeChecked()

    fireEvent.click(choice2)
    expect(choice1).not.toBeChecked()
    expect(choice2).toBeChecked()
  })

  it("should select one choice in a question won't affect other questions", () => {
    const { getByLabelText } = renderMultipleChoicePage({
      questions: [
        MultipleChoiceQuestionFactory.createTestInstance({
          mc: MultipleChoice.createTestInstance({
            choices: ['Question 1 Choice A', 'Question 1 Choice B'],
          }),
        }),
        MultipleChoiceQuestionFactory.createTestInstance({
          mc: MultipleChoice.createTestInstance({
            choices: ['Question 2 Choice A', 'Question 2 Choice B'],
          }),
        }),
      ],
    })

    const question1ChoiceA = getByLabelText('Question 1 Choice A')
    const question2ChoiceB = getByLabelText('Question 2 Choice B')

    fireEvent.click(question1ChoiceA)
    fireEvent.click(question2ChoiceB)

    expect(question1ChoiceA).toBeChecked()
    expect(question2ChoiceB).toBeChecked()
  })

  it('should are choices unchecked at the beginning', () => {
    const { getByLabelText } = renderMultipleChoicePage({
      questions: [
        MultipleChoiceQuestionFactory.createTestInstance({
          mc: MultipleChoice.createTestInstance({
            choices: ['Choice 1', 'Choice 2'],
          }),
        }),
      ],
    })
    const choice1 = getByLabelText('Choice 1')
    const choice2 = getByLabelText('Choice 2')

    expect(choice1).not.toBeChecked()
    expect(choice2).not.toBeChecked()
  })
})

/* This wrapper function exist because in future, may need to move this test to other layer and the setup for it will be different too.
 * So, with this wrapper function, it will be easier to change in the future.
 */
function renderMultipleChoicePage({
  questions,
}: {
  questions: MultipleChoiceQuestion[]
}) {
  return render(<MultipleChoicePage questions={questions} />)
}
