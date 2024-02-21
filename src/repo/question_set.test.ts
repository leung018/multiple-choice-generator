import { MultipleChoiceBuilder } from '../model/mc'
import { QuestionSet, QuestionSetBuilderForTest } from '../model/question_set'
import {
  LocalStorageQuestionSetRepo,
  AddQuestionSetError,
  GetQuestionSetError,
  QuestionSetRepo,
} from './question_set'
import { expect } from '@jest/globals'
import '../test_utils/assert/check_error'

describe('LocalStorageQuestionSetRepo', () => {
  let repo: QuestionSetRepo
  let questionSet: QuestionSet

  beforeEach(() => {
    repo = LocalStorageQuestionSetRepo.createNull()
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
      GetQuestionSetError,
      'QUESTION_SET_NOT_FOUND',
    )
  })

  it('should throw error when question set name is taken', () => {
    repo.addQuestionSet(questionSet)
    expect(() => repo.addQuestionSet(questionSet)).toThrowCustomError(
      AddQuestionSetError,
      'DUPLICATE_QUESTION_SET_NAME',
    )
  })

  it('should add question set and get question set by id', () => {
    repo.addQuestionSet(questionSet)
    expect(repo.getQuestionSetById(questionSet.id)).toEqual(questionSet)
  })

  it("should throw error when question set id doesn't exist", () => {
    expect(() => repo.getQuestionSetById('unknown_id')).toThrowCustomError(
      GetQuestionSetError,
      'QUESTION_SET_NOT_FOUND',
    )
  })

  it('should get all question sets for added', () => {
    const questionSet2 = new QuestionSetBuilderForTest().setName('2').build()
    repo.addQuestionSet(questionSet)
    repo.addQuestionSet(questionSet2)
    expect(repo.getQuestionSets()).toEqual([questionSet, questionSet2])
  })

  it('should get empty list for getQuestionSets when no question set added', () => {
    expect(repo.getQuestionSets()).toEqual([])
  })
})
