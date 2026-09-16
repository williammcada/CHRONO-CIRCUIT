// Optional development export. Runtime uses the committed native-size PNGs.
// All source illustrations were produced with built-in image generation.
// This script only registers/resamples them to the engine's logical pixel grid.
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/index.js':import.meta.url);
const sharp=require('sharp');
for(const id of ['metro','tower','sky','tidal','garden','prism','fair']){
 const input=fileURLToPath(new URL(`./${id}-source.png`,import.meta.url));
 const output=fileURLToPath(new URL(`../../public/assets/environment/${id}.png`,import.meta.url));
 await sharp(input).resize(320,180,{fit:'fill',kernel:'nearest'}).png().toFile(output);
}
