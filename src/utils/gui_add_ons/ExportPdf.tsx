import { useChart } from "../../context/useChart";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { ReportPDF } from "./ReportPDF";
import { addDays, startOfWeek } from "date-fns";
import { NavDropdown } from "react-bootstrap";

const ExportPDF = () => {
	const { roomsData, weekChart, monthChart, date } = useChart();

	const generatePdf = async () => {
		const rooms = [...new Set(roomsData.map((entry) => entry.room_name).filter(Boolean))] as string[];
		const startDate: { week: Date; month: Date } = {
			week: addDays(date, -7),
			month: addDays(startOfWeek(date, { weekStartsOn: 1 }), -21),
		};
		const endDate: { week: Date; month: Date } = {
			week: addDays(date, 1), // have to add 1 day to the end to include selectedDay in the filter
			month: addDays(startOfWeek(date, { weekStartsOn: 1 }), 7),
		};

		const filter = (start?: Date, end?: Date) =>
			roomsData.filter(
				(entry) =>
					(!start || entry.start_timestamp.getTime() >= start.getTime()) &&
					(!end || entry.end_timestamp.getTime() < end.getTime()) &&
					entry.value === 1,
			);

		const minutesPerRoom = (data: typeof roomsData) =>
			rooms.reduce((acc, room) => {
				acc[room] = data
					.filter((entry) => entry.room_name === room)
					.reduce(
						(sum, entry) =>
							sum + (entry.end_timestamp.getTime() - entry.start_timestamp.getTime()) / 60000,
						0,
					);
				return acc;
			}, Object.fromEntries(rooms.map((room) => [room, 0])) as Record<string, number>); // ensure all rooms are present, even if 0

		const data = {
			"Last 7 days": minutesPerRoom(filter(startDate.week, endDate.week)),
			"Last month": minutesPerRoom(filter(startDate.month, endDate.month)),
			"All time": minutesPerRoom(filter()),
		};
		try {
			// if (!weekChart || !monthChart) {
			// 	throw new Error("Chart images are not available");
			// }
			// console.log(data["All time"]);
			const blob = await pdf(
				<ReportPDF data={data} weekChart={weekChart} monthChart={monthChart} />,
			).toBlob();

			saveAs(blob, "rooms_usage.pdf");
		} catch (error) {
			console.error("Error generating or saving PDF:", error);
		}
	};

	return <NavDropdown.Item onClick={generatePdf}>Get PDF</NavDropdown.Item>;
};

export default ExportPDF;
