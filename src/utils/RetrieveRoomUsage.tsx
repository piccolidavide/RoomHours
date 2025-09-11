import { format, parseISO } from "date-fns";
import type { Period, RoomsData } from "../types/Types";

export default function retrieveRoomUsage(
	userId: string,
	roomNames: string[],
	roomMap: { [name: string]: string },
	data: RoomsData[],
) {
	let periods: Period[] = [];
	for (const roomName of roomNames) {
		let currentState = null;
		let startTimestamp = null;

		for (const entry of data) {
			const timestamp = format(
				parseISO(entry.Timestamp),
				"yyyy-MM-dd HH:mm:ss",
			);
			// const timestamp = new Date(entry.Timestamp); //data giusta

			let newState = entry[roomName];

			//prima riga o cambio di stato
			if (currentState == null || currentState != newState) {
				if (currentState != null) {
					//se prima riga non entra qui
					periods.push({
						user_id: userId,
						room_id: roomMap[roomName],
						start_timestamp: startTimestamp!,
						end_timestamp: timestamp,
						value: Number(currentState),
					});
				}
				currentState = newState;
				startTimestamp = timestamp;
			}
		}

		// chiude l'ultimo periodo con il timestamp dell'ultima entry del file
		if (currentState != null && startTimestamp != null) {
			periods.push({
				user_id: userId,
				room_id: roomMap[roomName],
				start_timestamp: startTimestamp,
				end_timestamp: format(
					parseISO(data[data.length - 1].Timestamp),
					"yyyy-MM-dd HH:mm:ss",
				),
				value: Number(currentState),
			});
		}
	}

	let emptyPeriods: Period[] = [];
	let currentEmptyStart = null;

	for (const entry of data) {
		const timestamp = format(
			parseISO(entry.Timestamp),
			"yyyy-MM-dd HH:mm:ss",
		);
		const allEmpty = roomNames.every((roomName) => entry[roomName] === 0);

		if (allEmpty && currentEmptyStart == null) {
			currentEmptyStart = timestamp;
		} else if (!allEmpty && currentEmptyStart != null) {
			emptyPeriods.push({
				user_id: userId,
				room_id: null, //nessuna presenza in casa
				start_timestamp: currentEmptyStart,
				end_timestamp: timestamp,
				value: 0,
			});
			currentEmptyStart = null;
		}
	}
	if (currentEmptyStart != null) {
		emptyPeriods.push({
			user_id: userId,
			room_id: null, //nessuna presenza in casa
			start_timestamp: currentEmptyStart,
			end_timestamp: format(
				parseISO(data[data.length - 1].Timestamp),
				"yyyy-MM-dd HH:mm:ss",
			),
			value: 0,
		});
	}

	return periods.concat(emptyPeriods);
}
