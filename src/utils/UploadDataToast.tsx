import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { Button, Form } from "react-bootstrap";
import Papa from "papaparse";
import type { RoomsData } from "../types/Types";
import { uploadRoomData } from "../services/supabase";

const UploadToast = () => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [rooms, setRooms] = useState<string[]>([]);
	const [parsedData, setParsedData] = useState<RoomsData[]>([]);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];

		if (file && file.name.endsWith(".csv")) {
			Papa.parse(file, {
				header: true,
				skipEmptyLines: true,
				dynamicTyping: true,
				complete: (results) => {
					handleCSVResults(
						results.data as RoomsData[],
						results.errors,
						results.meta,
					);
				},
				error: (err) => {
					toast.error("Errore nel parsing del file CSV.");
					console.error("CSV Parsing Error:", err);
				},
			});
		} else if (file && file.name.endsWith(".json")) {
			// const reader = new FileReader();
		} else {
			toast.error("Formato file non valido. Carica un file CSV o JSON.");
			return;
		}
	};

	const handleCSVResults = (
		data: RoomsData[],
		errors: Papa.ParseError[],
		_meta?: Papa.ParseMeta,
	) => {
		if (errors.length) {
			toast.error("Errore nel parsing del file CSV.");
			console.error("CSV Parsing Errors:", errors);
			return;
		}
		if (data.length === 0) {
			toast.error("Il file CSV è vuoto.");
			return;
		}

		const roomNames = Object.keys(data[0])
			.filter((key) => key !== "Timestamp" && key.trim() !== "")
			.map((name) => name.trim());

		if (roomNames.length === 0) {
			toast.error("Il file CSV non contiene nomi di aule validi.");
			return;
		}
		if (!data[0].Timestamp) {
			toast.error("Il file CSV non contiene la colonna 'Timestamp'.");
			return;
		}

		setRooms(roomNames);
		setParsedData(data);

		// console.log("Parsed Rooms:", roomNames);
		// console.log("Parsed Data:", data[0]);
	};

	const handleConfirmClick = (
		_e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
	) => {
		// Optionally, you can validate if a file is selected before confirming
		const file = fileInputRef.current?.files?.[0];
		if (!file) {
			toast.error("Seleziona un file prima di confermare.");
			return;
		}
		// Close the toast after confirmation
		toast.dismiss();
		toast.success("File caricato con successo!");

		// console.log("Uploading data for rooms:", rooms);
		// console.log("Data sample:", parsedData[0]);

		uploadRoomData(rooms, parsedData).then(({ success, error }) => {
			if (success) {
				toast.success("Dati caricati con successo!");
			} else {
				toast.error("Errore nel caricamento dei dati: " + error, {
					autoClose: 3000,
				});
			}
		});
	};

	return (
		<div className="w-100">
			<p>Carica il tuo file CSV o JSON:</p>
			<Form.Control
				type="file"
				ref={fileInputRef}
				accept=".csv, .json"
				onChange={handleFileChange}
			/>
			<div className="d-flex justify-content-between gap-2 mt-3">
				<Button
					variant="secondary"
					className="toast-cancel-button"
					onClick={() => toast.dismiss()}
				>
					Annulla
				</Button>
				<Button
					variant="secondary"
					className="toast-confirm-button"
					onClick={handleConfirmClick}
				>
					Conferma
				</Button>
			</div>
		</div>
	);
};

const handleUploadData = () => {
	toast(<UploadToast />, {
		position: "top-center",
		autoClose: false,
		closeOnClick: false,
		draggable: false,
		className: "cardnav-dropdown-toast-form ",
	});
};

export default handleUploadData;
