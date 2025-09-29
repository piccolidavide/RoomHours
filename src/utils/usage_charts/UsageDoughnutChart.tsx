import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Card } from "react-bootstrap";
import { CHART_COLORS, type ChartData, type RoomsUsageData } from "../../types/Types";

ChartJS.register(ArcElement, Tooltip, Legend);

interface DoughnutChartProps {
	selectedDate: Date; // date to filter the data by
	data: RoomsUsageData[]; // data to use for the chart
}

/**
 * Creates a doughnut chart to show the usage of the rooms for the day.
 *
 * @param [data] - The data to use for the chart
 * @returns The JSX element containing the doughnut chart
 */
const UsageDoughnutChart = ({ data }: DoughnutChartProps) => {
	// Filter to get only the entries with presence in the rooms
	const presenceData = data.filter((entry) => entry.value === 1);

	// Calculate the total time spent in each room
	const timePerRoom = presenceData.reduce((acc, entry) => {
		const time = (entry.end_timestamp.getTime() - entry.start_timestamp.getTime()) / 1000; //divided by 1000 to transform ms in seconds

		acc[entry.room_name!] = (acc[entry.room_name!] || 0) + time;

		return acc;
	}, {} as { [key: string]: number });

	const labels = Object.keys(timePerRoom); // the keys are the room names
	const times = Object.values(timePerRoom); // the values are the minutes

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

	//Create and return the chart
	return (
		<Card className="chart-card">
			<Card.Header as="h5">Daily Rooms Usage</Card.Header>
			<Card.Body>
				{chartData.labels.length > 0 ? ( // Render the chart only if there is data
					<Doughnut
						data={chartData}
						options={{
							responsive: true,
							maintainAspectRatio: false,
							plugins: {
								legend: {
									display: true,
									position: "bottom",
								},
								tooltip: {
									callbacks: {
										// When hovering on a slice, shows the time in minutes
										label: (context) => {
											const value = context.parsed;
											return `${Math.round(value / 60)} minuti`;
										},
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

export default UsageDoughnutChart;
