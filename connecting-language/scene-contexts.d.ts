export type SceneContext={senseId:string;content_version:number;term:string;meaning:string;example:string;kind:string;title:string;facts:string[][];relationship:string;review_status:string;publication_status:string;human_approved:boolean;educator_approval:boolean;raster_policy:string;question_mapping:string;question_ids:string[];trips?:{distanceKm:number;speedKmh:number;minutes:number}[];results?:{team:string;before:number;after:number;attempts:number}[]};
export const sceneContexts:Record<string,SceneContext>;
export function contextForSense(sense:{id:string;content_version:number;term:string;meaning:string;example:string}):SceneContext|null;
export function stripGeometry(joined?:boolean):{long:{x:number;y:number;width:number;height:number};short:{x:number;y:number;width:number;height:number};copies:{x:number;y:number;width:number;height:number}[]};
export function equalLengthGeometry():{x:number;y:number;width:number;height:number}[];

export function underneathGeometry():{mat:{x:number;y:number;width:number;height:number};key:{x:number;y:number;width:number;height:number}};
