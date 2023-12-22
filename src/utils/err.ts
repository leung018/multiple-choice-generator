interface CustomBaseErrorOptions<ErrorCode> extends ErrorOptions {
  cause: {
    code: ErrorCode
  }
}

export abstract class CustomBaseError<
  ErrorCode extends string = string,
> extends Error {
  readonly cause!: CustomBaseErrorOptions<ErrorCode>['cause']

  constructor(code: ErrorCode, message?: string) {
    super(message, { cause: { code } })
  }
}
