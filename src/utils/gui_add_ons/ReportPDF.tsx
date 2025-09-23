import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";

// Stili globali
// Definizione degli stili per la tabella
const styles = StyleSheet.create({
	page: {
		flexDirection: "column",
		padding: 20,
		backgroundColor: "#f5f5f5",
	},
	section: {
		flexGrow: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	table: {
		width: "90%",
		borderWidth: 1,
		borderColor: "#333",
		borderStyle: "solid",
		borderRadius: 4,
		overflow: "hidden",
	},
	tableRow: {
		flexDirection: "row",
		borderBottomWidth: 1,
		borderBottomColor: "#333",
		backgroundColor: "#fff",
	},
	headerRow: {
		flexDirection: "row",
		borderBottomWidth: 2,
		borderBottomColor: "#000",
		backgroundColor: "#e0e0e0",
		fontWeight: "bold",
	},
	tableCell: {
		flex: 1,
		padding: 8,
		fontSize: 10,
		textAlign: "center",
		borderRightWidth: 1,
		borderRightColor: "#333",
	},
	headerCell: {
		flex: 1,
		padding: 8,
		fontSize: 11,
		textAlign: "center",
		fontWeight: "bold",
		borderRightWidth: 1,
		borderRightColor: "#333",
	},
	title: {
		fontSize: 18,
		marginBottom: 20,
		textAlign: "center",
		color: "#333",
		fontWeight: "bold",
	},
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
}) => {
	const rooms = Object.keys(data["Last 7 days"]);

	return (
		<Page size="A4" style={styles.page}>
			<View style={styles.section}>
				<Text style={styles.title}>Rooms Usage Report</Text>
				<View style={styles.table}>
					{/* Header: Periodi come righe, stanze come colonne */}
					<View style={styles.headerRow}>
						<Text style={styles.headerCell}>Period</Text>
						{rooms.map((room) => (
							<Text key={room} style={styles.headerCell}>
								{room}
							</Text>
						))}
					</View>
					{/* Dati */}
					{Object.entries(data).map(([period, values]) => (
						<View key={period} style={styles.tableRow}>
							<Text style={styles.tableCell}>{period}</Text>
							{rooms.map((room) => (
								<Text key={`${room}-${period}`} style={styles.tableCell}>
									{values[room] ? Math.round(values[room]) + "min" : "-"}
								</Text>
							))}
						</View>
					))}
				</View>
			</View>
		</Page>
	);
};

// Componente per Grafici (Pagina 2)
// const ChartsPage = ({
// 	weekChartImage,
// 	monthChartImage,
// }: {
// 	weekChartImage: string;
// 	monthChartImage: string;
// }) => (
// 	<Page size="A4" style={styles.page}>
// 		<View style={styles.section}>
// 			<Text style={{ fontSize: 18, marginBottom: 10 }}>Grafici Ultimi 7 Giorni e Mese</Text>
// 			<Image style={styles.chartImage} src={weekChartImage} />
// 			<Text style={{ marginTop: 10, marginBottom: 10 }}>Ultimi 7 Giorni</Text>
// 			<Image style={styles.chartImage} src={monthChartImage} />
// 			<Text style={{ marginTop: 10 }}>Ultimo Mese</Text>
// 		</View>
// 	</Page>
// );

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
