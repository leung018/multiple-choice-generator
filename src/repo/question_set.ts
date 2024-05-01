import { QuestionSet } from '../model/question_set'
import { CustomBaseError } from '../utils/err'
import { LocalStorageOperator } from '../utils/local_storage'

export interface QuestionSetRepo {
  /**
   * @throws {UpsertQuestionSetError}
   */
  upsertQuestionSet(questionSet: QuestionSet): void

  /**
   * @throws {GetQuestionSetError}
   */
  getQuestionSetByName(questionSetName: string): QuestionSet

  /**
   * @throws {GetQuestionSetError}
   */
  getQuestionSetById(questionSetId: string): QuestionSet

  /**
   * Sorted by order that they are added from oldest to newest
   */
  getQuestionSets(): ReadonlyArray<QuestionSet>
}

type UpsertQuestionSetErrorCode = 'DUPLICATE_QUESTION_SET_NAME'
export class UpsertQuestionSetError extends CustomBaseError<UpsertQuestionSetErrorCode> {
  constructor(code: UpsertQuestionSetErrorCode, message?: string) {
    super(code, message)
  }
}

type GetQuestionSetErrorCode = 'QUESTION_SET_NOT_FOUND'
export class GetQuestionSetError extends CustomBaseError<GetQuestionSetErrorCode> {
  constructor(code: GetQuestionSetErrorCode, message?: string) {
    super(code, message)
  }
}

type QuestionSetMap = {
  [id: string]: QuestionSet
}

export class LocalStorageQuestionSetRepo implements QuestionSetRepo {
  static createNull(): LocalStorageQuestionSetRepo {
    return new LocalStorageQuestionSetRepo(
      LocalStorageOperator.createNull('IN_MEMORY'),
    )
  }

  static createOriginalQuestionSetRepo(): LocalStorageQuestionSetRepo {
    return new LocalStorageQuestionSetRepo(
      LocalStorageOperator.create('ORIGINAL_QUESTION_SET'),
    )
  }

  static createLastSubmittedQuestionSetRepo(): LocalStorageQuestionSetRepo {
    return new LocalStorageQuestionSetRepo(
      LocalStorageOperator.create('LAST_SUBMITTED_QUESTION_SET'),
    )
  }

  private constructor(
    localStorageOperator: LocalStorageOperator<QuestionSetMap>,
  ) {
    this.localStorageOperator = localStorageOperator
  }

  private localStorageOperator: LocalStorageOperator<QuestionSetMap>

  private getQuestionSetMap(): QuestionSetMap {
    return this.localStorageOperator.getItem() ?? {}
  }

  private setQuestionSetMap(questionSetMap: QuestionSetMap): void {
    this.localStorageOperator.setItem(questionSetMap)
  }

  upsertQuestionSet(questionSet: QuestionSet): void {
    const questionSetMap = this.getQuestionSetMap()

    if (
      this.findOneQuestionSetByFilter(
        (q) => q.name === questionSet.name && q.id !== questionSet.id,
      )
    ) {
      throw new UpsertQuestionSetError(
        'DUPLICATE_QUESTION_SET_NAME',
        `QuestionSet with name ${questionSet.name} already exists`,
      )
    }

    questionSetMap[questionSet.id] = questionSet
    this.setQuestionSetMap(questionSetMap)
  }

  private findOneQuestionSetByFilter(
    filter: (questionSet: QuestionSet) => boolean,
  ): QuestionSet | null {
    const questionSets = this.getQuestionSets()
    return questionSets.find(filter) ?? null
  }

  getQuestionSetByName(questionSetName: string): QuestionSet {
    const questionSet = this.findOneQuestionSetByFilter(
      (questionSet) => questionSet.name === questionSetName,
    )
    if (!questionSet) {
      throw new GetQuestionSetError(
        'QUESTION_SET_NOT_FOUND',
        `QuestionSet with name ${questionSetName} not found`,
      )
    }
    return questionSet
  }

  getQuestionSetById(questionSetId: string): QuestionSet {
    const questionSetMap = this.getQuestionSetMap()
    if (!questionSetMap[questionSetId]) {
      throw new GetQuestionSetError(
        'QUESTION_SET_NOT_FOUND',
        `QuestionSet with id ${questionSetId} not found`,
      )
    }
    return questionSetMap[questionSetId]
  }

  getQuestionSets(): readonly QuestionSet[] {
    const questionSetMap = this.getQuestionSetMap()
    const questionSets: QuestionSet[] = Object.values(questionSetMap)
    return questionSets
  }
}
