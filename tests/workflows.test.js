const test = require('node:test');
const assert = require('node:assert/strict');
const {spawn} = require('node:child_process');
const path = require('node:path');

const port = 4317;
let server;
async function request(route, options={}) {
  let last;
  for (let attempt=0; attempt<4; attempt++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}${route}`, options);
      const json = await res.json();
      return {res,json};
    } catch (error) { last=error; await new Promise(resolve=>setTimeout(resolve,30)); }
  }
  throw last;
}
test.before(async () => {
  server = spawn(process.execPath, ['server.js'], {cwd:path.join(__dirname,'..'),env:{...process.env,PORT:String(port)}});
  await new Promise((resolve,reject) => { const timer=setTimeout(()=>reject(new Error('server did not start')),5000); server.stdout.on('data',d=>{if(d.toString().includes('running')){clearTimeout(timer);resolve();}});});
  for (let attempt=0; attempt<20; attempt++) {
    try { const {res}=await request('/api/health'); if (res.ok) return; } catch (_) {}
    await new Promise(resolve=>setTimeout(resolve,50));
  }
  throw new Error('server did not become reachable');
});
test.after(() => server.kill());
test('authenticated dashboard computes seeded metrics', async () => {
  const {json:login} = await request('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'admin@carbonscope.demo',password:'Demo123!'})});
  assert.ok(login.token);
  const {res,json} = await request('/api/dashboard',{headers:{Authorization:`Bearer ${login.token}`}});
  assert.equal(res.status,200); assert.equal(json.metrics.companies,12); assert.ok(json.metrics.emissions>0); assert.ok(json.metrics.budget>0);
});
test('inventory movement refuses retirement beyond eligible availability', async () => {
  const {json:login} = await request('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'admin@carbonscope.demo',password:'Demo123!'})});
  const {json:lots} = await request('/api/lots',{headers:{Authorization:`Bearer ${login.token}`}});
  const lot=lots.items.find(x=>x.available>0);
  const {res,json} = await request('/api/lots/move',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${login.token}`},body:JSON.stringify({lotId:lot.id,event:'Retired',quantity:lot.available+1})});
  assert.equal(res.status,422); assert.match(json.error,/eligible/);
});
test('listing validates quantity against available inventory', async () => {
  const {json:login} = await request('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'admin@carbonscope.demo',password:'Demo123!'})});
  const {json:lots} = await request('/api/lots',{headers:{Authorization:`Bearer ${login.token}`}});
  const lot=lots.items.find(x=>x.available>0);
  const {res} = await request('/api/listings',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${login.token}`},body:JSON.stringify({lotId:lot.id,quantity:lot.available+1,price:10})});
  assert.equal(res.status,422);
});
