'use client'

import { useRouter } from 'next/navigation'
import { QuestionSet } from '../../model/question_set'
import {
  QuestionSetRepo,
  QuestionSetRepoFactory,
} from '../../repo/question_set'
import { useEffect, useState } from 'react'
import LoadingSpinner from './loading'

export class HomePageUIService {
  static create() {
    return new HomePageUIService({
      questionSetRepo: QuestionSetRepoFactory.createLocalStorageInstance(),
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

  private getSortedQuestionSets = () => {
    // Ideally perhaps this should be done in the repo layer with a more generic method
    // But for current project scope, this is fine
    return [...this.questionSetRepo.getQuestionSets()].sort((a, b) =>
      a.name.localeCompare(b.name),
    )
  }

  getElement() {
    return <HomePage getQuestionSets={this.getSortedQuestionSets}></HomePage>
  }
}

function HomePage({
  getQuestionSets,
}: {
  getQuestionSets: () => readonly QuestionSet[]
}) {
  const router = useRouter()
  const [isLoading, setLoading] = useState(true)

  const [questionSets, setQuestionSets] = useState<readonly QuestionSet[]>([])
  useEffect(() => {
    setQuestionSets(getQuestionSets())
    setLoading(false)
  }, [getQuestionSets])

  if (isLoading) {
    return <LoadingSpinner />
  }

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
                    router.push(`/mc/quiz?id=${set.id}`)
                  }}
                >
                  Take Quiz
                </button>
                {
                  // TODO: Add Edit feature. (See the git blame of this line to see the original edit button code)
                }
              </div>
            </div>
          </li>
        ))}
      </ul>
      <button
        className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-700 transition-colors"
        onClick={() => {
          router.push('/mc/edit')
        }}
      >
        Add New Question Set
      </button>
    </div>
  )
}
