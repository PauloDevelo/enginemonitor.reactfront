export function formatDateInUTC(date){
	return "" + date.getUTCFullYear() + "-" + (date.getUTCMonth()+1) + "-" + date.getUTCDate() + "T00:00:00+0000";
}
