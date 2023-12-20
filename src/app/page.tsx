'use client'

import { QuestionSetBuilderForTest } from '../model/question_set'
import { QuestionSetRepoFactory } from '../repo/question_set'
import { HomePageUIService } from './components/home'

export default function Home() {
  const questionSetRepo = QuestionSetRepoFactory.createTestInstance()
  questionSetRepo.createQuestionSet(
    new QuestionSetBuilderForTest().setName('Banana').build(),
  )
  questionSetRepo.createQuestionSet(
    new QuestionSetBuilderForTest().setName('Apple').build(),
  )
  questionSetRepo.createQuestionSet(
    new QuestionSetBuilderForTest().setName('Orange').build(),
  )
  return HomePageUIService.createTestInstance({ questionSetRepo }).getElement()
}
