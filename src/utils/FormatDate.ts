/**
 * Formats a date object to a string in the form yyyy-MM-dd.
 *
 * @param [date]- date object to be formatted
 * @returns A formatted string of the date
 */
export function formatDate(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0"); // months start at 0, need to add 1. pad to add 0 the months 1 through 9
	const day = String(date.getDate()).padStart(2, "0"); // pad to add 0 the days 1 through 9

	return `${year}-${month}-${day}`;
}

/**
 * Returns a date object from a string containing the year, month and day
 *
 * @param [date] the yyyy-MM-dd string to transform into a date
 * @returns A date object representing the date of the string
 */
export function getDateFromString(date: string): Date {
	const [year, month, day] = date.split("-").map(Number);

	return new Date(year, month - 1, day);
}
