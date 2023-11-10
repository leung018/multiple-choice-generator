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
      // TODO: turn these into one component and use one key only

      choiceInputs.push(
        <div key={i + '-' + 1} className="col-span-3">
          <label>
            Choice {i + 1}:
            <input
              type="text"
              className="border border-gray-300 px-2 py-1 ml-2"
              name={`question-${questionIndex}-choice-${i}-answer`}
            />
          </label>
        </div>,
      )
      choiceInputs.push(
        <div
          key={i + '-' + 2}
          className="col-span-1 flex items-center justify-center"
        >
          <input
            type="checkbox"
            className="mr-1"
            name={`question-${questionIndex}-choice-${i}-is-correct`}
            aria-label={`Choice ${i + 1} is correct answer`}
          />
        </div>,
      )
      choiceInputs.push(
        <div
          key={i + '-' + 3}
          className="col-span-1 flex items-center justify-center"
        >
          <input
            type="checkbox"
            className="mr-1"
            name={`question-${questionIndex}-choice-${i}-is-fixed-position`}
            aria-label={`Choice ${i + 1} is fixed position`}
          />
        </div>,
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
            <div className="grid grid-cols-5 gap-4">
              <div className="col-span-3"></div>
              <div className="col-span-1 text-center">Correct Answer</div>
              <div className="col-span-1 text-center">Fixed Position</div>
              {renderChoiceInputs(0, 2)}

              <div className="col-span-1">
                <button
                  type="button"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Add Choice
                </button>
              </div>
            </div>
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
