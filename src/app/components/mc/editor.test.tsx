import { fireEvent, render, screen } from '@testing-library/react'
import {
  QuestionSetRepo,
  QuestionSetRepoFactory,
} from '../../../repo/question_set'
import { QuestionSetEditorUIService } from './editor'
import { MultipleChoice } from '../../../model/mc'

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
      .inputQuestionDescription({
        description: 'Am I handsome?',
      })
      .inputAnswer({
        choiceNumber: 1,
        answer: 'True',
      })
      .clickFixedPosition({
        choiceNumber: 1,
      })
      .inputAnswer({
        choiceNumber: 2,
        answer: 'False',
      })
      .clickCorrectAnswer({
        choiceNumber: 2,
      })
      .clickSave()

    const actualQuestionSet = interactor.getSavedQuestionSet()

    expect(actualQuestionSet.name).toBe('Test name')
    expect(actualQuestionSet.questions).toEqual([
      {
        title: 'Am I handsome?',
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
    const editorRepo = QuestionSetRepoFactory.createTestInstance()
    const { getByLabelText, getByText } = render(
      QuestionSetEditorUIService.createTestInstance({
        editorRepo,
      }).getElement(),
    )

    fireEvent.change(getByLabelText('Question Set Name:'), {
      target: { value: 'Test name' },
    })
    fireEvent.change(getByLabelText('Question 1:'), {
      target: { value: '1 + 1 = ?' },
    })
    fireEvent.change(getByLabelText('answer of question 1 choice 1'), {
      target: { value: '1' },
    })
    fireEvent.change(getByLabelText('answer of question 1 choice 2'), {
      target: { value: '0' },
    })

    fireEvent.click(getByText('Add Choice'))

    fireEvent.change(getByLabelText('answer of question 1 choice 3'), {
      target: { value: 'None of the above' },
    })
    fireEvent.click(getByLabelText('question 1 choice 3 is correct answer'))
    fireEvent.click(getByLabelText('question 1 choice 3 is fixed position'))

    fireEvent.click(getByText('Save'))

    const actualQuestionSet = editorRepo.getQuestionSetByName('Test name')
    expect(actualQuestionSet.questions[0]).toEqual({
      title: '1 + 1 = ?',
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
    const editorRepo = QuestionSetRepoFactory.createTestInstance()
    const { getAllByText, getByLabelText, getByText } = render(
      QuestionSetEditorUIService.createTestInstance({
        editorRepo,
      }).getElement(),
    )
    fireEvent.change(getByLabelText('Question Set Name:'), {
      target: { value: 'Test name' },
    })

    fireEvent.change(getByLabelText('Question 1:'), {
      target: { value: '1 + 1 = ?' },
    })
    fireEvent.change(getByLabelText('answer of question 1 choice 1'), {
      target: { value: '2' },
    })
    fireEvent.change(getByLabelText('answer of question 1 choice 2'), {
      target: { value: '0' },
    })
    fireEvent.click(getByLabelText('question 1 choice 1 is correct answer'))

    fireEvent.click(getByText('Add Question'))

    fireEvent.change(getByLabelText('Question 2:'), {
      target: { value: '1 + 2 = ?' },
    })
    fireEvent.change(getByLabelText('answer of question 2 choice 1'), {
      target: { value: '3' },
    })
    fireEvent.change(getByLabelText('answer of question 2 choice 2'), {
      target: { value: '0' },
    })
    fireEvent.click(getByLabelText('question 2 choice 1 is correct answer'))

    fireEvent.click(getByText('Add Question'))

    fireEvent.change(getByLabelText('Question 3:'), {
      target: { value: '1 + 3 = ?' },
    })
    fireEvent.change(getByLabelText('answer of question 3 choice 1'), {
      target: { value: '1' },
    })
    fireEvent.change(getByLabelText('answer of question 3 choice 2'), {
      target: { value: '3' },
    })
    const question3AddChoice = getAllByText(
      'Add Choice',
    ).pop() as HTMLButtonElement
    fireEvent.click(question3AddChoice)
    fireEvent.click(question3AddChoice)
    fireEvent.change(getByLabelText('answer of question 3 choice 3'), {
      target: { value: '0' },
    })
    fireEvent.change(getByLabelText('answer of question 3 choice 4'), {
      target: { value: 'None of the above' },
    })
    fireEvent.click(getByLabelText('question 3 choice 4 is correct answer'))
    fireEvent.click(getByLabelText('question 3 choice 4 is fixed position'))

    fireEvent.click(getByText('Save'))

    const actualQuestionSet = editorRepo.getQuestionSetByName('Test name')
    expect(actualQuestionSet.questions).toEqual([
      {
        title: '1 + 1 = ?',
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
        title: '1 + 2 = ?',
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
        title: '1 + 3 = ?',
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
})
