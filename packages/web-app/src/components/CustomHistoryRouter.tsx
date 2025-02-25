import type { Action, History, Location } from 'history'
import type { ReactNode } from 'react'
import { useLayoutEffect, useState } from 'react'
import { Router } from 'react-router'

/**
 * This component creates a bridge between a custom history object and
 * React Router's low-level <Router>. It listens for location changes in the
 * provided history instance and updates the Router accordingly, allowing
 * React Router to stay in sync with external navigation or side-effects.
 */

interface CustomHistoryRouterProps {
  history: History
  children: ReactNode
}

export const CustomHistoryRouter = ({ history, children }: CustomHistoryRouterProps) => {
  const [routerState, setRouterState] = useState<{ action: Action; location: Location }>({
    action: history.action,
    location: history.location,
  })

  useLayoutEffect(() => {
    const unsubscribe = history.listen(({ action, location }) => {
      setRouterState({ action, location })
    })
    return unsubscribe
  }, [history])

  return (
    <Router location={routerState.location} navigationType={routerState.action} navigator={history}>
      {children}
    </Router>
  )
}
