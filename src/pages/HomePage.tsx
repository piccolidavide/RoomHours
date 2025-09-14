import { use, useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import Spinner from "../utils/Spinner";
import { supabase, retrieveUserData } from "../services/supabase";
import type { RoomsUsageData } from "../types/Types";
import UsageDoughnutChart from "../utils/UsageDoughnutChart";
import UsageLineChart from "../utils/UsageLineChart";
import DatePicker from "../utils/DatePicker";
import { formatDate, getDateFromString } from "../utils/FormatDate";

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
			}

			// setSelectedDate(getDateFromString(dates[dates.length - 1])); // Set the latest date the users has data on
			setRoomUsageData(data);
		} catch (error) {
			console.error(error);
			setRoomUsageData([]);
		} finally {
			setDataLoading(false);
		}
	};

	useEffect(() => {
		if (!user?.id || loading) return;
		console.log("Retrieving user data...");

		updateUserData();
	}, [user?.id, loading]);

	useEffect(() => {
		const filtered = roomUsageData.filter(
			(item) => formatDate(item.start_timestamp) === formatDate(selectedDate),
		);

		setFilteredData(filtered);
	}, [selectedDate, roomUsageData]);

	// useEffect per la sottoscrizione in tempo reale
	useEffect(() => {
		if (!user?.id || loading) return;

		// Crea un canale per la sottoscrizione
		const channel = supabase()
			.channel("rooms_usage_periods_changes")
			.on(
				"postgres_changes",
				{
					event: "INSERT", // Ascolta solo gli INSERT
					schema: "public", // Assumi schema pubblico
					table: "rooms_usage_periods",
					filter: `user_id=eq.${user.id}`, // Filtra per user_id dell'utente autenticato
				},
				(_payload) => {
					// console.log("Nuovo inserimento rilevato:", payload);
					// Ricarica i dati quando c'è un INSERT
					updateUserData();
				},
			)
			.subscribe((status) => {
				console.log("Stato sottoscrizione:", status);
			});

		// Cleanup: rimuovi la sottoscrizione quando il componente si smonta
		return () => {
			supabase().removeChannel(channel);
		};
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
			<div className="chart-container">
				<UsageDoughnutChart selectedDate={selectedDate} data={filteredData} colors={chartColors} />
			</div>
			<div className="chart-container">
				<UsageLineChart selectedDate={selectedDate} data={filteredData} colors={chartColors} />
			</div>
		</div>
	) : (
		<p className="d-flex justify-content-center align-items-center text-center">
			Nessun dato disponibile
		</p>
	);
}
