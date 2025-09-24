import { useContext } from "react";
import { AuthContext } from "./AuthContext";

/**
 * Custom hook to access the authentication context.
 *
 * @returns The authentication context
 */
export const useAuth = () => {
	const context = useContext(AuthContext); // Get the context value

	// Throw an error if the context is undefined
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}

	return context;
};
