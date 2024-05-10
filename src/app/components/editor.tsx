'use client'

import { useState } from 'react'
import {
  QuestionSetRepo,
  LocalStorageQuestionSetRepo,
  UpsertQuestionSetError,
} from '../../repo/question_set'
import { Question, QuestionSet } from '../../model/question_set'
import { MultipleChoiceBuilder, MultipleChoiceError } from '../../model/mc'
import { useRouter } from 'next/navigation'

export class QuestionSetEditorAriaLabel {
  // If update of labels in this class, may need also to update e2e test

  static readonly ERROR_PROMPT = 'error prompt'

  static answerInput({
    choiceNumber,
    questionNumber,
  }: {
    choiceNumber: number
    questionNumber: number
  }) {
    return `answer of question ${questionNumber} choice ${choiceNumber}`
  }

  static isCorrectAnswerCheckbox({
    choiceNumber,
    questionNumber,
  }: {
    choiceNumber: number
    questionNumber: number
  }) {
    return `question ${questionNumber} choice ${choiceNumber} is correct answer`
  }

  static isFixedPositionCheckbox({
    choiceNumber,
    questionNumber,
  }: {
    choiceNumber: number
    questionNumber: number
  }) {
    return `question ${questionNumber} choice ${choiceNumber} is fixed position`
  }
}

export class QuestionSetEditorUIService {
  static create() {
    return new QuestionSetEditorUIService({
      questionSetRepo:
        LocalStorageQuestionSetRepo.createOriginalQuestionSetRepo(),
    })
  }

  static createNull({
    questionSetRepo = LocalStorageQuestionSetRepo.createNull(),
  }: {
    questionSetRepo?: QuestionSetRepo
  }) {
    return new QuestionSetEditorUIService({ questionSetRepo })
  }

  private readonly questionSetRepo: QuestionSetRepo

  private constructor({
    questionSetRepo: questionSetRepo,
  }: {
    questionSetRepo: QuestionSetRepo
  }) {
    this.questionSetRepo = questionSetRepo
  }

  getElement() {
    return <QuestionSetEditor questionSetRepo={this.questionSetRepo} />
  }
}

interface QuestionSetInput {
  name: string
  questions: QuestionInput[]
}

interface QuestionInput {
  description: string
  choices: ChoiceInput[]
}

interface ChoiceInput {
  answer: string
  isFixedPosition: boolean
  isCorrect: boolean
}

const newChoice = (): ChoiceInput => ({
  answer: '',
  isFixedPosition: false,
  isCorrect: false,
})

const newQuestion = (): QuestionInput => ({
  description: '',
  choices: [newChoice(), newChoice()],
})

function QuestionSetEditor({
  questionSetRepo,
}: {
  questionSetRepo: QuestionSetRepo
}) {
  const router = useRouter()

  const [questionSetInput, setQuestionSetInput] = useState<QuestionSetInput>({
    name: '',
    questions: [newQuestion()],
  })
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleQuestionUpdate = (
    questionIndex: number,
    questionUpdater: (oldQuestion: QuestionInput) => QuestionInput,
  ) => {
    setQuestionSetInput({
      ...questionSetInput,
      questions: questionSetInput.questions.map((oldQuestion, index) => {
        if (index === questionIndex) {
          return questionUpdater(oldQuestion)
        }
        return oldQuestion
      }),
    })
  }

  const handleSaveClick = () => {
    if (questionSetInput.name === '') {
      setErrorMessage("Question set name can't be empty")
      return
    }

    const questions: Question[] = []

    for (let i = 0; i < questionSetInput.questions.length; i++) {
      const questionInput = questionSetInput.questions[i]
      const questionNumber = i + 1

      const { error, question } = createQuestion(questionInput, questionNumber)
      if (error) {
        setErrorMessage(error)
        return
      }
      if (!question) {
        setErrorMessage('Unexpected error')
        return
      }
      questions.push(question)
    }

    const questionSet = new QuestionSet({
      name: questionSetInput.name,
      questions,
    })

    try {
      questionSetRepo.upsertQuestionSet(questionSet)
    } catch (e) {
      if (e instanceof UpsertQuestionSetError) {
        if (e.cause.code === 'DUPLICATE_QUESTION_SET_NAME') {
          setErrorMessage('Question set with same name already exists')
          return
        }
      }
      throw e
    }

    router.push('/')
  }

  const createQuestion = (
    input: QuestionInput,
    questionNumber: number,
  ): {
    error?: string
    question?: Question
  } => {
    if (input.description === '') {
      return {
        error: `Question ${questionNumber}: description can't be empty`,
      }
    }

    if (input.choices.filter((choice) => choice.answer === '').length > 0) {
      return { error: `Question ${questionNumber}: answer can't be empty` }
    }

    const mcBuilder = new MultipleChoiceBuilder()
    input.choices.forEach((choice, choiceIndex) => {
      mcBuilder.appendChoice({
        answer: choice.answer,
        isFixedPosition: choice.isFixedPosition,
      })
      if (choice.isCorrect) {
        mcBuilder.setCorrectChoiceIndex(choiceIndex)
      }
    })

    try {
      const mc = mcBuilder.build()
      return {
        question: {
          description: input.description,
          mc,
        },
      }
    } catch (e) {
      if (e instanceof MultipleChoiceError) {
        if (e.cause.code === 'DUPLICATE_CHOICES') {
          return { error: `Question ${questionNumber}: duplicate answer` }
        }
        if (e.cause.code === 'INVALID_CORRECT_CHOICE_INDEX') {
          return {
            error: `Question ${questionNumber}: please select one correct choice`,
          }
        }
      }
      throw e
    }
  }

  return (
    <div className="container mx-auto p-4">
      <form>
        <div className="form-group mb-8">
          <label>
            <h1 className="text-lg font-bold mb-2">Question Set Name:</h1>
            <input
              type="text"
              className="border border-gray-300 px-2 py-1 w-full"
              onChange={(e) => {
                setQuestionSetInput({
                  ...questionSetInput,
                  name: e.target.value,
                })
              }}
            />
          </label>
        </div>

        {questionSetInput.questions.map((question, questionIndex) => {
          return (
            <div
              key={questionIndex}
              className="mb-8 border border-2 border-gray-300 p-4"
            >
              <label>
                <h2 className="text-lg font-bold mb-2">
                  Question {questionIndex + 1}:
                </h2>
                <input
                  type="text"
                  className="border border-gray-300 px-2 py-1 w-full"
                  onChange={(e) => {
                    handleQuestionUpdate(questionIndex, (oldQuestion) => ({
                      ...oldQuestion,
                      description: e.target.value,
                    }))
                  }}
                />
              </label>
              <div className="form-group">
                <h3 className="text-lg font-bold mb-2">Choices:</h3>
                <table className="border-collapse border border-slate-400">
                  <thead>
                    <tr>
                      <th className="border border-slate-300">Answer</th>
                      <th className="border border-slate-300">Correct</th>
                      <th className="border border-slate-300">
                        Fixed Position
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <ChoicesEditor
                      questionIndex={questionIndex}
                      choices={question.choices}
                      onChoicesUpdate={(choices) => {
                        handleQuestionUpdate(questionIndex, (oldQuestion) => ({
                          ...oldQuestion,
                          choices,
                        }))
                      }}
                    />
                  </tbody>
                </table>

                <button
                  type="button"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={() => {
                    handleQuestionUpdate(questionIndex, (oldQuestion) => ({
                      ...oldQuestion,
                      choices: [...oldQuestion.choices, newChoice()],
                    }))
                  }}
                >
                  Add Choice
                </button>
              </div>
            </div>
          )
        })}
        <button
          type="button"
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => {
            setQuestionSetInput({
              ...questionSetInput,
              questions: [...questionSetInput.questions, newQuestion()],
            })
          }}
        >
          Add Question
        </button>

        <div className="flex items-center justify-center w-full">
          <button
            type="button"
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={() => {
              handleSaveClick()
            }}
          >
            Save
          </button>
          {errorMessage && (
            <div
              id="error-message"
              className="text-red-500 ml-2"
              aria-label={QuestionSetEditorAriaLabel.ERROR_PROMPT}
            >
              {errorMessage}
            </div>
          )}
        </div>
      </form>
    </div>
  )
}

function ChoicesEditor(props: {
  questionIndex: number
  choices: ChoiceInput[]
  onChoicesUpdate: (choices: ChoiceInput[]) => void
}) {
  const { choices, questionIndex, onChoicesUpdate } = props

  const handleInternalChoiceUpdate = (
    choiceIndex: number,
    choiceUpdate: Partial<ChoiceInput>,
  ) => {
    const newChoices = choices.map((oldChoice, index) => {
      if (index === choiceIndex) {
        return {
          ...oldChoice,
          ...choiceUpdate,
        }
      }
      return oldChoice
    })
    if (choiceUpdate.isCorrect) {
      newChoices.forEach((choice, index) => {
        if (index !== choiceIndex) {
          choice.isCorrect = false
        }
      })
    }
    onChoicesUpdate(newChoices)
  }

  const choiceEditors = []
  for (let choiceIndex = 0; choiceIndex < choices.length; choiceIndex++) {
    choiceEditors.push(
      <tr key={choiceIndex}>
        <td className="border border-slate-300">
          <input
            type="text"
            className="border border-gray-300 px-2 py-1"
            onChange={(e) => {
              handleInternalChoiceUpdate(choiceIndex, {
                answer: e.target.value,
              })
            }}
            aria-label={QuestionSetEditorAriaLabel.answerInput({
              choiceNumber: choiceIndex + 1,
              questionNumber: questionIndex + 1,
            })}
          />
        </td>
        <td className="border border-slate-300">
          <input
            type="checkbox"
            className="mr-1"
            checked={choices[choiceIndex].isCorrect}
            onChange={(e) => {
              handleInternalChoiceUpdate(choiceIndex, {
                isCorrect: e.target.checked,
              })
            }}
            aria-label={QuestionSetEditorAriaLabel.isCorrectAnswerCheckbox({
              choiceNumber: choiceIndex + 1,
              questionNumber: questionIndex + 1,
            })}
          />
        </td>
        <td className="border border-slate-300">
          <input
            type="checkbox"
            className="mr-1"
            aria-label={QuestionSetEditorAriaLabel.isFixedPositionCheckbox({
              choiceNumber: choiceIndex + 1,
              questionNumber: questionIndex + 1,
            })}
            onChange={(e) => {
              handleInternalChoiceUpdate(choiceIndex, {
                isFixedPosition: e.target.checked,
              })
            }}
          />
        </td>
      </tr>,
    )
  }
  return choiceEditors
}
