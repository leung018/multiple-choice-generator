export function getPermutations<E>(
  input: ReadonlyArray<E>,
): Set<ReadonlyArray<E>> {
  // TODO: Don't hardcode

  if (input.length === 2)
    return new Set([
      [input[1], input[0]],
      [input[0], input[1]],
    ])
  else if (input.length === 3)
    return new Set([
      [input[0], input[1], input[2]],
      [input[0], input[2], input[1]],
      [input[1], input[2], input[0]],
      [input[1], input[0], input[2]],
      [input[2], input[0], input[1]],
      [input[2], input[1], input[0]],
    ])
  else throw new Error('Not implemented')
}
