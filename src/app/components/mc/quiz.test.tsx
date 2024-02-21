import { MultipleChoiceBuilder } from '../../../model/mc'
import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MultipleChoiceQuizUIService } from './quiz'
import {
  QuestionSetBuilderForTest,
  QuestionSet,
} from '../../../model/question_set'
import { LocalStorageQuestionSetRepo } from '../../../repo/question_set'

describe('MultipleChoiceQuiz', () => {
  const presetCorrectChoiceMcBuilder = () => {
    return new MultipleChoiceBuilder().setCorrectChoiceIndex(0)
  }

  it('should render name of question set', () => {
    const { getByText } = renderMultipleChoicePage({
      questionSet: new QuestionSetBuilderForTest()
        .setName('My Question Set')
        .build(),
    })
    expect(getByText('My Question Set')).toBeInTheDocument()
  })

  it('should render attributes of a question', () => {
    const { getByText, getByLabelText } = renderMultipleChoicePage({
      questionSet: new QuestionSetBuilderForTest()
        .appendQuestion({
          description: 'Sample Question?',
          mc: presetCorrectChoiceMcBuilder()
            .appendNonFixedChoice('Answer 1')
            .appendNonFixedChoice('Answer 2')
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
          description: 'Question 1',
        })
        .appendQuestion({
          description: 'Question 2',
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
          mc: presetCorrectChoiceMcBuilder()
            .appendNonFixedChoice('Choice 1')
            .appendNonFixedChoice('Choice 2')
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
    const { getByLabelText } = renderMultipleChoicePage({
      questionSet: new QuestionSetBuilderForTest()
        .appendQuestion({
          mc: presetCorrectChoiceMcBuilder()
            .appendNonFixedChoice('Question 1 Choice A')
            .appendNonFixedChoice('Question 1 Choice B')
            .build(),
        })
        .appendQuestion({
          mc: presetCorrectChoiceMcBuilder()
            .appendNonFixedChoice('Question 2 Choice A')
            .appendNonFixedChoice('Question 2 Choice B')
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

  it("should render not found when question set doesn't exist", () => {
    const { getByText } = render(
      MultipleChoiceQuizUIService.createTestInstance({
        questionSetId: 'unknown',
      }).getElement(),
    )

    expect(getByText('404')).toBeInTheDocument()
  })
})

function renderMultipleChoicePage({
  questionSet,
}: {
  questionSet: QuestionSet
}) {
  const questionSetRepo = LocalStorageQuestionSetRepo.createNull()
  questionSetRepo.addQuestionSet(questionSet)
  return render(
    MultipleChoiceQuizUIService.createTestInstance({
      questionSetRepo,
      questionSetId: questionSet.id,
    }).getElement(),
  )
}
