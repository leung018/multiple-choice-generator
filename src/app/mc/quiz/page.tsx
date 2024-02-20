'use client'

import { notFound, useSearchParams } from 'next/navigation'
import { MultipleChoiceQuizUIService } from '../../components/mc/quiz'
import { Suspense } from 'react'

export default function MultipleChoiceQuizPage() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  if (!id) {
    notFound()
  }

  const element = MultipleChoiceQuizUIService.create({
    questionSetId: id,
  }).getElement()

  return <Suspense>{element}</Suspense>
}
