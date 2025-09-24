import { createRoot } from "react-dom/client";
import { usePdfContext } from "../../context/usePdfContext";
import { PdfProvider } from "../../context/PdfContext";
import { NavDropdown } from "react-bootstrap";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { addDays, startOfWeek } from "date-fns";
import html2canvas from "@html2canvas/html2canvas";
import type { RoomsUsageData } from "../../types/Types";
import UsageGroupedBarChart from "../usage_charts/UsageGroupedBarChart";
import { ReportPDF } from "./ReportPDF";
import jsPDF from "jspdf";
import * as htmlToImage from "html-to-image";

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

const chartImage = async (
	date: Date,
	chartType: "week" | "month",
	data: RoomsUsageData[],
): Promise<string> => {
	// Crea un contenitore DOM temporaneo
	const container = document.createElement("div");
	container.style.position = "absolute";
	container.style.left = "-9999px";
	document.body.appendChild(container);

	// Renderizza il componente nel contenitore
	const root = createRoot(container);
	root.render(
		<PdfProvider>
			<UsageGroupedBarChart
				// ref={chartRef}
				selectedDate={date}
				roomsUsageData={data}
				colors={chartColors}
				type={chartType}
			/>
		</PdfProvider>,
	);

	// Aspetta che il rendering sia completato
	await new Promise((resolve) => setTimeout(resolve, 100));

	const canvas = document.createElement("canvas");
	canvas.getContext("2d", { willReadFrequently: true });

	// Ottieni l'immagine dal grafico
	const imageCanvas = await html2canvas(container, { canvas });
	const chartImage = imageCanvas.toDataURL("image/png");

	// Pulisci il contenitore
	root.unmount();
	document.body.removeChild(container);

	return chartImage;
};

async function create({
	doc,
	elements,
}: {
	doc: jsPDF;
	elements: HTMLCollectionOf<Element> | NodeListOf<Element>;
}) {
	const padding = 10;
	const marginTop = 20;
	let top = marginTop;

	for (let i = 0; i < elements.length; i++) {
		const el = elements.item(i) as HTMLElement;
		// const imgData = await htmlToImage.toPng(el);
		let imgData;

		try {
			imgData = await htmlToImage.toPng(el);
		} catch (error) {
			console.warn("Errore durante la conversione in immagine:", error);
			continue; // Salta l'elemento problematico
		}

		let elHeight = el.offsetHeight;
		let elWidth = el.offsetWidth;

		const pageWidth = doc.internal.pageSize.getWidth();

		if (elWidth > pageWidth) {
			const ratio = pageWidth / elWidth;
			elHeight = elHeight * ratio - padding * 2;
			elWidth = elWidth * ratio - padding * 2;
		}

		const pageHeight = doc.internal.pageSize.getHeight();

		if (top + elHeight > pageHeight) {
			doc.addPage();
			top = marginTop;
		}

		doc.addImage(imgData, "PNG", padding, top, elWidth, elHeight, `image${i}`);
		top += elHeight + marginTop;
	}

	return { doc, elements };
}

const ExportPDF = () => {
	// const { roomsData, date } = usePdfContext();

	/* const generatePdf = async () => {
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
			const weekChart = await chartImage(date, "week", filter(startDate.week, endDate.week));
			const monthChart = await chartImage(date, "month", filter(startDate.month, endDate.month));

			const blob = await pdf(
				<ReportPDF data={data} weekChart={weekChart} monthChart={monthChart} />,
			).toBlob();

			saveAs(blob, "rooms_usage.pdf");
		} catch (error) {
			console.error("Error generating or saving PDF:", error);
		}
	}; */

	const generatePdf2 = async () => {
		const doc = new jsPDF("p", "px", "a4");

		// const elements = document.getElementsByClassName("chart-container");
		const elements = document.querySelectorAll('.chart-container[data-chart-type="grouped-bar-chart"]'); // || document.querySelectorAll('.chart-container[data-chart-type="grouped-bar-chart"]');

		await create({ doc, elements });

		doc.save("charts.pdf");
	};

	return <NavDropdown.Item onClick={generatePdf2}>Get PDF</NavDropdown.Item>;
};

export default ExportPDF;
