import { QuestionSet } from '../model/question_set'
import { CustomBaseError } from '../utils/err'
import {
  FakeLocalStorageWrapper,
  LocalStorageWrapper,
  LocalStorageWrapperImpl,
} from '../utils/local_storage'

/**
 * For React components that utilize this interface, ensure that calls to this interface are wrapped in useEffect.
 * This precaution helps prevent errors such as `ReferenceError: localStorage is not defined`, which can occur if the localStorage version of this repository is accessed.
 */
export interface QuestionSetRepo {
  /**
   * @throws {UpsertQuestionSetError}
   */
  upsertQuestionSet(questionSet: QuestionSet): void

  deleteQuestionSet(questionSetId: string): void

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
  private storagePath: string

  static createNull(): LocalStorageQuestionSetRepo {
    return new LocalStorageQuestionSetRepo(
      new FakeLocalStorageWrapper(),
      'IN_MEMORY',
    )
  }

  static createOriginalQuestionSetRepo(): LocalStorageQuestionSetRepo {
    return new LocalStorageQuestionSetRepo(
      new LocalStorageWrapperImpl(),
      'ORIGINAL_QUESTION_SET',
    )
  }

  static createLastSubmittedQuestionSetRepo(): LocalStorageQuestionSetRepo {
    return new LocalStorageQuestionSetRepo(
      new LocalStorageWrapperImpl(),
      'LAST_SUBMITTED_QUESTION_SET',
    )
  }

  private constructor(
    localStorageWrapper: LocalStorageWrapper,
    storagePath: string,
  ) {
    this.localStorageWrapper = localStorageWrapper
    this.storagePath = storagePath
  }

  private localStorageWrapper: LocalStorageWrapper

  private getQuestionSetMap(): QuestionSetMap {
    const itemMap = JSON.parse(
      this.localStorageWrapper.getItem(this.storagePath) ?? '{}',
    )
    for (const questionSetId in itemMap) {
      itemMap[questionSetId] = QuestionSet.deserialize(itemMap[questionSetId])
    }
    return itemMap
  }

  private setQuestionSetMap(questionSetMap: QuestionSetMap): void {
    const newMap: { [id: string]: string } = {}
    for (const questionSetId in questionSetMap) {
      newMap[questionSetId] = QuestionSet.serialize(
        questionSetMap[questionSetId],
      )
    }
    this.localStorageWrapper.setItem(this.storagePath, JSON.stringify(newMap))
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

  deleteQuestionSet(questionSetId: string): void {
    const questionSetMap = this.getQuestionSetMap()
    delete questionSetMap[questionSetId]
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
