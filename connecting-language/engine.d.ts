export interface Session {ids:string[];seen:string[];at:number;completedAt:number;completedDay:string}
export interface OpenResponse {senseId:string;exerciseId:string;text:string;spoken:boolean;at:number;contentVersion:number;status:'human-feedback-pending';prompt?:string;context?:string}
export interface ReviewWorksheet {responseAt:number;responseText:string;reviewerLabel:string;feedback:string;ratings:Record<string,string>;at:number;status:'unverified-human-annotation'}
export interface ConnectingProgress {version:1;sessions:Record<string,Session>;exposures:Record<string,number>;attempts:Record<string,{senseId:string;exerciseId:string;answer:string;at:number;contentVersion:number;exerciseVersion:number;reviewedAtAttempt:boolean;conflicted:boolean;exerciseRevision?:number;reviewSnapshot?:string;senseSnapshot?:string}>;notes:Record<string,{text:string;at:number;review:'pending'}>;responses:Record<string,OpenResponse>;worksheets:Record<string,ReviewWorksheet>}
export function validId(id:unknown):boolean;
export function localDay(now:number):string;
export function fresh():ConnectingProgress;
export function formalTruth(id:string,p:boolean,q:boolean):boolean|undefined;
export function usableAsset(asset:unknown,sense:unknown):boolean;
export function parse(raw:unknown):ConnectingProgress;
export function merge(a:unknown,b:unknown):ConnectingProgress|undefined;
export function status(raw:unknown,now:number):{done:boolean;available:boolean;count:number};
export function begin(raw:unknown,now:number,catalog:{id:string;level:number}[]):{state:ConnectingProgress;day:string};
export function acknowledge(raw:unknown,day:string,id:string,now:number):ConnectingProgress;
export function recordAttempt(raw:unknown,key:string,sense:{id:string;content_version:number;publication_status?:string;review_status?:string;reviewer?:string|null;reviewed_at?:string|null;editorial_finding_ids?:string[];editorial_resolved_at?:string},exercise:{id:string;senseId:string;content_version?:number;publication_status?:string;review_status?:string;reviewer?:string|null;reviewed_at?:string|null;mode?:string;choices:{id:string}[]},answer:string,now:number):ConnectingProgress;
export function reviewEvidence(raw:unknown,sense:{id:string;publication_status?:string;editorial_finding_ids?:string[];editorial_resolved_at?:string;review_status:string;reviewer?:string|null;reviewed_at?:string|null;content_version:number},exercises:{id:string;senseId:string;mode?:string;publication_status?:string;review_status:string;reviewer?:string|null;reviewed_at?:string|null;content_version:number;new_context?:boolean;accepted_answers?:string[];choices?:{id:string;text?:string}[]}[],now:number):{state:string;passed:boolean;retained:boolean;due?:boolean};
export function save(storage:Pick<Storage,'getItem'|'setItem'>,playerId:string,fn:(state:ConnectingProgress)=>ConnectingProgress,now:number,allowPrivateText?:boolean):ConnectingProgress;

export function recordResponse(raw:unknown,key:string,sense:{id:string;content_version:number},exercise:{id:string;senseId:string;content_version:number;mode:string;choices?:unknown[];prompt?:string;context?:string},text:string,spoken:boolean,now:number):ConnectingProgress;
export function recordWorksheet(raw:unknown,key:string,reviewerLabel:string,ratings:Record<string,string>,feedback:string,now:number,expectedAt:number,expectedText:string):ConnectingProgress;

export function assessmentItems(sense:{id:string;content_version:number},exercises:unknown[]):unknown[];

export function privateKey(playerId:string):string;
export function loadProgress(storage:Pick<Storage,'getItem'>,playerId:string,raw:unknown):ConnectingProgress;
export function redactPlayer<T>(player:T):T;
export function redactText(data:string):string;

export function clearDeviceData(storage:Pick<Storage,'getItem'|'removeItem'>,playerId:string):void;

export function publicFingerprint(player:unknown):string;
