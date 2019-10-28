export function formatDateInUTC(date: Date): string{
	return "" + date.getUTCFullYear() + "-" + (date.getUTCMonth()+1) + "-" + date.getUTCDate() + "T00:00:00+0000";
}

export function scrollTo(left: number, top: number, scrollDuration: number) {
	const minimumStepInMs = 5;
	const nbSteps = scrollDuration / minimumStepInMs;

	var scrollStepY = (top - window.scrollY) / nbSteps;
	var scrollStepX = (left - window.scrollX) / nbSteps;

	let counter = 0;
	var scrollInterval = setInterval(
		() => {
			if(counter++ <= nbSteps){
				window.scrollBy( scrollStepX, scrollStepY );
			}
			else{
				clearInterval(scrollInterval);
			}
		},
		minimumStepInMs
	);
}
