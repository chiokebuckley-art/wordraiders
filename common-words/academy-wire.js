// Keep the Academy learner identity when its save travels through WordRaiders.
export function toWordRaiders(raw){
 if(raw?.app!=='small-common-word-academy'||raw.version!==1)return raw;
 if(!raw.learner||!raw.academy||!raw.records)throw Error('Invalid Academy save.');
 return {version:2,name:raw.learner.name,savedAt:raw.updatedAt||0,xp:0,commonWords:{...raw.academy,records:raw.records,syncLearner:raw.learner}};
}
