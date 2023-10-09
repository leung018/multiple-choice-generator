export function getPermutations<E>(
  input: ReadonlyArray<E>,
): Set<ReadonlyArray<E>> {
  if (input.length === 0) return new Set()
  if (input.length === 1) return new Set([input])

  const resultSet = new Set<ReadonlyArray<E>>()

  for (let i = 0; i < input.length; i++) {
    const element = input[i]
    const rest = input.slice(0, i).concat(input.slice(i + 1))
    const permutationsOfRest = getPermutations(rest)
    permutationsOfRest.forEach((permutation) => {
      resultSet.add([element].concat(permutation))
    })
  }

  return resultSet
}
