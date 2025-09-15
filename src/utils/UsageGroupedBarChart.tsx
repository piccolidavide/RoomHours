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
				: addDays(startOfWeek(selectedDate, { weekStartsOn: 1 }), 0);

		return roomsUsageData.filter(
			(entry) =>
				entry.start_timestamp.getTime() >= startDate.getTime() &&
				entry.end_timestamp.getTime() < endDate.getTime() &&
				entry.value === 1,
		);
	})();

	if (type === "week") {
		const days = Array.from({ length: 7 }, (_, i) => addDays(selectedDate, -6 + i));
		const labels: string[] = days.map((day) =>
			day.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" }),
		);

		const rooms = [...new Set(filteredData.map((entry) => entry.room_name).filter(Boolean))] as string[];

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

		return (
			<Card className="chart-card">
				<Card.Header as="h5">Last week's Rooms Usage</Card.Header>
				<Card.Body>
					<Bar
						data={{
							labels,
							datasets,
						}}
						options={{
							scales: {
								x: {
									title: {
										display: true,
										text: "Days",
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
	}
};

export default UsageGroupedBarChart;
