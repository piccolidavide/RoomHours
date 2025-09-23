import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import Spinner from "../utils/gui_add_ons/Spinner";
import { retrieveUserData, subscribeToRoomUsage } from "../services/supabase";
import type { RoomsUsageData } from "../types/Types";
import UsageDoughnutChart from "../utils/usage_charts/UsageDoughnutChart";
import UsageLineChart from "../utils/usage_charts/UsageLineChart";
import DatePicker from "../utils/gui_add_ons/DatePicker";
import { formatDate, getDateFromString } from "../utils/FormatDate";
import UsageBarChart from "../utils/usage_charts/UsageBarChart";
import UsageGroupedBarChart from "../utils/usage_charts/UsageGroupedBarChart";
import { useChart } from "../context/useChart";
import { Chart } from "chart.js";
import { ChartProvider } from "../context/ChartContext";

const chartColors = {
	backgroundColor: [
		"rgba(255, 99, 132, 0.2)",
		"rgba(54, 162, 235, 0.2)",
		"rgba(255, 206, 86, 0.2)",
		"rgba(75, 192, 143, 0.2)",
		"rgba(153, 102, 255, 0.2)",
		"rgba(255, 159, 64, 0.2)",
	],
	borderColor: [
		"rgba(255, 99, 122, 1)",
		"rgba(54, 162, 235, 1)",
		"rgba(255, 206, 86, 1)",
		"rgba(75, 192, 143, 1)",
		"rgba(153, 102, 255, 1)",
		"rgba(255, 159, 64, 1)",
	],
};

export default function HomePage() {
	const { user, loading } = useAuth();
	const { setRoomsData, setDate } = useChart();
	const [dataLoading, setDataLoading] = useState(true);
	const [roomUsageData, setRoomUsageData] = useState<RoomsUsageData[]>([]);
	const [filteredData, setFilteredData] = useState<RoomsUsageData[]>([]);
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [distinctDates, setDistinctDates] = useState<string[]>([]);

	const updateUserData = async () => {
		setDataLoading(true);

		try {
			const data = await retrieveUserData(user.id);

			const dates = [
				...new Set(
					data.map((item) => {
						return formatDate(item.start_timestamp);
					}),
				),
			];
			setDistinctDates(dates);

			if (dates.length > 0) {
				setSelectedDate(getDateFromString(dates[dates.length - 1])); // Set the latest date the users has data on
				setDate(getDateFromString(dates[dates.length - 1])); // date in ChartContext
			}

			setRoomUsageData(data);
			setRoomsData(data); // data in ChartContext
		} catch (error) {
			console.error(error);
			setRoomUsageData([]);
		} finally {
			setDataLoading(false);
		}
	};

	useEffect(() => {
		if (!user?.id || loading) return;
		// console.log("Retrieving user data...");

		updateUserData();
	}, [user?.id, loading]);

	useEffect(() => {
		const filtered = roomUsageData.filter(
			(item) => formatDate(item.start_timestamp) === formatDate(selectedDate),
		);

		setFilteredData(filtered);
	}, [selectedDate, roomUsageData]);

	useEffect(() => {
		const subscribe = async () => {
			if (!user?.id || loading) return;

			const unsubscribe = await subscribeToRoomUsage(user.id, updateUserData);

			return unsubscribe;
		};

		subscribe();
	}, [user?.id, loading]);

	if (loading || dataLoading) return <Spinner />;

	const handleDateChange = (date: Date) => {
		setSelectedDate(date);
	};

	// console.log("HomePage ", distinctDates);
	return roomUsageData.length > 0 ? (
		<div className="home-page-container">
			<DatePicker
				dateChange={handleDateChange}
				usableDates={distinctDates}
				selectedDate={selectedDate}
			/>
			<div className="text-center text-secondary">
				<h2 className="divider gradient">Daily recap</h2>
			</div>
			<div className="chart-container">
				<UsageDoughnutChart selectedDate={selectedDate} data={filteredData} colors={chartColors} />
			</div>
			<div className="chart-container">
				<UsageBarChart selectedDate={selectedDate} data={filteredData} colors={chartColors} />
			</div>
			<div className="chart-container">
				<UsageLineChart selectedDate={selectedDate} data={filteredData} colors={chartColors} />
			</div>
			<div className="text-center mt-5 text-secondary">
				<h2 className="divider gradient">7 days recap</h2>
			</div>
			<ChartProvider>
				<div className="chart-container">
					<UsageGroupedBarChart
						selectedDate={selectedDate}
						roomsUsageData={roomUsageData}
						colors={chartColors}
						type="week"
					/>
				</div>
				<div className="text-center text-secondary">
					<h2 className="divider gradient">4 weeks recap</h2>
				</div>
				<div className="chart-container">
					<UsageGroupedBarChart
						selectedDate={selectedDate}
						roomsUsageData={roomUsageData}
						colors={chartColors}
						type="month"
					/>
				</div>
			</ChartProvider>
		</div>
	) : (
		<p className="d-flex justify-content-center align-items-center text-center">
			Nessun dato disponibile
		</p>
	);
}
