import { create } from 'zustand'
import { ConsoleFilter } from '../components/debug/Console'

type ConsoleState = {
  commands: { text: string, type: ConsoleFilter, color: string }[]
}

export const Debug = {
  log(text: string, type = 'default' as ConsoleFilter, color = '#ddd') {
    const commands = useConsoleState.getState().commands;
    commands.push({ text, type, color });
    useConsoleState.setState({ commands });
  },
  error(text: string) {
    const commands = useConsoleState.getState().commands;
    commands.push({ text, type: 'error', color: '#c00' });
    useConsoleState.setState({ commands });
  },
  clear: () => useConsoleState.setState({ commands: [] })
}

export const useConsoleState = create<ConsoleState>(() => ({
  commands: []
}))