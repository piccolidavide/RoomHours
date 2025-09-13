import type { Period } from "../types/Types";

export default function combinePeriodsData(
	newData: Period[],
	oldData: { rowId: string; Period: Period }[],
	roomsId: string[],
): [string[], Period[]] {
	//const rowIDs = oldData.map(entry => entry.rowId);
	let oldDataPeriods = oldData.map((entry) => entry.Period);

	const lastPeriodPerRoom = roomsId.map(
		(roomId) => oldDataPeriods.find((entry) => entry.room_id === roomId)!,
	);

	let alteredRows: string[] = [];

	//per ogni stanza in newData che è anche in oldData, se start_ts di newData e end_ts di oldData sono nello stesso giorno
	//li unisco solo se i due value hanno lo stesso valore
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

	// console.log("alteredRows: ", alteredRows);
	// console.log("result: ", oldDataPeriods);
	// console.log("result: ", oldData.concat(newData));

	return [alteredRows, oldDataPeriods.concat(newData)];
}
