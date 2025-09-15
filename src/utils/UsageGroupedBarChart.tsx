import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { Card } from "react-bootstrap";
import type { RoomsUsageData } from "../types/Types";
import { addDays, startOfWeek } from "date-fns";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface UsageGroupedBarChartProps {
	selectedDate: Date;
	roomsUsageData: RoomsUsageData[];
	colors: { backgroundColor: string[]; borderColor: string[] };
	type: "week" | "month";
}

const UsageGroupedBarChart = ({ selectedDate, roomsUsageData, colors, type }: UsageGroupedBarChartProps) => {
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

	const rooms = [...new Set(filteredData.map((entry) => entry.room_name).filter(Boolean))] as string[];

	let barLabels: any[] = [];
	let barDatasets: any[] = [];
	let xTitle: string = "";

	if (type === "week") {
		const days = Array.from({ length: 7 }, (_, i) => addDays(selectedDate, -6 + i));
		const labels: string[] = days.map(
			(day) =>
				day.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" }) +
				" " +
				day.toLocaleDateString("en-GB", { weekday: "short" }),
		);

		const datasets = rooms.map((room, index) => {
			const data = days.map((day) => {
				const dayStart = new Date(day.setHours(0, 0, 0, 0));
				const dayEnd = new Date(day.setHours(23, 59, 59, 999));

				const totalMins = filteredData
					.filter((entry) => {
						return (
							entry.room_name === room &&
							entry.start_timestamp.getTime() >= dayStart.getTime() &&
							entry.end_timestamp.getTime() < dayEnd.getTime()
						);
					})
					.reduce((sum, entry) => {
						// console.log("entry", entry);
						return sum + (entry.end_timestamp.getTime() - entry.start_timestamp.getTime()) / 1000;
					}, 0);
				return totalMins;
			});
			return {
				label: room,
				data,
				backgroundColor: colors.backgroundColor[index % colors.backgroundColor.length],
				borderColor: colors.borderColor[index % colors.borderColor.length],
				borderWidth: 2,
			};
		});

		barLabels = labels;
		barDatasets = datasets;
		xTitle = "Days";
	} else if (type === "month") {
		const curWeekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
		const weeks = Array.from({ length: 4 }, (_, i) => addDays(curWeekStart, -21 + i * 7));
		const labels: string[] = weeks.map((weekStart) => {
			const weekEnd = addDays(weekStart, 6);

			const start = weekStart.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" });
			const end = weekEnd.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" });

			return `${start} - ${end}`;
		});

		const datasets = rooms.map((room, index) => {
			const data = weeks.map((weekStart) => {
				const weekEnd = addDays(weekStart, 6);
				const weekStartDate = new Date(weekStart.setHours(0, 0, 0, 0));
				const weekEndDate = new Date(weekEnd.setHours(23, 59, 59, 999));

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
				backgroundColor: colors.backgroundColor[index % colors.backgroundColor.length],
				borderColor: colors.borderColor[index % colors.borderColor.length],
				borderWidth: 2,
			};
		});

		barLabels = labels;
		barDatasets = datasets;
		xTitle = "Weeks";
	}

	const chartData = {
		labels: barLabels,
		datasets: barDatasets,
	};

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
									text: "Minutes",
								},
								ticks: {
									callback: (value) => `${Math.round(Number(value) / 60)} min`,
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
									title: (tooltipItems: any) => {
										return ` ${tooltipItems[0].dataset.label}`;
									},
									label: (context) => {
										// const label = context.label;
										const value = context.parsed.y;
										return `${Math.round(value / 60)} minuti`;
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
