export const REQUEST_PRESETS = [
  {label:'An everyday email',text:'Name: Avery Morgan\nHey team, could we bring 12 people from our book club on 2026-10-12? We would love the patio. You can reach me at avery@example.test. What do you need from us?'},
  {label:'Missing the details',text:'Name: Sam Rivera\nCould we get a table next week for some friends? Please confirm the booking and a group discount.'},
  {label:'A sensitive request',text:'Name: Casey Lee\nEmail: casey@example.test\nDate: 2026-10-15\nGuests: 8\nCan you guarantee a nut-free meal for someone with a severe allergy?'}
];

export function extractRequest(text) {
  const fields = {}, evidence = {}, missing = [];
  const natural = {
    email:/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    date:/\b\d{4}-\d{2}-\d{2}\b/g,
    guests:/\b([1-9]\d{0,2})\s+(?:people|guests)\b/gi
  };
  const ambiguous = /\b(?:not|instead|cancel|no longer|correction|previously)\b/i.test(text);
  for (const key of ['name','email','date','guests']) {
    const matches = [...text.matchAll(new RegExp('^'+key+':[ \\t]*([^\\r\\n]*)$','gim'))];
    let value = matches.length === 1 ? matches[0][1].trim() : '';
    let excerpt = matches.length === 1 ? matches[0][0].trim() : '';
    if (!matches.length && natural[key] && !ambiguous) {
      const found = [...text.matchAll(natural[key])];
      if (found.length === 1) {
        value = key === 'guests' ? found[0][1] : found[0][0];
        excerpt = found[0][0];
      }
    }
    if (key === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) value = '';
    if (key === 'guests' && !/^[1-9]\d{0,2}$/.test(value)) value = '';
    if (key === 'date' && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value)) || new Date(value).toISOString().slice(0,10) !== value)) value = '';
    fields[key] = value || 'Not provided';
    if (value) evidence[key] = excerpt;
    else missing.push(key);
  }
  const sensitive = /allerg|medical|nut.free|guarantee|payment|card number|celiac|coeliac|cross[ -]?contamination|anaphyla|intoleran/i.test(text);
  const draft = 'Thank you for contacting Juniper Table. We have noted your enquiry'+
    (fields.date !== 'Not provided' ? ' for '+fields.date : '')+'. '+
    (missing.length ? 'Could you please provide: '+missing.join(', ')+'? ' : '')+
    'Our team needs to check availability and any special requirements before confirming anything. '+
    (sensitive ? 'A manager must review the sensitive details directly. ' : '')+
    'This is not a confirmed booking.';
  return {fields,evidence,missing,sensitive,ambiguous,draft,notes:[
    'Literal extraction only: labeled fields, one email address, one ISO date, and one count of people or guests. Ambiguous free text goes to a person.',
    'Availability, pricing, discounts, and safety cannot be verified here.'
  ]};
}

const receipt = (demo,outcome,data) => ({
  demo,business:'Juniper Table (fictional)',outcome,recordedAt:new Date().toISOString(),
  mode:'Browser-only deterministic demo. No live AI.',sent:false,deployed:false,
  ...structuredClone(data)
});

export class RequestDesk {
  constructor() { this.input=''; this.result=null; this.draft=''; this.receipt=null; this.preparedInput=null; }
  editInput(value) { this.input=value; this.result=null; this.draft=''; this.receipt=null; this.preparedInput=null; }
  analyze(value) {
    this.editInput(value);
    if (!value.trim() || value.length>2000) throw Error('Add a request of 1 to 2,000 characters.');
    this.result=extractRequest(value); this.draft=this.result.draft; this.preparedInput=value;
  }
  editDraft(value) { this.draft=value; this.receipt=null; }
  decide(outcome) {
    if (!this.result || this.input!==this.preparedInput) throw Error('Prepare this exact request first.');
    if (!['approved','changes requested','hold'].includes(outcome)) throw Error('Invalid decision.');
    if (!this.draft.trim() || this.draft.length>3000) throw Error('The reply needs 1 to 3,000 characters.');
    this.receipt=receipt('Request Desk',outcome,{
      input:this.input,extraction:this.result,draft:this.draft,
      nextStep:outcome==='approved'?'Draft approved locally for human follow-up. Nothing sent.':'Human follow-up required. Nothing sent.'
    });
  }
}

export const SOURCES = [
  {id:'JT-01',title:'Opening hours',excerpt:'Juniper Table opens Tuesday through Sunday, 8am to 4pm. The cafe is closed on Mondays.'},
  {id:'JT-02',title:'Patio guidance',excerpt:'Patio seating is weather-dependent. Staff must confirm patio availability on the day; no patio table is guaranteed.'},
  {id:'JT-03',title:'Group enquiries',excerpt:'Groups of eight or more require manager review. A request is not a booking until a team member confirms it.'},
  {id:'JT-04',title:'Community event',excerpt:'The fictional Autumn Table gathering is on October 17, 2026, from 2pm to 4pm. Reservations and pricing are not listed in this source.'}
];
const hoursQuery = /^(?:are you|is the cafe) open (?:on )?(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)(?: at (?:[1-9]|1[0-2])(?::[0-5]\d)?\s*(?:am|pm))?$/;

export function answerQuestion(question) {
  const q=question.toLowerCase().trim().replace(/[?!.,]/g,' ').replace(/\s+/g,' ').trim();
  if (/ignore|password|secret|system prompt|override|instructions|<script|onerror/.test(q)) {
    return {kind:'refused',text:'Instructions in a question are not an approved source. I cannot reveal secrets or change the review rules.',citations:[]};
  }
  const groups = [
    /^(hours|opening hours|what are your hours|when are you open|what are the opening hours)$/,
    /^(patio|is the patio open|what is the patio policy|can i reserve the patio)$/,
    /^(groups|group policy|what is the group policy|can you book a group of \d{1,3})$/,
    /^(events|event|what event is coming up|when is the autumn table gathering)$/
  ];
  const parts=q.split(/\s+(?:and|also)\s+|;\s*/);
  const indices=parts.map(p=>hoursQuery.test(p.trim())?0:groups.findIndex(rx=>rx.test(p.trim())));
  if (!q || indices.some(i=>i<0)) return {
    kind:'unknown',text:'The approved sources do not fully support this question. No answer has been approved. Ask a narrower question or escalate the whole request to a manager.',citations:[]
  };
  const citations=[...new Set(indices)].map(i=>({...SOURCES[i]}));
  const caveat=parts.some(p=>hoursQuery.test(p.trim()))?'\n\nThis is the normal hours source, not a date-specific confirmation. Holidays, exceptions, and availability require a person to check.':'';
  return {kind:'supported',text:citations.map(c=>c.excerpt).join('\n\n')+caveat,citations};
}

export class Brain {
  constructor() { this.question=''; this.answer=null; this.receipt=null; this.answeredQuestion=null; }
  edit(value) { this.question=value; this.answer=null; this.receipt=null; this.answeredQuestion=null; }
  ask(value) {
    this.edit(value);
    if (!value.trim() || value.length>1000) throw Error('Enter a question of 1 to 1,000 characters.');
    this.answer=answerQuestion(value); this.answeredQuestion=value;
  }
  decide(outcome) {
    if (!this.answer || this.question!==this.answeredQuestion) throw Error('Check the sources for this exact question first.');
    if (outcome==='approved' && this.answer.kind!=='supported') throw Error('Only fully supported answers can be approved.');
    if (!['approved','escalated'].includes(outcome)) throw Error('Invalid decision.');
    this.receipt=receipt('Business Brain',outcome,{
      question:this.question,answer:this.answer,
      nextStep:outcome==='approved'?'Answer approved for reference only. Nothing sent.':'Manager review requested locally. No notification sent.'
    });
  }
}

export const INITIAL_SITE = {
  hours:'Tuesday to Sunday, 8am to 4pm. Closed Monday.',
  event:'Autumn Table gathering · October 17, 2026 · 2pm to 4pm.',
  patio:'Weather-dependent. Ask our team about seating today.'
};

export class SiteManager {
  constructor() { this.live={...INITIAL_SITE}; this.draft={...this.live}; this.reviewed=null; this.approved=null; this.previous=null; this.receipt=null; }
  edit(key,value) {
    if (!Object.hasOwn(this.draft,key)) throw Error('Unsupported field.');
    this.draft[key]=value; this.reviewed=null; this.approved=null; this.receipt=null;
  }
  changes() { return Object.keys(this.draft).filter(k=>this.draft[k]!==this.live[k]).map(key=>({key,before:this.live[key],after:this.draft[key]})); }
  review() {
    if (Object.values(this.draft).some(v=>!v.trim()||v.length>240)) throw Error('Each field needs 1 to 240 characters.');
    if (!this.changes().length) throw Error('Change at least one field before review.');
    this.reviewed=JSON.stringify(this.draft); this.approved=null; return this.changes();
  }
  approve() {
    if (!this.reviewed || this.reviewed!==JSON.stringify(this.draft)) throw Error('Review this exact draft first.');
    this.approved=this.reviewed;
  }
  publish() {
    if (!this.approved || this.approved!==JSON.stringify(this.draft)) throw Error('Approve this exact draft first.');
    const changes=this.changes(); this.previous={...this.live}; this.live={...this.draft}; this.approved=null; this.reviewed=null;
    this.receipt=receipt('Website Manager','published in local demo',{changes,preview:{...this.live},nextStep:'Only this page changed. No website was deployed.'});
  }
  undo() {
    if (!this.previous) throw Error('No local change to undo.');
    this.live={...this.previous}; this.draft={...this.live}; this.previous=null; this.approved=null; this.reviewed=null;
    this.receipt=receipt('Website Manager','undone in local demo',{preview:{...this.live},nextStep:'Previous local preview restored. No website was deployed.'});
  }
}
