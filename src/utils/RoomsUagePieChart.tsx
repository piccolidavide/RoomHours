import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Card } from "react-bootstrap";
// import type { RoomsUsageData } from "../types/Types";

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartData {
	labels: string[];
	datasets: {
		label: string;
		data: number[];
		backgroundColor: string[];
		borderColor: string[];
		borderWidth: number;
	}[];
}

const RoomsUsagePieChart = ({ data }: { data: { [key: string]: number } }) => {
	const labels = Object.keys(data);
	const times = Object.values(data);

	const chartData: PieChartData = {
		labels: labels,
		datasets: [
			{
				label: "Rooms Usage",
				data: times,
				backgroundColor: [
					"rgba(255, 99, 132, 0.2)",
					"rgba(54, 162, 235, 0.2)",
					"rgba(255, 206, 86, 0.2)",
					"rgba(75, 192, 192, 0.2)",
					"rgba(153, 102, 255, 0.2)",
					"rgba(255, 159, 64, 0.2)",
				],
				borderColor: [
					"rgba(255, 99, 132, 1)",
					"rgba(54, 162, 235, 1)",
					"rgba(255, 206, 86, 1)",
					"rgba(75, 192, 192, 1)",
					"rgba(153, 102, 255, 1)",
					"rgba(255, 159, 64, 1)",
				],
				borderWidth: 1,
			},
		],
	};

	return (
		<Card className="pie-chart-card">
			<Card.Body>
				{chartData.labels.length > 0 ? (
					<Pie
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
											const label = context.label;
											const value = context.parsed;
											return `${label}: ${value} secondi`;
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

export default RoomsUsagePieChart;
