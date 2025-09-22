// ErrorBoundary.tsx
import { Component, type ReactNode } from "react";

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
	state = { hasError: false };

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	render() {
		if (this.state.hasError) {
			return <h1>Qualcosa è andato storto. Riprova più tardi.</h1>;
		}
		return this.props.children;
	}
}

export default ErrorBoundary;
