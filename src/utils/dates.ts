/** Interprète uniquement une vraie date du calendrier au format AAAA-MM-JJ. */
export function calendarDateToIso(value:string):string|null {
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
 const [y,m,d]=value.split('-').map(Number);
 const dt=new Date(Date.UTC(y,m-1,d,12,0,0));
 if(dt.getUTCFullYear()!==y||dt.getUTCMonth()!==m-1||dt.getUTCDate()!==d)return null;
 return dt.toISOString();
}
