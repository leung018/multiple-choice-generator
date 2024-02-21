'use client'

import { useEffect, useState } from 'react'
import { Question, QuestionSet } from '../../../model/question_set'
import {
  GetQuestionSetError,
  QuestionSetRepo,
  LocalStorageQuestionSetRepo,
} from '../../../repo/question_set'
import LoadingSpinner from '../loading'
import Error from 'next/error'

export class MultipleChoiceQuizUIService {
  static create({ questionSetId }: { questionSetId: string }) {
    return new MultipleChoiceQuizUIService({
      questionSetRepo: LocalStorageQuestionSetRepo.create(),
      questionSetId,
    })
  }

  static createTestInstance({
    questionSetRepo = LocalStorageQuestionSetRepo.createNull(),
    questionSetId,
  }: {
    questionSetRepo?: QuestionSetRepo
    questionSetId: string
  }) {
    return new MultipleChoiceQuizUIService({ questionSetRepo, questionSetId })
  }

  private readonly questionSetRepo: QuestionSetRepo
  private readonly questionSetId: string

  private constructor({
    questionSetRepo,
    questionSetId,
  }: {
    questionSetRepo: QuestionSetRepo
    questionSetId: string
  }) {
    this.questionSetRepo = questionSetRepo
    this.questionSetId = questionSetId
  }

  getElement() {
    return (
      <MultipleChoiceQuiz
        getQuestionSet={() =>
          this.questionSetRepo.getQuestionSetById(this.questionSetId)
        }
      ></MultipleChoiceQuiz>
    )
  }
}

// TODO: Noted that won't test the rendering of submit button by now. Test that part later in the feature of submitting the answer is more meaningful.
export default function MultipleChoiceQuiz({
  getQuestionSet,
}: {
  getQuestionSet: () => QuestionSet
}) {
  const [isLoading, setLoading] = useState(true)
  const [isNotFound, setNotFound] = useState(false)

  const [questions, setQuestions] = useState<readonly Question[]>([])
  const [questionSetName, setQuestionSetName] = useState('')

  useEffect(() => {
    try {
      const questionSet = getQuestionSet()
      setQuestions(questionSet.questions)
      setQuestionSetName(questionSet.name)
      setLoading(false)
    } catch (e) {
      if (
        e instanceof GetQuestionSetError &&
        e.cause.code === 'QUESTION_SET_NOT_FOUND'
      ) {
        setNotFound(true)
      }
    }
  }, [getQuestionSet])

  const [questionToCheckedChoiceMap, setCheckedChoice] = useState<
    Map<number, number>
  >(new Map<number, number>())

  const handleChoiceChange = (questionIndex: number, choiceIndex: number) => {
    const newMap = new Map<number, number>(questionToCheckedChoiceMap)
    newMap.set(questionIndex, choiceIndex)
    setCheckedChoice(newMap)
  }

  if (isNotFound) {
    return <Error statusCode={404} />
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-6">{questionSetName}</h1>
      {questions.map((question, questionIndex) => (
        <div key={questionIndex} className="mb-4">
          <p className="font-bold whitespace-pre-line">
            {question.description}
          </p>
          <div className="ml-4">
            {question.mc.choices.map((choice, choiceIndex) => (
              <label key={choiceIndex} className="flex items-center mb-2">
                <input
                  type="radio"
                  className="mr-2"
                  checked={
                    choiceIndex ===
                    questionToCheckedChoiceMap.get(questionIndex)
                  }
                  onChange={() =>
                    handleChoiceChange(questionIndex, choiceIndex)
                  }
                />
                {choice.answer}
              </label>
            ))}
          </div>
        </div>
      ))}
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">
        Submit
      </button>
    </div>
  )
}
