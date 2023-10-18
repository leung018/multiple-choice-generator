import { MultipleChoice } from '../../../mc/mc'
import {
  MultipleChoiceQuestion,
  MultipleChoiceQuestionFactory,
} from '../../../mc/question'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import MultipleChoicePage from './display'

describe('MultipleChoicePage', () => {
  it('should render title and choices of a question', () => {
    const question: MultipleChoiceQuestion = {
      title: 'Sample Question?',
      mc: MultipleChoice.createTestInstance({
        choices: ['Answer 1', 'Answer 2'],
      }),
    }
    const { getByText, getByLabelText } = render(
      <MultipleChoicePage questions={[question]} />,
    )
    expect(getByText('Sample Question?')).toBeInTheDocument()
    expect(getByLabelText('Answer 1')).toBeInTheDocument()
    expect(getByLabelText('Answer 2')).toBeInTheDocument()
  })

  it('should render multiple questions', () => {
    const { getByText } = render(
      <MultipleChoicePage
        questions={[
          MultipleChoiceQuestionFactory.createTestInstance({
            title: 'Question 1',
          }),
          MultipleChoiceQuestionFactory.createTestInstance({
            title: 'Question 2',
          }),
        ]}
      />,
    )
    expect(getByText('Question 1')).toBeInTheDocument()
    expect(getByText('Question 2')).toBeInTheDocument()
  })

  it('should select one choice in a question will uncheck other selected', () => {
    const { getByLabelText } = render(
      <MultipleChoicePage
        questions={[
          MultipleChoiceQuestionFactory.createTestInstance({
            mc: MultipleChoice.createTestInstance({
              choices: ['Choice 1', 'Choice 2'],
            }),
          }),
        ]}
      />,
    )
    const choice1 = getByLabelText('Choice 1')
    const choice2 = getByLabelText('Choice 2')

    choice1.click()
    expect(choice1).toBeChecked()

    choice2.click()
    expect(choice1).not.toBeChecked()
    expect(choice2).toBeChecked()
  })

  it("should select one choice in a question won't affect other questions", () => {
    const { getByLabelText } = render(
      <MultipleChoicePage
        questions={[
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
        ]}
      />,
    )

    const question1ChoiceA = getByLabelText('Question 1 Choice A')
    const question2ChoiceB = getByLabelText('Question 2 Choice B')

    question1ChoiceA.click()
    question2ChoiceB.click()

    expect(question1ChoiceA).toBeChecked()
    expect(question2ChoiceB).toBeChecked()
  })

  it('should are choices unchecked at the beginning', () => {
    const { getByLabelText } = render(
      <MultipleChoicePage
        questions={[
          MultipleChoiceQuestionFactory.createTestInstance({
            mc: MultipleChoice.createTestInstance({
              choices: ['Choice 1', 'Choice 2'],
            }),
          }),
        ]}
      />,
    )
    const choice1 = getByLabelText('Choice 1')
    const choice2 = getByLabelText('Choice 2')

    expect(choice1).not.toBeChecked()
    expect(choice2).not.toBeChecked()
  })
})
