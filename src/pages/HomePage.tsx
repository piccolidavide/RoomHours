import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import Spinner from "../utils/Spinner";
import { retrieveUserData } from "../services/supabase";
import type { RoomsUsageData } from "../types/Types";
import RoomsUsagePieChart from "../utils/RoomsUagePieChart";

export default function HomePage() {
	const { user, loading } = useAuth();
	const [roomUsageData, setRoomUsageData] = useState<RoomsUsageData[]>([]);
	const [dataLoading, setDataLoading] = useState(true);

	useEffect(() => {
		if (!user?.id || loading) return;

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

	const presenceData = roomUsageData.filter(
		(entry) => entry.value === 1 && entry.room_name,
	);

	const timePerRoom = presenceData.reduce((acc, entry) => {
		console.log(typeof entry.start_timestamp);
		const time =
			(new Date(entry.end_timestamp).getTime() -
				new Date(entry.start_timestamp).getTime()) /
			1000; //divided by 1000 to transform ms in seconds
		acc[entry.room_name!] = (acc[entry.room_name!] || 0) + time;
		return acc;
	}, {} as { [key: string]: number });

	console.log("homepage");
	console.log(timePerRoom);

	return (
		<div className="pie-chart-container">
			{roomUsageData.length > 0 ? (
				//TODO : implementare il grafico a torta
				<RoomsUsagePieChart data={timePerRoom} />
			) : (
				<p>Nessun dato disponibile.</p>
			)}
		</div>
	);
}
