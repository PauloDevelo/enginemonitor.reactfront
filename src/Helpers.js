export function convertDateOrDefault(date){
	var installationDateStr = '';
	if(date !== undefined){
		if(date.toISOString !== undefined){
			installationDateStr = date.toISOString().substr(0, 10);
		}
		else{
			installationDateStr = new Date(date).toISOString().substr(0, 10);
		}
	}
	else{
		installationDateStr = new Date().toISOString().substr(0, 10);
	}
	
	return installationDateStr;
}

export function formatDateInUTC(date){
	return "" + date.getUTCFullYear() + "-" + (date.getUTCMonth()+1) + "-" + date.getUTCDate() + "T00:00:00+0000";
}
