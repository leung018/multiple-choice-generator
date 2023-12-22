import { QuestionSet } from '../model/question_set'
import { CustomBaseError } from '../utils/err'
import { LocalStorageObjectOperator } from '../utils/local_storage'

export interface QuestionSetRepo {
  /**
   * @throws {AddQuestionSetError}
   */
  addQuestionSet(questionSet: QuestionSet): void

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

type AddQuestionSetErrorCode = 'DUPLICATE_QUESTION_SET_NAME'
export class AddQuestionSetError extends CustomBaseError<AddQuestionSetErrorCode> {
  constructor(code: AddQuestionSetErrorCode, message?: string) {
    super(code, message)
  }
}

type GetQuestionSetErrorCode = 'QUESTION_SET_NOT_FOUND'
export class GetQuestionSetError extends CustomBaseError<GetQuestionSetErrorCode> {
  constructor(code: GetQuestionSetErrorCode, message?: string) {
    super(code, message)
  }
}

export class QuestionSetRepoFactory {
  static createTestInstance(): QuestionSetRepo {
    return LocalStorageQuestionSetRepo.createTestInstance()
  }

  static create(): QuestionSetRepo {
    return LocalStorageQuestionSetRepo.create()
  }
}

export class LocalStorageQuestionSetRepo implements QuestionSetRepo {
  static readonly STORAGE_PATH = 'questionSets'

  static createTestInstance(): LocalStorageQuestionSetRepo {
    return new LocalStorageQuestionSetRepo(
      LocalStorageObjectOperator.createTestInstance(this.STORAGE_PATH),
    )
  }

  static create(): LocalStorageQuestionSetRepo {
    return new LocalStorageQuestionSetRepo(
      LocalStorageObjectOperator.create(this.STORAGE_PATH),
    )
  }

  private constructor(
    localStorageObjectOperator: LocalStorageObjectOperator<QuestionSet>,
  ) {
    this.localStorageOperator = localStorageObjectOperator
  }

  private localStorageOperator: LocalStorageObjectOperator<QuestionSet>

  addQuestionSet(questionSet: QuestionSet): void {
    if (
      this.localStorageOperator.findOneByFilter(
        (q) => q.name === questionSet.name,
      )
    ) {
      throw new AddQuestionSetError(
        'DUPLICATE_QUESTION_SET_NAME',
        `QuestionSet with name ${questionSet.name} already exists`,
      )
    }
    this.localStorageOperator.add(questionSet)
  }

  getQuestionSetByName(questionSetName: string): QuestionSet {
    const questionSet = this.localStorageOperator.findOneByFilter(
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
    const questionSet = this.localStorageOperator.findOneByFilter(
      (questionSet) => questionSet.id === questionSetId,
    )
    if (!questionSet) {
      throw new GetQuestionSetError(
        'QUESTION_SET_NOT_FOUND',
        `QuestionSet with id ${questionSetId} not found`,
      )
    }
    return questionSet
  }

  getQuestionSets(): readonly QuestionSet[] {
    return this.localStorageOperator.getAll()
  }
}
