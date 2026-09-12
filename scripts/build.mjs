import {copyFile,mkdir,readFile} from 'node:fs/promises';
const files=['index.html','styles.css','app.mjs','content.mjs','story.mjs','config.js'];
await mkdir('dist',{recursive:true});
for(const name of files)await copyFile('frontend/'+name,'dist/'+name);
const html=await readFile('dist/index.html','utf8');if(!html.includes('1.1'))throw new Error('Missing release version');
console.log('Built 6 public files in dist/');
