import { MultipleChoiceBuilder } from '../model/mc'
import { QuestionSet, QuestionSetBuilderForTest } from '../model/question_set'
import {
  LocalStorageQuestionSetRepo,
  QuestionSetCreateError,
  QuestionSetGetError,
  QuestionSetRepo,
} from './question_set'
import { expect } from '@jest/globals'
import '../test_utils/assert/check_error'

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

  it("should throw error when question set name doesn't exist", () => {
    expect(() => repo.getQuestionSetByName('unknown')).toThrowCustomError(
      QuestionSetGetError,
      'QUESTION_SET_NOT_FOUND',
    )
  })

  it('should throw error when question set name is taken', () => {
    repo.addQuestionSet(questionSet)
    expect(() => repo.addQuestionSet(questionSet)).toThrowCustomError(
      QuestionSetCreateError,
      'DUPLICATE_QUESTION_SET_NAME',
    )
  })
})
