import annotationPlugin from "chartjs-plugin-annotation";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { Card } from "react-bootstrap";
import { CHART_COLORS, type ChartData, type RoomsUsageData } from "../../types/Types";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, annotationPlugin);

interface BarChartProps {
	selectedDate: Date; // date to filter the data by
	data: RoomsUsageData[]; // data to use for the chart
}

/**
 * Creates a bar chart showing the minutes spent in each room.
 *
 * @param [data] - the data to use for the chart
 * @returns the JSX element containing the bar chart
 */
const UsageBarChart = ({ data }: BarChartProps) => {
	// Filter the data to get only the entries with presence in the rooms
	const presenceData = data.filter((entry) => entry.value === 1);

	// Calculates the total time spent in each room
	const timePerRoom = presenceData.reduce((acc, entry) => {
		const time = (entry.end_timestamp.getTime() - entry.start_timestamp.getTime()) / 1000; //divided by 1000 to transform ms in seconds

		acc[entry.room_name!] = (acc[entry.room_name!] || 0) + time;

		return acc;
	}, {} as { [key: string]: number }); // the object has from {room: minutes}

	const labels = Object.keys(timePerRoom); // the keys are the room names
	const times = Object.values(timePerRoom); // the values are the minutes
	const totalTime = times.reduce((sum, time) => sum + time, 0); // calculate the total time to compare each room with the total of the day

	const chartData: ChartData = {
		labels: labels,
		datasets: [
			{
				label: "Rooms Usage",
				data: times,
				backgroundColor: CHART_COLORS.backgroundColor,
				borderColor: CHART_COLORS.borderColor,
				borderWidth: 2,
			},
		],
	};

	// Creates and returns the chart
	return (
		<Card className="chart-card">
			<Card.Header as="h5">Daily Rooms Usage</Card.Header>
			<Card.Body>
				{chartData.labels.length > 0 ? ( //only render the chart if there is data
					<Bar
						data={chartData}
						options={{
							indexAxis: "y",
							responsive: true,
							maintainAspectRatio: false,
							plugins: {
								legend: {
									display: false,
								},
								tooltip: {
									callbacks: {
										// When hovering on a bar, shows the time in minutes
										label: (context) => {
											const value = context.parsed.x;
											return `${Math.round(value / 60)} minuti`;
										},
									},
								},
								annotation: {
									// Creates the line of the total minutes of the days
									annotations: {
										totalLine: {
											type: "line",
											xMin: totalTime,
											xMax: totalTime,
											borderColor: "rgba(111, 111, 111, 0.5)",
											borderWidth: 2,
											borderDash: [5, 5],
											label: {
												content: `Totale: ${Math.round(totalTime / 60)} min`,
												display: true,
												position: "start",
												backgroundColor: "rgba(0, 0, 0, 0.7)",
												color: "gray",
												padding: 4,
											},
										},
									},
								},
							},
							scales: {
								// Labels for the axis
								x: {
									title: {
										display: true,
										text: "Minutes",
									},
									ticks: {
										callback: (value) => `${Math.round(Number(value) / 60)}`,
									},
								},
								y: {
									title: {
										display: true,
										text: "Rooms",
									},
								},
							},
						}}
					/>
				) : (
					<p className="text-center">No data available</p>
				)}
			</Card.Body>
		</Card>
	);
};

export default UsageBarChart;
