import { AppShell } from './components'
import { useAppState } from './state'
import { screenMap } from './screens'

function App() {
  const { state } = useAppState()
  return <AppShell>{screenMap[state.page]}</AppShell>
}

export default App
