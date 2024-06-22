import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useKeyboardInput } from '../../hooks/inputs/useKeyboardInput'
import { useConsoleState } from '../../state/consoleState'
import { toSentenceCase } from '../../helpers'

const initFilters = { error: true, playerEnterState: true, playerLeaveState: true, playerAnimation: true, gunAnimation: true }
export type ConsoleFilter = keyof typeof initFilters

export function Console() {
  const [active, setActive] = useState(false);
  const [filters, setFilters] = useState(initFilters)
  const keyboard = useKeyboardInput(['`']);
  const { commands } = useConsoleState();
  
  function setFilter(filter: string, value: boolean) {
    setFilters(filters => ({ ...filters, [filter]: value }))
  }

  useEffect(() => {
    if (commands.at(-1)?.type === 'error') {
      if (filters.error) {
        setActive(true);
      }
    }
  }, [commands.length]);

  useEffect(() => {
    if (keyboard.tilde) {
      setActive(!active);
    }
  }, [keyboard]);

  return active && <Container onClick={e => e.stopPropagation()}>
      <Commands>
        {commands
          .filter(command => filters[command.type] === true)
          .reverse().map((command, i) => <Command key={i} color={command.color} >{command.text}</Command>)}
      </Commands>
      <Filters>
        Filters:
        {Object.keys(filters).map(filter => <Button
            $active={filters[filter as keyof typeof filters]}
            onClick={() => setFilter(filter, !filters[filter as keyof typeof filters])}
          > 
          {toSentenceCase(filter)}
          </Button>
        )}
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

box-shadow: 0px 10px 10px #00000044;

* {
  font-family: 'Console';
  font-size: 11px;
}
filter: blur(0.000001px);
position: absolute;
width: 100%;

background-color: #4e4e4ecc;
color: #ddd;

z-index: 1;
flex-direction: column;
`

const Commands = styled.div`
display: flex;
height: 200px;
flex-direction: column-reverse;
overflow: hidden;
border-bottom: 1px outset;
padding: 10px;
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
