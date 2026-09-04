#!/usr/bin/env python3
"""Static checks for the isolated ClearPath demo package."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
import json,re
ROOT=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
    def __init__(self):
        super().__init__();self.ids=[];self.links=[];self.assets=[];self.copy=[];self.hidden=0
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a:self.ids.append(a['id'])
        if tag in {'script','style'}:self.hidden+=1
        if tag=='a':self.links.append(a.get('href',''))
        if tag in {'script','img','link'}:
            u=a.get('src') or a.get('href')
            if u:self.assets.append(u)
    def handle_endtag(self,tag):
        if tag in {'script','style'}:self.hidden=max(0,self.hidden-1)
    def handle_data(self,data):
        if not self.hidden:self.copy.append(data)
pages={p:Page() for p in ROOT.rglob('index.html') if 'evidence' not in p.parts}
checks=[]
def check(name,ok):checks.append({'name':name,'pass':bool(ok)})
for p,parser in pages.items():parser.feed(p.read_text())
check('exactly five static routes',len(pages)==5)
for p,parser in pages.items():
    rel=str(p.relative_to(ROOT));html=p.read_text();text=' '.join(parser.copy)
    check(rel+' no duplicate IDs',len(parser.ids)==len(set(parser.ids)))
    check(rel+' no em dash',not any(s in text for s in ['\u2014','&mdash;']))
    check(rel+' no banned marketing terms',not re.search(r'\b(synergy|leverage|unlock|transform|revolutioniz\w*|cutting-edge|game-changer)\b',text,re.I))
    check(rel+' indexable metadata','index,follow' in html and 'noindex' not in html)
    check(rel+' disallows network connections',"connect-src 'none'" in html)
    check(rel+' disallows form sends',"form-action 'none'" in html)
    for href in set(parser.links+parser.assets):
        url=urlsplit(href)
        check(rel+' allowed asset/link '+href, (not url.scheme and not url.netloc) or href in {'mailto:JWhalen@ClearPathWV.com','https://www.clearpathwv.com/','https://www.clearpathwv.com/demos/','https://www.clearpathwv.com/demos/request-desk/','https://www.clearpathwv.com/demos/business-brain/','https://www.clearpathwv.com/demos/website-manager/','https://cal.com/justin-whalen-xpjqtn/free-15-minute-fit-call','https://book.stripe.com/3cI14nfbRcWe4uadBJ6Vq05','https://buy.stripe.com/fZu28rbZFaO64ua9lt6Vq06','https://buy.stripe.com/14A4gz6FlbSa6CifJR6Vq07','https://buy.stripe.com/9B614n3t9f4m1hY9lt6Vq08'})
        if url.scheme or url.netloc:continue
        target=(ROOT/url.path.lstrip('/')) if url.path.startswith('/') else (p.parent/url.path)
        if not url.path:target=p
        elif target.is_dir():target=target/'index.html'
        check(rel+' target exists '+href,target.is_file())
        if url.fragment:
            check(rel+' fragment '+href,target in pages and url.fragment in pages[target].ids)
for p in (ROOT/'assets').glob('*.mjs'):
    code=p.read_text()
    check(p.name+' no network or persistent storage',not re.search(r'\b(fetch|XMLHttpRequest|WebSocket|localStorage|sessionStorage|indexedDB|sendBeacon)\b',code))
report={'checks':checks,'passed':sum(c['pass'] for c in checks),'failed':sum(not c['pass'] for c in checks)}
(ROOT/'evidence'/'static-qa.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'passed':report['passed'],'failed':report['failed'],'failures':[c for c in checks if not c['pass']]},indent=2))
raise SystemExit(1 if report['failed'] else 0)
