import { create } from 'zustand'

type DebugState = {
  filters: Filters
  setFilter: (filter: Filter, value: boolean) => void
  commands: { text: string, type: Filter, color: string }[]
  clearCommands: () => void
};

type Filters = { [key: string]: boolean };
export type Filter = keyof typeof initialFilters;

const initialFilters = {
  error: true, 
  playerEnterState: false, 
  playerLeaveState: false, 
  playerAnimation: false, 
  gunAnimation: false 
};

export const Debug = {
  log(text: string, type = 'default' as Filter, color = '#ddd') {
    if (useDebugState.getState().filters[type] === false) return;

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
};

export const useDebugState = create<DebugState>((set, get) => ({
  filters: initialFilters,
  setFilter(filter, value) {
    const filters = { ...get().filters, [filter]: value };
    set({ filters });
  },
  commands: [],
  clearCommands: () => set({ commands: [ ]}),
}));