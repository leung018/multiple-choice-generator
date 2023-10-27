import { MultipleChoiceBuilder } from '../../../model/mc'
import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import MultipleChoiceQuiz from './quiz'
import {
  QuestionSet,
  QuestionSetBuilderForTest,
} from '../../../model/question_set'

describe('MultipleChoiceQuiz', () => {
  it('should render title and choices of a question', () => {
    const { getByText, getByLabelText } = renderMultipleChoicePage({
      questionSet: new QuestionSetBuilderForTest()
        .appendQuestion({
          title: 'Sample Question?',
          mc: new MultipleChoiceBuilder()
            .setCorrectChoiceIndex(0)
            .addNonFixedChoice('Answer 1')
            .addNonFixedChoice('Answer 2')
            .build(),
        })
        .build(),
    })
    expect(getByText('Sample Question?')).toBeInTheDocument()
    expect(getByLabelText('Answer 1')).toBeInTheDocument()
    expect(getByLabelText('Answer 2')).toBeInTheDocument()
  })

  it('should render multiple questions', () => {
    const { getByText } = renderMultipleChoicePage({
      questionSet: new QuestionSetBuilderForTest()
        .appendQuestion({
          title: 'Question 1',
        })
        .appendQuestion({
          title: 'Question 2',
        })
        .build(),
    })
    expect(getByText('Question 1')).toBeInTheDocument()
    expect(getByText('Question 2')).toBeInTheDocument()
  })

  it('should select one choice in a question will check it and uncheck other previously selected', () => {
    const { getByLabelText } = renderMultipleChoicePage({
      questionSet: new QuestionSetBuilderForTest()
        .appendQuestion({
          mc: new MultipleChoiceBuilder()
            .setCorrectChoiceIndex(0)
            .addNonFixedChoice('Choice 1')
            .addNonFixedChoice('Choice 2')
            .build(),
        })
        .build(),
    })
    const choice1 = getByLabelText('Choice 1')
    const choice2 = getByLabelText('Choice 2')

    expect(choice1).not.toBeChecked()
    expect(choice2).not.toBeChecked()

    fireEvent.click(choice1)
    expect(choice1).toBeChecked()

    fireEvent.click(choice2)
    expect(choice1).not.toBeChecked()
    expect(choice2).toBeChecked()
  })

  it("should select one choice in a question won't affect other questions", () => {
    const presetIndexMcBuilder =
      new MultipleChoiceBuilder().setCorrectChoiceIndex(0)
    const { getByLabelText } = renderMultipleChoicePage({
      questionSet: new QuestionSetBuilderForTest()
        .appendQuestion({
          mc: new MultipleChoiceBuilder()
            .setCorrectChoiceIndex(0)
            .addNonFixedChoice('Question 1 Choice A')
            .addNonFixedChoice('Question 1 Choice B')
            .build(),
        })
        .appendQuestion({
          mc: new MultipleChoiceBuilder()
            .setCorrectChoiceIndex(0)
            .addNonFixedChoice('Question 2 Choice A')
            .addNonFixedChoice('Question 2 Choice B')
            .build(),
        })
        .build(),
    })

    const question1ChoiceA = getByLabelText('Question 1 Choice A')
    const question2ChoiceB = getByLabelText('Question 2 Choice B')

    fireEvent.click(question1ChoiceA)
    fireEvent.click(question2ChoiceB)

    expect(question1ChoiceA).toBeChecked()
    expect(question2ChoiceB).toBeChecked()
  })
})

/* This wrapper function exist because in future, may need to move this test to other layer and the setup for it will be different too.
 * So, with this wrapper function, it will be easier to change in the future.
 */
function renderMultipleChoicePage({
  questionSet,
}: {
  questionSet: QuestionSet
}) {
  // TODO: move this mapping to MultipleChoiceQuizUIService
  const questions = questionSet.questions.map((question) => {
    return {
      title: question.title,
      mc: {
        choices: question.mc.choices.map((choice) => choice.answer),
        correctChoiceIndex: question.mc.correctChoiceIndex,
      },
    }
  })
  return render(<MultipleChoiceQuiz questions={questions} />)
}
