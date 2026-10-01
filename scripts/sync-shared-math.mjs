// Rebuild from the pinned canonical Olivia checkout, never from private game HTML.
import {resolve,join} from 'node:path';
import {createRequire} from 'node:module';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const source=resolve(process.argv[2]||'../olivia');
const revision='df28efce7bde25a239915af7db72b8b5caf85eb4';
const require=createRequire(join(source,'package.json'));
const {build}=require('esbuild');
const result=await build({stdin:{contents:`export * from './src/shared-math/standalone.ts'; export {validMath,pool} from './src/shared-math/engine.ts';`,resolveDir:source,sourcefile:'chrono-shared-entry.ts'},bundle:true,format:'esm',target:'es2020',outfile:'public/shared-math.js',metafile:true});
const sha256=data=>createHash('sha256').update(data).digest('hex');
const files={};for(const file of Object.keys(result.metafile.inputs)){if(file.endsWith('chrono-shared-entry.ts'))continue;const absolute=resolve(file),relative=absolute.slice(source.length+1);files[relative]=sha256(await readFile(absolute));}
await writeFile('public/shared-math.provenance.json',JSON.stringify({canonicalRepository:'williammcada/OLIVIA-MAGIC-BRACELET-QUEST',canonicalRevision:revision,canonicalDirectory:'src/shared-math',bundleSha256:sha256(await readFile('public/shared-math.js')),sourceFiles:files},null,2)+'\n');
console.log('Generated canonical shared math bundle and provenance.');
