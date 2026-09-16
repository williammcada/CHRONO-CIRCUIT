// Draw all world labels at device resolution, independently of pixel-art scaling.
export function sharpText(canvas,ctx){
 const layer=document.createElement('canvas');layer.id='sharp-text';layer.setAttribute('aria-hidden','true');canvas.parentElement.append(layer);Object.assign(layer.style,{position:'fixed',pointerEvents:'none',zIndex:'2',imageRendering:'auto'});const c=layer.getContext('2d');let sx=1,sy=1;
 ctx.fillText=function(text,x,y,max){const m=ctx.getTransform();c.setTransform(sx*m.a,sy*m.b,sx*m.c,sy*m.d,sx*m.e,sy*m.f);for(const k of ['font','fillStyle','textAlign','textBaseline','globalAlpha'])c[k]=ctx[k];if(max===undefined)c.fillText(text,x,y);else c.fillText(text,x,y,max);};
 return ()=>{const r=canvas.getBoundingClientRect(),d=devicePixelRatio||1;const w=Math.round(r.width*d),h=Math.round(r.height*d);if(layer.width!==w||layer.height!==h){layer.width=w;layer.height=h;}Object.assign(layer.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});sx=w/canvas.width;sy=h/canvas.height;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,w,h);};
}
