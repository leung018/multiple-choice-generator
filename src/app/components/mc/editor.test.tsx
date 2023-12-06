import { fireEvent, render, screen } from '@testing-library/react'
import {
  QuestionSetRepo,
  QuestionSetRepoFactory,
} from '../../../repo/question_set'
import { QuestionSetEditorUIService } from './editor'
import { MultipleChoice } from '../../../model/mc'
import '@testing-library/jest-dom'

class UIServiceInteractor {
  readonly screen
  private readonly editorRepo: QuestionSetRepo
  private questionSetName: string
  private questionNumberFocus = 1

  constructor({ questionSetName = 'Dummy name' }) {
    this.editorRepo = QuestionSetRepoFactory.createTestInstance()
    render(
      QuestionSetEditorUIService.createTestInstance({
        editorRepo: this.editorRepo,
      }).getElement(),
    )
    this.screen = screen

    this.questionSetName = questionSetName
    this.syncQuestionSetName()
  }

  private syncQuestionSetName() {
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
    return this.editorRepo.getQuestionSetByName(this.questionSetName)
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
        `answer of question ${this.questionNumberFocus} choice ${choiceNumber}`,
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
        `question ${this.questionNumberFocus} choice ${choiceNumber} is fixed position`,
      ),
    )
    return this
  }

  clickCorrectAnswer({ choiceNumber }: { choiceNumber: number }) {
    fireEvent.click(
      screen.getByLabelText(
        `question ${this.questionNumberFocus} choice ${choiceNumber} is correct answer`,
      ),
    )
    return this
  }

  expectCorrectAnswerChecked({ choiceNumber }: { choiceNumber: number }) {
    expect(
      screen.getByLabelText(
        `question ${this.questionNumberFocus} choice ${choiceNumber} is correct answer`,
      ),
    ).toBeChecked()
  }

  expectCorrectAnswerUnchecked({ choiceNumber }: { choiceNumber: number }) {
    expect(
      screen.getByLabelText(
        `question ${this.questionNumberFocus} choice ${choiceNumber} is correct answer`,
      ),
    ).not.toBeChecked()
  }

  clickAddChoice() {
    const addChoiceButtons = screen.getAllByText('Add Choice')
    fireEvent.click(addChoiceButtons[this.questionNumberFocus - 1])
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
}

describe('QuestionSetEditorUIService', () => {
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
    interactor.expectCorrectAnswerChecked({ choiceNumber: 2 })
    interactor.expectCorrectAnswerUnchecked({ choiceNumber: 1 })
    interactor.expectCorrectAnswerUnchecked({ choiceNumber: 3 })
  })
})
