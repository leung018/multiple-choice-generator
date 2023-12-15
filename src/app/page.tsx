'use client'

import { QuestionSetBuilderForTest } from '../model/question_set'
import { QuestionSetRepoFactory } from '../repo/question_set'
import { HomePageUIService } from './components/home'

export default function Home() {
  const questionSetRepo = QuestionSetRepoFactory.createTestInstance()
  questionSetRepo.save(new QuestionSetBuilderForTest().build())
  questionSetRepo.save(
    new QuestionSetBuilderForTest().setName('Question Set 2').build(),
  )
  return HomePageUIService.createTestInstance({ questionSetRepo }).getElement()
}
