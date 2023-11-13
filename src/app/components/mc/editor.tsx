'use client'

import { useState } from 'react'
import {
  QuestionSetRepo,
  QuestionSetRepoFactory,
} from '../../../repo/question_set'
import { QuestionSet } from '../../../model/question_set'
import { MultipleChoiceBuilder } from '../../../model/mc'

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

  const mapFormDataToQuestionSet = (formData: FormData): QuestionSet => {
    return {
      name: formData.get('question-set-name') as string,
      questions: [
        {
          title: formData.get('question-0-title') as string,
          mc: (() => {
            const numOfChoices = questionIndexToNumOfChoices.get(0) as number
            const mcBuilder = new MultipleChoiceBuilder()
            for (let i = 0; i < numOfChoices; i++) {
              mcBuilder.appendChoice({
                answer: formData.get(`question-0-choice-${i}-answer`) as string,
                isFixedPosition:
                  formData.get(`question-0-choice-${i}-is-fixed-position`) ===
                  'on',
              })
              if (formData.get(`question-0-choice-${i}-is-correct`) === 'on') {
                mcBuilder.setCorrectChoiceIndex(i)
              }
            }
            return mcBuilder.build()
          })(),
        },
      ],
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

        <div className="mb-8">
          <label>
            <h2 className="text-lg font-bold mb-2">Question 1:</h2>
            <input
              type="text"
              className="border border-gray-300 px-2 py-1 w-full"
              name="question-0-title"
            />
          </label>
          <div className="form-group">
            <table className="border-collapse border border-slate-400">
              <thead>
                <tr>
                  <th className="border border-slate-300">Choice</th>
                  <th className="border border-slate-300">Correct</th>
                  <th className="border border-slate-300">Fixed Position</th>
                </tr>
              </thead>
              <tbody>{renderChoiceInputs(0, 2)}</tbody>
            </table>

            <button
              type="button"
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Add Choice
            </button>
          </div>
        </div>
        <button
          type="button"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Question
        </button>

        <div className="flex items-center justify-center w-full">
          <button
            type="button"
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={() =>
              onSave(mapFormDataToQuestionSet(new FormData(document.forms[0])))
            }
          >
            Save
          </button>
        </div>
      </form>
    </div>
  )
}
