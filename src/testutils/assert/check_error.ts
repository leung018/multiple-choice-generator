import { expect } from '@jest/globals'
import type { MatcherFunction } from 'expect'
import { CustomBaseError } from '../../utils/err'

type Newable<T> = { new (...args: any[]): T }

const toThrowCustomError: MatcherFunction<
  [expectedErrorType: Newable<CustomBaseError>, expectedCode?: string]
> = function (received, expectedErrorType, expectedCode) {
  if (typeof received !== 'function') {
    throw new Error('This should be type function!')
  }
  const expectedConstructor = expectedErrorType.name

  let error: Error | undefined = undefined

  try {
    received()
  } catch (e) {
    if (e instanceof Error) {
      error = e
    }
  }

  if (error === undefined) {
    return {
      pass: false,
      message: () =>
        `Expected constructor: ${expectedConstructor}\n\nReceived function did not throw`,
    }
  }
  if (!(error instanceof expectedErrorType)) {
    return {
      pass: false,
      message: () => {
        const receivedConstructor = error?.constructor.name

        return `Expected constructor: ${expectedConstructor}\n\nReceived constructor: ${receivedConstructor}`
      },
    }
  }

  // TODO: check error code

  return {
    pass: true,
    message: () => 'Expected not to throw {}',
  }
}

expect.extend({ toThrowCustomError })

declare module 'expect' {
  interface Matchers<R> {
    toThrowCustomError(
      expectedErrorType: Newable<CustomBaseError>,
      expectedCode?: string,
    ): R
  }
}
