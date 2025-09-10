import type { Period, UploadData } from "../types/Types";

// interface Period {
// 	user_id: string;
// 	room_id: string | null;
// 	start_timestamp: Date;
// 	end_timestamp: Date;
// 	value: number;
// }

export default function retrieveRoomUsage(
	userId: string,
	roomNames: string[],
	roomMap: { [name: string]: string },
	data: UploadData[],
) {
	let periods: Period[] = [];
	for (const roomName of roomNames) {
		let currentState = null;
		let startTimestamp = null;

		for (const entry of data) {
			const timestamp = new Date(entry.Timestamp + "Z");

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
				end_timestamp: new Date(data[data.length - 1].Timestamp + "Z"),
				value: Number(currentState),
			});
		}
	}

	let emptyPeriods: Period[] = [];
	let currentEmptyStart = null;

	for (const entry of data) {
		const timestamp = new Date(entry.Timestamp + "Z");
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
			end_timestamp: new Date(data[data.length - 1].Timestamp + "Z"),
			value: 0,
		});
	}

	return periods.concat(emptyPeriods);
}
