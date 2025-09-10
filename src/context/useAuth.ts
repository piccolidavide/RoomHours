import { useContext } from "react";
import { AuthContext } from "./AuthContext";

export const useAuth = () => {
	const context = useContext(AuthContext);
	console.log("AuthContext:", context); // Debug
	if (!context) {
		console.error(
			"useAuth error: Context is undefined. Check if component is within AuthProvider.",
		);
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
