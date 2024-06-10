import { fireEvent, render, screen } from '@testing-library/react'
import {
  QuestionSetRepo,
  LocalStorageQuestionSetRepo,
} from '../../repo/question_set'
import {
  QuestionSetEditorAriaLabel,
  QuestionSetEditorUIService,
} from './editor'
import { MultipleChoiceBuilder, MultipleChoice } from '../../model/mc'
import '@testing-library/jest-dom'
import {
  QuestionSet,
  QuestionSetBuilderForTest,
} from '../../model/question_set'

class UIServiceInteractor {
  private readonly questionSetRepo: QuestionSetRepo
  private questionSetName: string = ''
  private questionNumberFocus = 1

  /**
   * Initializes a new instance of UIServiceInteractor, providing methods for rendering the associated UI using `testing-library/react` and interact with it.
   * Use `setQuestionNumberFocus` to specify the question number before interacting with any UI elements related to a specific question.
   * Note that querying UI elements unrelated to any specific question is not the responsibility of this class.
   *
   * @param questionSetRepo Repository for storing the submitted question set after it is submitted through this page.
   */
  constructor({
    questionSetRepo = LocalStorageQuestionSetRepo.createNull(),
  } = {}) {
    this.questionSetRepo = questionSetRepo
  }

  /**
   * @param @questionSetName The initial name of the question set to be inputted once the UI is rendered.
   */
  renderCreationPage({ questionSetName = 'Dummy name' } = {}) {
    render(
      QuestionSetEditorUIService.createNull({
        questionSetRepo: this.questionSetRepo,
      }).getCreationPageElement(),
    )
    this.setQuestionSetName(questionSetName)
    return this
  }

  renderModifyingPage(questionSetId: string) {
    render(
      QuestionSetEditorUIService.createNull({
        questionSetRepo: this.questionSetRepo,
      }).getModifyingPageElement(questionSetId),
    )

    const questionSetNameInput = screen.queryByLabelText(
      'Question Set Name:',
    ) as HTMLInputElement | null
    if (questionSetNameInput)
      this.setQuestionSetName(questionSetNameInput.value)

    return this
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

  getQuestionSetByInputtedName() {
    return this.questionSetRepo.getQuestionSetByName(this.questionSetName)
  }

  inputQuestionDescription(description: string) {
    fireEvent.change(this.getQuestionDescriptionInput(), {
      target: { value: description },
    })
    return this
  }

  getQuestionDescriptionInput() {
    return screen.getByLabelText(`Question ${this.questionNumberFocus}:`)
  }

  inputAnswer({
    choiceNumber,
    answer,
  }: {
    choiceNumber: number
    answer: string
  }) {
    fireEvent.change(this.getAnswerInput({ choiceNumber }), {
      target: { value: answer },
    })
    return this
  }

  getAnswerInput({ choiceNumber }: { choiceNumber: number }) {
    return screen.getByLabelText(
      QuestionSetEditorAriaLabel.answerInput({
        questionNumber: this.questionNumberFocus,
        choiceNumber,
      }),
    )
  }

  clickFixedPosition({ choiceNumber }: { choiceNumber: number }) {
    fireEvent.click(this.getIsFixedPositionCheckbox({ choiceNumber }))
    return this
  }

  getIsFixedPositionCheckbox({ choiceNumber }: { choiceNumber: number }) {
    return screen.getByLabelText(
      QuestionSetEditorAriaLabel.isFixedPositionCheckbox({
        questionNumber: this.questionNumberFocus,
        choiceNumber,
      }),
    )
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

  clickRemoveChoice({ choiceNumber }: { choiceNumber: number }) {
    fireEvent.click(this.queryRemoveChoiceButton({ choiceNumber })!)
    return this
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

  queryRemoveChoiceButton({ choiceNumber }: { choiceNumber: number }) {
    return screen.queryByLabelText(
      QuestionSetEditorAriaLabel.removeChoiceButton({
        questionNumber: this.questionNumberFocus,
        choiceNumber,
      }),
    )
  }
}

describe('QuestionSetEditor', () => {
  it('should save question set successfully when no extra choice or question added', () => {
    const interactor = new UIServiceInteractor()
    interactor.renderCreationPage({ questionSetName: 'Test name' })
    interactor
      .setQuestionNumberFocus(1)
      .inputQuestionDescription('Am I handsome?')
      .inputAnswer({ choiceNumber: 1, answer: 'True' })
      .clickFixedPosition({ choiceNumber: 1 })
      .inputAnswer({ choiceNumber: 2, answer: 'False' })
      .clickCorrectAnswer({ choiceNumber: 2 })
      .clickSave()

    const actualQuestionSet = interactor.getQuestionSetByInputtedName()

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
    const interactor = new UIServiceInteractor()
    interactor.renderCreationPage()
    interactor.setQuestionNumberFocus(1).inputQuestionDescription('1 + 1 = ?')

    interactor
      .inputAnswer({ choiceNumber: 1, answer: '1' })
      .inputAnswer({ choiceNumber: 2, answer: '0' })
      .clickAddChoice()
      .inputAnswer({ choiceNumber: 3, answer: 'None of the above' })
      .clickCorrectAnswer({ choiceNumber: 3 })
      .clickFixedPosition({ choiceNumber: 3 })
      .clickSave()

    const actualQuestionSet = interactor.getQuestionSetByInputtedName()
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
    const interactor = new UIServiceInteractor()
    interactor.renderCreationPage()

    interactor
      .setQuestionNumberFocus(1)
      .inputQuestionDescription('1 + 1 = ?')
      .inputAnswer({ choiceNumber: 1, answer: '2' })
      .inputAnswer({ choiceNumber: 2, answer: '0' })
      .clickCorrectAnswer({ choiceNumber: 1 })

    interactor.clickAddQuestion()

    interactor
      .setQuestionNumberFocus(2)
      .inputQuestionDescription('1 + 2 = ?')
      .inputAnswer({ choiceNumber: 1, answer: '3' })
      .inputAnswer({ choiceNumber: 2, answer: '0' })
      .clickCorrectAnswer({ choiceNumber: 1 })

    interactor.clickAddQuestion()

    interactor
      .setQuestionNumberFocus(3)
      .inputQuestionDescription('1 + 3 = ?')
      .inputAnswer({ choiceNumber: 1, answer: '1' })
      .inputAnswer({ choiceNumber: 2, answer: '3' })
      .clickAddChoice()
      .clickAddChoice()
      .inputAnswer({ choiceNumber: 3, answer: '0' })
      .inputAnswer({ choiceNumber: 4, answer: 'None of the above' })
      .clickCorrectAnswer({ choiceNumber: 4 })
      .clickFixedPosition({ choiceNumber: 4 })

    interactor.clickSave()

    const actualQuestionSet = interactor.getQuestionSetByInputtedName()
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
    const interactor = new UIServiceInteractor()
    interactor.renderCreationPage()

    interactor
      .setQuestionNumberFocus(1)
      .inputQuestionDescription('1 + 1 = ?')
      .inputAnswer({ choiceNumber: 1, answer: '0' })
      .inputAnswer({ choiceNumber: 2, answer: '2' })
      .clickAddChoice()
      .inputAnswer({ choiceNumber: 3, answer: '1' })

    interactor
      .clickCorrectAnswer({ choiceNumber: 1 })
      .clickCorrectAnswer({ choiceNumber: 3 })
      .clickCorrectAnswer({ choiceNumber: 2 })
      .clickSave()

    const actualQuestionSet = interactor.getQuestionSetByInputtedName()
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
    const interactor = new UIServiceInteractor()
    interactor.renderCreationPage()

    interactor
      .setQuestionNumberFocus(1)
      .inputQuestionDescription('1 + 1 = ?')
      .inputAnswer({ choiceNumber: 1, answer: 'I. 0' })
      .inputAnswer({ choiceNumber: 2, answer: 'II. 1' })
      .clickAddChoice()
      .inputAnswer({ choiceNumber: 3, answer: 'III. None of the above' })
      .clickFixedPosition({ choiceNumber: 1 })
      .clickFixedPosition({ choiceNumber: 2 })
      .clickFixedPosition({ choiceNumber: 3 })
      .clickCorrectAnswer({ choiceNumber: 3 })
      .clickSave()

    const actualQuestionSet = interactor.getQuestionSetByInputtedName()
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
    const interactor = new UIServiceInteractor()
    interactor.renderCreationPage()

    setFirstValidQuestion(interactor)
    interactor.clickSave()

    expect(
      screen.queryByLabelText(QuestionSetEditorAriaLabel.ERROR_PROMPT),
    ).toBeNull()
  })

  it('should reject saving question set when question set name is empty', () => {
    const interactor = new UIServiceInteractor()
    interactor.renderCreationPage({ questionSetName: '' })
    setFirstValidQuestion(interactor)
    interactor.clickSave()

    expectCannotCreateQuestionSet({
      interactor,
      errorMessage: "Question set name can't be empty",
    })
  })

  it('should reject saving question set when empty question description', () => {
    const interactor = new UIServiceInteractor()
    interactor.renderCreationPage()

    setFirstValidQuestion(interactor)
    interactor
      .setQuestionNumberFocus(1)
      .inputQuestionDescription('')
      .clickSave()

    expectCannotCreateQuestionSet({
      interactor,
      errorMessage: "Question 1: description can't be empty",
    })
  })

  it('should reject saving question set when empty answer', () => {
    const interactor = new UIServiceInteractor()
    interactor.renderCreationPage()

    interactor
      .setQuestionNumberFocus(1)
      .inputQuestionDescription('1 + 1 = ?')
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
    const interactor = new UIServiceInteractor()
    interactor.renderCreationPage()

    interactor
      .setQuestionNumberFocus(1)
      .inputQuestionDescription('1 + 1 = ?')
      .inputAnswer({ choiceNumber: 1, answer: '2' })
      .inputAnswer({ choiceNumber: 2, answer: '0' })
      .clickSave()

    expectCannotCreateQuestionSet({
      interactor,
      errorMessage: 'Question 1: please select one correct choice',
    })
  })

  it('should reject saving question set when duplicate answer in a question', () => {
    const interactor = new UIServiceInteractor()
    interactor.renderCreationPage()

    interactor
      .setQuestionNumberFocus(1)
      .inputQuestionDescription('1 + 1 = ?')
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
    const interactor = new UIServiceInteractor()
    interactor.renderCreationPage()

    interactor
      .setQuestionNumberFocus(1)
      .inputQuestionDescription('1 + 1 = ?')
      .inputAnswer({ choiceNumber: 1, answer: '2' })
      .inputAnswer({ choiceNumber: 2, answer: '0' })
      .clickCorrectAnswer({ choiceNumber: 1 })

    interactor
      .clickAddQuestion()
      .setQuestionNumberFocus(2)
      .inputQuestionDescription('1 + 2 = ?')
      .inputAnswer({ choiceNumber: 1, answer: '3' })
      .inputAnswer({ choiceNumber: 2, answer: '2' })
      .clickCorrectAnswer({ choiceNumber: 1 })
      .clickSave()

    expect(
      screen.queryByLabelText(QuestionSetEditorAriaLabel.ERROR_PROMPT),
    ).toBeNull()
    interactor.getQuestionSetByInputtedName() // should not throw
  })

  it('should not save if same name as existing question set', () => {
    const questionSetRepo = LocalStorageQuestionSetRepo.createNull()
    const questionSet = new QuestionSetBuilderForTest()
      .setName('Test name')
      .appendQuestion()
      .build()
    questionSetRepo.upsertQuestionSet(questionSet)

    const interactor = new UIServiceInteractor({
      questionSetRepo,
    })
    interactor.renderCreationPage({ questionSetName: 'Test name' })
    setFirstValidQuestion(interactor)
    interactor.clickSave()

    expect(
      screen.getByLabelText(QuestionSetEditorAriaLabel.ERROR_PROMPT),
    ).toHaveTextContent('Question set with same name already exists')

    // change name and save again
    interactor.setQuestionSetName('Test name 2').clickSave()

    expect(interactor.getQuestionSetByInputtedName()['name']).toBe(
      'Test name 2',
    )
  })

  it('should show remove question button when questions are more than one', () => {
    const interactor = new UIServiceInteractor()
    interactor.renderCreationPage()

    interactor.clickAddQuestion()

    interactor.setQuestionNumberFocus(1)
    expect(interactor.queryRemoveQuestionButton()).toBeInTheDocument()

    interactor.setQuestionNumberFocus(2)
    expect(interactor.queryRemoveQuestionButton()).toBeInTheDocument()
  })

  it('should hide remove question button when there is only one question', () => {
    const interactor = new UIServiceInteractor()
    interactor.renderCreationPage()

    interactor.setQuestionNumberFocus(1)
    expect(interactor.queryRemoveQuestionButton()).toBeNull()

    interactor.clickAddQuestion()
    interactor.clickRemoveQuestion()

    expect(interactor.queryRemoveQuestionButton()).toBeNull()
  })

  it('should remove targeted question by clicking remove question button', () => {
    const interactor = new UIServiceInteractor()
    interactor.renderCreationPage()

    interactor
      .setQuestionNumberFocus(1)
      .inputQuestionDescription('I will be removed')

    interactor
      .clickAddQuestion()
      .setQuestionNumberFocus(2)
      .inputQuestionDescription('I will be kept')

    interactor.setQuestionNumberFocus(1).clickRemoveQuestion()

    expect(screen.queryByDisplayValue('I will be kept')).toBeInTheDocument()
    expect(screen.queryByDisplayValue('I will be removed')).toBeNull()
  })

  it('should show remove choice button when there are more than two choices', () => {
    const interactor = new UIServiceInteractor()
    interactor.renderCreationPage()

    interactor.setQuestionNumberFocus(1).clickAddChoice()

    expect(
      interactor.queryRemoveChoiceButton({ choiceNumber: 1 }),
    ).toBeInTheDocument()
    expect(
      interactor.queryRemoveChoiceButton({ choiceNumber: 2 }),
    ).toBeInTheDocument()
    expect(
      interactor.queryRemoveChoiceButton({ choiceNumber: 3 }),
    ).toBeInTheDocument()
  })

  it('should hide remove choice button when there are only two choices', () => {
    const interactor = new UIServiceInteractor()
    interactor.renderCreationPage()

    interactor.setQuestionNumberFocus(1)
    expect(interactor.queryRemoveChoiceButton({ choiceNumber: 1 })).toBeNull()
    expect(interactor.queryRemoveChoiceButton({ choiceNumber: 2 })).toBeNull()

    interactor.clickAddChoice()
    interactor.clickRemoveChoice({ choiceNumber: 1 })

    expect(interactor.queryRemoveChoiceButton({ choiceNumber: 1 })).toBeNull()
    expect(interactor.queryRemoveChoiceButton({ choiceNumber: 2 })).toBeNull()
    expect(interactor.queryRemoveChoiceButton({ choiceNumber: 3 })).toBeNull()
  })

  it('should remove targeted choice by clicking nearby remove choice button', () => {
    const interactor = new UIServiceInteractor()
    interactor.renderCreationPage()

    interactor
      .setQuestionNumberFocus(1)
      .clickAddChoice()
      .inputAnswer({ choiceNumber: 1, answer: 'I will be removed' })
      .inputAnswer({ choiceNumber: 2, answer: 'I will be kept' })
      .inputAnswer({ choiceNumber: 3, answer: 'I will be kept too' })

    interactor.clickRemoveChoice({ choiceNumber: 1 })

    expect(screen.queryByDisplayValue('I will be kept')).toBeInTheDocument()
    expect(screen.queryByDisplayValue('I will be kept too')).toBeInTheDocument()
    expect(screen.queryByDisplayValue('I will be removed')).toBeNull()
  })

  it("should render not found when modify a question set that doesn't exist", () => {
    const interactor = new UIServiceInteractor()
    interactor.renderModifyingPage('unknown_question_set_id')

    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('should modifying page load the contents in original question set', () => {
    const questionSetRepo = LocalStorageQuestionSetRepo.createNull()
    const questionSet = new QuestionSet({
      name: 'Hello World',
      questions: [
        {
          description: 'Which one is larger than 1.1?',
          mc: new MultipleChoiceBuilder()
            .appendNonFixedChoice('1')
            .appendNonFixedChoice('2')
            .appendFixedChoice('All of the above')
            .setCorrectChoiceIndex(1)
            .build(),
        },
      ],
    })
    questionSetRepo.upsertQuestionSet(questionSet)

    const interactor = new UIServiceInteractor({
      questionSetRepo,
    })
    interactor.renderModifyingPage(questionSet.id)

    expect(screen.getByLabelText('Question Set Name:')).toHaveDisplayValue(
      'Hello World',
    )

    interactor.setQuestionNumberFocus(1)
    expect(interactor.getQuestionDescriptionInput()).toHaveDisplayValue(
      'Which one is larger than 1.1?',
    )

    // Choice 1
    expect(interactor.getAnswerInput({ choiceNumber: 1 })).toHaveDisplayValue(
      '1',
    )
    expect(
      interactor.getCorrectAnswerCheckbox({ choiceNumber: 1 }),
    ).not.toBeChecked()
    expect(
      interactor.getIsFixedPositionCheckbox({ choiceNumber: 1 }),
    ).not.toBeChecked()

    // Choice 2
    expect(interactor.getAnswerInput({ choiceNumber: 2 })).toHaveDisplayValue(
      '2',
    )
    expect(
      interactor.getCorrectAnswerCheckbox({ choiceNumber: 2 }),
    ).toBeChecked()
    expect(
      interactor.getIsFixedPositionCheckbox({ choiceNumber: 2 }),
    ).not.toBeChecked()

    // Choice 3
    expect(interactor.getAnswerInput({ choiceNumber: 3 })).toHaveDisplayValue(
      'All of the above',
    )
    expect(
      interactor.getCorrectAnswerCheckbox({ choiceNumber: 3 }),
    ).not.toBeChecked()
    expect(
      interactor.getIsFixedPositionCheckbox({ choiceNumber: 3 }),
    ).toBeChecked()
  })

  it('should able to save question set again without any changes in modifying page', () => {
    const questionSetRepo = LocalStorageQuestionSetRepo.createNull()
    const questionSet = new QuestionSetBuilderForTest().appendQuestion().build()
    questionSetRepo.upsertQuestionSet(questionSet)

    const interactor = new UIServiceInteractor({
      questionSetRepo,
    })
    interactor.renderModifyingPage(questionSet.id)

    interactor.clickSave()

    expect(
      screen.queryByLabelText(QuestionSetEditorAriaLabel.ERROR_PROMPT),
    ).toBeNull()
    expect(interactor.getQuestionSetByInputtedName()).toEqual(questionSet)
  })

  it('should able to modify the existing question set and save', () => {
    const questionSetRepo = LocalStorageQuestionSetRepo.createNull()
    const questionSet = new QuestionSet({
      name: 'Hello World',
      questions: [
        {
          description: 'Which one is larger than 1.1?',
          mc: new MultipleChoiceBuilder()
            .appendNonFixedChoice('1')
            .appendNonFixedChoice('2')
            .appendFixedChoice('All of the above')
            .setCorrectChoiceIndex(1)
            .build(),
        },
      ],
    })
    questionSetRepo.upsertQuestionSet(questionSet)

    const interactor = new UIServiceInteractor({
      questionSetRepo,
    })
    interactor.renderModifyingPage(questionSet.id)

    // make some modifications
    interactor
      .setQuestionSetName('A whole new world')
      .clickRemoveChoice({ choiceNumber: 3 })
      .clickSave()

    // set the expected values of the questionSet
    questionSet.name = 'A whole new world'
    questionSet.questions[0].mc = new MultipleChoiceBuilder()
      .appendNonFixedChoice('1')
      .appendNonFixedChoice('2')
      .setCorrectChoiceIndex(1)
      .build()

    expect(interactor.getQuestionSetByInputtedName()).toEqual(questionSet)
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
    interactor.getQuestionSetByInputtedName()
  }).toThrow()
}

function setFirstValidQuestion(interactor: UIServiceInteractor) {
  interactor
    .setQuestionNumberFocus(1)
    .inputQuestionDescription('1 + 1 = ?')
    .inputAnswer({ choiceNumber: 1, answer: '2' })
    .inputAnswer({ choiceNumber: 2, answer: '0' })
    .clickCorrectAnswer({ choiceNumber: 1 })
}
