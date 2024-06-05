'use client'
import { QuestionSetEditorUIService } from '../components/editor'

export default function QuestionSetEditorPage() {
  // TODO: If id is passed in query param, getModifyingPageElement instead
  return QuestionSetEditorUIService.create().getCreationPageElement()
}
