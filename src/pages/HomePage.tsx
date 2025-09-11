import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import Spinner from "../utils/Spinner";
import { retrieveUserData } from "../services/supabase";
import type { RoomsUsageData } from "../types/Types";
import UsageDoughnutChart from "../utils/UsageDoughnutChart";
import UsageLineChart from "../utils/UsageLineChart";

const chartColors = {
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
};

export default function HomePage() {
	const { user, loading } = useAuth();
	const [roomUsageData, setRoomUsageData] = useState<RoomsUsageData[]>([]);
	const [dataLoading, setDataLoading] = useState(true);

	useEffect(() => {
		if (!user?.id || loading) return;
		console.log("Retrieving user data...");

		const fetchData = async () => {
			try {
				const data = await retrieveUserData(user.id);
				setRoomUsageData(data);
			} catch (error) {
				console.error(error);
				setRoomUsageData([]);
			} finally {
				setDataLoading(false);
			}
		};

		fetchData();
	}, [user?.id, loading]);

	if (loading || dataLoading) return <Spinner />;

	return roomUsageData.length > 0 ? (
		<div>
			<div className="chart-container">
				<UsageDoughnutChart data={roomUsageData} colors={chartColors} />
			</div>
			<div className="chart-container">
				<UsageLineChart data={roomUsageData} colors={chartColors} />
			</div>
		</div>
	) : (
		<p className="text-center">Nessun dato disponibile</p>
	);
}
