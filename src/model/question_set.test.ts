import { MultipleChoiceBuilder } from './mc'
import { QuestionSet, QuestionSetBuilderForTest } from './question_set'

describe('QuestionSet', () => {
  it('should id generated each time are different', () => {
    const questionSet1 = new QuestionSetBuilderForTest().build()
    const questionSet2 = new QuestionSetBuilderForTest().build()

    expect(questionSet1.id).not.toBe(questionSet2.id)
  })

  it('should allow building question set with the existing id', () => {
    const questionSet1 = new QuestionSetBuilderForTest().build()
    const questionSet2 = QuestionSet.create({
      name: questionSet1.name,
      questions: questionSet1.questions,
      id: questionSet1.id,
    })

    expect(questionSet2.id).toBe(questionSet1.id)
  })

  it('should newSwappedQuestionSet return question set with swapped choices', () => {
    const questionSet = new QuestionSetBuilderForTest()
      .appendQuestion({
        description: 'My choices cannot be swapped',
        mc: new MultipleChoiceBuilder()
          .appendFixedChoice('True')
          .appendFixedChoice('False')
          .setCorrectChoiceIndex(0)
          .build(),
      })
      .appendQuestion({
        description: 'My choices contains one significant swapped version only',
        mc: new MultipleChoiceBuilder()
          .appendNonFixedChoice('Apple')
          .appendNonFixedChoice('Banana')
          .setCorrectChoiceIndex(1)
          .build(),
      })
      .build()

    const newQuestionSet = questionSet.newSwappedChoicesQuestionSet()

    expect(newQuestionSet.id).toBe(questionSet.id)
    expect(newQuestionSet.name).toBe(questionSet.name)
    expect(newQuestionSet.questions).toEqual(questionSet.questions)
    expect(newQuestionSet.getCurrentPlayQuestions()).toEqual([
      questionSet.questions[0],
      {
        description: questionSet.questions[1].description,
        mc: new MultipleChoiceBuilder()
          .appendNonFixedChoice('Banana')
          .appendNonFixedChoice('Apple')
          .setCorrectChoiceIndex(0)
          .build(),
      },
    ])
  })

  it('should getCurrentPlayQuestions return the original questions if it is from the initial created question set', () => {
    const questionSet = new QuestionSetBuilderForTest().appendQuestion().build()
    expect(questionSet.getCurrentPlayQuestions()).toEqual(questionSet.questions)
  })
})
