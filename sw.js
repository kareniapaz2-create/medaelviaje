// ¿Me da el viaje? — funciona sin internet y se actualiza sola cuando hay conexión
const CACHE="mdev-v4";
const BASE=["./","./index.html","./manifest.json","./icono.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(BASE)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
function conTiempo(p,ms){return new Promise((ok,mal)=>{const t=setTimeout(()=>mal(new Error("lento")),ms);p.then(r=>{clearTimeout(t);ok(r);},e=>{clearTimeout(t);mal(e);});});}
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;
  const u=new URL(r.url);
  if(u.origin===location.origin){
    if(r.mode==="navigate"){ // la página: primero internet (para tener la última versión), si no hay o está lento, la guardada
      e.respondWith(conTiempo(fetch(r),4000).then(res=>{const c=res.clone();caches.open(CACHE).then(ca=>ca.put("./index.html",c));return res;})
        .catch(()=>caches.match("./index.html").then(x=>x||caches.match("./"))));
      return;
    }
    e.respondWith(caches.match(r).then(x=>x||fetch(r).then(res=>{const c=res.clone();caches.open(CACHE).then(ca=>ca.put(r,c));return res;})));
    return;
  }
  if(/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){ // letras: guardadas para que se vean sin internet
    e.respondWith(caches.match(r).then(x=>x||fetch(r).then(res=>{const c=res.clone();caches.open(CACHE).then(ca=>ca.put(r,c));return res;}).catch(()=>x)));
  }
});
