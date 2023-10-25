import { QuestionSet } from '../model/question_set'

export interface QuestionSetRepo {
  getQuestionSetByName(questionSetName: string): QuestionSet
}

export class QuestionSetRepoFactory {
  static createTestInstance(): QuestionSetRepo {
    return new InMemoryQuestionSetRepo()
  }
}

class InMemoryQuestionSetRepo implements QuestionSetRepo {
  getQuestionSetByName(questionSetName: string): QuestionSet {
    return {
      name: 'Sample Question Set',
      questions: [],
    }
  }
}
