import { create } from 'zustand'

type ModelStore = {
  model?: string
  setModel: (model?: string) => void
}

export const useModels = create<ModelStore>()((set) => ({
  model: undefined,
  setModel: (model?: string) => set(() => ({ model })),
}))
