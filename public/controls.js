export const KEY_MAP = {
  ArrowLeft:'left', KeyA:'left', ArrowRight:'right', KeyD:'right',
  Space:'jump', KeyZ:'jump', KeyW:'jump', KeyX:'fire', KeyJ:'fire',
  KeyC:'power',KeyQ:'cycle', ArrowUp:'up', ArrowDown:'down', KeyS:'down', KeyE:'interact', Escape:'pause', KeyP:'pause',
};

// Keep each physical input independent: releasing one finger/key cannot cancel another.
export class Controls {
  held = new Map();
  pressed = new Set();
  pointers = new Map();
  sources = new Map();
  set(action, down, source = action) {
    if(down) this.sources.set(source,action); else this.sources.delete(source);
    const held = [...this.sources.values()].includes(action);
    if(held && !this.held.get(action)) this.pressed.add(action);
    this.held.set(action,held);
  }
  releaseSource(source) { const action=this.sources.get(source); if(action)this.set(action,false,source); }
  clear() { this.held.clear(); this.pressed.clear(); this.pointers.clear(); this.sources.clear(); }
}

export function atRoomExit(player, roomIndex) {
  return roomIndex < 6 && player.vx > 0 && player.x + player.w >= 320 && player.y + player.h <= 156;
}

export function movePlayer(player, dt, platforms) {
  player.x = Math.max(0, Math.min(320-player.w, player.x + player.vx*dt));
  const oldBottom=player.y+player.h;
  player.y+=player.vy*dt;
  player.onGround=false;
  if(player.vy>=0) for(const [x,y,width] of platforms) {
    if(player.x+player.w>x+2 && player.x<x+width-2 && oldBottom<=y+3 && player.y+player.h>=y) {
      player.y=y-player.h; player.vy=0; player.onGround=true; break;
    }
  }
}
