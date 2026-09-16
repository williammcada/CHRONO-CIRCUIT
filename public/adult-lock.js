const KEY='chrono-circuit-adult-v1';
const hex=b=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('');
export async function verifier(password,salt){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:150000,hash:'SHA-256'},key,256));}
export async function createCredential(password){const salt=hex(crypto.getRandomValues(new Uint8Array(16)));return {salt,hash:await verifier(password,salt)};}
export class AdultLock {
 constructor(storage){this.storage=storage;this.until=0;this.failures=0;this.blockedUntil=0;}
 lock(){this.until=0;}
 get unlocked(){return Date.now()<this.until;}
 async unlock(password){if(Date.now()<this.blockedUntil)return false;let credential=JSON.parse(this.storage.getItem(KEY)||'null');if(!credential){credential=await createCredential('admin123');this.storage.setItem(KEY,JSON.stringify(credential));}const ok=await verifier(password,credential.salt)===credential.hash;if(ok){this.failures=0;this.until=Date.now()+300000;return true;}if(++this.failures>=3){this.blockedUntil=Date.now()+30000;this.failures=0;}return false;}
 async change(password){if(!this.unlocked)throw Error('Unlock adult settings first.');if(password.length<6)throw Error('Use at least six characters.');this.storage.setItem(KEY,JSON.stringify(await createCredential(password)));}
}
