import type {IncomingMessage,ServerResponse} from 'node:http';
export type Json=Record<string,unknown>;
export class HttpError extends Error{
  status:number;
  constructor(status:number,message:string){super(message);this.status=status;}
}
export function send(res:ServerResponse,status:number,data:Json){
  res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
  res.end(JSON.stringify(data));
}
export async function body(req:IncomingMessage):Promise<Json>{
  let size=0;const parts:Buffer[]=[];
  for await(const chunk of req){
    const b=Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk);
    size+=b.length;if(size>32768)throw new HttpError(413,'Requête trop volumineuse.');
    parts.push(b);
  }
  try{
    const obj:unknown=JSON.parse(Buffer.concat(parts).toString('utf8'));
    if(!obj||Array.isArray(obj)||typeof obj!=='object')throw Error();
    return obj as Json;
  }catch{throw new HttpError(400,'JSON invalide.');}
}
export function str(v:unknown){return typeof v==='string'?v:'';}
export function validUuid(id:string){return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);}
export function required(v:unknown,label:string,max=250){
  const s=str(v).trim();if(!s||s.length>max)throw new HttpError(400,`${label} invalide.`);return s;
}
export function priority(v:unknown){
  if(v!=='high'&&v!=='medium'&&v!=='low')throw new HttpError(400,'Priorité invalide.');return v;
}
export function optionalDate(v:unknown):string|null{
  if(v==null||v==='')return null;
  const t=str(v).slice(0,10);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(t)||Number.isNaN(Date.parse(t))||new Date(`${t}T00:00:00Z`).toISOString().slice(0,10)!==t)throw new HttpError(400,'Date invalide.');
  return t;
}
export function isoDate(v:unknown):string|null{
  if(v==null)return null;
  const d=v instanceof Date?v:new Date(String(v));return Number.isNaN(d.valueOf())?null:d.toISOString();
}
