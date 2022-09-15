export const delay = async (ms: number): Promise<void> => await new Promise(resolve => setTimeout(resolve, ms));

export const round = (
	num: number,
	digits = 2,
): number => Math.round((num + Number.EPSILON) * 10 ** digits) / 10 ** digits;
