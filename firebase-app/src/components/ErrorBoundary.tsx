import { Component, ReactNode } from 'react'

interface Props {
  section: string
  children: ReactNode
}

interface State {
  hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-950 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-3xl mb-4">
            ⚠️
          </div>
          <h2 className="font-heading font-semibold text-xl text-gray-900 dark:text-white mb-2">
            Algo salió mal
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
            Ocurrió un error inesperado en {this.props.section}.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-primary text-gray-900 font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Recargar página
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
