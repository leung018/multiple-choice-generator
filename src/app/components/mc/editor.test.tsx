import { fireEvent, render, screen } from '@testing-library/react'
import {
  QuestionSetRepo,
  QuestionSetRepoFactory,
} from '../../../repo/question_set'
import { QuestionSetEditorUIService } from './editor'
import { MultipleChoice } from '../../../model/mc'
import '@testing-library/jest-dom'
import {
  QuestionSet,
  QuestionSetBuilderForTest,
} from '../../../model/question_set'

class UIServiceInteractor {
  private readonly editorRepo: QuestionSetRepo
  private questionSetName: string
  private questionNumberFocus = 1

  constructor({
    questionSetName = 'Dummy name',
    editorRepo = QuestionSetRepoFactory.createTestInstance(),
  }) {
    this.editorRepo = editorRepo
    render(
      QuestionSetEditorUIService.createTestInstance({
        editorRepo: this.editorRepo,
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
    fireEvent.click(this.correctAnswerCheckbox({ choiceNumber }))
    return this
  }

  correctAnswerCheckbox({ choiceNumber }: { choiceNumber: number }) {
    return screen.getByLabelText(
      `question ${this.questionNumberFocus} choice ${choiceNumber} is correct answer`,
    )
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

  errorPrompt() {
    return screen.queryByLabelText('error prompt')
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
    expect(interactor.correctAnswerCheckbox({ choiceNumber: 2 })).toBeChecked()
    expect(
      interactor.correctAnswerCheckbox({ choiceNumber: 1 }),
    ).not.toBeChecked()
    expect(
      interactor.correctAnswerCheckbox({ choiceNumber: 3 }),
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

    expect(interactor.errorPrompt()).toBeNull()
  })

  it('should reject saving question set when question set name is empty', () => {
    const interactor = new UIServiceInteractor({ questionSetName: '' })
    setFirstValidQuestion(interactor)
    interactor.clickSave()

    expectCannotSaveQuestionSet({
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

    expectCannotSaveQuestionSet({
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

    expectCannotSaveQuestionSet({
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

    expectCannotSaveQuestionSet({
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

    expectCannotSaveQuestionSet({
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

    expect(interactor.errorPrompt()).toBeNull()
    interactor.getSavedQuestionSet() // should not throw
  })

  it('should not save if same name as existing question set', () => {
    const editorRepo = QuestionSetRepoFactory.createTestInstance()
    const questionSet = new QuestionSetBuilderForTest()
      .setName('Test name')
      .appendQuestion()
      .build()
    editorRepo.createQuestionSet(questionSet)

    const interactor = new UIServiceInteractor({
      questionSetName: 'Test name',
      editorRepo,
    })
    setFirstValidQuestion(interactor)
    interactor.clickSave()

    expect(interactor.errorPrompt()).toHaveTextContent(
      'Question set with same name already exists',
    )

    // change name and save again
    interactor.setQuestionSetName('Test name 2').clickSave()

    expect(interactor.getSavedQuestionSet()['name']).toBe('Test name 2')
  })
})

function expectCannotSaveQuestionSet({
  interactor,
  errorMessage,
}: {
  interactor: UIServiceInteractor
  errorMessage: string
}) {
  expect(interactor.errorPrompt()).toHaveTextContent(errorMessage)
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
