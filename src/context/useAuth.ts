import { useContext } from "react";
import { AuthContext } from "./AuthContext";

export const useAuth = () => {
	const context = useContext(AuthContext);
	// console.log("AuthContext:", context); // Debug
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
