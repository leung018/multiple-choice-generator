import { getSignificantSwappedMc } from './swap'

describe('getSignificantSwappedMc', () => {
  it('compute swaps for two choices', () => {
    const mc: MultipleChoice<'a' | 'b'> = {
      choices: {
        a: {
          description: 'Apple',
        },
        b: {
          description: 'Banana',
        },
      },
      answer: 'a',
    }
    expect(getSignificantSwappedMc(mc)).toEqual(
      new Set([
        {
          choices: {
            a: {
              description: 'Banana',
            },
            b: {
              description: 'Apple',
            },
          },
          answer: 'b',
        },
      ]),
    )
  })
})
