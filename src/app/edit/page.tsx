'use client'
import { QuestionSetEditorUIService } from '../components/editor'

export default function QuestionSetEditorPage() {
  return QuestionSetEditorUIService.create().getElement()
}
