import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { Card } from "react-bootstrap";
import type { RoomsUsageData } from "../types/Types";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface GanttChartData {
	labels: string[];
	datasets: {
		label: string;
		data: { start: number; end: number; label: string }[];
		backgroundColor: string[];
		borderColor: string[];
		borderWidth: number;
	}[];
}

interface GanttChartProps {
	data: RoomsUsageData[]; // data to use for the chart
	colors: { backgroundColor: string[]; borderColor: string[] };
}

const UsageGanttChart = ({ data, colors }: GanttChartProps) => {
	const presenceData = data.filter((entry) => entry.value === 1);

	const roomNames = [...new Set(presenceData.map((entry) => entry.room_name))];

	const datasets = presenceData
		.map((entry) => {
			if (entry.room_name === null) return null;

			const startHour = entry.start_timestamp.getHours() + entry.start_timestamp.getMinutes() / 60;
			const endHour = entry.end_timestamp.getHours() + entry.end_timestamp.getMinutes() / 60;

			console.log(startHour, endHour);

			return {
				label: entry.room_name,
				data: [{ start: startHour, end: endHour, label: entry.room_name }],
				backgroundColor: colors.backgroundColor,
				borderColor: colors.borderColor,
				borderWidth: 2,
			};
		})
		.filter(Boolean) as GanttChartData["datasets"]; // filter out null values

	const chartData: GanttChartData = {
		labels: roomNames.filter((name) => name !== null),
		datasets: datasets,
	};

	return (
		<Card className="chart-card">
			<Card.Header as="h5">Daily Rooms Usage timeline</Card.Header>
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
											const dataset = context.dataset;
											const dataPoint = dataset.data[context.dataIndex] as unknown as {
												start: number;
												end: number;
												label: string;
											};
											const start = dataPoint.start;
											const end = dataPoint.end;
											const duration = ((end - start) * 60).toFixed(0); // duration in minutes

											return `${dataset.label}: 
                                                ${start.toFixed(2)} - 
                                                ${end.toFixed(2)} 
                                                (${duration} min)`;
										},
									},
								},
							},
							scales: {
								x: {
									type: "linear",
									min: 0,
									max: 24,
									title: {
										display: true,
										text: "Hour of the day",
									},
									ticks: {
										stepSize: 1,
										callback: (value) => `${value}:00`,
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

export default UsageGanttChart;
