'use client'
import { useSearchParams } from 'next/navigation'
import { QuestionSetEditorUIService } from '../components/editor'
import { Suspense } from 'react'

export default function QuestionSetEditorPage() {
  // TODO: Suspense is needed when useSearchParams is used. Mark this in README or use util function to remind this info.
  return (
    <Suspense>
      <MyQuestionSetEditorPage />
    </Suspense>
  )
}

function MyQuestionSetEditorPage() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  const service = QuestionSetEditorUIService.create()

  if (!id) {
    return service.getCreationPageElement()
  }

  return service.getModifyingPageElement(id)
}
