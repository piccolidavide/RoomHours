export type RoomsData = {
	Timestamp: string;
	[roomName: string]: string | number;
};

export type Period = {
	user_id: string;
	room_id: string | null;
	start_timestamp: string;
	end_timestamp: string;
	value: number;
};

export type RoomsUsageData = {
	user_id: string;
	username: string;
	room_name: string | null;
	start_timestamp: Date;
	end_timestamp: Date;
	value: number;
};

export const CHART_COLORS = {
	backgroundColor: [
		"rgba(255, 99, 132, 0.2)",
		"rgba(54, 162, 235, 0.2)",
		"rgba(255, 206, 86, 0.2)",
		"rgba(75, 192, 143, 0.2)",
		"rgba(153, 102, 255, 0.2)",
		"rgba(255, 159, 64, 0.2)",
	],
	borderColor: [
		"rgba(255, 99, 122, 1)",
		"rgba(54, 162, 235, 1)",
		"rgba(255, 206, 86, 1)",
		"rgba(75, 192, 143, 1)",
		"rgba(153, 102, 255, 1)",
		"rgba(255, 159, 64, 1)",
	],
};

export type pdfTableData = {
	/**
	 * Array of object containing the total minutes spent in each room in each day of the last 7 days
	 */
	weekReport: { day: string; data: Record<string, string> }[];

	/**
	 * Array of object containing the total minutes spent in each room in each week of the last 4 weeks
	 */
	monthReport: { week: string; data: Record<string, string> }[];

	/**
	 * Object containing the total minutes spent in each room in the last 7 days
	 */
	"Last 7 days": Record<string, string>;

	/**
	 * Object containing the total minutes spent in each room in the last 4 weeks
	 */
	"Last month": Record<string, string>;

	/**
	 * Object containing the total minutes spent in each room all time
	 */
	"All time": Record<string, string>;
};
