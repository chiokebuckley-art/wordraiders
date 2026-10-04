import test from 'node:test';
import assert from 'node:assert/strict';
import {blankProfile,initialState,validateState} from '../engine.js';

test('writers have isolated films, notes, mission progress and arcade scores',()=>{
 const s=initialState();s.profiles.push(blankProfile('Second writer'));
 const a=s.profiles[0],b=s.profiles[1];
 a.projects[0].fields.logline='My original story';a.progress[0]={answers:[true],checks:[],complete:false};a.arcade.best.test=30;
 assert.notEqual(a.id,b.id);assert.notEqual(a.projects[0].id,b.projects[0].id);
 assert.equal(b.projects[0].fields.logline,undefined);assert.deepEqual(b.progress,{});assert.deepEqual(b.arcade.best,{});
});
test('profile selection and renaming preserve existing writing after reload',()=>{
 const s=initialState();s.profiles[0].projects[0].fields.sparks='Keep my notes';s.profiles[0].name='Chioke';s.profiles.push(blankProfile('Ian'));s.active=1;
 const loaded=validateState(JSON.parse(JSON.stringify(s)));
 assert.equal(loaded.profiles[loaded.active].name,'Ian');assert.equal(loaded.profiles[0].projects[0].fields.sparks,'Keep my notes');
});
test('one-profile exports use the existing backup format without other writers',()=>{
 const p=blankProfile('Myla');p.projects[0].fields.sparks='A missing camera';
 const imported=validateState(JSON.parse(JSON.stringify({version:2,active:0,profiles:[p]})));
 assert.equal(imported.profiles.length,1);assert.equal(imported.profiles[0].projects[0].fields.sparks,'A missing camera');
});
