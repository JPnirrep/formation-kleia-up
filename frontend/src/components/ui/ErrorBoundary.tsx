import { Component, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };
  private resetCount = 0;
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  private handleReset = () => {
    if (this.resetCount >= 3) return;
    this.resetCount++;
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8">
          <h1 className="text-4xl font-heading text-kleia-violet">Oups !</h1>
          <p className="text-kleia-gray">Une erreur inattendue s'est produite.</p>
          {this.state.error && (
            <pre className="text-sm text-kleia-gray/70 bg-kleia-dark/5 p-4 rounded-kleia max-w-lg overflow-auto">
              {this.state.error.message}
            </pre>
          )}
          <div className="flex gap-4">
            <button onClick={this.handleReset}
              className="px-4 py-2 bg-kleia-violet text-white rounded-kleia hover:opacity-90">
              Réessayer
            </button>
            <Link to="/" className="px-4 py-2 border border-kleia-gold text-kleia-gold rounded-kleia hover:bg-kleia-gold/10">
              Retour à l'accueil
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
