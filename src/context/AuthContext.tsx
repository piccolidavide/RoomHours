import { createContext, useEffect, useState } from "react";
import { getCurrentUser, onAuthStateChange } from "../services/supabase";

interface AuthContextType {
	user: any; // User object or null if not authenticated
	setUser: (user: any) => void; // Function to update the user state
	loading: boolean; // Loading state to indicate if the authentication status is being checked
}

// Create the AuthContext with default undefined value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provides an authentication context for the application.
 *
 * It initializes the authentication state and sets up a listener for changes to the user state.
 *
 * The authentication context includes the current user, a function to update the user, and a loading state to indicate if the authentication status is being checked.
 * The component will re-render the children whenever the authentication status changes.
 *
 * @param children The child components that will have access to the authentication context.
 * @returns The AuthContext provider component.
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [user, setUser] = useState<any>(null); // State to hold the current user
	const [loading, setLoading] = useState<boolean>(true); // State to indicate if the authentication status is being checked

	// Effect to initialize authentication and set up a listener for auth state changes
	useEffect(() => {
		const initializeAuth = async () => {
			try {
				const currentUser = await getCurrentUser(); // Fetch the current user from the authentication service
				setUser(currentUser);
				setLoading(false);
			} catch (error) {
				// If there is an error, set user to null and loading to false
				console.error("Error initializing authentication:", error);
				setUser(null);
				setLoading(false);
			}
		};

		initializeAuth();

		// Set up a listener for authentication state changes
		const unsubscribe = onAuthStateChange((newUser) => {
			setUser(newUser);
			setLoading(false);
		});

		return () => unsubscribe(); // Clean up the listener on component unmount
	}, []);

	// Render the provider component with the current user, setUser function, and loading state
	return <AuthContext.Provider value={{ user, setUser, loading }}>{children}</AuthContext.Provider>;
};
