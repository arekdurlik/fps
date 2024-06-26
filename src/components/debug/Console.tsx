import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useKeyboardInput } from '../../hooks/useKeyboardInput'
import { toSentenceCase } from '../../helpers'
import { Filter, useDebugState } from '../../state/debugState'

export function Console() {
  const [active, setActive] = useState(false);
  const keyboard = useKeyboardInput(['`']);
  const { commands, filters, setFilter, clearCommands } = useDebugState();
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

  return active && <Container onClick={e => e.stopPropagation()}>
      <ClearButton onClick={clearCommands}>Clear</ClearButton>
      <Commands>
        {filteredAndReversedCommands.map((command, i) => <Command key={i} color={command.color} >{command.text}</Command>)}
      </Commands>
      <Filters>
        Filters:
        {Object.keys(filters).map(filter => (
          <FilterOption
            $active={filters[filter]}
            onClick={() => setFilter(filter as Filter, !filters[filter])}
          > 
            {toSentenceCase(filter)}
          </FilterOption>
        ))}
      </Filters>
    </Container>
}

const Button = styled.button`
  background-color: transparent;
  border: 1px outset;
  border-radius: 3px;
  padding: 4px 6px;
  color: #ddd;

  &:active {
    border: 1px inset;
  }
`

const ClearButton = styled(Button)`
position: absolute;
top: 0;
right: 0;
margin: 5px 28px;
`

const FilterOption = styled(Button)<{ $active: boolean }>`
  color: #888;

  &:active {
    border: 1px inset;
  }

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

overflow-y: scroll;
color-scheme: dark;
`

const Command = styled.span<{ color?: string, type?: Filter }>`
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
