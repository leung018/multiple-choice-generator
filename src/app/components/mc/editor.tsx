'use client'

import { useState } from 'react'
import {
  QuestionSetRepo,
  QuestionSetRepoFactory,
} from '../../../repo/question_set'
import { QuestionSet } from '../../../model/question_set'
import { MultipleChoice, MultipleChoiceBuilder } from '../../../model/mc'

export class QuestionSetEditorUIService {
  static create() {
    return new QuestionSetEditorUIService({
      editorRepo: QuestionSetRepoFactory.createTestInstance(), // TODO: replace with real repo
    })
  }

  static createTestInstance({
    editorRepo = QuestionSetRepoFactory.createTestInstance(),
  }) {
    return new QuestionSetEditorUIService({ editorRepo })
  }

  private editorRepo: QuestionSetRepo

  private constructor({ editorRepo }: { editorRepo: QuestionSetRepo }) {
    this.editorRepo = editorRepo
  }

  private handleSave = (questionSet: QuestionSet) => {
    this.editorRepo.save(questionSet)
  }

  getElement() {
    return <QuestionSetEditor onSave={this.handleSave} />
  }
}

interface QuestionSetInput {
  name: string
  questions: {
    description: string
    choices: {
      answer: string
      isFixedPosition: boolean
      isCorrect: boolean
    }[]
  }[]
}

function QuestionSetEditor({
  onSave,
}: {
  onSave: (questionSet: QuestionSet) => void
}) {
  const [questionSetInput, setQuestionSetInput] = useState<QuestionSetInput>({
    name: '',
    questions: [
      {
        description: '',
        choices: [
          {
            answer: '',
            isFixedPosition: false,
            isCorrect: false,
          },
          {
            answer: '',
            isFixedPosition: false,
            isCorrect: false,
          },
        ],
      },
    ],
  })

  const renderChoiceInputs = (questionIndex: number, numOfChoices: number) => {
    const choiceInputs = []
    for (let i = 0; i < numOfChoices; i++) {
      choiceInputs.push(
        <tr key={i}>
          <td className="border border-slate-300">
            <input
              type="text"
              className="border border-gray-300 px-2 py-1"
              onChange={(e) => {
                setQuestionSetInput({
                  ...questionSetInput,
                  questions: questionSetInput.questions.map(
                    (question, index) => {
                      if (index === questionIndex) {
                        return {
                          ...question,
                          choices: question.choices.map((choice, index) => {
                            if (index === i) {
                              return {
                                ...choice,
                                answer: e.target.value,
                              }
                            }
                            return choice
                          }),
                        }
                      }
                      return question
                    },
                  ),
                })
              }}
              aria-label={`answer of question ${questionIndex + 1} choice ${
                i + 1
              }`}
            />
          </td>
          <td className="border border-slate-300">
            <input
              type="checkbox"
              className="mr-1"
              onChange={(e) => {
                setQuestionSetInput({
                  ...questionSetInput,
                  questions: questionSetInput.questions.map(
                    (question, index) => {
                      if (index === questionIndex) {
                        return {
                          ...question,
                          choices: question.choices.map((choice, index) => {
                            if (index === i) {
                              return {
                                ...choice,
                                isCorrect: e.target.checked,
                              }
                            }
                            return choice
                          }),
                        }
                      }
                      return question
                    },
                  ),
                })
              }}
              aria-label={`question ${questionIndex + 1} choice ${
                i + 1
              } is correct answer`}
            />
          </td>
          <td className="border border-slate-300">
            <input
              type="checkbox"
              className="mr-1"
              aria-label={`question ${questionIndex + 1} choice ${
                i + 1
              } is fixed position`}
              onChange={(e) => {
                setQuestionSetInput({
                  ...questionSetInput,
                  questions: questionSetInput.questions.map(
                    (question, index) => {
                      if (index === questionIndex) {
                        return {
                          ...question,
                          choices: question.choices.map((choice, index) => {
                            if (index === i) {
                              return {
                                ...choice,
                                isFixedPosition: e.target.checked,
                              }
                            }
                            return choice
                          }),
                        }
                      }
                      return question
                    },
                  ),
                })
              }}
            />
          </td>
        </tr>,
      )
    }
    return choiceInputs
  }

  const mapQuestionSetInputToQuestionSet = (): QuestionSet => {
    const questions: {
      description: string
      mc: MultipleChoice
    }[] = questionSetInput.questions.map((question) => {
      const mcBuilder = new MultipleChoiceBuilder()
      question.choices.forEach((choice, choiceIndex) => {
        mcBuilder.appendChoice({
          answer: choice.answer,
          isFixedPosition: choice.isFixedPosition,
        })
        if (choice.isCorrect) {
          mcBuilder.setCorrectChoiceIndex(choiceIndex)
        }
      })
      return {
        description: question.description,
        mc: mcBuilder.build(),
      }
    })

    return {
      name: questionSetInput.name,
      questions,
    }
  }

  return (
    <div className="container mx-auto p-4">
      <form>
        <div className="form-group">
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
            <div key={questionIndex} className="mb-8">
              <label>
                <h2 className="text-lg font-bold mb-2">
                  Question {questionIndex + 1}:
                </h2>
                <input
                  type="text"
                  className="border border-gray-300 px-2 py-1 w-full"
                  onChange={(e) => {
                    setQuestionSetInput({
                      ...questionSetInput,
                      questions: questionSetInput.questions.map(
                        (question, index) => {
                          if (index === questionIndex) {
                            return {
                              ...question,
                              description: e.target.value,
                            }
                          }
                          return question
                        },
                      ),
                    })
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
                    {renderChoiceInputs(questionIndex, question.choices.length)}
                  </tbody>
                </table>

                <button
                  type="button"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={() => {
                    setQuestionSetInput({
                      ...questionSetInput,
                      questions: questionSetInput.questions.map(
                        (question, index) => {
                          if (index === questionIndex) {
                            return {
                              ...question,
                              choices: [
                                ...question.choices,
                                {
                                  answer: '',
                                  isFixedPosition: false,
                                  isCorrect: false,
                                },
                              ],
                            }
                          }
                          return question
                        },
                      ),
                    })
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
              questions: [
                ...questionSetInput.questions,
                {
                  description: '',
                  choices: [
                    {
                      answer: '',
                      isFixedPosition: false,
                      isCorrect: false,
                    },
                    {
                      answer: '',
                      isFixedPosition: false,
                      isCorrect: false,
                    },
                  ],
                },
              ],
            })
          }}
        >
          Add Question
        </button>

        <div className="flex items-center justify-center w-full">
          <button
            type="button"
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={() => onSave(mapQuestionSetInputToQuestionSet())}
          >
            Save
          </button>
        </div>
      </form>
    </div>
  )
}
