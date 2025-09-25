import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { Card } from "react-bootstrap";
import { CHART_COLORS, type RoomsUsageData } from "../../types/Types";
import { addDays, startOfWeek } from "date-fns";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface UsageGroupedBarChartProps {
	selectedDate: Date; // selected date by the user
	roomsUsageData: RoomsUsageData[]; // Data to use for the chart
	type: "week" | "month"; // Type to render the chart differently
}

/**
 * Creates a grouped bar chart to show the usage of the rooms.
 *
 * Depending on the type parameter, the chart is rendered differently:
 * - "week": The chart shows the usage of the rooms for the last 7 days
 * - "month": The chart shows the usage of the rooms for the last 4 weeks.
 *
 * @param [selectedDate] - The selected date for the chart
 * @param [data] - The data to use for the chart
 * @returns The JSX element containing the doughnut chart
 */
const UsageGroupedBarChart = ({ selectedDate, roomsUsageData, type }: UsageGroupedBarChartProps) => {
	// Filters the data depending on which type is passed as parameter
	const filteredData = (() => {
		const startDate =
			type === "week"
				? addDays(selectedDate, -7)
				: addDays(startOfWeek(selectedDate, { weekStartsOn: 1 }), -21);
		const endDate =
			type === "week"
				? addDays(selectedDate, 1) // have to add 1 day to the end to include selectedDay in the filter
				: addDays(startOfWeek(selectedDate, { weekStartsOn: 1 }), 7);

		return roomsUsageData.filter(
			(entry) =>
				entry.start_timestamp.getTime() >= startDate.getTime() &&
				entry.end_timestamp.getTime() < endDate.getTime() &&
				entry.value === 1,
		);
	})();

	// Find the room names
	const rooms = [...new Set(filteredData.map((entry) => entry.room_name).filter(Boolean))] as string[];

	let barLabels: any[] = [];
	let barDatasets: any[] = [];
	let xTitle: string = "";

	// If weekly grouped chart find the data for the last 7 days
	if (type === "week") {
		const days = Array.from({ length: 7 }, (_, i) => addDays(selectedDate, -6 + i)); // Array of the last 7 days

		// Custom label for each day
		const labels: string[] = days.map(
			(day) =>
				day.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" }) +
				" " +
				day.toLocaleDateString("en-GB", { weekday: "short" }),
		);

		// Finds the minutes spent in each room for the last 7 days
		const datasets = rooms.map((room, index) => {
			const data = days.map((day) => {
				const dayStart = new Date(day.setHours(0, 0, 0, 0));
				const dayEnd = new Date(day.setHours(23, 59, 59, 999));

				// Total minutes of the current day
				const totalMins = filteredData
					.filter((entry) => {
						return (
							entry.room_name === room &&
							entry.start_timestamp.getTime() >= dayStart.getTime() &&
							entry.end_timestamp.getTime() < dayEnd.getTime()
						);
					})
					.reduce((sum, entry) => {
						return sum + (entry.end_timestamp.getTime() - entry.start_timestamp.getTime()) / 1000;
					}, 0);
				return totalMins;
			});
			return {
				label: room,
				data,
				backgroundColor: CHART_COLORS.backgroundColor[index % CHART_COLORS.backgroundColor.length],
				borderColor: CHART_COLORS.borderColor[index % CHART_COLORS.borderColor.length],
				borderWidth: 2,
			};
		});

		// Parameters for the chart
		barLabels = labels;
		barDatasets = datasets;
		xTitle = "Days";
	} else if (type === "month") {
		// If monthly grouped chart find the data for the last 4 weeks

		// Finds the last 4 weeks
		const curWeekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
		const weeks = Array.from({ length: 4 }, (_, i) => addDays(curWeekStart, -21 + i * 7));

		// Custom label for each week
		const labels: string[] = weeks.map((weekStart) => {
			const weekEnd = addDays(weekStart, 6);

			const start = weekStart.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" });
			const end = weekEnd.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" });

			return `${start} - ${end}`;
		});

		// Finds the minutes spent in each room for each week
		const datasets = rooms.map((room, index) => {
			const data = weeks.map((weekStart) => {
				const weekEnd = addDays(weekStart, 6);
				const weekStartDate = new Date(weekStart.setHours(0, 0, 0, 0));
				const weekEndDate = new Date(weekEnd.setHours(23, 59, 59, 999));

				// Minutes in the week
				const totalMins = filteredData
					.filter(
						(entry) =>
							entry.room_name === room &&
							entry.start_timestamp.getTime() >= weekStartDate.getTime() &&
							entry.end_timestamp.getTime() < weekEndDate.getTime(),
					)
					.reduce(
						(sum, entry) =>
							sum + (entry.end_timestamp.getTime() - entry.start_timestamp.getTime()) / 1000,
						0,
					);
				return totalMins;
			});
			return {
				label: room,
				data,
				backgroundColor: CHART_COLORS.backgroundColor[index % CHART_COLORS.backgroundColor.length],
				borderColor: CHART_COLORS.borderColor[index % CHART_COLORS.borderColor.length],
				borderWidth: 2,
			};
		});

		// Parameters for the chart
		barLabels = labels;
		barDatasets = datasets;
		xTitle = "Weeks";
	}

	const chartData = {
		labels: barLabels,
		datasets: barDatasets,
	};

	// Creates and returns the chart
	return (
		<Card className="chart-card mb-5">
			<Card.Header as="h5">Rooms Usage</Card.Header>
			<Card.Body style={{ height: "25rem" }}>
				<Bar
					data={chartData}
					options={{
						scales: {
							x: {
								title: {
									display: true,
									text: xTitle,
								},
								ticks: {
									// Custom ticks for the x ax based on type
									callback:
										type === "week"
											? (value: any) => {
													const [day, name] =
														chartData.labels[Number(value)].split(" ");
													return [`${day}`, `${name}`];
											  }
											: (value: any) => `${chartData.labels[Number(value)]}`,
								},
							},
							y: {
								beginAtZero: true,
								title: {
									display: true,
									text: type === "week" ? "Minutes" : "Hours",
								},
								ticks: {
									stepSize: type === "week" ? 10 * 60 : 60 * 60, //every 10 minutes for week, every hour for month
									callback: (value) => {
										value = Math.round(Number(value) / 60); // convert to minutes

										// Convert to hours if its more than 60 minutes
										if (value >= 60) {
											const hours = Math.floor(value / 60);
											return `${hours} h `;
										}

										return `${value} min`;
									},
								},
							},
						},
						plugins: {
							legend: {
								display: true,
								position: "bottom",
							},
							tooltip: {
								callbacks: {
									// When hovering on a bar shows the hours+minutes spent
									title: (context) => ` ${context[0].dataset.label}`,
									label: (context) => {
										const value = Math.round(context.parsed.y / 60);
										if (value > 60) {
											const hours = Math.floor(value / 60);
											const minutes = Math.round(value % 60);
											return `${hours} h ${minutes} min`;
										}
										return `${value} minuti`;
									},
								},
							},
						},
					}}
				/>
			</Card.Body>
		</Card>
	);
};

export default UsageGroupedBarChart;
