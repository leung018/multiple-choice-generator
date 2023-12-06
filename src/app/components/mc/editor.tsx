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
  onSave,
}: {
  onSave: (questionSet: QuestionSet) => void
}) {
  const [questionSetInput, setQuestionSetInput] = useState<QuestionSetInput>({
    name: '',
    questions: [newQuestion()],
  })

  const handleQuestionUpdate = (
    questionIndex: number,
    questionUpdater: (oldQuestion: QuestionInput) => QuestionInput,
  ) => {
    setQuestionSetInput({
      ...questionSetInput,
      questions: questionSetInput.questions.map((oldQuestion, index) => {
        if (index === questionIndex) {
          return {
            ...oldQuestion,
            ...questionUpdater(oldQuestion),
          }
        }
        return oldQuestion
      }),
    })
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
            onClick={() => onSave(mapQuestionSetInputToQuestionSet())}
          >
            Save
          </button>
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
            aria-label={`answer of question ${questionIndex + 1} choice ${
              choiceIndex + 1
            }`}
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
            aria-label={`question ${questionIndex + 1} choice ${
              choiceIndex + 1
            } is correct answer`}
          />
        </td>
        <td className="border border-slate-300">
          <input
            type="checkbox"
            className="mr-1"
            aria-label={`question ${questionIndex + 1} choice ${
              choiceIndex + 1
            } is fixed position`}
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
