import { QuestionSet } from '../model/question_set'
import { CustomBaseError } from '../utils/err'

export interface QuestionSetRepo {
  /**
   * @throws {QuestionSetSaveError}
   */
  save(questionSet: QuestionSet): void
  getQuestionSetByName(questionSetName: string): QuestionSet
}

type QuestionSetSaveErrorCode = 'DUPLICATE_QUESTION_SET_NAME'
export class QuestionSetSaveError extends CustomBaseError {
  constructor(code: QuestionSetSaveErrorCode, message?: string) {
    super(code, message)
  }
}

export class QuestionSetRepoFactory {
  static createTestInstance(): QuestionSetRepo {
    return new InMemoryQuestionSetRepo()
  }
}

class InMemoryQuestionSetRepo implements QuestionSetRepo {
  private nameToQuestionSet: { [name: string]: QuestionSet } = {}

  save(questionSet: QuestionSet): void {
    if (this.nameToQuestionSet[questionSet.name]) {
      throw new QuestionSetSaveError(
        'DUPLICATE_QUESTION_SET_NAME',
        `QuestionSet with name ${questionSet.name} already exists`,
      )
    }
    this.nameToQuestionSet[questionSet.name] = questionSet
  }

  getQuestionSetByName(questionSetName: string): QuestionSet {
    if (!this.nameToQuestionSet[questionSetName]) {
      throw new Error(`QuestionSet with name ${questionSetName} not found`) // TODO: Create custom error
    }
    return this.nameToQuestionSet[questionSetName]
  }
}
