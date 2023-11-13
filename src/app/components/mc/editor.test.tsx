import { fireEvent, render } from '@testing-library/react'
import { QuestionSetRepoFactory } from '../../../repo/question_set'
import { QuestionSetEditorUIService } from './editor'
import { MultipleChoice } from '../../../model/mc'

describe('QuestionSetEditor', () => {
  it('should save question set successfully when no extra choice or question added', () => {
    const editorRepo = QuestionSetRepoFactory.createTestInstance()
    const { getByLabelText, getByText } = render(
      QuestionSetEditorUIService.createTestInstance({
        editorRepo,
      }).getElement(),
    )
    const questionSetNameInput = getByLabelText('Question Set Name:')
    const questionInput = getByLabelText('Question 1:')

    const choice1Input = getByLabelText('answer of question 1 choice 1')
    const isChoice1FixedPositionInput = getByLabelText(
      'question 1 choice 1 is fixed position',
    )

    const choice2Input = getByLabelText('answer of question 1 choice 2')
    const isChoice2CorrectInput = getByLabelText(
      'question 1 choice 2 is correct answer',
    )

    fireEvent.change(questionSetNameInput, { target: { value: 'Test name' } })
    fireEvent.change(questionInput, { target: { value: 'Am I handsome?' } })
    fireEvent.change(choice1Input, { target: { value: 'True' } })
    fireEvent.click(isChoice1FixedPositionInput)

    fireEvent.change(choice2Input, { target: { value: 'False' } })
    fireEvent.click(isChoice2CorrectInput)

    fireEvent.click(getByText('Save'))

    const actualQuestionSet = editorRepo.getQuestionSetByName('Test name')

    expect(actualQuestionSet.name).toBe('Test name')
    expect(actualQuestionSet.questions.length).toBe(1)
    expect(actualQuestionSet.questions[0].title).toBe('Am I handsome?')
    expect(actualQuestionSet.questions[0].mc).toEqual(
      new MultipleChoice({
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
    )
  })

  it('should also save all input specified in extra option', () => {
    const editorRepo = QuestionSetRepoFactory.createTestInstance()
    const { getByLabelText, getByText } = render(
      QuestionSetEditorUIService.createTestInstance({
        editorRepo,
      }).getElement(),
    )
    const questionSetNameInput = getByLabelText('Question Set Name:')
    const questionInput = getByLabelText('Question 1:')

    const choice1Input = getByLabelText('answer of question 1 choice 1')
    const choice2Input = getByLabelText('answer of question 1 choice 2')

    fireEvent.change(questionSetNameInput, { target: { value: 'Test name' } })
    fireEvent.change(questionInput, { target: { value: '1 + 1 = ?' } })
    fireEvent.change(choice1Input, { target: { value: '1' } })
    fireEvent.change(choice2Input, { target: { value: '0' } })

    fireEvent.click(getByText('Add Choice'))

    const choice3Input = getByLabelText('answer of question 1 choice 3')
    fireEvent.change(choice3Input, { target: { value: 'None of the above' } })
    fireEvent.click(getByLabelText('question 1 choice 3 is correct answer'))
    fireEvent.click(getByLabelText('question 1 choice 3 is fixed position'))

    fireEvent.click(getByText('Save'))

    const actualQuestionSet = editorRepo.getQuestionSetByName('Test name')
    expect(actualQuestionSet.questions[0].title).toBe('1 + 1 = ?')
    expect(actualQuestionSet.questions[0].mc).toEqual(
      new MultipleChoice({
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
    )
  })
})
