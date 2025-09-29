import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { usePdfContext } from "../context/usePdfContext";
import { PdfProvider } from "../context/PdfContext";
import { retrieveUserData, subscribeToRoomUsage } from "../services/supabase";
import type { RoomsUsageData } from "../types/Types";
import Spinner from "../utils/gui_add_ons/Spinner";
import { formatDate, getDateFromString } from "../utils/FormatDate";
import DatePicker from "../utils/gui_add_ons/DatePicker";
import UsageDoughnutChart from "../utils/usage_charts/UsageDoughnutChart";
import UsageBarChart from "../utils/usage_charts/UsageBarChart";
import UsageLineChart from "../utils/usage_charts/UsageLineChart";
import UsageGroupedBarChart from "../utils/usage_charts/UsageGroupedBarChart";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import handleUploadData from "../utils/gui_add_ons/UploadDataToast";

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
				<UsageDoughnutChart selectedDate={selectedDate} data={filteredData} />
			</div>
			<div className="chart-container">
				<UsageBarChart selectedDate={selectedDate} data={filteredData} />
			</div>
			<div className="chart-container">
				<UsageLineChart selectedDate={selectedDate} data={filteredData} />
			</div>
			<div className="text-center mt-5 text-secondary">
				<h2 className="divider gradient">7 days recap</h2>
			</div>
			<PdfProvider>
				<div className="chart-container" data-chart-type="grouped-bar-chart">
					<UsageGroupedBarChart
						selectedDate={selectedDate}
						roomsUsageData={roomUsageData}
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
						type="month"
					/>
				</div>
			</PdfProvider>
		</div>
	) : (
		// Insert form for data upload if there is no data available
		<Container className="mt-5 min-vh-100 align-items-center">
			<Row className="justify-content-center">
				<Col md={4} className="w-100">
					<Card className="form-card">
						<Card.Body>
							<h3 className="text-center mb-4">No data uploaded, upload now</h3>
							<Button
								onClick={handleUploadData}
								variant="primary"
								type="submit"
								className="w-100"
							>
								Upload
							</Button>
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</Container>
	);
}
