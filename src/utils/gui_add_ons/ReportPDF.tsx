import type { pdfTableData } from "../../types/Types";
import type jsPDF from "jspdf";
import { autoTable, type Styles } from "jspdf-autotable";
import * as htmlToImage from "html-to-image";

// Styles for the table
const tableStyles = {
	styles: {
		cellPadding: 8,
		fontSize: 10,
		textColor: [51, 51, 51],
		halign: "center",
		lineWidth: 0.3,
		lineColor: [51, 51, 51],
		fillColor: [255, 255, 255],
	},
	headStyles: {
		cellPadding: 8,
		fontSize: 11,
		fontStyle: "bold",
		textColor: [51, 51, 51],
		halign: "center",
		lineWidth: 0.3,
		lineColor: [51, 51, 51],
		fillColor: [108, 117, 125],
		minCellHeight: 20,
	},
	bodyStyles: {
		fillColor: [255, 255, 255],
		lineWidth: { right: 0.3, bottom: 0.3 },
		lineColor: [51, 51, 51],
	},
	alternateRowStyles: {
		fillColor: [245, 245, 245],
	},
	margin: { top: 40, left: 20, right: 20 },
	theme: "grid",
};

async function addTable({
	doc,
	rooms,
	data,
	date,
}: {
	doc: jsPDF;
	rooms: string[];
	data: pdfTableData;
	date: Date;
}) {
	const text = "Report created from " + date.toLocaleDateString();
	doc.setFontSize(10);
	doc.text(text, doc.internal.pageSize.getWidth() - 10, 10, { align: "right" });
	doc.setFontSize(30);
	doc.text("USAGE REPORT", doc.internal.pageSize.getWidth() / 2, 80, { align: "center" });

	//create table
	autoTable(doc, {
		startY: 100, // Under the title
		head: [["Period", ...rooms]],
		// body: Object.entries(data).map(([period, values]) => [period, ...rooms.map((room) => values[room])]),
		body: [
			[{ content: "PAST 7 DAYS", styles: { fontStyle: "bold" } }],
			...data.weekReport.map(({ day, data }) => [day, ...rooms.map((room) => data[room])]),
			[{ content: "PAST 4 WEEKS", styles: { fontStyle: "bold" } }],
			...data.monthReport.map(({ week, data }) => [week, ...rooms.map((room) => data[room])]),
			[{ content: "TOTAL", styles: { fontStyle: "bold" } }],
			...Object.entries({
				"Last 7 days": data["Last 7 days"],
				"Last month": data["Last month"],
				"All time": data["All time"],
			}).map(([period, values]) => [period, ...rooms.map((room) => values[room])]),
		],
		styles: tableStyles as Partial<Styles>,
		didDrawCell: (table) => {
			if (
				table.row.index === data.weekReport.length ||
				table.row.index === data.weekReport.length + 1 + data.monthReport.length
			) {
				const { x, y, width, height } = table.cell;
				doc.setLineWidth(0.6);
				doc.setDrawColor(51, 51, 51);
				doc.line(x, y + height, x + width, y + height);
			}
		},
	});

	return { doc };
}

async function addImages({ doc, elements }: { doc: jsPDF; elements: NodeListOf<Element> }) {
	const padding = 10;
	const marginTop = 20;
	let top = marginTop;
	const imageTitles = ["Last 7 days report", "Last 4 weeks report"];

	// Iterates over the charts and adds them to the PDF
	for (let i = 0; i < elements.length; i++) {
		const el = elements.item(i) as HTMLElement; //current chart
		let imgData;

		try {
			imgData = await htmlToImage.toPng(el); //transform the chart into an image
		} catch (error) {
			console.warn("Errore durante la conversione in immagine:", error);
			continue; // Skip if conversion fails
		}

		// Height and width of the image
		let elHeight = el.offsetHeight;
		let elWidth = el.offsetWidth;

		const pageWidth = doc.internal.pageSize.getWidth();

		// If the image is too wide, resize it to fit in the page
		if (elWidth > pageWidth) {
			const ratio = pageWidth / elWidth;
			elHeight = elHeight * ratio - padding * 2;
			elWidth = elWidth * ratio - padding * 2;
		}

		const pageHeight = doc.internal.pageSize.getHeight();

		// If the image is too big for the current page, add a new page
		if (top + elHeight > pageHeight) {
			doc.addPage();
			top = marginTop;
		}

		// doc.setFontSize(30);
		doc.setFont("helvetica", "bold");
		doc.text(imageTitles[i], pageWidth / 2, top + 10, { align: "center" });
		top += 10;

		doc.addImage(imgData, "PNG", padding, top, elWidth, elHeight, `image${i}`);
		top += elHeight + marginTop;
	}

	return { doc, elements };
}

export const createPdf = async (
	doc: jsPDF,
	rooms: string[],
	data: pdfTableData,
	elements: NodeListOf<Element>,
	date: Date,
) => {
	await addTable({ doc, rooms, data, date });
	doc.addPage();
	await addImages({ doc, elements });
};
