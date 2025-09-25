import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { usePdfContext } from "../context/usePdfContext";
import { PdfProvider } from "../context/PdfContext";
import { retrieveUserData, subscribeToRoomUsage } from "../services/supabase";
import type { RoomsUsageData, ChartColors } from "../types/Types";
import Spinner from "../utils/gui_add_ons/Spinner";
import { formatDate, getDateFromString } from "../utils/FormatDate";
import UsageDoughnutChart from "../utils/usage_charts/UsageDoughnutChart";
import UsageLineChart from "../utils/usage_charts/UsageLineChart";
import DatePicker from "../utils/gui_add_ons/DatePicker";
import UsageBarChart from "../utils/usage_charts/UsageBarChart";
import UsageGroupedBarChart from "../utils/usage_charts/UsageGroupedBarChart";

// Colors for the charts
// const chartColors = {
// 	backgroundColor: [
// 		"rgba(255, 99, 132, 0.2)",
// 		"rgba(54, 162, 235, 0.2)",
// 		"rgba(255, 206, 86, 0.2)",
// 		"rgba(75, 192, 143, 0.2)",
// 		"rgba(153, 102, 255, 0.2)",
// 		"rgba(255, 159, 64, 0.2)",
// 	],
// 	borderColor: [
// 		"rgba(255, 99, 122, 1)",
// 		"rgba(54, 162, 235, 1)",
// 		"rgba(255, 206, 86, 1)",
// 		"rgba(75, 192, 143, 1)",
// 		"rgba(153, 102, 255, 1)",
// 		"rgba(255, 159, 64, 1)",
// 	],
// };

/**
 * HomePage component.
 * Holds all the charts showing the user data, allowing the user to select the date to show data from.
 *
 * @returns {JSX.Element} - The JSX element representing the HomePage component.
 */
export default function HomePage() {
	const { user, loading } = useAuth(); // context for the user to stay updated on its state
	const { setRoomsData, setDate } = usePdfContext(); // context for the chart to be used when creating pdf
	const [dataLoading, setDataLoading] = useState(true); // loading state for the data retrieval
	const [roomUsageData, setRoomUsageData] = useState<RoomsUsageData[]>([]); // all the data retrieved from the db
	const [filteredData, setFilteredData] = useState<RoomsUsageData[]>([]); // data filtered by the selected date
	const [selectedDate, setSelectedDate] = useState(new Date()); // date selected by the user
	const [distinctDates, setDistinctDates] = useState<string[]>([]); // all the distinct dates the user has data on

	// Function to retrieve user data from the database and update the various states
	const updateUserData = async () => {
		setDataLoading(true);

		try {
			const data = await retrieveUserData(user.id); // Fetch user data from the database

			// Extract distinct dates from the dataset
			const dates = [
				...new Set(
					data.map((item) => {
						return formatDate(item.start_timestamp);
					}),
				),
			];
			setDistinctDates(dates); // Update the state with distinct dates

			// If there are dates available, set the selected date to the latest one available
			if (dates.length > 0) {
				//update the dates state
				setSelectedDate(getDateFromString(dates[dates.length - 1]));
				setDate(getDateFromString(dates[dates.length - 1]));
			}

			// update the room usage data state for both local and pdf context
			setRoomUsageData(data);
			setRoomsData(data);
		} catch (error) {
			console.error(error);
			setRoomUsageData([]);
		} finally {
			setDataLoading(false);
		}
	};

	// Effect to fetch user data when the user ID changes or loading state changes
	useEffect(() => {
		if (!user?.id || loading) return;

		updateUserData();
	}, [user?.id, loading]);

	// Effect to filter data based on the selected date
	useEffect(() => {
		const filtered = roomUsageData.filter(
			(item) => formatDate(item.start_timestamp) === formatDate(selectedDate),
		);

		setFilteredData(filtered); // updating the filtered data state
	}, [selectedDate, roomUsageData]);

	// Effect to subscribe to real-time updates for room usage data
	useEffect(() => {
		const subscribe = async () => {
			if (!user?.id || loading) return;

			const unsubscribe = await subscribeToRoomUsage(user.id, updateUserData); // Subscribe in supabase client

			return unsubscribe; // Cleanup function to unsubscribe when the component unmounts or dependencies change
		};

		subscribe();
	}, [user?.id, loading]);

	if (loading || dataLoading) return <Spinner />; // Show a spinner while loading

	/**
	 * Handles a date change event from the DatePicker component
	 * and updates the selectedDate state with the new date.
	 * @param {Date} date The new date to be set as the selected date.
	 */
	const handleDateChange = (date: Date) => {
		setSelectedDate(date);
	};

	// Render the main content of the HomePage component, if there is data available
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
				<UsageDoughnutChart selectedDate={selectedDate} data={filteredData} colors={ChartColors} />
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
			<PdfProvider>
				<div className="chart-container" data-chart-type="grouped-bar-chart">
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
				<div className="chart-container" data-chart-type="grouped-bar-chart">
					<UsageGroupedBarChart
						selectedDate={selectedDate}
						roomsUsageData={roomUsageData}
						colors={chartColors}
						type="month"
					/>
				</div>
			</PdfProvider>
		</div>
	) : (
		// Render a message if no data is available
		<p className="d-flex justify-content-center align-items-center text-center">
			Nessun dato disponibile
		</p>
	);
}
