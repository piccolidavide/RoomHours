import { useContext } from "react";
import { PdfContext } from "./PdfContext";

/**
 * Hook that returns the PdfContext value.
 * It throws an error if it is used outside of an PdfProvider.
 *
 * @returns The PdfContext value.
 */
export const usePdfContext = () => {
	const context = useContext(PdfContext); // Get the context value

	// Throw an error if the context is undefined
	if (!context) {
		throw new Error("useChart must be used within an ChartProvider");
	}

	return context;
};
