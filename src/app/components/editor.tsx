'use client'

import { useEffect, useRef, useState } from 'react'
import {
  QuestionSetRepo,
  LocalStorageQuestionSetRepo,
  UpsertQuestionSetError,
  GetQuestionSetError,
} from '../../repo/question_set'
import { Question, QuestionSet } from '../../model/question_set'
import {
  MultipleChoice,
  MultipleChoiceBuilder,
  MultipleChoiceError,
} from '../../model/mc'
import { useRouter } from 'next/navigation'
import Error from 'next/error'
import LoadingSpinner from './loading'

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

type OperationResult<T = undefined> = SuccessResult<T> | FailureResult

interface SuccessResult<T> {
  result: T
}

interface FailureResult {
  error: string
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

  getCreationPageElement() {
    return (
      <QuestionSetEditor
        saveQuestionSet={this.saveQuestionSet}
        fetchQuestionSet={() => QuestionSet.create({ name: '', questions: [] })}
      />
    )
  }

  getModifyingPageElement(questionSetId: string) {
    return (
      <QuestionSetEditor
        saveQuestionSet={this.saveQuestionSet}
        fetchQuestionSet={() =>
          this.questionSetRepo.getQuestionSetById(questionSetId)
        }
      />
    )
  }

  private saveQuestionSet = (questionSet: QuestionSet): OperationResult => {
    try {
      this.questionSetRepo.upsertQuestionSet(questionSet)
    } catch (e) {
      if (e instanceof UpsertQuestionSetError) {
        if (e.cause.code === 'DUPLICATE_QUESTION_SET_NAME') {
          return {
            error: 'Question set with same name already exists',
          }
        }
      }
      throw e
    }
    return {
      result: undefined,
    }
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

const newChoiceInput = ({
  answer = '',
  isFixedPosition = false,
  isCorrect = false,
} = {}): ChoiceInput => ({
  id: choiceCounter++,
  answer,
  isFixedPosition,
  isCorrect,
})

let questionCounter = 0

const newQuestionInput = ({
  description = '',
  choices = [newChoiceInput(), newChoiceInput()],
} = {}): QuestionInput => ({
  id: questionCounter++,
  description,
  choices,
})

const mapQuestionSetToQuestionSetInput = (
  questionSet: QuestionSet,
): QuestionSetInput => {
  const input = {
    name: questionSet.name,
    questions: questionSet.questions.map((question) =>
      newQuestionInput({
        description: question.description,
        choices: mapMultipleChoiceToChoiceInputs(question.mc),
      }),
    ),
  }
  if (input.questions.length == 0) input.questions.push(newQuestionInput())
  return input
}

const mapMultipleChoiceToChoiceInputs = (mc: MultipleChoice): ChoiceInput[] => {
  return mc.choices.map((choice, choiceIndex) =>
    newChoiceInput({
      answer: choice.answer,
      isFixedPosition: choice.isFixedPosition,
      isCorrect: choiceIndex == mc.correctChoiceIndex,
    }),
  )
}

function QuestionSetEditor({
  saveQuestionSet,
  fetchQuestionSet,
}: {
  fetchQuestionSet: () => QuestionSet
  saveQuestionSet: (questionSet: QuestionSet) => OperationResult
}) {
  const router = useRouter()
  const [isLoading, setLoading] = useState(true)
  const [isNotFound, setNotFound] = useState(false)

  const questionSetIdRef = useRef<string>('')

  const [questionSetInput, setQuestionSetInput] = useState<QuestionSetInput>({
    name: '',
    questions: [],
  })
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    try {
      const questionSet = fetchQuestionSet()
      questionSetIdRef.current = questionSet.id
      setQuestionSetInput(mapQuestionSetToQuestionSetInput(questionSet))
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
    const response = saveChanges()
    if ('error' in response) {
      setErrorMessage(response.error)
      return
    }

    router.push('/')
  }

  const saveChanges = (): OperationResult => {
    const response = buildQuestionSet(questionSetInput)
    if ('error' in response) {
      return response
    }
    return saveQuestionSet(response.result)
  }

  const buildQuestionSet = (
    questionSetInput: QuestionSetInput,
  ): OperationResult<QuestionSet> => {
    if (questionSetInput.name === '') {
      return { error: "Question set name can't be empty" }
    }

    // build Questions
    const questions: Question[] = []
    for (let i = 0; i < questionSetInput.questions.length; i++) {
      const questionInput = questionSetInput.questions[i]
      const questionNumber = i + 1

      const response = buildQuestion(questionInput, questionNumber)
      if ('error' in response) {
        return {
          error: response.error,
        }
      }

      questions.push(response.result)
    }

    return {
      result: QuestionSet.create({
        name: questionSetInput.name,
        questions,
        id: questionSetIdRef.current,
      }),
    }
  }

  const buildQuestion = (
    input: QuestionInput,
    questionNumber: number,
  ): OperationResult<Question> => {
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
        result: {
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

  if (isNotFound) {
    return <Error statusCode={404} />
  }

  if (isLoading) {
    return <LoadingSpinner />
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
              value={questionSetInput.name}
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
                  value={question.description}
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
              questions: [...questionSetInput.questions, newQuestionInput()],
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
                    value={choice.answer}
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
                    checked={choice.isFixedPosition}
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
          onChoicesUpdate([...choices, newChoiceInput()])
        }}
      >
        Add Choice
      </button>
    </div>
  )
}
