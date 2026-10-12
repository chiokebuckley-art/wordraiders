interface Sense {id:string;content_version:number}
interface Exercise {id:string;senseId:string;mode:string;exercise_revision?:number}
export interface LessonCursor {playerId:string;day:string;view:'lesson'|'assessment';senseId:string;revision:string;daily:boolean;sessionDay:string;phase?:number;questionIndex:number;attemptDay?:string;bankIds?:string[]}
export function cursorKey(playerId:string):string;
export function lessonRevision(sense:Sense,bank:Exercise[]):string;
export function readCursor(raw:string|null,playerId:string,day:string,catalog:Sense[],exercises:Exercise[]):LessonCursor|null;
export function learnerPrompt(prompt:string):string;
