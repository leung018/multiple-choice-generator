'use client'
import { QuestionSetEditorUIService } from '../../components/mc/editor'

export default function QuestionSetEditorPage() {
  return QuestionSetEditorUIService.create().getElement()
}
