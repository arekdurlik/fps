import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { Debug } from './state/debugState.ts'

window.onerror = function(event, source, line) {
    Debug.error(`${event} [${source}:${line}]`);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
)
