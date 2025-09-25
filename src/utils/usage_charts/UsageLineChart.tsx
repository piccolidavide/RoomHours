import { Line } from "react-chartjs-2";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";
import { Card } from "react-bootstrap";
import { startOfHour, addHours, differenceInMinutes } from "date-fns";
import { CHART_COLORS, type RoomsUsageData } from "../../types/Types";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface UsageLineChartProps {
	selectedDate: Date; // The selected date for the chart
	data: RoomsUsageData[]; // Data to use for the chart
}

/**
 * Creates a line chart to show the usage of the rooms during the hours of the day.
 *
 * @param [selectedDate] - The selected date for the chart
 * @param [data] - The data to use for the chart
 * @returns The JSX element containing the doughnut chart
 */
const UsageLineChart = ({ selectedDate, data }: UsageLineChartProps) => {
	// Filter to get only the entries with presence in the rooms
	const filteredData: RoomsUsageData[] = data.filter((entry) => entry.value === 1);

	// Get the unique names of the rooms
	const rooms: string[] = [
		...(Array.from(new Set(filteredData.map((entry: any) => entry.room_name!))) as string[]),
	];

	// The hours of the day
	const labels = Array.from({ length: 24 }, (_, i) => i);

	// Creates a bucket for each hour, to store the time spent in each room in each hour
	const hourBuckets: { [hour: string]: { start: Date; end: Date } } = {};
	for (let i = 0; i < 24; i++) {
		const start = addHours(startOfHour(selectedDate), i); // adds i hours to the start of the 24 hour period

		hourBuckets[String(i)] = { start, end: addHours(start, 1) };
	}

	// Calculate the time passed in each room per hourBucket
	const roomData = rooms.map((room: string, index: number) => {
		const hourData = Array(24).fill(0);

		filteredData
			.filter((entry: any) => entry.room_name === room) // filter by room
			.forEach((entry: any) => {
				labels.forEach((hour, i) => {
					// for each hour of the day
					const { start, end } = hourBuckets[hour]; // get the start and end of the hour

					// Check if the entry overlaps with the hour
					const overlapStart = new Date(Math.max(start.getTime(), entry.start_timestamp.getTime()));
					const overlapEnd = new Date(Math.min(end.getTime(), entry.end_timestamp.getTime()));

					// If the entry overlaps with the hour, add the difference in minutes
					if (overlapStart < overlapEnd) {
						hourData[i] += differenceInMinutes(overlapEnd, overlapStart);
					}
				});
			});
		return {
			label: String(room),
			data: hourData,
			borderColor: CHART_COLORS.borderColor[index],
			backgroundColor: CHART_COLORS.backgroundColor[index],
			tension: 0.2,
			borderWidth: 2,
		};
	});

	// Creates and returns the line chart
	return (
		<Card className="chart-card">
			<Card.Header as="h5">Rooms usage timeline</Card.Header>
			<Card.Body>
				{roomData.length > 0 ? ( // Render the chart only if there is data
					<Line
						data={{
							labels,
							datasets: roomData,
						}}
						options={{
							responsive: true,
							maintainAspectRatio: false,
							plugins: {
								legend: { position: "bottom" as const },
								tooltip: {
									callbacks: {
										// When hoverin on a point show the room name and the minutes
										title: (context) => `${context[0].label}:00`,
										label: (context) => {
											const value = context.parsed.y;
											return `${context.dataset.label}: ${Math.round(value)} min`;
										},
									},
								},
							},
							scales: {
								// Labels for the axis
								x: {
									title: { display: true, text: "Hours" },
									grid: { color: "#333333" },
								},
								y: {
									title: { display: true, text: "Minutes" },
									grid: { color: "#333333" },
								},
							},
						}}
					/>
				) : (
					<p>No data available</p>
				)}
			</Card.Body>
		</Card>
	);
};

export default UsageLineChart;
