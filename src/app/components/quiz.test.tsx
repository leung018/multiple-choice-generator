import { MultipleChoiceBuilder } from '../../model/mc'
import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MultipleChoiceQuizUIService } from './quiz'
import {
  QuestionSetBuilderForTest,
  QuestionSet,
} from '../../model/question_set'
import { LocalStorageQuestionSetRepo } from '../../repo/question_set'

describe('MultipleChoiceQuiz', () => {
  const presetCorrectChoiceMcBuilder = () => {
    return new MultipleChoiceBuilder().setCorrectChoiceIndex(0)
  }

  it('should render name of question set', () => {
    const {
      renderResult: { getByText },
    } = renderMultipleChoicePage({
      originalQuestionSet: new QuestionSetBuilderForTest()
        .setName('My Question Set')
        .build(),
    })
    expect(getByText('My Question Set')).toBeInTheDocument()
  })

  it('should render attributes of a question', () => {
    const {
      renderResult: { getByText, getByLabelText },
    } = renderMultipleChoicePage({
      originalQuestionSet: new QuestionSetBuilderForTest()
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
    const {
      renderResult: { getByText },
    } = renderMultipleChoicePage({
      originalQuestionSet: new QuestionSetBuilderForTest()
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
    const {
      renderResult: { getByLabelText },
    } = renderMultipleChoicePage({
      originalQuestionSet: new QuestionSetBuilderForTest()
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
    const {
      renderResult: { getByLabelText },
    } = renderMultipleChoicePage({
      originalQuestionSet: new QuestionSetBuilderForTest()
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
      MultipleChoiceQuizUIService.createNull({
        questionSetId: 'unknown',
      }).getElement(),
    )

    expect(getByText('404')).toBeInTheDocument()
  })

  it('should display final score when submit button is clicked', async () => {
    const {
      renderResult: { findByText, getByText, getByLabelText },
    } = renderMultipleChoicePage({
      originalQuestionSet: new QuestionSetBuilderForTest()
        .appendQuestion({
          mc: new MultipleChoiceBuilder()
            .setCorrectChoiceIndex(0)
            .appendNonFixedChoice('Question 1 Choice 1 (Correct)')
            .appendNonFixedChoice('Question 1 Choice 2')
            .build(),
        })
        .appendQuestion({
          mc: new MultipleChoiceBuilder()
            .setCorrectChoiceIndex(1)
            .appendNonFixedChoice('Question 2 Choice 1')
            .appendNonFixedChoice('Question 2 Choice 2 (Correct)')
            .build(),
        })
        .build(),
    })

    fireEvent.click(getByLabelText('Question 1 Choice 1 (Correct)'))
    fireEvent.click(getByLabelText('Question 2 Choice 1'))

    fireEvent.click(getByText('Submit'))

    expect(await findByText('Your score: 1/2')).toBeVisible()
  })

  it('should display back to home page button only after submit button is clicked', async () => {
    const {
      renderResult: { queryByRole, getByText, findByRole },
    } = renderMultipleChoicePage()

    expect(queryByRole('button', { name: 'Back' })).toBeNull()
    fireEvent.click(getByText('Submit'))

    expect(await findByRole('button', { name: 'Back' })).toBeVisible()
  })

  it('should submit button and choices are disabled after submitting', async () => {
    const {
      renderResult: { getByText, getByLabelText },
    } = renderMultipleChoicePage({
      originalQuestionSet: new QuestionSetBuilderForTest()
        .appendQuestion({
          mc: presetCorrectChoiceMcBuilder()
            .appendNonFixedChoice('Question 1 Choice 1')
            .appendNonFixedChoice('Question 1 Choice 2')
            .build(),
        })
        .build(),
    })

    fireEvent.click(getByLabelText('Question 1 Choice 1'))
    fireEvent.click(getByText('Submit'))

    expect(getByText('Submit')).toBeDisabled()
    expect(getByLabelText('Question 1 Choice 1')).toBeDisabled()
    expect(getByLabelText('Question 1 Choice 2')).toBeDisabled()
  })

  it('should indicate correct and wrong answers after submitting', async () => {
    const {
      renderResult: { getByText, getByLabelText },
    } = renderMultipleChoicePage({
      originalQuestionSet: new QuestionSetBuilderForTest()
        .appendQuestion({
          mc: new MultipleChoiceBuilder()
            .setCorrectChoiceIndex(0)
            .appendNonFixedChoice('Question 1 Choice 1 (Correct)')
            .appendNonFixedChoice('Question 1 Choice 2')
            .build(),
        })
        .appendQuestion({
          mc: new MultipleChoiceBuilder()
            .setCorrectChoiceIndex(1)
            .appendNonFixedChoice('Question 2 Choice 1')
            .appendNonFixedChoice('Question 2 Choice 2 (Correct)')
            .build(),
        })
        .build(),
    })

    fireEvent.click(getByLabelText('Question 1 Choice 1 (Correct)'))
    fireEvent.click(getByLabelText('Question 2 Choice 1'))

    fireEvent.click(getByText('Submit'))

    expect(
      getByLabelText('Question 1 Choice 1 (Correct) is correct'),
    ).toBeVisible()
    expect(getByLabelText('Question 2 Choice 1 is wrong')).toBeVisible()
  })

  it('should questionSet being saved to lastSubmittedQuestionSetRepo after submitting', async () => {
    const questionSet = new QuestionSetBuilderForTest().build()

    const {
      renderResult: { getByText },
      lastSubmittedQuestionSetRepo,
    } = renderMultipleChoicePage({
      originalQuestionSet: questionSet,
    })

    fireEvent.click(getByText('Submit'))

    expect(
      lastSubmittedQuestionSetRepo.getQuestionSetById(questionSet.id),
    ).toEqual(questionSet)
  })

  it('should use originalQuestionSet if there is no lastSubmittedQuestionSet', async () => {
    const originalQuestionSet = new QuestionSetBuilderForTest().build()

    const {
      renderResult: { getByText },
      lastSubmittedQuestionSetRepo,
    } = renderMultipleChoicePage({
      originalQuestionSet,
      lastSubmittedQuestionSet: null,
    })

    fireEvent.click(getByText('Submit'))

    expect(
      lastSubmittedQuestionSetRepo.getQuestionSetById(originalQuestionSet.id),
    ).toEqual(originalQuestionSet)
  })

  it('should swap multiple choices of lastSubmittedQuestionSet if possible', async () => {
    const originalQuestionSet = new QuestionSetBuilderForTest()
      .appendQuestion({
        mc: new MultipleChoiceBuilder()
          .setCorrectChoiceIndex(0)
          .appendNonFixedChoice('Question 1 Choice 1 (Correct)')
          .appendNonFixedChoice('Question 1 Choice 2')
          .build(),
      })
      .build()

    const {
      renderResult: { getByText, getByLabelText },
      lastSubmittedQuestionSetRepo,
    } = renderMultipleChoicePage({
      originalQuestionSet,
      lastSubmittedQuestionSet: originalQuestionSet,
    })

    // Choices are swapped in the page
    const choice1 = getByLabelText('Question 1 Choice 1 (Correct)')
    const choice2 = getByLabelText('Question 1 Choice 2')
    expect(choice2.compareDocumentPosition(choice1)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )

    fireEvent.click(getByText('Submit'))

    // Should save the swapped choices to lastSubmittedQuestionSetRepo
    const lastSubmittedQuestionSet =
      lastSubmittedQuestionSetRepo.getQuestionSetById(originalQuestionSet.id)
    const question = lastSubmittedQuestionSet.questions[0]
    const choices = question.mc.choices
    expect(choices[0].answer).toBe('Question 1 Choice 2')
    expect(choices[1].answer).toBe('Question 1 Choice 1 (Correct)')
  })
})

function renderMultipleChoicePage({
  originalQuestionSet = new QuestionSetBuilderForTest().build(),
  lastSubmittedQuestionSet = null,
}: {
  originalQuestionSet?: QuestionSet
  lastSubmittedQuestionSet?: QuestionSet | null
} = {}) {
  const originalQuestionSetRepo = LocalStorageQuestionSetRepo.createNull()
  originalQuestionSetRepo.upsertQuestionSet(originalQuestionSet)

  const lastSubmittedQuestionSetRepo = LocalStorageQuestionSetRepo.createNull()
  if (lastSubmittedQuestionSet) {
    lastSubmittedQuestionSetRepo.upsertQuestionSet(lastSubmittedQuestionSet)
  }

  return {
    renderResult: render(
      MultipleChoiceQuizUIService.createNull({
        originalQuestionSetRepo,
        lastSubmittedQuestionSetRepo,
        questionSetId: originalQuestionSet.id,
      }).getElement(),
    ),
    lastSubmittedQuestionSetRepo,
  }
}
