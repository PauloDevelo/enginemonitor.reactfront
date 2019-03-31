export function formatDateInUTC(date: Date): string{
	return "" + date.getUTCFullYear() + "-" + (date.getUTCMonth()+1) + "-" + date.getUTCDate() + "T00:00:00+0000";
}
