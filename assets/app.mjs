import {RequestDesk,Brain,SiteManager,REQUEST_PRESETS,SOURCES,extractRequest} from './models.mjs';
const $=id=>document.getElementById(id);
const text=(id,v)=>{$(id).textContent=v;};
const show=(id,v)=>{$(id).hidden=!v;};
function node(tag,value,cls){const n=document.createElement(tag);if(value!==undefined)n.textContent=value;if(cls)n.className=cls;return n;}
function stage(n,message){document.querySelectorAll('[data-step]').forEach(el=>{if(Number(el.dataset.step)===n)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});if($('status'))text('status',message);}
function clearReceipt(){currentReceipt=null;if($('receipt-panel'))show('receipt-panel',false);}
let currentReceipt=null;
function renderReceipt(r){currentReceipt=r;show('receipt-panel',true);text('receipt-summary',r.outcome.charAt(0).toUpperCase()+r.outcome.slice(1)+'. '+r.nextStep);text('receipt-json',JSON.stringify(r,null,2));stage(4,r.nextStep);}
function action(id,fn){$(id).addEventListener('click',()=>{try{fn();}catch(e){stage(1,e.message);}});}
if($('download'))action('download',()=>{if(!currentReceipt)return;const blob=new Blob([JSON.stringify(currentReceipt,null,2)],{type:'application/json'});const u=URL.createObjectURL(blob);const a=node('a');a.href=u;a.download='juniper-table-'+document.body.dataset.page+'-receipt.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);});
function presetButtons(container,items,choose){items.forEach((p,i)=>{const b=node('button',p.label,'secondary');b.type='button';b.setAttribute('aria-pressed',String(i===0));b.addEventListener('click',()=>{container.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));choose(p);});container.append(b);});}
const page=document.body.dataset.page;
if(page==='home'){
 function mini(){const r=extractRequest($('mini-input').value);text('mini-title',r.missing.length?'Not ready to promise.':'Facts found. Judgment next.');text('mini-output',r.missing.length?'Missing: '+r.missing.join(', ')+'. Ask for the details before promising a table. Availability still needs a human check.':'Four fields found. Availability, pricing, and special requirements still need a human check. No booking confirmed.');}
 action('mini-run',mini);$('mini-input').addEventListener('input',mini);mini();
}
if(page==='request'){
 let model=new RequestDesk();
 function render(){const r=model.result;show('request-result',Boolean(r));show('request-empty',!r);clearReceipt();if(!r)return;const list=$('facts');list.replaceChildren();for(const [k,v]of Object.entries(r.fields)){const div=node('div');div.append(node('dt',k),node('dd',v));if(r.evidence?.[k]){const e=node('small','From: “'+r.evidence[k]+'”','field-evidence');div.append(e);}list.append(div);}text('missing',r.missing.length?'Ask for: '+r.missing.join(', ')+'.':'All four supported fields found. This is still an enquiry, not a confirmed booking.');text('risk',r.sensitive?'Safety-sensitive language detected. Hold for direct manager review; do not promise allergen safety.':'Availability, discounts, and special requests have not been checked.');$('safe-draft').value=model.draft;stage(3,'Draft prepared. Read the facts and the reply, then decide. Nothing sent.');}
 function prepare(){model.analyze($('request-input').value);render();}
 presetButtons($('request-presets'),REQUEST_PRESETS,p=>{$('request-input').value=p.text;prepare();});
 $('request-input').addEventListener('input',()=>{model.editInput($('request-input').value);render();document.querySelectorAll('#request-presets button').forEach(b=>b.setAttribute('aria-pressed','false'));stage(1,'Message changed. Prepare again; previous review and decision cleared.');});
 $('safe-draft').addEventListener('input',()=>{model.editDraft($('safe-draft').value);clearReceipt();stage(3,'Reply edited. Previous decision revoked. Review the whole draft again.');});
 action('analyze',prepare);
 for(const [id,outcome]of [['approve-request','approved'],['changes-request','changes requested'],['hold-request','hold']])action(id,()=>{model.decide(outcome);renderReceipt(model.receipt);});
 action('reset',()=>{model=new RequestDesk();$('request-input').value=REQUEST_PRESETS[0].text;prepare();});
 $('request-input').value=REQUEST_PRESETS[0].text;prepare();
}
if(page==='brain'){
 let model=new Brain();
 for(const s of SOURCES){const div=node('article',undefined,'source');div.id=s.id;div.append(node('small',s.id+' · Approved fictional source'),node('h3',s.title),node('p',s.excerpt));$('sources').append(div);}
 function render(){clearReceipt();const a=model.answer;show('brain-result',!!a);show('brain-empty',!a);if(!a)return;text('answer-kind',a.kind==='supported'?'Supported by approved excerpts':a.kind==='refused'?'Refused: not an approved request':'Unknown: manager review needed');text('answer',a.text);$('citations').replaceChildren();for(const c of a.citations){const block=node('div',undefined,'citation');const link=node('a',c.id+' / '+c.title+' ↗');link.href='#'+c.id;link.addEventListener('click',()=>{$('source-drawer').open=true;});block.append(link,node('blockquote',c.excerpt));$('citations').append(block);}$('approve-answer').disabled=a.kind!=='supported';stage(3,a.kind==='supported'?'Read the exact excerpts before approving for reference.':'No complete supported answer. Escalate instead of guessing.');}
 function ask(){model.ask($('question').value);render();}
 presetButtons($('brain-presets'),[{label:'Opening hours',text:'What are your hours?'},{label:'Patio policy',text:'Is the patio open?'},{label:'Group request',text:'What is the group policy?'},{label:'Event',text:'What event is coming up?'},{label:'A question it should hold',text:'Are you open Sunday at 9 am and is everything free?'}],p=>{$('question').value=p.text;ask();});
 $('question').addEventListener('input',()=>{model.edit($('question').value);render();document.querySelectorAll('#brain-presets button').forEach(b=>b.setAttribute('aria-pressed','false'));stage(1,'Question changed. Previous answer and approval cleared.');});
 action('ask',ask);action('approve-answer',()=>{model.decide('approved');renderReceipt(model.receipt);});action('escalate-answer',()=>{model.decide('escalated');renderReceipt(model.receipt);});action('reset',()=>{model=new Brain();$('question').value='What are your hours?';ask();});ask();
}
if(page==='site'){
 let model=new SiteManager();
 let previewMode='draft';
 function preview(){const values=previewMode==='draft'?model.draft:model.live;for(const k of ['hours','event','patio'])text('live-'+k,values[k]);$('undo-site').disabled=!model.previous;text('preview-title',previewMode==='draft'?'Draft preview / not published':'Local published preview');$('view-draft').setAttribute('aria-pressed',String(previewMode==='draft'));$('view-published').setAttribute('aria-pressed',String(previewMode==='published'));}
 action('view-draft',()=>{previewMode='draft';preview();});
 action('view-published',()=>{previewMode='published';preview();});
 function inputs(){for(const k of ['hours','event','patio'])$(k).value=model.draft[k];}
 function invalidate(){clearReceipt();show('site-review',false);$('publish-site').disabled=true;preview();stage(1,'Draft changed. Review and approval cleared. The local published version is unchanged.');}
 for(const k of ['hours','event','patio'])$(k).addEventListener('input',()=>{model.edit(k,$(k).value);invalidate();});
 action('site-preset',()=>{model.edit('patio','The patio is closed today due to rain. Come inside for a warm seat.');model.edit('event','Autumn Table gathering moves indoors. October 17, 2026, from 2pm to 4pm.');inputs();invalidate();});
 action('review-site',()=>{const changes=model.review();$('diff').replaceChildren();for(const c of changes){const d=node('div',undefined,'diff-item');d.append(node('strong',c.key),node('span','Before'),node('p',c.before),node('span','After'),node('p',c.after,'after'));$('diff').append(d);}show('site-review',true);$('approve-site').disabled=false;$('publish-site').disabled=true;stage(3,'Compare each changed field. Approve only if this exact draft is correct.');});
 action('approve-site',()=>{model.approve();$('publish-site').disabled=false;$('approve-site').disabled=true;stage(3,'This exact draft is approved. Publish changes only the DEMO preview.');});
 action('publish-site',()=>{model.publish();previewMode='published';preview();show('site-review',false);$('publish-site').disabled=true;renderReceipt(model.receipt);});
 action('undo-site',()=>{model.undo();inputs();preview();show('site-review',false);$('publish-site').disabled=true;renderReceipt(model.receipt);});
 action('reset',()=>{model=new SiteManager();inputs();preview();invalidate();stage(1,'Original fictional cafe restored. Try a rainy-day update or edit a field.');});inputs();preview();stage(1,'The cafe preview is ready. Try a rainy-day update or edit a field.');
}
