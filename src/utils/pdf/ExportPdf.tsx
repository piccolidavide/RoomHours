import { usePdfContext } from "../../context/usePdfContext";
import { NavDropdown } from "react-bootstrap";
import { addDays, startOfWeek } from "date-fns";
import type { pdfTableData, RoomsUsageData } from "../../types/Types";
import { createPdf } from "./ReportPDF";
import jsPDF from "jspdf";

/**
 * Filter the usage data array based on the start and end dates.
 *
 * @param [roomsData] - The array of usage data to be filtered.
 * @param  [start] - The start date to filter by. Defaults to undefined.
 * @param  [end] - The end date to filter by. Defaults to undefined.
 * @returns  The filtered array of rooms data.
 */
const filter = (roomsData: RoomsUsageData[], start?: Date, end?: Date) =>
	roomsData.filter(
		(entry) =>
			(!start || entry.start_timestamp.getTime() >= start.getTime()) &&
			(!end || entry.end_timestamp.getTime() < end.getTime()) &&
			entry.value === 1,
	);

/**
 * Finds the total minutes spent in each room in a given period of time.
 *
 * @param [data] - The array of usage data to be filtered.
 * @param [rooms] - The array of room names.
 * @returns The total minutes spent in each room in a given period of time.
 */
const minutesPerRoom = (data: RoomsUsageData[], rooms: string[]) =>
	// Finds the minutes spent in each room
	rooms.reduce((acc, room) => {
		const totalMins = data
			.filter((entry) => entry.room_name === room) // filter by room
			.reduce(
				// calculate total minutes
				(sum, entry) =>
					sum + (entry.end_timestamp.getTime() - entry.start_timestamp.getTime()) / 60000,
				0,
			);
		// Formats the string if its over one hour
		if (totalMins >= 60) {
			const hours = Math.floor(totalMins / 60);
			const minutes = Math.round(totalMins % 60);
			acc[room] = `${hours} h ${minutes} min`;
		} else acc[room] = `${Math.round(totalMins)} min`;

		return acc;
	}, Object.fromEntries(rooms.map((room) => [room, "0 min"])) as Record<string, string>); // ensure all rooms are present, even if 0

/**
 * Create the object for the report over the last 7 days.
 *
 * The object contains the minutes spent in each room in each day.
 *
 * @param [data] - The array of usage data to be filtered.
 * @param [date] - The start date of the report to go back 7 days from.
 * @param [rooms] - The array of room names.
 * @returns An object with the report for the last 7 days.
 */
const findWeekReport = (data: RoomsUsageData[], date: Date, rooms: string[]) => {
	const days = Array.from({ length: 7 }, (_, i) => addDays(date, -6 + i)); // Array of the last 7 days

	// Formatted label for each day
	const labels: string[] = days.map(
		(day) =>
			day.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" }) +
			" " +
			day.toLocaleDateString("en-GB", { weekday: "short" }),
	);

	// Find the total minutes spent in each room in each day
	const weekData = days.map((day, index) => {
		const dayStart = new Date(day.setHours(0, 0, 0, 0));
		const dayEnd = new Date(day.setHours(23, 59, 59, 999));

		return {
			day: labels[index],
			data: minutesPerRoom(filter(data, dayStart, dayEnd), rooms),
		};
	});

	return weekData;
};

/**
 * Create the object for the report over the last 4 weeks.
 *
 * The object the minutes spent in each room in each week.
 *
 * @param [data] - The array of usage data to be filtered.
 * @param [date] - The start date of the report to go back 4 weeks from.
 * @param [rooms] - The array of room names.
 * @returns An object with the report for the last 4 weeks.
 */
const findMonthReport = (data: RoomsUsageData[], date: Date, rooms: string[]) => {
	const curWeekStart = startOfWeek(date, { weekStartsOn: 1 }); // Get the start of the current week (on monday)
	const weeks = Array.from({ length: 4 }, (_, i) => addDays(curWeekStart, -21 + i * 7)); // Array of the last 4 weeks

	// Formatted label for each week
	const labels: string[] = weeks.map((weekStart) => {
		const weekEnd = addDays(weekStart, 6);

		const start = weekStart.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" });
		const end = weekEnd.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" });

		return `${start} - ${end}`;
	});

	// Find the total minutes spent in each room in each week
	const weekData = weeks.map((weekStart, index) => {
		const weekEnd = addDays(weekStart, 6);
		const weekStartDate = new Date(weekStart.setHours(0, 0, 0, 0));
		const weekEndDate = new Date(weekEnd.setHours(23, 59, 59, 999));

		return {
			week: labels[index],
			data: minutesPerRoom(filter(data, weekStartDate, weekEndDate), rooms),
		};
	});

	return weekData;
};

/**
 * Cretes the button for the export pdf feature.
 *
 * When the button is clicked the generatePdf function is called and the pdf is downloaded.
 *
 * @returns The navbar dropdown item for the export pdf button
 */
const ExportPDF = () => {
	const { roomsData, date } = usePdfContext();

	const generatePdf = async () => {
		// Find the room names
		const rooms = [...new Set(roomsData.map((entry) => entry.room_name).filter(Boolean))] as string[];

		//start date and end date for the last week and the last 4 weeks
		const startDate: { week: Date; month: Date } = {
			week: addDays(date, -7),
			month: addDays(startOfWeek(date, { weekStartsOn: 1 }), -21),
		};
		const endDate: { week: Date; month: Date } = {
			week: addDays(date, 1), // have to add 1 day to the end to include selectedDay in the filter
			month: addDays(startOfWeek(date, { weekStartsOn: 1 }), 7),
		};

		// Create the data to be added to the pdf
		const data: pdfTableData = {
			weekReport: findWeekReport(roomsData, date, rooms),
			monthReport: findMonthReport(roomsData, date, rooms),
			"Last 7 days": minutesPerRoom(filter(roomsData, startDate.week, endDate.week), rooms),
			"Last month": minutesPerRoom(filter(roomsData, startDate.month, endDate.month), rooms),
			"All time": minutesPerRoom(filter(roomsData), rooms),
		};

		const doc = new jsPDF("p", "px", "a4"); // Create a new jsPDF document

		// Find the charts to add to the pdf
		const chartsToAdd = document.querySelectorAll(
			'.chart-container[data-chart-type="grouped-bar-chart"]',
		);

		// Create the pdf
		await createPdf(doc, rooms, data, chartsToAdd, date);

		// Download the pdf
		doc.save("usage_report.pdf");
	};

	return <NavDropdown.Item onClick={generatePdf}>Get PDF</NavDropdown.Item>;
};

export { ExportPDF };
