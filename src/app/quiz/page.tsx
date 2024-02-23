'use client'

import { notFound, useSearchParams } from 'next/navigation'
import { MultipleChoiceQuizUIService } from '../components/quiz'
import { Suspense } from 'react'

export default function MultipleChoiceQuizPage() {
  return (
    <Suspense>
      <MyMultipleChoiceQuizPage />
    </Suspense>
  )
}

function MyMultipleChoiceQuizPage() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  if (!id) {
    notFound()
  }

  return MultipleChoiceQuizUIService.create({
    questionSetId: id,
  }).getElement()
}
