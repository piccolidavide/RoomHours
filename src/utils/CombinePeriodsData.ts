import { toast } from "react-toastify";
import type { Period } from "../types/Types";

export default function combinePeriodsData(
	newData: Period[],
	oldData: { rowId: string; Period: Period }[],
	roomsId: string[],
): [string[], Period[]] {
	let oldDataPeriods = oldData.map((entry) => entry.Period); // take the period from old data

	// for each room, find the last period in oldData
	const lastPeriodPerRoom = roomsId.map(
		(roomId) => oldDataPeriods.find((entry) => entry.room_id === roomId)!,
	);

	let oldLength = newData.length;

	//remove the periods that appear both in newData and oldData
	newData = newData.filter(
		(entry) =>
			!oldDataPeriods.some(
				(oldEntry) =>
					oldEntry.user_id === entry.user_id &&
					oldEntry.room_id === entry.room_id &&
					oldEntry.start_timestamp === entry.start_timestamp.replace(" ", "T") &&
					// oldEntry.end_timestamp === entry.end_timestamp &&
					oldEntry.value === entry.value,
			),
	);

	if (oldLength != newData.length)
		toast.error(
			"Duplicate periods found and removed.\nPeriods cannot have the same start time, room and value.",
			{ autoClose: 5000 },
		);

	let alteredRows: string[] = []; // array of row ids that need to be deleted from the database

	/*
	 For each room in newData that is also in oldData, if the start_ts of newData and the end_ts of oldData are on the same day
	 merge them only if the two values are the same
	*/
	roomsId.forEach((roomId, index) => {
		const oldPeriod = lastPeriodPerRoom[index];
		const newPeriod = newData.find((period) => period.room_id === roomId);

		if (oldPeriod && newPeriod && oldPeriod.value === newPeriod.value) {
			const oldDate = oldPeriod.end_timestamp.slice(0, 10);
			const newDate = newPeriod.start_timestamp.slice(0, 10);

			if (oldDate === newDate) {
				oldDataPeriods = oldDataPeriods.map((period, index) => {
					if (period.room_id === roomId && period.end_timestamp === oldPeriod.end_timestamp) {
						alteredRows.push(oldData[index].rowId);
						return { ...period, end_timestamp: newPeriod.end_timestamp };
					}
					return period;
				});

				newData.splice(newData.indexOf(newPeriod), 1); //rimuove dall'array il nuovo periodo usato
			}
		}
	});

	return [alteredRows, oldDataPeriods.concat(newData)];
}
