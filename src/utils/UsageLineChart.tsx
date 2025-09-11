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
import {
	startOfHour,
	endOfHour,
	addHours,
	differenceInMinutes,
	isWithinInterval,
	subHours,
} from "date-fns";
import type { RoomsUsageData } from "../types/Types";

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
);

const UsageLineChart = ({
	data,
	colors,
}: {
	data: RoomsUsageData[];
	colors: { backgroundColor: string[]; borderColor: string[] };
}) => {
	const latestEntry = data[data.length - 1];
	const last24Hours = subHours(latestEntry.end_timestamp, 24);

	const filteredData: RoomsUsageData[] = data.filter(
		(entry) =>
			entry.value === 1 &&
			entry.room_name &&
			entry.end_timestamp > last24Hours,
	);

	const rooms: string[] = [
		...(Array.from(
			new Set(filteredData.map((entry: any) => entry.room_name!)),
		) as string[]),
	];
	const labels = Array.from({ length: 24 }, (_, i) => i);

	const hourBuckets: { [hour: string]: { start: Date; end: Date } } = {};
	for (let i = 0; i < 24; i++) {
		const start = addHours(startOfHour(last24Hours), i); // adds i hours to the start of the 24 hour period
		hourBuckets[String(i)] = { start, end: addHours(start, 1) };
	}

	// Calculate the time passed in each room per hourBucket
	const roomData = rooms.map((room: string, index: number) => {
		const hourData = Array(24).fill(0);

		filteredData
			.filter((entry: any) => entry.room_name === room)
			.forEach((entry: any) => {
				labels.forEach((hour, i) => {
					// const bucket = hourBuckets[hour];
					const { start, end } = hourBuckets[hour];
					const overlapStart = new Date(
						Math.max(
							start.getTime(),
							entry.start_timestamp.getTime(),
						),
					);
					const overlapEnd = new Date(
						Math.min(end.getTime(), entry.end_timestamp.getTime()),
					);
					if (overlapStart < overlapEnd) {
						hourData[i] += differenceInMinutes(
							overlapEnd,
							overlapStart,
						);
					}
				});
			});
		return {
			label: String(room),
			data: hourData,
			borderColor: colors.borderColor[index],
			backgroundColor: colors.backgroundColor[index],
			tension: 0.2,
			borderWidth: 2,
		};
	});

	return (
		<Card className="chart-card">
			<Card.Header as="h5">Daily rooms usage</Card.Header>
			<Card.Body>
				{roomData.length > 0 ? (
					<Line
						data={{
							labels,
							datasets: roomData,
						}}
						options={{
							responsive: true,
							maintainAspectRatio: false,
							plugins: {
								legend: {
									position: "bottom" as const,
								},
							},
							scales: {
								x: {
									title: { display: true, text: "Hours" },
									grid: {
										color: "#333333",
									},
								},
								y: {
									title: { display: true, text: "Minutes" },
									grid: {
										color: "#333333",
									},
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
