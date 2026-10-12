export function reviewSnapshot(item:Record<string,unknown>,type:'sense'|'exercise'|'asset'|'context'):string;
export function aiReviewComplete(item:Record<string,unknown>,type:'sense'|'exercise'|'asset'|'context'):boolean;
export function reviewedItem(item:Record<string,unknown>,type:'sense'|'exercise'|'asset'|'context'):boolean;
export function reviewDigest(item:Record<string,unknown>,type:'sense'|'exercise'|'asset'|'context'):string;
