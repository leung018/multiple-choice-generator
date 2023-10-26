import { fireEvent, render } from '@testing-library/react'
import { QuestionSetRepoFactory } from '../../../repo/question_set'
import { QuestionSetEditorUIService } from './editor'

describe('QuestionSetEditor', () => {
  it('should save question set', () => {
    const editorRepo = QuestionSetRepoFactory.createTestInstance()
    const { getByLabelText, getByText } = render(
      QuestionSetEditorUIService.createTestInstance({
        editorRepo,
      }).getElement(),
    )
    const questionSetNameInput = getByLabelText('Question Set Name:')
    const questionInput = getByLabelText('Question 1:')

    const choice1Input = getByLabelText('Choice 1:')
    const isChoice1CorrectInput = getByLabelText('Choice 1 is correct answer')
    const isChoice1FixedPositionInput = getByLabelText(
      'Choice 1 is fixed position',
    )

    const choice2Input = getByLabelText('Choice 2:')

    fireEvent.change(questionSetNameInput, { target: { value: 'Test name' } })
    fireEvent.change(questionInput, { target: { value: 'Am I handsome?' } })
    fireEvent.change(choice1Input, { target: { value: 'True' } })
    fireEvent.change(isChoice1CorrectInput, { target: { value: 'true' } })
    fireEvent.change(isChoice1FixedPositionInput, {
      target: { value: 'true' },
    })

    fireEvent.change(choice2Input, { target: { value: 'False' } })

    fireEvent.click(getByText('Save'))

    const actualQuestionSet = editorRepo.getQuestionSetByName('Test name')

    // TODO: Assert the question set is saved with expected values
  })
})
