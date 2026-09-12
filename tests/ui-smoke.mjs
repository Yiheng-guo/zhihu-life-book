// Run with PLAYWRIGHT_MODULE pointing to an installed Playwright package.
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 for(const mode of ['local','api']){
 const context=await browser.newContext({viewport:{width:1280,height:950},acceptDownloads:true});
 if(mode==='local')await context.route('**/config.js',route=>route.fulfill({contentType:'text/javascript',body:"window.LIFE_BOOK_CONFIG={mode:'local',apiBase:''};"}));
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173');await page.locator('#startBtn').click();await page.locator('#choices button').first().waitFor();
 for(let i=0;i<4;i++){
 await page.locator('#choices button').first().click();await page.locator('#sourceList input').first().waitFor();
 assert.equal(await page.locator('#nextBtn').isDisabled(),true);
 assert.ok(await page.locator('#sourceList input').count()>=3);
 const url=page.url();
 // Stop the new tab's actual network request; only link targeting/selection independence is under test.
 await context.route('https://www.zhihu.com/**',r=>r.fulfill({body:'source'}));await context.route('https://zhuanlan.zhihu.com/**',r=>r.fulfill({body:'source'}));
 const popup=page.waitForEvent('popup');await page.locator('.source-bottom a').first().click();await (await popup).close();
 assert.equal(page.url(),url);assert.equal(await page.locator('#nextBtn').isDisabled(),true);
 await page.locator('#sourceList input').first().check();await page.waitForFunction(()=>!document.getElementById('nextBtn').disabled);
 const old=await page.locator('#selectedQuestion').textContent();
 await page.locator('#sourceList input').nth(1).check();await page.waitForFunction(prior=>document.getElementById('selectedQuestion').textContent!==prior,old);
 const selected=await page.locator('#selectedQuestion').textContent();
 await page.locator('#nextBtn').click();
 if(i<3){await page.waitForFunction(index=>document.querySelector('#steps li.current .step-number')?.textContent===String(index+2).padStart(2,'0'),i);assert.equal(await page.locator('#carryQuestion').textContent(),selected);}else await page.locator('#endingTitle').waitFor();
 }
 assert.equal(await page.locator('#history li').count(),4);await page.locator('#todayAction').fill('今天花 20 分钟了解一个岗位的日常');
 const download=page.waitForEvent('download');await page.locator('#saveBtn').click();assert.match((await download).suggestedFilename(),/书签/);
 await page.locator('#againBtn').click();await page.locator('#choices button').first().waitFor();assert.equal(await page.locator('#carry').isVisible(),false);
 await page.setViewportSize({width:390,height:844});await page.locator('#choices button').first().click();await page.locator('#sourceList input').first().waitFor();
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.screenshot({path:'work/qa-mobile-'+mode+'.png',fullPage:true});
 assert.deepEqual(errors,[]);console.log(mode+': full journey, independent source link, replace selection, carry, ending, download, restart and mobile passed');await context.close();
 }
}finally{await browser.close();}
