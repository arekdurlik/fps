import { Html, useProgress } from '@react-three/drei'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

export function LoadingScreen() {
  const { item } = useProgress();
  const [items, setItems] = useState<string[]>(['loading...']);

  useEffect(() => {
    setItems(items => [ ...items, item ]);
  }, [item]);
  return <Html center>
    <Text>{items.map((item, i) => <Line key={i}>{item}</Line>)}</Text>
  </Html>
}

const Text = styled.div`
box-sizing: border-box;
width: 100vw;
height: 100vh;
padding: 10px;
`
const Line = styled.span`
font-size: 24px;
display: block;
line-height: 32px;
` 