import { createContext, useState } from "react";
import type { RoomsUsageData } from "../types/Types";

interface PdfContextType {
	roomsData: RoomsUsageData[]; // Data to be used in the PDF generation
	setRoomsData: (data: RoomsUsageData[]) => void; // Function to update the roomsData state
	date: Date; // Date to be used in the PDF generation
	setDate: (date: Date) => void; // Function to update the date state
}

// Context for managing PDF-related data
export const PdfContext = createContext<PdfContextType | undefined>(undefined);

/**
 * Provider for managing PDF-related data.
 *
 * It provides two states: roomsData (the data to be used in the PDF generation) and date (the date to be used in the PDF generation).
 * It also provides two functions to update the corresponding states: setRoomsData and setDate.
 *
 * @param children The children components to be wrapped by the provider.
 * @returns The PdfContext provider component.
 */
export const PdfProvider = ({ children }: { children: React.ReactNode }) => {
	const [roomsData, setRoomsData] = useState<RoomsUsageData[]>([]); // State to hold the data for PDF generation
	const [date, setDate] = useState<Date>(new Date()); // State to hold the date for PDF generation

	// Render the provider component
	return (
		<PdfContext.Provider
			value={{
				roomsData,
				setRoomsData,
				date,
				setDate,
			}}
		>
			{children}
		</PdfContext.Provider>
	);
};
