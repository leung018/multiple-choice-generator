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

function QuestionSetEditor({
  onSave,
}: {
  onSave: (questionSet: QuestionSet) => void
}) {
  const [questionIndexToNumOfChoices, setQuestionIndexToNumOfChoices] =
    useState<Map<number, number>>(new Map<number, number>([[0, 2]]))

  const renderChoiceInputs = (questionIndex: number, numOfChoices: number) => {
    const choiceInputs = []
    for (let i = 0; i < numOfChoices; i++) {
      choiceInputs.push(
        <tr key={i}>
          <td className="border border-slate-300">
            <input
              type="text"
              className="border border-gray-300 px-2 py-1"
              name={`question-${questionIndex}-choice-${i}-answer`}
              aria-label={`answer of question ${questionIndex + 1} choice ${
                i + 1
              }`}
            />
          </td>
          <td className="border border-slate-300">
            <input
              type="checkbox"
              className="mr-1"
              name={`question-${questionIndex}-choice-${i}-is-correct`}
              aria-label={`question ${questionIndex + 1} choice ${
                i + 1
              } is correct answer`}
            />
          </td>
          <td className="border border-slate-300">
            <input
              type="checkbox"
              className="mr-1"
              name={`question-${questionIndex}-choice-${i}-is-fixed-position`}
              aria-label={`question ${questionIndex + 1} choice ${
                i + 1
              } is fixed position`}
            />
          </td>
        </tr>,
      )
    }
    return choiceInputs
  }

  const mapFormDataToQuestionSet = (
    formData: FormData,
    numOfQuestions: number,
  ): QuestionSet => {
    const questions: {
      description: string
      mc: MultipleChoice
    }[] = []
    for (
      let questionIndex = 0;
      questionIndex < numOfQuestions;
      questionIndex++
    ) {
      const numOfChoices = questionIndexToNumOfChoices.get(
        questionIndex,
      ) as number
      const mcBuilder = new MultipleChoiceBuilder()
      for (let choiceIndex = 0; choiceIndex < numOfChoices; choiceIndex++) {
        mcBuilder.appendChoice({
          answer: formData.get(
            `question-${questionIndex}-choice-${choiceIndex}-answer`,
          ) as string,
          isFixedPosition:
            formData.get(
              `question-${questionIndex}-choice-${choiceIndex}-is-fixed-position`,
            ) === 'on',
        })
        if (
          formData.get(
            `question-${questionIndex}-choice-${choiceIndex}-is-correct`,
          ) === 'on'
        ) {
          mcBuilder.setCorrectChoiceIndex(choiceIndex)
        }
      }

      questions.push({
        description: formData.get(`question-${questionIndex}-title`) as string,
        mc: mcBuilder.build(),
      })
    }

    return {
      name: formData.get('question-set-name') as string,
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
              name="question-set-name"
              className="border border-gray-300 px-2 py-1 w-full"
            />
          </label>
        </div>

        {Array.from(questionIndexToNumOfChoices).map(
          ([questionIndex, numOfChoices]) => {
            return (
              <div key={questionIndex} className="mb-8">
                <label>
                  <h2 className="text-lg font-bold mb-2">
                    Question {questionIndex + 1}:
                  </h2>
                  <input
                    type="text"
                    className="border border-gray-300 px-2 py-1 w-full"
                    name={`question-${questionIndex}-title`}
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
                      {renderChoiceInputs(questionIndex, numOfChoices)}
                    </tbody>
                  </table>

                  <button
                    type="button"
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={() => {
                      const newMap = new Map<number, number>(
                        questionIndexToNumOfChoices,
                      )
                      newMap.set(questionIndex, numOfChoices + 1)
                      setQuestionIndexToNumOfChoices(newMap)
                    }}
                  >
                    Add Choice
                  </button>
                </div>
              </div>
            )
          },
        )}
        <button
          type="button"
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => {
            const newMap = new Map<number, number>(questionIndexToNumOfChoices)
            newMap.set(newMap.size, 2)
            setQuestionIndexToNumOfChoices(newMap)
          }}
        >
          Add Question
        </button>

        <div className="flex items-center justify-center w-full">
          <button
            type="button"
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={() =>
              onSave(
                mapFormDataToQuestionSet(
                  new FormData(document.forms[0]),
                  questionIndexToNumOfChoices.size,
                ),
              )
            }
          >
            Save
          </button>
        </div>
      </form>
    </div>
  )
}
