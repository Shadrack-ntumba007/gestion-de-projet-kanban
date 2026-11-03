export function validEmail(email:string):boolean {return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());}
export function validPassword(password:string):boolean {return password.length>=8;}
export function nonEmpty(value:string):boolean {return value.trim().length>0;}
