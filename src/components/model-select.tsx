import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useModels } from '@/stores/model'
import { useTRPC } from '@/trpc/react'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'

interface ModelSelectorProps {
  disabled?: boolean
}

export const ModelSelector = ({ disabled }: ModelSelectorProps) => {
  const { model, setModel } = useModels()

  const trpc = useTRPC()

  const models = useQuery(trpc.models.getAll.queryOptions())

  const activeModel = useMemo(
    () => models.data?.find(({ id }) => id === model),
    [model, models.data],
  )

  useEffect(() => {
    if (models.data && !model) {
      setModel(models.data.filter(({ tier }) => tier === 'free')[0].id)
    }
  }, [models.data])

  if (!model) {
    return null
  }

  return (
    <Select
      value={model}
      onValueChange={(value) => setModel(value)}
      disabled={disabled}
    >
      <SelectTrigger
        className="h-7 rounded-md px-2 py-0 text-xs"
        aria-label="Select model"
      >
        <SelectValue>{activeModel?.name}</SelectValue>
      </SelectTrigger>
      <SelectContent align="end">
        {models.data?.map(({ id, name }) => (
          <SelectItem key={id} value={id}>
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
