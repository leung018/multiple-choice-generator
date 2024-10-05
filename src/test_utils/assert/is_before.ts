export function assertIsBefore(a: HTMLElement, b: HTMLElement) {
  expect(a.compareDocumentPosition(b)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
}
