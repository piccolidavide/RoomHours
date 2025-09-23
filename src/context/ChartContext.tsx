import { createContext, useState, useCallback } from "react";
import type { RoomsUsageData } from "../types/Types";

interface ChartContextType {
	weekChart: string;
	monthChart: string;
	setChartImage: (type: "week" | "month", image: string) => void;
	roomsData: RoomsUsageData[];
	setRoomsData: (data: RoomsUsageData[]) => void;
	date: Date;
	setDate: (date: Date) => void;
}

export const ChartContext = createContext<ChartContextType | undefined>(undefined);

export const ChartProvider = ({ children }: { children: React.ReactNode }) => {
	const [weekChart, setWeekChart] = useState<string>("");
	const [monthChart, setMonthChart] = useState<string>("");
	const [roomsData, setRoomsData] = useState<RoomsUsageData[]>([]);
	const [date, setDate] = useState<Date>(new Date());
	const setChartImage = useCallback((type: "week" | "month", image: string) => {
		type === "week" ? setWeekChart(image) : setMonthChart(image);
	}, []);

	return (
		<ChartContext.Provider
			value={{
				weekChart,
				monthChart,
				setChartImage,
				roomsData,
				setRoomsData,
				date,
				setDate,
			}}
		>
			{children}
		</ChartContext.Provider>
	);
};
