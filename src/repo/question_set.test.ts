import { MultipleChoiceBuilder } from '../model/mc'
import { QuestionSet, QuestionSetBuilderForTest } from '../model/question_set'
import { LocalStorageQuestionSetRepo, QuestionSetRepo } from './question_set'

describe('QuestionSetRepo', () => {
  let repo: QuestionSetRepo
  let questionSet: QuestionSet

  beforeEach(() => {
    repo = LocalStorageQuestionSetRepo.createTestInstance()
    questionSet = new QuestionSetBuilderForTest()
      .appendQuestion({
        mc: new MultipleChoiceBuilder()
          .appendFixedChoice('dummy1')
          .appendNonFixedChoice('dummy2')
          .setCorrectChoiceIndex(1)
          .build(),
      })
      .build()
  })

  it('should add question set and get question set by name', () => {
    repo.addQuestionSet(questionSet)
    expect(repo.getQuestionSetByName(questionSet.name)).toEqual(questionSet)
  })
})
