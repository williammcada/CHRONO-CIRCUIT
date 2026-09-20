// All game layers share one origin. Keyboard panning must never become game position.
export function viewportLayout(width,height,touch){
 const w=Math.max(1,width),h=Math.max(1,height);
 const cell=h<450?44:52;
 const rail=touch?3*cell+50:0; // gaps, border and up to 34px bottom safe area
 const available=Math.max(1,h-rail);
 const cw=Math.min(w,available*16/9),ch=cw*9/16;
 return {w,h,cell,rail,cw,ch,left:(w-cw)/2,top:(available-ch)/2};
}
