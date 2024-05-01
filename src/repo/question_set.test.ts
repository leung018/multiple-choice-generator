import { MultipleChoiceBuilder } from '../model/mc'
import { QuestionSet, QuestionSetBuilderForTest } from '../model/question_set'
import {
  LocalStorageQuestionSetRepo,
  UpsertQuestionSetError,
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
    repo.upsertQuestionSet(questionSet)
    expect(repo.getQuestionSetByName(questionSet.name)).toEqual(questionSet)
  })

  it("should throw error when question set name doesn't exist", () => {
    expect(() => repo.getQuestionSetByName('unknown')).toThrowCustomError(
      GetQuestionSetError,
      'QUESTION_SET_NOT_FOUND',
    )
  })

  it('should throw error when question set name is taken by other questionSet', () => {
    repo.upsertQuestionSet(questionSet)

    const anotherQuestionSet = new QuestionSetBuilderForTest()
      .setName(questionSet.name)
      .build()
    expect(() => repo.upsertQuestionSet(anotherQuestionSet)).toThrowCustomError(
      UpsertQuestionSetError,
      'DUPLICATE_QUESTION_SET_NAME',
    )

    // should not throw error when just updating the same question set
    repo.upsertQuestionSet(questionSet)
  })

  it('should add question set and get question set by id', () => {
    repo.upsertQuestionSet(questionSet)
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
    repo.upsertQuestionSet(questionSet)
    repo.upsertQuestionSet(questionSet2)
    expect(repo.getQuestionSets()).toEqual([questionSet, questionSet2])
  })

  it('should get empty list for getQuestionSets when no question set added', () => {
    expect(repo.getQuestionSets()).toEqual([])
  })

  it('should update questionSet', () => {
    repo.upsertQuestionSet(questionSet)

    const updatedQuestionSet = {
      ...questionSet,
      name: 'Updated name',
    }
    repo.upsertQuestionSet(updatedQuestionSet)

    expect(repo.getQuestionSetById(questionSet.id).name).toEqual(
      updatedQuestionSet.name,
    )
  })
})
