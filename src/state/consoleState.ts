import { create } from 'zustand'
import { ConsoleFilters } from '../components/scene/Console'

type ConsoleState = {
  commands: { text: string, type: ConsoleFilters, color: string }[]
  clear: () => void
}

export const Debug = {
  log(text: string, type = 'default' as ConsoleFilters, color = '#ddd') {
    const commands = useConsoleState.getState().commands;
    commands.push({ text, type, color });
    useConsoleState.setState({ commands });
  }
}

export const useConsoleState = create<ConsoleState>((set, _) => ({
  commands: [],
  clear: () => set({ commands: [] })
}))