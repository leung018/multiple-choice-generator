import { fireEvent, render } from '@testing-library/react'
import { QuestionSetRepoFactory } from '../../../repo/question_set'
import { QuestionSetEditorUIService } from './editor'

describe('QuestionSetEditor', () => {
  it('should save question set', () => {
    const editorRepo = QuestionSetRepoFactory.createTestInstance()
    const { getByLabelText } = render(
      QuestionSetEditorUIService.createTestInstance({
        editorRepo,
      }).getElement(),
    )
    const questionSetNameInput = getByLabelText('Question Set Name:')
    const questionInput = getByLabelText('Question:')

    // TODO: Fire events to input a question and then save

    const actualQuestionSet = editorRepo.getQuestionSetByName('Test name')

    // TODO: Assert the question set is saved with expected values
  })
})
