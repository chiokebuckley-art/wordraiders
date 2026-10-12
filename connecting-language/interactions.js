// Accessible text models: interaction aids, not substitutes for reviewed scene artwork.
export function quantified(id,blue,total=4){
 if(!Number.isInteger(blue)||blue<0||blue>total||!Number.isInteger(total)||total<1)throw Error('Invalid nonempty domain.');
 if(['CD-0239','CD-0240','CD-0248'].includes(id))return blue===total;
 if(['CD-0241','CD-0243','CD-0247'].includes(id))return blue>=1;
 if(id==='CD-0242')return blue===0;
 if(id==='CD-0244')return blue<=1;
 if(id==='CD-0245')return blue===1;
 if(id==='CD-0246')return blue<total;
}
export const models={
 'CD-0001':{title:'Include both items',states:[['Cat only','One drawing is included; this does not model “a cat and a dog”.'],['Cat and dog','Both drawings are included. The connector does not establish causation or a formal subset relation.']]},
 'CD-0016':{title:'Choose from the allowed alternatives',states:[['Apple','The example permits the apple.'],['Pear','The example permits the pear.'],['Both','The example explicitly permits both. Other contexts may limit or.']]},
 'CD-0028':{title:'Compare the properties',states:[['Small and blue','This adds a color; it does not supply the strength contrast.'],['Small but strong','The strength contrasts with an expectation associated with small size here.']]},
 'CD-0045':{title:'Compare fixed-distance trips at steady speeds without stops',states:[['Same route, faster','In this model, the same distance at a higher positive steady speed with no stops takes less time.'],['Same route, slower','In this model, the same distance at a lower positive steady speed with no stops takes more time.']]},
 'CD-0048':{title:'Follow the reason',states:[['Show event','The ground is wet.'],['Reveal stated reason','Because it rained introduces the reason in the example. This is an everyday causal claim, not formal implication.']]},
 'CD-0058':{title:'Follow the stated result',states:[['Show event','It rained.'],['Reveal result','So the ground is wet presents the stated result.']]},
 'CD-0067':{title:'Find the intended purpose',states:[['Show action','I went outside.'],['Reveal purpose','To play states the purpose, without guaranteeing that play happened.']]},
 'CD-0074':{title:'Change the stated condition',states:[['It rains','Under the stated rule, we stay inside.'],['It does not rain','The rule alone does not say what we do in this case.']]},
 'CD-0076':{title:'This rule requires a ticket; other requirements may apply',states:[['No ticket','The stated rule rules out permitted entry without a ticket.'],['Ticket held','The necessary condition is met. Entry is not guaranteed by only if alone.']]},
 'CD-0082':{title:'Prepare before the uncertainty is resolved',states:[['Before weather is known','Take the umbrella as a precaution.'],['Rain occurs','The preparation helps if it rains.'],['No rain occurs','The precaution can still have been sensible; in case did not promise rain.']]},
 'CD-0086':{title:'Keep the outcome in both branches',states:[['Sunny','We go.'],['Cloudy','We go.']]},
 'CD-0088':{title:'Change the order',states:[['Wash → Eat','Washing is before eating.'],['Eat → Wash','Washing is after eating; this reverses the stated instruction.']]},
 'CD-0099':{title:'Identify the starting point',states:[['Show Monday','Monday is the starting time.'],['Show later time','The residence continues from Monday to the later reference point in this example.']]},
 'CD-0120':{title:'Move from claim to illustration',states:[['General statement','Some fruit is yellow.'],['Example','Bananas are yellow illustrates that statement; it does not claim all fruit is yellow.']]},
 'CD-0135':{title:'Find the closing signal',states:[['Discussion','Reasons and evidence come earlier.'],['Final conclusion','In conclusion, the plan is practical signals the final conclusion.']]},
 'CD-0153':{title:'Organize a conversational step',states:[['New step','So, what shall we do next? starts a conversational step.'],['Compare another sense','It rained, so the ground is wet uses a different so sense to introduce a result.']]},
 'CD-0175':{title:'Describe position or movement',states:[['Cup rests on table','On describes the current surface relationship.'],['Cup moves to table','Onto describes the movement to the surface; it is a separate sense.']]},
 'CD-0195':{title:'Follow movement through an interior',states:[['Entrance','The train enters the tunnel.'],['Interior','The train moves inside the tunnel.'],['Other end','The train leaves through the other end: the path passes through the interior.']]},
 'CD-0198':{title:'Move from outside to inside',states:[['Outside → Inside','The ball rolls into the box.'],['Already inside','The ball is in the box: current position is a separate sense.']]},
 'CD-0200':{title:'Move to a surface',states:[['Ground → Table','The cat jumps onto the table.'],['Resting on table','On describes the resulting position, not the movement.']]},
 'CD-0202':{title:'Direction does not guarantee arrival',states:[['Walking toward gate','Movement is in the gate’s direction.'],['Stop before gate','Toward can still describe the movement even though the walkers stop short.']]},
 'CD-0205':{title:'Identify a destination',states:[['Destination: park','To identifies the park as the destination in this example.'],['Compare toward','Toward gives direction without by itself guaranteeing arrival.']]},
 'CD-0215':{title:'A process, not a spatial path',states:[['Practise','Practice is the process used for learning here.'],['Learn through practice','Through connects learning to that process; no tunnel or physical interior is implied.']]},
 'CD-0216':{title:'Recover the referent',states:[['I found a key.','The key is introduced.'],['It was silver.','It refers to that key in this example.']]},
 'CD-0218':{title:'Point to a whole event',states:[['We missed the bus.','An event is introduced.'],['This caused a delay.','This refers to missing the bus, not merely the bus as an object.']]},
 'CD-0224':{title:'Substitute a count noun',states:[['I need a pen.','The kind of thing needed is a pen.'],['Do you have one?','One stands for a pen; it need not be one particular pen introduced earlier.']]},
 'CD-0225':{title:'Recover the plural noun',states:[['Red shoes','Shoes is the noun.'],['Blue ones','Ones stands for shoes, so the phrase means blue shoes.']]},
 'CD-0226':{title:'Recover the action',states:[['Please close the door.','The action is close the door.'],['I will do so.','Do so stands for close the door.']]},
 'CD-0227':{title:'Recover the proposition',states:[['Will it rain?','The proposition concerns whether it will rain.'],['I think so.','So stands for the proposition that it will rain. It does not introduce a result here.']]},
 'CD-0228':{title:'Recover the negative proposition',states:[['Will it rain?','The proposition concerns whether it will rain.'],['I hope not.','The understood proposition is that it will not rain.']]},
 'CD-0232':{title:'Distinguish same choice from same object',states:[['I ordered soup.','The food choice is soup.'],['Jo ordered the same.','Jo made the same food choice; this does not require a shared physical bowl.']]},
};
export function relationshipControl(r,el,button,comparison){
 const panel=el('section');panel.append(el('p','Interactive text model · another explicitly stated example.'));
 const output=el('p',undefined,'feedback');output.setAttribute('role','status');output.setAttribute('aria-live','polite');
 if(Number(r.id.slice(3))>=239){
  panel.append(el('h3','Change a fixed set of four circles'));const selected=new Set(),controls=el('div');
  const update=()=>{output.textContent=selected.size+' of 4 circles are blue. '+r.term+': '+(quantified(r.id,selected.size)?'True':'False')+'. The domain stays these four circles.';};
  for(let i=1;i<=4;i++){const b=button('Circle '+i+' · not blue',()=>{if(selected.has(i))selected.delete(i);else selected.add(i);b.setAttribute('aria-pressed',String(selected.has(i)));b.textContent='Circle '+i+' · '+(selected.has(i)?'blue':'not blue');update();});b.setAttribute('aria-pressed','false');controls.append(b);}
  panel.append(controls,output);update();
 }
 const model=models[r.id];if(!model&&!comparison)return null;if(model){panel.append(el('h3',model.title));const controls=el('div');for(const [label,description]of model.states)controls.append(button(label,()=>{output.textContent=description;}));panel.append(controls,output);output.textContent=model.states[0][1];}
 if(comparison&&comparison.senseId===r.id&&comparison.content_version===r.content_version&&comparison.term===r.term){const compare=el('section');compare.append(el('h3','Change this authored situation'),el('p','Both situations may be possible. Explain the change; different wording is not automatically wrong.'));if(comparison.editorial_blocked)compare.append(el('p','Editorial workshop only: the original source example is unresolved. These proposed clarifications are not approved teaching or answer keys.','warn'));if(comparison.supplemental_context)compare.append(el('p','For the first situation: '+comparison.supplemental_context,'example'));const display=el('p',comparison.scene,'example'),why=el('p',comparison.explanation,'feedback');display.setAttribute('role','status');display.setAttribute('aria-live','polite');const a=button('Use authored situation',()=>{display.textContent=comparison.scene;a.setAttribute('aria-pressed','true');b.setAttribute('aria-pressed','false');}),b=button('Use changed situation',()=>{display.textContent=comparison.changed;a.setAttribute('aria-pressed','false');b.setAttribute('aria-pressed','true');});a.setAttribute('aria-pressed','true');b.setAttribute('aria-pressed','false');compare.append(a,b,display,why);panel.append(compare);}return panel;
}
