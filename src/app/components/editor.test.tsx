import { fireEvent, render, screen } from '@testing-library/react'
import {
  QuestionSetRepo,
  LocalStorageQuestionSetRepo,
} from '../../repo/question_set'
import {
  QuestionSetEditorAriaLabel,
  QuestionSetEditorUIService,
} from './editor'
import { MultipleChoice } from '../../model/mc'
import '@testing-library/jest-dom'
import { QuestionSetBuilderForTest } from '../../model/question_set'

class UIServiceInteractor {
  private readonly questionSetRepo: QuestionSetRepo
  private questionSetName: string
  private questionNumberFocus = 1

  constructor({
    questionSetName = 'Dummy name',
    questionSetRepo = LocalStorageQuestionSetRepo.createNull(),
  }) {
    this.questionSetRepo = questionSetRepo
    render(
      QuestionSetEditorUIService.createNull({
        questionSetRepo: this.questionSetRepo,
      }).getElement(),
    )

    this.questionSetName = questionSetName
    this.setQuestionSetName(questionSetName)
  }

  setQuestionSetName(questionSetName: string) {
    this.questionSetName = questionSetName
    fireEvent.change(screen.getByLabelText('Question Set Name:'), {
      target: { value: this.questionSetName },
    })
    return this
  }

  setQuestionNumberFocus(questionNumber: number) {
    this.questionNumberFocus = questionNumber
    return this
  }

  getSavedQuestionSet() {
    return this.questionSetRepo.getQuestionSetByName(this.questionSetName)
  }

  inputQuestionDescription({ description }: { description: string }) {
    fireEvent.change(
      screen.getByLabelText(`Question ${this.questionNumberFocus}:`),
      {
        target: { value: description },
      },
    )
    return this
  }

  inputAnswer({
    choiceNumber,
    answer,
  }: {
    choiceNumber: number
    answer: string
  }) {
    fireEvent.change(
      screen.getByLabelText(
        QuestionSetEditorAriaLabel.answerInput({
          questionNumber: this.questionNumberFocus,
          choiceNumber,
        }),
      ),
      {
        target: { value: answer },
      },
    )
    return this
  }

  clickFixedPosition({ choiceNumber }: { choiceNumber: number }) {
    fireEvent.click(
      screen.getByLabelText(
        QuestionSetEditorAriaLabel.isFixedPositionCheckbox({
          questionNumber: this.questionNumberFocus,
          choiceNumber,
        }),
      ),
    )
    return this
  }

  clickCorrectAnswer({ choiceNumber }: { choiceNumber: number }) {
    fireEvent.click(this.getCorrectAnswerCheckbox({ choiceNumber }))
    return this
  }

  getCorrectAnswerCheckbox({ choiceNumber }: { choiceNumber: number }) {
    return screen.getByLabelText(
      QuestionSetEditorAriaLabel.isCorrectAnswerCheckbox({
        questionNumber: this.questionNumberFocus,
        choiceNumber,
      }),
    )
  }

  clickAddChoice() {
    const addChoiceButtons = screen.getAllByText('Add Choice')
    fireEvent.click(addChoiceButtons[this.questionNumberFocus - 1])
    return this
  }

  clickRemoveQuestion() {
    fireEvent.click(this.queryRemoveQuestionButton()!)
    return this
  }

  clickAddQuestion() {
    fireEvent.click(screen.getByText('Add Question'))
    return this
  }

  clickSave() {
    fireEvent.click(screen.getByText('Save'))
    return this
  }

  queryRemoveQuestionButton() {
    return screen.queryByLabelText(
      QuestionSetEditorAriaLabel.removeQuestionButton(this.questionNumberFocus),
    )
  }
}

describe('QuestionSetEditor', () => {
  it('should save question set successfully when no extra choice or question added', () => {
    const interactor = new UIServiceInteractor({ questionSetName: 'Test name' })
    interactor
      .setQuestionNumberFocus(1)
      .inputQuestionDescription({ description: 'Am I handsome?' })
      .inputAnswer({ choiceNumber: 1, answer: 'True' })
      .clickFixedPosition({ choiceNumber: 1 })
      .inputAnswer({ choiceNumber: 2, answer: 'False' })
      .clickCorrectAnswer({ choiceNumber: 2 })
      .clickSave()

    const actualQuestionSet = interactor.getSavedQuestionSet()

    expect(actualQuestionSet.name).toBe('Test name')
    expect(actualQuestionSet.questions).toEqual([
      {
        description: 'Am I handsome?',
        mc: new MultipleChoice({
          choices: [
            {
              answer: 'True',
              isFixedPosition: true,
            },
            {
              answer: 'False',
              isFixedPosition: false,
            },
          ],
          correctChoiceIndex: 1,
        }),
      },
    ])
  })

  it('should also save all input specified in extra option', () => {
    const interactor = new UIServiceInteractor({})
    interactor
      .setQuestionNumberFocus(1)
      .inputQuestionDescription({ description: '1 + 1 = ?' })

    interactor
      .inputAnswer({ choiceNumber: 1, answer: '1' })
      .inputAnswer({ choiceNumber: 2, answer: '0' })
      .clickAddChoice()
      .inputAnswer({ choiceNumber: 3, answer: 'None of the above' })
      .clickCorrectAnswer({ choiceNumber: 3 })
      .clickFixedPosition({ choiceNumber: 3 })
      .clickSave()

    const actualQuestionSet = interactor.getSavedQuestionSet()
    expect(actualQuestionSet.questions[0]).toEqual({
      description: '1 + 1 = ?',
      mc: new MultipleChoice({
        choices: [
          {
            answer: '1',
            isFixedPosition: false,
          },
          {
            answer: '0',
            isFixedPosition: false,
          },
          {
            answer: 'None of the above',
            isFixedPosition: true,
          },
        ],
        correctChoiceIndex: 2,
      }),
    })
  })

  it('should save question set after multiple clicks of add choice and add question', () => {
    const interactor = new UIServiceInteractor({})

    interactor
      .setQuestionNumberFocus(1)
      .inputQuestionDescription({ description: '1 + 1 = ?' })
      .inputAnswer({ choiceNumber: 1, answer: '2' })
      .inputAnswer({ choiceNumber: 2, answer: '0' })
      .clickCorrectAnswer({ choiceNumber: 1 })

    interactor.clickAddQuestion()

    interactor
      .setQuestionNumberFocus(2)
      .inputQuestionDescription({ description: '1 + 2 = ?' })
      .inputAnswer({ choiceNumber: 1, answer: '3' })
      .inputAnswer({ choiceNumber: 2, answer: '0' })
      .clickCorrectAnswer({ choiceNumber: 1 })

    interactor.clickAddQuestion()

    interactor
      .setQuestionNumberFocus(3)
      .inputQuestionDescription({ description: '1 + 3 = ?' })
      .inputAnswer({ choiceNumber: 1, answer: '1' })
      .inputAnswer({ choiceNumber: 2, answer: '3' })
      .clickAddChoice()
      .clickAddChoice()
      .inputAnswer({ choiceNumber: 3, answer: '0' })
      .inputAnswer({ choiceNumber: 4, answer: 'None of the above' })
      .clickCorrectAnswer({ choiceNumber: 4 })
      .clickFixedPosition({ choiceNumber: 4 })

    interactor.clickSave()

    const actualQuestionSet = interactor.getSavedQuestionSet()
    expect(actualQuestionSet.questions).toEqual([
      {
        description: '1 + 1 = ?',
        mc: new MultipleChoice({
          choices: [
            {
              answer: '2',
              isFixedPosition: false,
            },
            {
              answer: '0',
              isFixedPosition: false,
            },
          ],
          correctChoiceIndex: 0,
        }),
      },
      {
        description: '1 + 2 = ?',
        mc: new MultipleChoice({
          choices: [
            {
              answer: '3',
              isFixedPosition: false,
            },
            {
              answer: '0',
              isFixedPosition: false,
            },
          ],
          correctChoiceIndex: 0,
        }),
      },
      {
        description: '1 + 3 = ?',
        mc: new MultipleChoice({
          choices: [
            {
              answer: '1',
              isFixedPosition: false,
            },
            {
              answer: '3',
              isFixedPosition: false,
            },
            {
              answer: '0',
              isFixedPosition: false,
            },
            {
              answer: 'None of the above',
              isFixedPosition: true,
            },
          ],
          correctChoiceIndex: 3,
        }),
      },
    ])
  })

  it('should only choose one correct answer no matter how many are clicked as correct', () => {
    const interactor = new UIServiceInteractor({})

    interactor
      .setQuestionNumberFocus(1)
      .inputQuestionDescription({ description: '1 + 1 = ?' })
      .inputAnswer({ choiceNumber: 1, answer: '0' })
      .inputAnswer({ choiceNumber: 2, answer: '2' })
      .clickAddChoice()
      .inputAnswer({ choiceNumber: 3, answer: '1' })

    interactor
      .clickCorrectAnswer({ choiceNumber: 1 })
      .clickCorrectAnswer({ choiceNumber: 3 })
      .clickCorrectAnswer({ choiceNumber: 2 })
      .clickSave()

    const actualQuestionSet = interactor.getSavedQuestionSet()
    expect(actualQuestionSet.questions[0].mc.correctChoiceIndex).toBe(1)

    // also check that the UI is updated correctly
    expect(
      interactor.getCorrectAnswerCheckbox({ choiceNumber: 2 }),
    ).toBeChecked()
    expect(
      interactor.getCorrectAnswerCheckbox({ choiceNumber: 1 }),
    ).not.toBeChecked()
    expect(
      interactor.getCorrectAnswerCheckbox({ choiceNumber: 3 }),
    ).not.toBeChecked()
  })

  it('should allow multiple choices to be fixed position', () => {
    const interactor = new UIServiceInteractor({})

    interactor
      .setQuestionNumberFocus(1)
      .inputQuestionDescription({ description: '1 + 1 = ?' })
      .inputAnswer({ choiceNumber: 1, answer: 'I. 0' })
      .inputAnswer({ choiceNumber: 2, answer: 'II. 1' })
      .clickAddChoice()
      .inputAnswer({ choiceNumber: 3, answer: 'III. None of the above' })
      .clickFixedPosition({ choiceNumber: 1 })
      .clickFixedPosition({ choiceNumber: 2 })
      .clickFixedPosition({ choiceNumber: 3 })
      .clickCorrectAnswer({ choiceNumber: 3 })
      .clickSave()

    const actualQuestionSet = interactor.getSavedQuestionSet()
    expect(actualQuestionSet.questions[0].mc.choices).toEqual([
      {
        answer: 'I. 0',
        isFixedPosition: true,
      },
      {
        answer: 'II. 1',
        isFixedPosition: true,
      },
      {
        answer: 'III. None of the above',
        isFixedPosition: true,
      },
    ])
  })

  it('should hide error prompt when successful save', () => {
    const interactor = new UIServiceInteractor({})
    setFirstValidQuestion(interactor)
    interactor.clickSave()

    expect(
      screen.queryByLabelText(QuestionSetEditorAriaLabel.ERROR_PROMPT),
    ).toBeNull()
  })

  it('should reject saving question set when question set name is empty', () => {
    const interactor = new UIServiceInteractor({ questionSetName: '' })
    setFirstValidQuestion(interactor)
    interactor.clickSave()

    expectCannotCreateQuestionSet({
      interactor,
      errorMessage: "Question set name can't be empty",
    })
  })

  it('should reject saving question set when empty question description', () => {
    const interactor = new UIServiceInteractor({})
    setFirstValidQuestion(interactor)
    interactor
      .setQuestionNumberFocus(1)
      .inputQuestionDescription({ description: '' })
      .clickSave()

    expectCannotCreateQuestionSet({
      interactor,
      errorMessage: "Question 1: description can't be empty",
    })
  })

  it('should reject saving question set when empty answer', () => {
    const interactor = new UIServiceInteractor({})

    interactor
      .setQuestionNumberFocus(1)
      .inputQuestionDescription({ description: '1 + 1 = ?' })
      .inputAnswer({ choiceNumber: 1, answer: '2' })
      .inputAnswer({ choiceNumber: 2, answer: '' })
      .clickCorrectAnswer({ choiceNumber: 1 })
      .clickSave()

    expectCannotCreateQuestionSet({
      interactor,
      errorMessage: "Question 1: answer can't be empty",
    })
  })

  it('should reject saving question set when no correct answer is selected', () => {
    const interactor = new UIServiceInteractor({})

    interactor
      .setQuestionNumberFocus(1)
      .inputQuestionDescription({ description: '1 + 1 = ?' })
      .inputAnswer({ choiceNumber: 1, answer: '2' })
      .inputAnswer({ choiceNumber: 2, answer: '0' })
      .clickSave()

    expectCannotCreateQuestionSet({
      interactor,
      errorMessage: 'Question 1: please select one correct choice',
    })
  })

  it('should reject saving question set when duplicate answer in a question', () => {
    const interactor = new UIServiceInteractor({})

    interactor
      .setQuestionNumberFocus(1)
      .inputQuestionDescription({ description: '1 + 1 = ?' })
      .inputAnswer({ choiceNumber: 1, answer: '2' })
      .inputAnswer({ choiceNumber: 2, answer: '2' })
      .clickCorrectAnswer({ choiceNumber: 1 })
      .clickSave()

    expectCannotCreateQuestionSet({
      interactor,
      errorMessage: 'Question 1: duplicate answer',
    })
  })

  it('should save if duplicate answer in different questions', () => {
    const interactor = new UIServiceInteractor({})

    interactor
      .setQuestionNumberFocus(1)
      .inputQuestionDescription({ description: '1 + 1 = ?' })
      .inputAnswer({ choiceNumber: 1, answer: '2' })
      .inputAnswer({ choiceNumber: 2, answer: '0' })
      .clickCorrectAnswer({ choiceNumber: 1 })

    interactor
      .clickAddQuestion()
      .setQuestionNumberFocus(2)
      .inputQuestionDescription({ description: '1 + 2 = ?' })
      .inputAnswer({ choiceNumber: 1, answer: '3' })
      .inputAnswer({ choiceNumber: 2, answer: '2' })
      .clickCorrectAnswer({ choiceNumber: 1 })
      .clickSave()

    expect(
      screen.queryByLabelText(QuestionSetEditorAriaLabel.ERROR_PROMPT),
    ).toBeNull()
    interactor.getSavedQuestionSet() // should not throw
  })

  it('should not save if same name as existing question set', () => {
    const questionSetRepo = LocalStorageQuestionSetRepo.createNull()
    const questionSet = new QuestionSetBuilderForTest()
      .setName('Test name')
      .appendQuestion()
      .build()
    questionSetRepo.upsertQuestionSet(questionSet)

    const interactor = new UIServiceInteractor({
      questionSetName: 'Test name',
      questionSetRepo,
    })
    setFirstValidQuestion(interactor)
    interactor.clickSave()

    expect(
      screen.getByLabelText(QuestionSetEditorAriaLabel.ERROR_PROMPT),
    ).toHaveTextContent('Question set with same name already exists')

    // change name and save again
    interactor.setQuestionSetName('Test name 2').clickSave()

    expect(interactor.getSavedQuestionSet()['name']).toBe('Test name 2')
  })

  it('should show remove question button when questions are more than one', () => {
    const interactor = new UIServiceInteractor({})

    interactor.clickAddQuestion()

    interactor.setQuestionNumberFocus(1)
    expect(interactor.queryRemoveQuestionButton()).not.toBeNull()

    interactor.setQuestionNumberFocus(2)
    expect(interactor.queryRemoveQuestionButton()).not.toBeNull()
  })

  it('should hide remove question button when there is only one question', () => {
    const interactor = new UIServiceInteractor({})

    interactor.setQuestionNumberFocus(1)
    expect(interactor.queryRemoveQuestionButton()).toBeNull()

    interactor.clickAddQuestion()
    interactor.clickRemoveQuestion()

    expect(interactor.queryRemoveQuestionButton()).toBeNull()
  })

  it('should remove targeted question by clicking remove question button', () => {
    const interactor = new UIServiceInteractor({})

    interactor
      .setQuestionNumberFocus(1)
      .inputQuestionDescription({ description: 'I will be removed' })

    interactor
      .clickAddQuestion()
      .setQuestionNumberFocus(2)
      .inputQuestionDescription({ description: 'I will be kept' })

    interactor.setQuestionNumberFocus(1).clickRemoveQuestion()

    expect(screen.queryByDisplayValue('I will be kept')).not.toBeNull()
    expect(screen.queryByDisplayValue('I will be removed')).toBeNull()
  })
})

function expectCannotCreateQuestionSet({
  interactor,
  errorMessage,
}: {
  interactor: UIServiceInteractor
  errorMessage: string
}) {
  expect(
    screen.getByLabelText(QuestionSetEditorAriaLabel.ERROR_PROMPT),
  ).toHaveTextContent(errorMessage)
  expect(() => {
    interactor.getSavedQuestionSet()
  }).toThrow()
}

function setFirstValidQuestion(interactor: UIServiceInteractor) {
  interactor
    .setQuestionNumberFocus(1)
    .inputQuestionDescription({ description: '1 + 1 = ?' })
    .inputAnswer({ choiceNumber: 1, answer: '2' })
    .inputAnswer({ choiceNumber: 2, answer: '0' })
    .clickCorrectAnswer({ choiceNumber: 1 })
}
