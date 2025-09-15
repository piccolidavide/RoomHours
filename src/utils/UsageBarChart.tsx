import annotationPlugin from "chartjs-plugin-annotation";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { Card } from "react-bootstrap";
import type { RoomsUsageData } from "../types/Types";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, annotationPlugin);

interface BarChartData {
	labels: string[];
	datasets: {
		label: string;
		data: number[];
		backgroundColor: string[];
		borderColor: string[];
		borderWidth: number;
	}[];
}

interface BarChartProps {
	selectedDate: Date; // date to filter the data by
	data: RoomsUsageData[]; // data to use for the chart
	colors: { backgroundColor: string[]; borderColor: string[] };
}

const UsageBarChart = ({ data, colors }: BarChartProps) => {
	const presenceData = data.filter((entry) => entry.value === 1 && entry.room_name);

	const timePerRoom = presenceData.reduce((acc, entry) => {
		const time = (entry.end_timestamp.getTime() - entry.start_timestamp.getTime()) / 1000; //divided by 1000 to transform ms in seconds

		acc[entry.room_name!] = (acc[entry.room_name!] || 0) + time;

		return acc;
	}, {} as { [key: string]: number });

	const labels = Object.keys(timePerRoom);
	const times = Object.values(timePerRoom);
	const totalTime = times.reduce((sum, time) => sum + time, 0);

	const chartData: BarChartData = {
		labels: labels,
		datasets: [
			{
				label: "Rooms Usage",
				data: times,
				backgroundColor: colors.backgroundColor,
				borderColor: colors.borderColor,
				borderWidth: 2,
			},
		],
	};

	return (
		<Card className="chart-card">
			<Card.Header as="h5">Daily Rooms Usage</Card.Header>
			<Card.Body>
				{chartData.labels.length > 0 ? (
					<Bar
						data={chartData}
						options={{
							indexAxis: "y",
							responsive: true,
							plugins: {
								legend: {
									display: false,
								},
								tooltip: {
									callbacks: {
										label: (context) => {
											const label = context.label;
											const value = context.parsed.x;
											return `${label}: ${Math.round(value / 60)} minuti`;
										},
									},
								},
								annotation: {
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
						id="bar-chart"
					/>
				) : (
					<p className="text-center">No data available</p>
				)}
			</Card.Body>
		</Card>
	);
};

export default UsageBarChart;
