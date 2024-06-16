import { QuestionSet, QuestionSetBuilderForTest } from './question_set'

describe('QuestionSet', () => {
  it('should id generated each time are different', () => {
    const questionSet1 = new QuestionSetBuilderForTest().build()
    const questionSet2 = new QuestionSetBuilderForTest().build()

    expect(questionSet1.id).not.toBe(questionSet2.id)
  })

  it('should allow building question set with the existing id', () => {
    const questionSet1 = new QuestionSetBuilderForTest().build()
    const questionSet2 = new QuestionSet({
      name: questionSet1.name,
      questions: questionSet1.questions,
      id: questionSet1.id,
    })

    expect(questionSet2.id).toBe(questionSet1.id)
  })
})
