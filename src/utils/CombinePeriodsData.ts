import { toast } from "react-toastify";
import type { Period } from "../types/Types";

/**
 * Combine the usage data from two periods of usage.
 *
 * From oldData it will find the last entry of each room,
 * it then checks for every room present in both oldData and newData if there are entries where
 * the day of start_timestamp in newData overlaps with the days of end_timestamp in oldData.
 * It will merge the two entries if they both have the same value, meaning the period of usage continues between data uploads.
 *
 * @param [newData] - array of data containing the new periods uploaded
 * @param [oldData] - array of data containing the old periods already in the system
 * @param [roomsId] - the ids of the room in the system
 * @returns An array of entries ids that have been modified and a new array of periods with the updated usage of the rooms
 */
export default function combinePeriodsData(
	newData: Period[], // data just uploaded
	oldData: { rowId: string; Period: Period }[], // data already in the system
	roomsId: string[],
): [string[], Period[]] {
	let oldDataPeriods = oldData.map((entry) => entry.Period); // take the period from old data

	// for each room, find the last period in oldData
	const lastPeriodPerRoom = roomsId.map(
		(roomId) => oldDataPeriods.find((entry) => entry.room_id === roomId)!,
	);

	let oldLength = newData.length;

	//if there are periods in newData and oldData that have the same user, room and start_timestamp it means they are duplicate, so they have to be deleted
	newData = newData.filter(
		(entry) =>
			!oldDataPeriods.some(
				(oldEntry) =>
					oldEntry.user_id === entry.user_id &&
					oldEntry.room_id === entry.room_id &&
					oldEntry.start_timestamp === entry.start_timestamp.replace(" ", "T") && // adjusting for different type of format
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
		const newPeriod = newData.find((period) => period.room_id === roomId); // finds the first period of the current room

		// if both periods have the same value
		if (oldPeriod && newPeriod && oldPeriod.value === newPeriod.value) {
			const oldDate = oldPeriod.end_timestamp.slice(0, 10); // takes only the day part
			const newDate = newPeriod.start_timestamp.slice(0, 10);

			// if the day overlaps
			if (oldDate === newDate) {
				oldDataPeriods = oldDataPeriods.map((period, index) => {
					if (period.room_id === roomId && period.end_timestamp === oldPeriod.end_timestamp) {
						alteredRows.push(oldData[index].rowId);
						return { ...period, end_timestamp: newPeriod.end_timestamp };
					}
					return period;
				});

				newData.splice(newData.indexOf(newPeriod), 1); // removes the newP period just used
			}
		}
	});

	return [alteredRows, oldDataPeriods.concat(newData)];
}
