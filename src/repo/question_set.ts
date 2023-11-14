import { QuestionSet } from '../model/question_set'

export interface QuestionSetRepo {
  save(questionSet: QuestionSet): void
  getQuestionSetByName(questionSetName: string): QuestionSet
}

export class QuestionSetRepoFactory {
  static createTestInstance(): QuestionSetRepo {
    return new InMemoryQuestionSetRepo()
  }
}

class InMemoryQuestionSetRepo implements QuestionSetRepo {
  private nameToQuestionSet: { [name: string]: QuestionSet } = {}

  save(questionSet: QuestionSet): void {
    this.nameToQuestionSet[questionSet.name] = questionSet
  }

  getQuestionSetByName(questionSetName: string): QuestionSet {
    return this.nameToQuestionSet[questionSetName]
  }
}
