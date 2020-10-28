export function defaultArgs(checkOpt, defaultOpt){
	if(!checkOpt) return defaultOpt;

	let output = checkOpt;
	const checkOptP = Object.keys(checkOpt);
	for(const p in defaultOpt){
		if(!checkOptP.includes(p)){
			output[p] = defaultOpt[p];
		}
	}

	return output;
}
