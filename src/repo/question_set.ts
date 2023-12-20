import { QuestionSet } from '../model/question_set'
import { CustomBaseError } from '../utils/err'

export interface QuestionSetRepo {
  /**
   * @throws {QuestionSetCreateError}
   */
  addQuestionSet(questionSet: QuestionSet): void

  /**
   * @throws {QuestionSetGetError}
   */
  getQuestionSetByName(questionSetName: string): QuestionSet

  /**
   * @throws {QuestionSetGetError}
   */
  getQuestionSetById(questionSetId: string): QuestionSet

  getQuestionSets(): ReadonlyArray<QuestionSet>
}

type QuestionSetCreateErrorCode = 'DUPLICATE_QUESTION_SET_NAME'
export class QuestionSetCreateError extends CustomBaseError {
  constructor(code: QuestionSetCreateErrorCode, message?: string) {
    super(code, message)
  }
}

type QuestionSetGetErrorCode = 'QUESTION_SET_NOT_FOUND'
export class QuestionSetGetError extends CustomBaseError {
  constructor(code: QuestionSetGetErrorCode, message?: string) {
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

  addQuestionSet(questionSet: QuestionSet): void {
    if (this.nameToQuestionSet[questionSet.name]) {
      throw new QuestionSetCreateError(
        'DUPLICATE_QUESTION_SET_NAME',
        `QuestionSet with name ${questionSet.name} already exists`,
      )
    }
    this.nameToQuestionSet[questionSet.name] = questionSet
  }

  getQuestionSetByName(questionSetName: string): QuestionSet {
    if (!this.nameToQuestionSet[questionSetName]) {
      throw new QuestionSetGetError(
        'QUESTION_SET_NOT_FOUND',
        `QuestionSet with name ${questionSetName} not found`,
      )
    }
    return this.nameToQuestionSet[questionSetName]
  }

  getQuestionSetById(questionSetId: string): QuestionSet {
    const questionSet = Object.values(this.nameToQuestionSet).find(
      (questionSet) => questionSet.id === questionSetId,
    )
    if (!questionSet) {
      throw new QuestionSetGetError(
        'QUESTION_SET_NOT_FOUND',
        `QuestionSet with id ${questionSetId} not found`,
      )
    }
    return questionSet
  }

  getQuestionSets(): readonly QuestionSet[] {
    return Object.values(this.nameToQuestionSet)
  }
}
