'use client'

import { QuestionSet } from '../../model/question_set'
import {
  QuestionSetRepo,
  QuestionSetRepoFactory,
} from '../../repo/question_set'

export class HomePageUIService {
  static create() {
    return new HomePageUIService({
      questionSetRepo: QuestionSetRepoFactory.createTestInstance(), // TODO: replace with real repo
    })
  }

  static createTestInstance({
    questionSetRepo = QuestionSetRepoFactory.createTestInstance(),
  }) {
    return new HomePageUIService({ questionSetRepo })
  }

  private readonly questionSetRepo: QuestionSetRepo

  private constructor({
    questionSetRepo,
  }: {
    questionSetRepo: QuestionSetRepo
  }) {
    this.questionSetRepo = questionSetRepo
  }

  getElement() {
    return (
      <HomePage
        questionSets={this.questionSetRepo.getQuestionSets()}
      ></HomePage>
    )
  }
}

function HomePage({ questionSets }: { questionSets: readonly QuestionSet[] }) {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Multiple Choice Question Sets</h1>
      <ul>
        {questionSets.map((set) => (
          <li key={set.id} className="mb-4">
            <div className="border p-4 rounded shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
              <span className="font-medium">{set.name}</span>
              <div>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition-colors"
                  onClick={() => {
                    // Logic to navigate to the Quiz page
                  }}
                >
                  Take Quiz
                </button>
                <button
                  className="ml-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 transition-colors"
                  onClick={() => {
                    // Logic to navigate to the Edit Question Set page
                  }}
                >
                  Edit
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <button
        className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-700 transition-colors"
        onClick={() => {
          // Logic to navigate to the Add New Question Set page
        }}
      >
        Add New Question Set
      </button>
    </div>
  )
}
