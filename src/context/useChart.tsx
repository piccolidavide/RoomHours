import { useContext } from "react";
import { ChartContext } from "./ChartContext";

export const useChart = () => {
	const context = useContext(ChartContext);

	if (!context) {
		throw new Error("useChart must be used within an ChartProvider");
	}
	return context;
};
