'use client'

import { useEffect, useState } from 'react'
import { Question, QuestionSet } from '../../model/question_set'
import {
  GetQuestionSetError,
  QuestionSetRepo,
  LocalStorageQuestionSetRepo,
} from '../../repo/question_set'
import LoadingSpinner from './loading'
import Error from 'next/error'

export class MultipleChoiceQuizUIService {
  static create({ questionSetId }: { questionSetId: string }) {
    return new MultipleChoiceQuizUIService({
      questionSetRepo: LocalStorageQuestionSetRepo.create(),
      questionSetId,
    })
  }

  static createNull({
    questionSetRepo = LocalStorageQuestionSetRepo.createNull(),
    questionSetId,
  }: {
    questionSetRepo?: QuestionSetRepo
    questionSetId: string
  }) {
    return new MultipleChoiceQuizUIService({
      questionSetRepo: questionSetRepo,
      questionSetId,
    })
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
        fetchQuestionSet={() =>
          this.questionSetRepo.getQuestionSetById(this.questionSetId)
        }
        onSubmit={(questionSet) => {
          this.questionSetRepo.upsertQuestionSet(
            questionSet.newSwappedChoicesQuestionSet(),
          )
        }}
      ></MultipleChoiceQuiz>
    )
  }
}

function MultipleChoiceQuiz({
  fetchQuestionSet,
  onSubmit,
}: {
  fetchQuestionSet: () => QuestionSet
  onSubmit: (questionSet: QuestionSet) => void
}) {
  const [isLoading, setLoading] = useState(true)
  const [isNotFound, setNotFound] = useState(false)

  const [questionSet, setQuestionSet] = useState<QuestionSet>(
    QuestionSet.create({
      id: '',
      name: '',
      questions: [],
    }),
  )
  const [score, setScore] = useState<number | null>(null)

  useEffect(() => {
    try {
      const questionSet = fetchQuestionSet()
      setQuestionSet(questionSet)
      setLoading(false)
    } catch (e) {
      if (
        e instanceof GetQuestionSetError &&
        e.cause.code === 'QUESTION_SET_NOT_FOUND'
      ) {
        setNotFound(true)
        return
      }
      throw e
    }
  }, [fetchQuestionSet])

  const [questionToCheckedChoiceMap, setCheckedChoice] = useState<
    Map<number, number>
  >(new Map<number, number>())

  const updateCheckedChoice = (questionIndex: number, choiceIndex: number) => {
    const newMap = new Map<number, number>(questionToCheckedChoiceMap)
    newMap.set(questionIndex, choiceIndex)
    setCheckedChoice(newMap)
  }

  const handleSubmit = () => {
    setScore(calculateScore())
    onSubmit(questionSet)
  }

  const isSubmitted = () => score !== null

  const calculateScore = () => {
    let score = 0
    questionSet.questions.forEach((question, questionIndex) => {
      if (
        question.mc.correctChoiceIndex ===
        questionToCheckedChoiceMap.get(questionIndex)
      ) {
        score++
      }
    })
    return score
  }

  if (isNotFound) {
    return <Error statusCode={404} />
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-6">{questionSet.name}</h1>
      {questionSet.getCurrentPlayQuestions().map((question, questionIndex) => (
        <QuestionForm
          key={questionIndex}
          question={question}
          checkedChoiceIndex={questionToCheckedChoiceMap.get(questionIndex)}
          handleChoiceChange={(newCheckedChoiceIndex) =>
            updateCheckedChoice(questionIndex, newCheckedChoiceIndex)
          }
          isSubmitted={isSubmitted()}
        />
      ))}
      <button
        className="bg-blue-500 enabled:hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 disabled:opacity-75"
        onClick={() => {
          handleSubmit()
        }}
        disabled={isSubmitted()}
      >
        Submit
      </button>
      {isSubmitted() && (
        <div className="mt-4">
          <p className="font-bold">
            Your score: {score}/{questionSet.questions.length}
          </p>
        </div>
      )}
    </div>
  )
}

function QuestionForm({
  question,
  checkedChoiceIndex,
  handleChoiceChange,
  isSubmitted,
}: {
  question: Question
  checkedChoiceIndex: number | undefined
  handleChoiceChange: (newCheckedChoiceIndex: number) => void
  isSubmitted: boolean
}) {
  return (
    <div className="mb-4">
      <p className="font-bold whitespace-pre-line">{question.description}</p>
      <div className="ml-4">
        {question.mc.choices.map((choice, choiceIndex) => (
          <ChoiceForm
            key={choiceIndex}
            answer={choice.answer}
            onSelect={() => handleChoiceChange(choiceIndex)}
            isChecked={checkedChoiceIndex === choiceIndex}
            isSubmitted={isSubmitted}
            isCorrectAnswer={question.mc.correctChoiceIndex === choiceIndex}
          />
        ))}
      </div>
    </div>
  )
}

function ChoiceForm({
  answer,
  onSelect,
  isChecked,
  isSubmitted,
  isCorrectAnswer,
}: {
  answer: string
  onSelect: () => void
  isChecked: boolean
  isSubmitted: boolean
  isCorrectAnswer: boolean
}) {
  return (
    <span className="flex items-center">
      <label className="flex mb-2">
        <input
          type="radio"
          className="mr-2"
          checked={isChecked}
          onChange={() => onSelect()}
          disabled={isSubmitted}
        />
        {answer}
      </label>

      {isSubmitted && isChecked && (
        <span className="ml-2">
          {isCorrectAnswer ? (
            <span
              className="text-green-500"
              aria-label={`${answer} is correct`}
            >
              ✓
            </span>
          ) : (
            <span className="text-red-500" aria-label={`${answer} is wrong`}>
              ✕
            </span>
          )}
        </span>
      )}
    </span>
  )
}
