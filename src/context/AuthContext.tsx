import { createContext, useEffect, useState } from "react";
import { getCurrentUser, onAuthStateChange } from "../services/supabase";

interface AuthContextType {
	user: any;
	setUser: (user: any) => void;
	loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
	undefined,
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [user, setUser] = useState<any>(null);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		let mounted = true;

		const initializeAuth = async () => {
			try {
				const currentUser = await getCurrentUser();
				if (mounted) {
					setUser(currentUser);
					setLoading(false);
				}
			} catch (error) {
				console.error("Error initializing authentication:", error);
				if (mounted) {
					setUser(null);
					setLoading(false);
				}
			}
		};

		initializeAuth();

		const unsubscribe = onAuthStateChange((newUser) => {
			if (mounted) {
				setUser(newUser);
				setLoading(false);
			}
		});

		return () => {
			mounted = false;
			unsubscribe();
		};
	}, []);

	return (
		<AuthContext.Provider value={{ user, setUser, loading }}>
			{children}
		</AuthContext.Provider>
	);
};
