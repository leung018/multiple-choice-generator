jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      prefetch: () => null,
      push: jest.fn(),
    }
  },
}))
