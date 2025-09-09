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
		const initializeAuth = async () => {
			try {
				const currentUser = await getCurrentUser();
				setUser(currentUser);
				setLoading(false);
			} catch (error) {
				console.error("Error initializing authentication:", error);
				setUser(null);
				setLoading(false);
			}
		};

		initializeAuth();

		const unsubscribe = onAuthStateChange((newUser) => {
			setUser(newUser);
			setLoading(false);
		});

		return () => unsubscribe();
	}, []);

	return (
		<AuthContext.Provider value={{ user, setUser, loading }}>
			{children}
		</AuthContext.Provider>
	);
};
