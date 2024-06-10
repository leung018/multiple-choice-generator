'use client'

import { useRouter } from 'next/navigation'
import { QuestionSet } from '../../model/question_set'
import {
  QuestionSetRepo,
  LocalStorageQuestionSetRepo,
} from '../../repo/question_set'
import { useEffect, useState } from 'react'
import LoadingSpinner from './loading'

export class HomePageUIService {
  static create() {
    return new HomePageUIService({
      questionSetRepo:
        LocalStorageQuestionSetRepo.createOriginalQuestionSetRepo(),
    })
  }

  static createNull({
    questionSetRepo = LocalStorageQuestionSetRepo.createNull(),
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
    return <HomePage fetchQuestionSets={this.getSortedQuestionSets}></HomePage>
  }
}

function HomePage({
  fetchQuestionSets,
}: {
  fetchQuestionSets: () => readonly QuestionSet[]
}) {
  const router = useRouter()
  const [isLoading, setLoading] = useState(true)

  const [questionSets, setQuestionSets] = useState<readonly QuestionSet[]>([])
  useEffect(() => {
    setQuestionSets(fetchQuestionSets())
    setLoading(false)
  }, [fetchQuestionSets])

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
                    router.push(`/quiz?id=${set.id}`)
                  }}
                >
                  Take Quiz
                </button>
                <button
                  className="ml-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 transition-colors"
                  onClick={() => {
                    router.push(`/edit?id=${set.id}`)
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
          router.push('/edit')
        }}
      >
        Add New Question Set
      </button>
    </div>
  )
}
