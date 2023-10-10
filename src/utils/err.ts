interface CustomBaseErrorOptions extends ErrorOptions {
  cause: {
    code: string
  }
}

export abstract class CustomBaseError extends Error {
  readonly cause!: CustomBaseErrorOptions['cause']

  constructor(code: string, message?: string) {
    super(message, { cause: { code } })
  }
}
