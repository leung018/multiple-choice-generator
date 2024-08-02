import { useEffect, useState } from 'react'
import LoadingSpinner from './loading'

function useFetchData<D>(fetchAction: () => D) {
  const [isLoading, setLoading] = useState(true)
  const [data, setData] = useState<D>()

  useEffect(() => {
    setData(fetchAction())
    setLoading(false)
  }, [fetchAction])

  return { data, isLoading }
}

export function DataLoader<D>({
  fetchAction,
  render,
}: {
  fetchAction: () => D
  render: (data: D) => React.ReactElement
}) {
  const { data, isLoading } = useFetchData(fetchAction)

  if (isLoading) {
    return <LoadingSpinner />
  }

  return render(data as D)
}
