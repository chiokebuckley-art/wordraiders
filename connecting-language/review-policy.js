import {sha256} from './review-digest.js';
// AI review records are editorial evidence, never educator certification or learner mastery.
// The snapshot makes edits invalidate approval until the changed item is reviewed again.
const fields={
 sense:['id','term','meaning','example','category','content_version','word_classes','component_word_classes','expression_grammar','relation_tags','syntax_frames','grammar_note','supplemental_context','editorial_finding_ids'],
 exercise:['id','senseId','content_version','exercise_revision','mode','kind','prompt','context','choices','accepted_answers','explanation','new_context','coaching_notes'],
 context:['senseId','content_version','term','meaning','example','kind','title','facts','relationship','fact_basis','raster_policy','question_mapping','geometry'],
 asset:['senseId','content_version','term','meaning','example','kind','mime','sha256','alt_text','context_limits','scene_caption']
};
const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])])):value;
export function reviewSnapshot(item,type){if(!fields[type])throw Error('Unknown review item type.');const keys=type==='context'?Object.keys(item).filter(key=>!['review_status','publication_status','reviewer','reviewed_at','reviewer_type','review_policy','review_evidence','human_review_required','human_approved','educator_approval'].includes(key)):fields[type];return JSON.stringify(canonical(Object.fromEntries(keys.filter(key=>item[key]!==undefined).map(key=>[key,item[key]]))));}
export function aiReviewComplete(item,type){
 const evidence=item?.review_evidence;
 return item?.reviewer_type==='ai'&&item.review_policy==='ai-independent-v1'&&item.educator_approval===false&&item.human_approved!==true&&item.human_review_required===false&&
 evidence?.snapshot===reviewSnapshot(item,type)&&Array.isArray(evidence.reviews)&&evidence.reviews.length>=2&&
 evidence.reviews.every(r=>r&&typeof r==='object'&&r.verdict==='pass'&&typeof r.reviewer==='string'&&r.reviewer.trim()&&typeof r.rationale==='string'&&r.rationale.trim()&&typeof r.reviewed_at==='string'&&Number.isFinite(Date.parse(r.reviewed_at)))&&
 new Set(evidence.reviews.map(r=>r.reviewer)).size>=2;
}
export function reviewedItem(item,type){return !!item&&item.review_status==='reviewed'&&item.publication_status==='published'&&typeof item.reviewer==='string'&&!!item.reviewer.trim()&&typeof item.reviewed_at==='string'&&Number.isFinite(Date.parse(item.reviewed_at))&&aiReviewComplete(item,type);}

export const reviewDigest=(item,type)=>sha256(reviewSnapshot(item,type));
