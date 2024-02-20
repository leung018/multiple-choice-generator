'use client'

import { notFound, useSearchParams } from 'next/navigation'
import { MultipleChoiceQuizUIService } from '../../components/mc/quiz'

export default function MultipleChoiceQuizPage() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  if (!id) {
    notFound()
  }

  return MultipleChoiceQuizUIService.create({
    questionSetId: id,
  }).getElement()
}
