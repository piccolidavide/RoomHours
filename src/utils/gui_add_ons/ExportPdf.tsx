import { useChart } from "../../context/useChart";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { ReportPDF } from "./ReportPDF";
import { addDays, startOfWeek } from "date-fns";
import { NavDropdown } from "react-bootstrap";
import { useEffect, useRef, useState } from "react";

// const PDF = ({
// 	roomsData,
// 	weekChart,
// 	monthChart,
// }: {
// 	roomsData: RoomsUsageData[];
// 	weekChart: string;
// 	monthChart: string;
// }) => (
// 	<Document>
// 		<TablePage data={roomsData} />
// 		<ChartsPage weekChart={weekChart} monthChart={monthChart} />
// 	</Document>;
// );

// const handlePdfExport = () => {
const ExportPDF = () => {
	const { roomsData, weekChart, monthChart, date /* refreshCounter, refreshImagesRef */ } = useChart();
	// const [isRoomReady, setIsRoomReady] = useState(false);
	// const checkInterval = useRef<NodeJS.Timeout | null>(null);

	//check if images are ready
	// useEffect(() => {
	// 	console.log("useeffect");
	// 	if (weekChart && monthChart) {
	// 		setIsRoomReady(true);
	// 	} else {
	// 		setIsRoomReady(false);
	// 	}
	// }, [weekChart, monthChart, date]);

	const generatePdf = async () => {
		// if (!isRoomReady) {
		// 	await new Promise<void>((resolve) => {
		// 		const chechImages = () => {
		// 			if (weekChart && monthChart) {
		// 				setIsRoomReady(true);
		// 				resolve();
		// 			}
		// 		};
		// 		chechImages();
		// 	});
		// }

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

		console.log("Generating PDF with data:", data);
		console.log("Week chart image:", weekChart);
		console.log("Month chart image:", monthChart);
		try {
			// if (!weekChart || !monthChart) {
			// 	throw new Error("Chart images are not available");
			// }

			const blob = await pdf(
				<ReportPDF data={data} weekChart={weekChart} monthChart={monthChart} />,
			).toBlob();
			const input = document.createElement("input");
			input.type = "file";
			input.setAttribute("nwsaveas", "rooms_usage.pdf");
			input.setAttribute("nwdirectory", "");
			input.onchange = (e) => {
				const target = e.target as HTMLInputElement;
				if (target.files && target.files.length > 0) {
					const filePath = (target.files[0] as any)?.path as string;
					saveAs(blob, filePath);
				}
			};
			input.click();
		} catch (error) {
			console.error("Error generating or saving PDF:", error);
		}
	};

	return <NavDropdown.Item onClick={generatePdf}>Get PDF</NavDropdown.Item>;
};

export default ExportPDF;
