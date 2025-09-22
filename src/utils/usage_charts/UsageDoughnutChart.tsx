import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Card } from "react-bootstrap";
import type { RoomsUsageData } from "../../types/Types";

ChartJS.register(ArcElement, Tooltip, Legend);

interface DoughnutChartData {
	labels: string[];
	datasets: {
		label: string;
		data: number[];
		backgroundColor: string[];
		borderColor: string[];
		borderWidth: number;
	}[];
}

interface DoughnutChartProps {
	selectedDate: Date; // date to filter the data by
	data: RoomsUsageData[]; // data to use for the chart
	colors: { backgroundColor: string[]; borderColor: string[] };
}

const UsageDoughnutChart = ({ data, colors }: DoughnutChartProps) => {
	const presenceData = data.filter((entry) => entry.value === 1 && entry.room_name);

	const timePerRoom = presenceData.reduce((acc, entry) => {
		const time = (entry.end_timestamp.getTime() - entry.start_timestamp.getTime()) / 1000; //divided by 1000 to transform ms in seconds

		acc[entry.room_name!] = (acc[entry.room_name!] || 0) + time;

		return acc;
	}, {} as { [key: string]: number });

	const labels = Object.keys(timePerRoom);
	const times = Object.values(timePerRoom);

	const chartData: DoughnutChartData = {
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
					<Doughnut
						data={chartData}
						options={{
							responsive: true,
							plugins: {
								legend: {
									display: true,
									position: "bottom",
								},
								tooltip: {
									callbacks: {
										label: (context) => {
											// const label = context.label;
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
