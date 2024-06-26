import { create } from 'zustand'
import { ConsoleFilter } from '../components/debug/Console'

type DebugState = {
  commands: { text: string, type: ConsoleFilter, color: string }[]
}

export const Debug = {
  log(text: string, type = 'default' as ConsoleFilter, color = '#ddd') {
    const commands = useDebugState.getState().commands;
    commands.push({ text, type, color });
    useDebugState.setState({ commands });
  },
  error(text: string) {
    const commands = useDebugState.getState().commands;
    commands.push({ text, type: 'error', color: '#c00' });
    useDebugState.setState({ commands });
  },
  clear: () => useDebugState.setState({ commands: [] })
}

export const useDebugState = create<DebugState>(() => ({
  commands: []
}))