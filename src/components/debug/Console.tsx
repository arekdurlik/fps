import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useKeyboardInput } from '../../hooks/useKeyboardInput'
import { toSentenceCase } from '../../helpers'
import { useDebugState } from '../../state/debugState'

const initFilters = { 
  error: true, 
  playerEnterState: false, 
  playerLeaveState: false, 
  playerAnimation: false, 
  gunAnimation: false 
}

export type ConsoleFilter = keyof typeof initFilters

export function Console() {
  const [active, setActive] = useState(false);
  const [filters, setFilters] = useState(initFilters)
  const keyboard = useKeyboardInput(['`']);
  const { commands } = useDebugState();
  const filteredAndReversedCommands = commands.filter(command => filters[command.type] === true).reverse();

  // open console if last message is an error and error filter is on
  useEffect(() => {
    if (commands.at(-1)?.type === 'error') {
      if (filters.error) {
        setActive(true);
      }
    }
  }, [commands.length]);

  // open console
  useEffect(() => {
    if (keyboard.tilde) {
      setActive(!active);
    }
  }, [keyboard]);

  function setFilter(filter: string, value: boolean) {
    setFilters(filters => ({ ...filters, [filter]: value }));
  }

  return active && <Container onClick={e => e.stopPropagation()}>
      <Commands>
        {filteredAndReversedCommands.map((command, i) => <Command key={i} color={command.color} >{command.text}</Command>)}
      </Commands>
      <Filters>
        Filters:
        {Object.keys(filters).map(filter => (
          <Button
            $active={filters[filter as ConsoleFilter]}
            onClick={() => setFilter(filter, !filters[filter as ConsoleFilter])}
          > 
            {toSentenceCase(filter)}
          </Button>
        ))}
      </Filters>
    </Container>
}

const Button = styled.button<{ $active: boolean }>`
  background-color: transparent;
  border: 1px outset;
  border-radius: 3px;
  color: #888;
  padding: 4px 6px;
  ${({ $active }) => $active && `
    color: #ddd;
    border: 1px inset;
  `}
`

const Container = styled.div`

* {
  font-family: 'Console';
  font-size: 11px;
}
position: absolute;
width: 500px;

background-color: #4e4e4ecc;
color: #ddd;

z-index: 1;
flex-direction: column;
`

const Commands = styled.div`
display: flex;
height: 200px;
flex-direction: column-reverse;
border-bottom: 1px outset;
padding: 10px;

overflow-y: auto;
color-scheme: dark;
`

const Command = styled.span<{ color?: string, type?: ConsoleFilter }>`
  
  padding-top: 5px;
  font-size: 11px;
  color: #ddd;
  ${({ color }) => color && `color: ${color};`}

  ${({ type }) => {
    switch(type) {
    case 'playerEnterState':
      return 'color: #82d682';
    case 'playerLeaveState':
      return 'color: #d88181';
    case 'gunAnimation':
      return 'color: #d8da7e';
    case 'playerAnimation':
      return 'color: #9bbbff';
  }}}

`

const Filters = styled.div`
display: flex;
align-items: center;
padding: 5px 10px;
gap: 10px;
`
