'use client'

import { QuestionSetBuilderForTest } from '../model/question_set'
import { QuestionSetRepoFactory } from '../repo/question_set'
import { HomePageUIService } from './components/home'

export default function Home() {
  const questionSetRepo = QuestionSetRepoFactory.createTestInstance()
  questionSetRepo.addQuestionSet(
    new QuestionSetBuilderForTest().setName('Banana').build(),
  )
  questionSetRepo.addQuestionSet(
    new QuestionSetBuilderForTest().setName('Apple').build(),
  )
  questionSetRepo.addQuestionSet(
    new QuestionSetBuilderForTest().setName('Orange').build(),
  )
  return HomePageUIService.createTestInstance({ questionSetRepo }).getElement()
}
