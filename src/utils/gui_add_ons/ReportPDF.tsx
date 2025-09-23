import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";

// Stili globali
const styles = StyleSheet.create({
	page: { flexDirection: "column", backgroundColor: "#FFFFFF", padding: 30 },
	section: { margin: 10, padding: 10 },
	table: { display: "flex", width: "auto", borderStyle: "solid", borderWidth: 1 },
	tableRow: { margin: "auto", flexDirection: "row" },
	tableCell: { margin: "auto", padding: 5, borderStyle: "solid", borderWidth: 1, width: 100 }, // Adatta per stanze
	chartImage: { width: "100%", height: 300 }, // Per immagini grafici
});

// Componente per la Tabella (Pagina 1)
const TablePage = ({
	data,
}: {
	data: {
		"Last 7 days": Record<string, number>;
		"Last month": Record<string, number>;
		"All time": Record<string, number>;
	};
}) => (
	<Page size="A4" style={styles.page}>
		<View style={styles.section}>
			<Text style={{ fontSize: 18, marginBottom: 10 }}>Resoconto Utilizzo Stanze</Text>
			<View style={styles.table}>
				{/* Header: Periodi come righe, stanze come colonne */}
				<View style={styles.tableRow}>
					<Text style={styles.tableCell}>Periodo</Text>
					{Object.keys(data["Last 7 days"].rooms || {}).map((room) => (
						<Text key={room} style={styles.tableCell}>
							{room}
						</Text>
					))}
				</View>
				{Object.entries(data).map(([period, row], i) => (
					<View key={i} style={styles.tableRow}>
						<Text style={styles.tableCell}>{period}</Text>
						{Object.entries(row.rooms || {}).map(([room, value]) => (
							<Text key={room} style={styles.tableCell}>
								{value} min
							</Text>
						))}
					</View>
				))}
			</View>
		</View>
	</Page>
);

// Componente per Grafici (Pagina 2)
const ChartsPage = ({
	weekChartImage,
	monthChartImage,
}: {
	weekChartImage: string;
	monthChartImage: string;
}) => (
	<Page size="A4" style={styles.page}>
		<View style={styles.section}>
			<Text style={{ fontSize: 18, marginBottom: 10 }}>Grafici Ultimi 7 Giorni e Mese</Text>
			<Image style={styles.chartImage} src={weekChartImage} />
			<Text style={{ marginTop: 10, marginBottom: 10 }}>Ultimi 7 Giorni</Text>
			<Image style={styles.chartImage} src={monthChartImage} />
			<Text style={{ marginTop: 10 }}>Ultimo Mese</Text>
		</View>
	</Page>
);

// Documento Principale
export const ReportPDF = ({
	data,
	weekChart,
	monthChart,
}: {
	data: {
		"Last 7 days": Record<string, number>;
		"Last month": Record<string, number>;
		"All time": Record<string, number>;
	}; //e.g. period="last 7 days", rooms=["Room A", "Room B"], Room A=120, Room B=90
	weekChart: string; // Base64 image
	monthChart: string; // Base64 image
}) => (
	<Document>
		<TablePage data={data} />
		{/* <ChartsPage weekChartImage={weekChart} monthChartImage={monthChart} /> */}
	</Document>
);
