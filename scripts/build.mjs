import {copyFile,mkdir,readFile} from 'node:fs/promises';
const files=['index.html','styles.css','app.mjs','content.mjs','story.mjs','config.js','cover.mjs'];
await mkdir('dist',{recursive:true});
for(const name of files)await copyFile('frontend/'+name,'dist/'+name);
const html=await readFile('dist/index.html','utf8');if(!html.includes((await readFile('VERSION','utf8')).trim()))throw new Error('Missing release version');
console.log('Built 7 public files in dist/');
