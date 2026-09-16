import {readdir,readFile,access} from 'node:fs/promises';
import {join,resolve,dirname} from 'node:path';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
const root=resolve('public');
const files=await readdir(root,{recursive:true});
let checked=0;
for(const name of files.filter(x=>x.endsWith('.js'))){
  const file=join(root,name);
  const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
  if(result.status!==0)throw Error(result.stderr);
  const code=await readFile(file,'utf8');
  for(const match of code.matchAll(/(?:from\s+|import\s*)['"](\.\.?\/[^'"]+)['"]/g))await access(resolve(dirname(file),match[1]));
  for(const match of code.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"](\.\.?\/[^'"]+)['"]/g)){
    const imported=await import(pathToFileURL(resolve(dirname(file),match[2])).href);
    for(const name of match[1].split(',').map(n=>n.trim().split(/\s+as\s+/)[0]).filter(Boolean)){
      if(!(name in imported))throw Error(`${name} is not exported by ${match[2]} (imported in ${name})`);
    }
  }
  checked++;
}
const manifest=JSON.parse(await readFile(join(root,'manifest.webmanifest'),'utf8'));
if(manifest.start_url!=='./')throw Error('Project Pages needs a relative start_url');
console.log(`${checked} JavaScript modules parsed; relative imports and manifest checked.`);
