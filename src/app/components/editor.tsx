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

  static removeQuestionButton(questionNumber: number) {
    return `button of removing question ${questionNumber}`
  }

  static removeChoiceButton({
    questionNumber,
    choiceNumber,
  }: {
    choiceNumber: number
    questionNumber: number
  }) {
    return `button of removing question ${questionNumber} choice ${choiceNumber}`
  }

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
  readonly id: number
  description: string
  choices: ChoiceInput[]
}

interface ChoiceInput {
  readonly id: number
  answer: string
  isFixedPosition: boolean
  isCorrect: boolean
}

let choiceCounter = 0

const newChoice = (): ChoiceInput => ({
  id: choiceCounter++,
  answer: '',
  isFixedPosition: false,
  isCorrect: false,
})

let questionCounter = 0

const newQuestion = (): QuestionInput => ({
  id: questionCounter++,
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
    questionId: number,
    questionUpdater: (oldQuestion: QuestionInput) => QuestionInput,
  ) => {
    setQuestionSetInput({
      ...questionSetInput,
      questions: questionSetInput.questions.map((oldQuestion) => {
        if (oldQuestion.id === questionId) {
          return questionUpdater(oldQuestion)
        }
        return oldQuestion
      }),
    })
  }

  const handleQuestionRemove = (questionId: number) => {
    setQuestionSetInput({
      ...questionSetInput,
      questions: questionSetInput.questions.filter(
        (question) => question.id !== questionId,
      ),
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
          const questionNumber = questionIndex + 1
          return (
            <div
              key={question.id}
              className="mb-8 border border-2 border-gray-300 p-4 relative"
            >
              {questionSetInput.questions.length > 1 && (
                <button
                  type="button"
                  className="absolute top-2 right-2 bg-transparent text-2xl text-red-500 hover:text-red-700"
                  aria-label={QuestionSetEditorAriaLabel.removeQuestionButton(
                    questionNumber,
                  )}
                  onClick={() => {
                    handleQuestionRemove(question.id)
                  }}
                >
                  ×
                </button>
              )}
              <label>
                <h2 className="text-lg font-bold mb-2">
                  Question {questionNumber}:
                </h2>
                <input
                  type="text"
                  className="border border-gray-300 px-2 py-1 w-full"
                  onChange={(e) => {
                    handleQuestionUpdate(question.id, (oldQuestion) => ({
                      ...oldQuestion,
                      description: e.target.value,
                    }))
                  }}
                />
              </label>
              <ChoicesEditor
                questionNumber={questionNumber}
                choices={question.choices}
                onChoicesUpdate={(choices) => {
                  handleQuestionUpdate(question.id, (oldQuestion) => ({
                    ...oldQuestion,
                    choices,
                  }))
                }}
              />
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
  questionNumber: number
  choices: ChoiceInput[]
  onChoicesUpdate: (choices: ChoiceInput[]) => void
}) {
  const { choices, questionNumber, onChoicesUpdate } = props

  const handleInternalChoiceUpdate = (
    choiceId: number,
    choiceUpdate: Partial<ChoiceInput>,
  ) => {
    const newChoices = choices.map((oldChoice) => {
      if (oldChoice.id === choiceId) {
        return {
          ...oldChoice,
          ...choiceUpdate,
        }
      }
      return oldChoice
    })
    if (choiceUpdate.isCorrect) {
      newChoices.forEach((choice) => {
        if (choice.id !== choiceId) {
          choice.isCorrect = false
        }
      })
    }
    onChoicesUpdate(newChoices)
  }

  const handleInternalChoiceRemove = (choiceId: number) => {
    const newChoices = choices.filter((choice) => choice.id !== choiceId)
    onChoicesUpdate(newChoices)
  }

  return (
    <div className="form-group">
      <h3 className="text-lg font-bold mb-2">Choices:</h3>
      <table className="border-collapse border border-slate-400">
        <thead>
          <tr>
            <th className="border border-slate-300">Answer</th>
            <th className="border border-slate-300">Correct</th>
            <th className="border border-slate-300">Fixed Position</th>
          </tr>
        </thead>
        <tbody>
          {choices.map((choice, choiceIndex) => {
            const choiceNumber = choiceIndex + 1
            return (
              <tr key={choice.id}>
                <td className="border border-slate-300">
                  <input
                    type="text"
                    className="border border-gray-300 px-2 py-1"
                    onChange={(e) => {
                      handleInternalChoiceUpdate(choice.id, {
                        answer: e.target.value,
                      })
                    }}
                    aria-label={QuestionSetEditorAriaLabel.answerInput({
                      choiceNumber,
                      questionNumber,
                    })}
                  />
                </td>
                <td className="border border-slate-300">
                  <input
                    type="checkbox"
                    className="mr-1"
                    checked={choice.isCorrect}
                    onChange={(e) => {
                      handleInternalChoiceUpdate(choice.id, {
                        isCorrect: e.target.checked,
                      })
                    }}
                    aria-label={QuestionSetEditorAriaLabel.isCorrectAnswerCheckbox(
                      {
                        choiceNumber,
                        questionNumber,
                      },
                    )}
                  />
                </td>
                <td className="border border-slate-300">
                  <input
                    type="checkbox"
                    className="mr-1"
                    aria-label={QuestionSetEditorAriaLabel.isFixedPositionCheckbox(
                      {
                        choiceNumber,
                        questionNumber,
                      },
                    )}
                    onChange={(e) => {
                      handleInternalChoiceUpdate(choice.id, {
                        isFixedPosition: e.target.checked,
                      })
                    }}
                  />
                </td>
                {choices.length > 2 && (
                  <td className="border border-slate-300">
                    <button
                      type="button"
                      className="bg-transparent text-2xl text-red-500 hover:text-red-700"
                      aria-label={QuestionSetEditorAriaLabel.removeChoiceButton(
                        {
                          questionNumber,
                          choiceNumber,
                        },
                      )}
                      onClick={() => {
                        handleInternalChoiceRemove(choice.id)
                      }}
                    >
                      ×
                    </button>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>

      <button
        type="button"
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={() => {
          onChoicesUpdate([...choices, newChoice()])
        }}
      >
        Add Choice
      </button>
    </div>
  )
}
