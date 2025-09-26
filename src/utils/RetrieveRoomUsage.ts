import { format, parseISO } from "date-fns";
import type { Period, RoomsData } from "../types/Types";

export default function retrieveRoomUsage(
	userId: string, // id of the current user
	roomNames: string[], // names of the rooms
	roomMap: { [name: string]: string }, // maps roomName -> roomId
	data: RoomsData[], //value (0|1) of each room at given timestamp
) {
	let periods: Period[] = [];

	// iterates over the rooms
	for (const roomName of roomNames) {
		let currentState = null; // current state 0 or 1
		let startTimestamp = null;

		// iterates over the presence data
		for (const entry of data) {
			const timestamp = format(parseISO(entry.Timestamp), "yyyy-MM-dd HH:mm:ss"); // formats the timestamp

			let newState = entry[roomName]; // get the state (0 or 1) for the given room of the current entry

			// if at the first entry or there has been a state change (0->1 or 1->0)
			if (currentState == null || currentState != newState) {
				if (currentState != null) {
					// if first entry it won't enter

					//create a new period of presence
					periods.push({
						user_id: userId,
						room_id: roomMap[roomName],
						start_timestamp: startTimestamp!,
						end_timestamp: timestamp,
						value: Number(currentState),
					});
				}

				//state and timestamp for next iteration
				currentState = newState;
				startTimestamp = timestamp;
			}
		}

		// after finding all the periods we have to close the periods that are still "open" with the latest timestamp of the file
		if (currentState != null && startTimestamp != null) {
			periods.push({
				user_id: userId,
				room_id: roomMap[roomName],
				start_timestamp: startTimestamp,
				end_timestamp: format(parseISO(data[data.length - 1].Timestamp), "yyyy-MM-dd HH:mm:ss"),
				value: Number(currentState),
			});
		}
	}

	return periods;
}
