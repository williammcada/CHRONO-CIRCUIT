// Original synthesized score. Every stage has its own melody, harmony and rhythm.
// Forty 4/4 bars form an introduction, statement, contrasting middle, break and return.
// No recordings, dependencies, downloaded melodies or commercial music assets.
export const BPM=144;
const ROOTS=[45,41,48,43,45,41,43,40];
const LEAD=[
  [76,0,79,81,0,79,76,74,72,0,74,76,0,72,74,0],
  [77,0,81,84,0,81,79,77,76,0,72,76,77,0,76,0],
  [79,0,76,79,84,0,83,79,76,0,79,81,0,79,76,0],
  [74,0,79,81,83,0,81,79,74,0,76,74,71,0,74,0],
  [81,0,79,76,81,0,84,83,81,79,76,74,76,0,79,0],
  [81,0,84,81,77,0,79,81,84,0,86,84,81,0,77,0],
  [83,0,81,79,74,0,79,81,83,81,79,76,74,0,71,0],
  [80,0,83,86,0,83,80,76,74,0,76,80,83,80,76,0],
];
const frequency=(midi)=>440*2**((midi-69)/12);

export function scoreStep(step,boss=false) {
  const bar=Math.floor(step/16)%8,beat=step%16,root=ROOTS[bar]+(boss?2:0);
  const intervals=bar===7?[0,4,7,12]:[0,(bar===1||bar===2||bar===5)?4:3,7,12];
  return {kick:beat%4===0,snare:beat===4||beat===12,hat:beat%2===0,openHat:beat===6||beat===14,
    bass:root+(beat%4===2?12:0),arp:root+24+intervals[beat%4],lead:LEAD[bar][beat]?(LEAD[bar][beat]+(boss?2:0)):0};
}

export const TRACKS={
 foundry:{name:'Furnace Drive',bpm:144,leadWave:'square',bassWave:'sawtooth',arpWave:'triangle'},
 metro:{name:'Last Express',bpm:152,leadWave:'sawtooth',bassWave:'square',arpWave:'square',roots:[40,40,48,47,40,45,48,47],melody:[
  [76,0,76,79,83,0,81,79,76,0,74,76,79,0,83,0],
  [74,0,76,0,78,79,78,0,74,0,71,74,78,0,74,0],
  [79,0,84,83,79,0,76,79,84,0,86,84,83,79,76,0],
  [78,0,83,0,81,78,75,0,71,0,75,78,83,81,78,0],
 ]},
 tower:{name:'Clockwork Chimes',bpm:132,leadWave:'triangle',bassWave:'triangle',arpWave:'sine',roots:[50,53,55,48,50,53,48,45],melody:[
  [86,0,0,81,0,0,77,0,79,0,0,81,0,77,0,0],
  [84,0,0,81,0,0,77,0,76,0,0,77,0,81,0,0],
  [86,0,0,83,0,0,79,0,81,0,0,83,0,79,0,0],
  [84,0,0,79,0,0,76,0,72,0,0,76,0,79,81,0],
 ]},
 sky:{name:'Dawn Current',bpm:140,leadWave:'triangle',bassWave:'sawtooth',arpWave:'sine',roots:[48,55,57,53,48,52,53,55],melody:[
  [79,0,84,0,86,88,0,86,84,0,79,0,76,79,0,0],
  [83,0,86,0,88,91,0,88,86,0,83,0,79,81,0,0],
  [81,0,84,0,88,89,0,88,84,0,81,0,79,81,0,0],
  [81,0,84,0,89,88,0,84,81,0,77,0,79,81,84,0],
 ]},
};
// New material is authored in MIDI note numbers; zero is an intentional rest.
// The middle phrases have independent contours, not merely a transposed A theme.
Object.assign(TRACKS,{
 tidal:{name:'Sluice Swing',bpm:132,leadWave:'triangle',bassWave:'triangle',arpWave:'sine',voice:'mallet',swing:.28,
  roots:[38,38,46,41,43,43,45,45],thirds:[3,3,4,4,3,3,4,4],bassPattern:[0,7,-1,12,0,-1,7,10],
  melody:[
   [74,0,77,0,0,79,81,0,77,0,74,0,72,0,74,0],
   [0,0,81,0,79,0,77,0,74,0,72,74,0,0,69,0],
   [77,0,0,82,0,81,77,0,74,0,77,0,81,0,79,0],
   [81,0,79,0,77,0,0,72,74,0,77,0,0,0,72,0],
   [79,0,82,0,0,86,84,0,82,0,79,0,77,0,79,0],
   [0,0,86,0,84,0,82,0,79,0,77,79,0,0,74,0],
   [81,0,85,0,88,0,0,85,81,0,79,0,76,0,73,0],
   [76,0,79,0,81,0,85,0,0,0,81,79,76,0,73,0]],
  middle:[
   [86,0,0,0,84,0,81,0,0,79,0,77,0,0,81,0],
   [82,0,0,0,81,0,77,0,0,74,0,72,0,0,77,0],
   [79,0,0,0,82,0,86,0,0,84,0,82,0,0,79,0],
   [85,0,0,0,81,0,79,0,0,76,0,73,0,0,69,0]]},
 garden:{name:'Copper Canopy',bpm:138,leadWave:'sawtooth',bassWave:'triangle',arpWave:'triangle',voice:'pluck',swing:0,
  roots:[40,43,48,47,40,45,48,47],thirds:[3,4,4,4,3,3,4,4],bassPattern:[0,-1,-1,7,-1,-1,12,-1],
  melody:[
   [76,0,79,83,0,81,79,0,78,0,0,76,0,79,0,0],
   [79,0,83,86,0,83,81,0,79,0,0,74,0,76,0,0],
   [84,0,83,79,0,76,79,0,81,0,0,83,0,79,0,0],
   [83,0,78,75,0,78,83,0,86,0,0,83,0,78,0,0],
   [88,0,86,83,0,81,79,0,83,0,0,86,0,88,0,0],
   [81,0,84,88,0,86,84,0,83,0,0,81,0,76,0,0],
   [79,0,84,88,0,91,88,0,84,0,0,83,0,79,0,0],
   [78,0,83,86,0,87,86,0,83,0,0,78,0,75,0,0]],
  middle:[
   [0,76,0,0,0,79,0,0,0,83,0,0,81,0,79,0],
   [0,74,0,0,0,79,0,0,0,83,0,0,81,0,78,0],
   [0,76,0,0,0,81,0,0,0,84,0,0,83,0,79,0],
   [0,78,0,0,0,83,0,0,0,86,0,0,83,0,75,0]]},
 prism:{name:'Light Between Shelves',bpm:126,leadWave:'sine',bassWave:'sine',arpWave:'sine',voice:'glass',swing:0,
  roots:[42,50,45,49,42,47,50,49],thirds:[3,4,4,4,3,3,4,4],bassPattern:[0,-1,-1,-1,7,-1,-1,12],
  melody:[
   [78,0,0,0,0,81,0,0,0,85,0,0,83,0,0,0],
   [86,0,0,0,0,81,0,0,0,78,0,0,76,0,0,0],
   [81,0,0,0,0,85,0,0,0,88,0,0,85,0,0,0],
   [85,0,0,0,0,80,0,0,0,77,0,0,73,0,0,0],
   [90,0,0,0,0,88,0,0,0,85,0,0,81,0,0,0],
   [83,0,0,0,0,86,0,0,0,90,0,0,88,0,0,0],
   [86,0,0,0,0,90,0,0,0,93,0,0,90,0,0,0],
   [92,0,0,0,0,89,0,0,0,85,0,0,80,0,0,0]],
  middle:[
   [0,0,73,0,78,0,0,0,0,0,81,0,85,0,0,0],
   [0,0,74,0,78,0,0,0,0,0,81,0,86,0,0,0],
   [0,0,71,0,74,0,0,0,0,0,78,0,83,0,0,0],
   [0,0,73,0,77,0,0,0,0,0,80,0,85,0,0,0]]},
 fair:{name:'Carousel Voltage',bpm:150,leadWave:'square',bassWave:'sawtooth',arpWave:'triangle',voice:'brass',swing:0,
  roots:[48,45,41,43,48,45,50,43],thirds:[4,3,4,4,4,3,3,4],bassPattern:[0,12,0,7,0,12,7,10],
  melody:[
   [79,0,84,84,0,0,88,0,0,0,86,0,84,0,79,0],
   [0,0,0,0,81,0,84,0,88,0,86,84,0,81,79,0],
   [77,0,81,81,0,0,84,0,0,0,86,0,84,0,81,0],
   [0,0,0,0,79,0,83,0,86,0,88,86,0,83,79,0],
   [84,0,88,88,0,0,91,0,0,0,88,0,86,0,84,0],
   [0,0,0,0,88,0,84,0,81,0,84,88,0,91,88,0],
   [86,0,89,89,0,0,93,0,0,0,91,0,89,0,86,0],
   [0,0,0,0,86,0,83,0,79,0,81,83,0,86,79,0]],
  middle:[
   [72,0,0,79,0,0,76,0,72,0,0,67,0,0,71,0],
   [69,0,0,76,0,0,72,0,69,0,0,64,0,0,67,0],
   [65,0,0,72,0,0,69,0,65,0,0,60,0,0,64,0],
   [67,0,0,74,0,0,71,0,67,0,0,62,0,0,65,0]]},
});
export const SONG_BARS=40;
export function songDuration(stage='foundry',boss=false){return SONG_BARS*4*60/((TRACKS[stage]||TRACKS.foundry).bpm+(boss?12:0));}

export function trackStep(step,stage='foundry',boss=false){
 if(stage==='foundry'||!TRACKS[stage])return scoreStep(step,boss);
 const track=TRACKS[stage],bar=Math.floor(step/16)%8,beat=step%16,root=track.roots[bar];
 if(track.middle){
  const bassInterval=track.bassPattern[Math.floor(beat/2)],third=track.thirds[bar];
  const arpPattern=stage==='garden'?[0,7,third,12,7,third,14,7]:stage==='prism'?[0,7,12,third]:[0,third,7,12];
  return {
   kick:stage==='tidal'?[0,6,8,14].includes(beat):stage==='garden'?[0,6,10].includes(beat):stage==='prism'?[0,8].includes(beat):[0,4,8,11,12].includes(beat),
   snare:beat===4||beat===12,hat:stage==='garden'?[0,3,6,8,11,14].includes(beat):stage==='prism'?[2,6,10,14].includes(beat):beat%2===0,
   openHat:stage==='fair'?beat===14:stage==='tidal'?beat===6:false,
   bass:beat%2===0&&bassInterval>=0?root+bassInterval:0,
   arp:(stage==='garden'||(stage==='prism'?beat%4===2:beat%2===1))?root+24+arpPattern[beat%arpPattern.length]:0,
   lead:track.melody[bar][beat],answer:stage==='tidal'&&bar%2===1&&[10,14].includes(beat)?root+24+(beat===10?7:12):0,
   offset:(beat%4>=2?track.swing:0),section:0};
 }
 const third=stage==='sky'?(bar===2||bar===5?3:4):stage==='tower'?(bar===0||bar===4||bar===7?3:4):(bar===2||bar===6?4:3);
 const melody=track.melody[bar%4][beat],answer=bar>=4&&beat>=8?12:0;
 return {kick:stage==='tower'?[0,6,10].includes(beat):stage==='metro'?[0,4,7,8,12].includes(beat):beat%4===0,
  snare:stage==='tower'?beat===8:beat===4||beat===12,hat:stage==='metro'?beat%2===0||beat===15:beat%2===0,openHat:stage==='sky'?beat===14:beat===6,
  bass:root+(stage==='metro'&&beat%4===2?12:0),arp:root+24+[0,third,7,12][(beat+(stage==='tower'?bar:0))%4],lead:melody?melody+answer+(boss?2:0):0};
}

export function arrangedStep(step,stage='foundry',boss=false){
 step=((Math.floor(step)%(SONG_BARS*16))+SONG_BARS*16)%(SONG_BARS*16);
 const n=trackStep(step,stage,boss),track=TRACKS[stage]||TRACKS.foundry;
 const section=Math.floor(step/128),bar=Math.floor(step/16)%8,beat=step%16;
 n.section=section;n.intensity=1;
 if(section===0){ // Eight-bar introduction: hear the stage's groove before the full hook.
  if(bar<4||beat%4!==0)n.lead=0;
  if(bar<2){n.snare=false;n.hat=false;}
  n.intensity=.8;
 }else if(section===2){ // Contrasting composed middle with a spacious percussion texture.
  if(track.middle){n.lead=track.middle[bar%4][beat];if(n.lead&&bar>=4)n.lead+=12;}
  else{if(n.lead)n.lead-=12;if(n.arp&&beat%4===3)n.arp+=12;}
  n.kick=beat===0||beat===8;n.openHat=false;n.intensity=.88;
 }else if(section===3){ // Break and build; returning fragments do not repeat the full melody.
  if(bar<4||beat%4!==0)n.lead=0;
  n.hat=bar>=4&&beat%4===2;n.openHat=false;
  if(bar<2)n.kick=beat===0;
  n.intensity=.78+bar*.02;
 }else if(section===4){
  n.snare=n.snare||(bar===7&&beat>=10&&beat%2===0);
  if(n.arp&&beat%8===7)n.arp+=12;
 }
 if(boss){ // Individual themes stay recognizable, with tighter low-register boss responses.
  n.intensity=.9;n.kick=n.kick||beat===8||beat===14;
  n.hat=beat%2===0;n.openHat=beat===14;
  n.lead=track.middle?track.middle[bar%4][beat]:n.lead;
  if(track.middle&&beat===12)n.answer=track.roots[bar]+19;
  if(beat===15&&bar%2===1)n.snare=true;
 }
 return n;
}

export class Soundtrack {
  context=null; timer=null; step=0; nextTime=0; musicGain=null; effectsGain=null; noise=null; voices=0;
  constructor(settings,scene) {this.settings=settings;this.scene=scene;}
  start() {
    if(this.settings().mute)return;
    try {
      if(!this.context) {
        const Audio=window.AudioContext||window.webkitAudioContext;
        if(!Audio)return;
        this.context=new Audio();
        const limiter=this.context.createDynamicsCompressor();
        limiter.threshold.value=-12;limiter.ratio.value=6;limiter.connect(this.context.destination);
        this.musicGain=this.context.createGain();this.musicGain.gain.value=.6;this.musicGain.connect(limiter);
        this.effectsGain=this.context.createGain();this.effectsGain.gain.value=.7;this.effectsGain.connect(limiter);
        this.noise=this.context.createBuffer(1,this.context.sampleRate*.25,this.context.sampleRate);
        const data=this.noise.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
      }
      this.context.resume().then(()=>{if(this.timer===null){this.nextTime=this.context.currentTime+.025;this.timer=setInterval(()=>this.schedule(),25);this.schedule();}}).catch(()=>{});
    } catch { /* Silent devices still allow play. The next gesture can retry. */ }
  }
  schedule() {
    if(!this.context||this.context.state!=='running')return;
    const {screen,room,boss,stage='foundry',selectedStage}=this.scene();
    const trackId=screen==='stage-select'?selectedStage||stage:stage,track=TRACKS[trackId]||TRACKS.foundry;
    if(this.trackId!==trackId){this.trackId=trackId;this.step=0;this.nextTime=this.context.currentTime+.025;}
    const s=this.settings(),silent=document.hidden||['pause','settings','report'].includes(screen);
    const quiet=screen==='math'?.28:screen==='play'?1:.5;
    this.musicGain.gain.setTargetAtTime(s.mute||s.musicMute||silent?0:(s.musicVolume??.6)*quiet,this.context.currentTime,.08);
    this.effectsGain.gain.setTargetAtTime(s.mute||s.effectsMute||silent?0:s.effectsVolume??.7,this.context.currentTime,.04);
    if(silent){this.nextTime=this.context.currentTime+.025;return;}
    if(this.nextTime<this.context.currentTime-.2)this.nextTime=this.context.currentTime+.025;
    let count=0;
    while(this.nextTime<this.context.currentTime+.12&&count++<4) {
      const bossMusic=!!boss&&screen==='play',n=arrangedStep(this.step++,trackId,bossMusic),subdivision=60/(track.bpm+(bossMusic?12:0))/4,time=this.nextTime+(n.offset||0)*subdivision;
      if(n.kick)this.kick(time);
      if(n.snare){this.noiseHit(time,.12,.1,1500);this.note(180,time,.09,'triangle',.06);}
      if(n.hat)this.noiseHit(time,n.openHat?.13:.035,n.openHat?.035:.025,6800);
      const level=n.intensity||1;
      if(n.bass)this.note(frequency(n.bass),time,track.middle?.16:.095,track.bassWave,.047*level,900);
      if(n.arp)this.note(frequency(n.arp),time,trackId==='tower'?.14:trackId==='garden'?.11:.065,track.arpWave,(track.middle?.024:.032)*level);
      if(n.lead)this.playLead(n.lead,time,track,level);
      if(n.answer)this.note(frequency(n.answer),time,.13,'square',.019*level,2100);
      this.nextTime+=subdivision;
    }
  }
  playLead(midi,time,track,level=1){
    const freq=frequency(midi);
    if(track.voice==='glass'){
      this.fmNote(freq,time,.32,.030*level);
    }else if(track.voice==='mallet'){
      this.note(freq,time,.19,'sine',.065*level);
      this.note(freq*2,time,.055,'triangle',.012*level,3200);
    }else if(track.voice==='pluck'){
      this.note(freq,time,.12,'triangle',.058*level);
      this.note(freq*2,time,.04,'sawtooth',.010*level,2300);
    }else if(track.voice==='brass'){
      this.note(freq,time,.17,'square',.027*level,2400);
      this.note(freq*.997,time,.13,'sawtooth',.010*level,3200);
    }else this.note(freq,time,track===TRACKS.tower?.24:.13,track.leadWave,(track===TRACKS.metro?.025:.036)*level,4200);
  }
  fmNote(freq,time,length,volume){
    if(this.voices>=46)return;this.voices+=2;
    const carrier=this.context.createOscillator(),mod=this.context.createOscillator(),depth=this.context.createGain(),amp=this.context.createGain();
    carrier.type='sine';carrier.frequency.value=freq;mod.type='sine';mod.frequency.value=freq*2.01;
    depth.gain.setValueAtTime(freq*.75,time);depth.gain.exponentialRampToValueAtTime(freq*.03,time+length);
    amp.gain.setValueAtTime(.0001,time);amp.gain.exponentialRampToValueAtTime(volume,time+.006);amp.gain.exponentialRampToValueAtTime(.0001,time+length);
    mod.connect(depth).connect(carrier.frequency);carrier.connect(amp).connect(this.musicGain);
    carrier.onended=()=>{this.voices-=2;carrier.disconnect();mod.disconnect();depth.disconnect();amp.disconnect();};
    carrier.start(time);mod.start(time);carrier.stop(time+length+.01);mod.stop(time+length+.01);
  }
  note(freq,time,length,type,volume,cutoff,bus=this.musicGain) {
    if(this.voices>=48)return;this.voices++;
    const o=this.context.createOscillator(),g=this.context.createGain();o.type=type;o.frequency.value=freq;
    g.gain.setValueAtTime(.0001,time);g.gain.exponentialRampToValueAtTime(volume,time+.004);g.gain.exponentialRampToValueAtTime(.0001,time+length);
    if(cutoff){const f=this.context.createBiquadFilter();f.type='lowpass';f.frequency.value=cutoff;o.connect(f).connect(g);}else o.connect(g);
    g.connect(bus);o.onended=()=>{this.voices--;o.disconnect();g.disconnect();};o.start(time);o.stop(time+length+.01);
  }
  kick(time) {const o=this.context.createOscillator(),g=this.context.createGain();o.frequency.setValueAtTime(155,time);o.frequency.exponentialRampToValueAtTime(42,time+.14);g.gain.setValueAtTime(.32,time);g.gain.exponentialRampToValueAtTime(.0001,time+.19);o.connect(g).connect(this.musicGain);o.start(time);o.stop(time+.2);}
  noiseHit(time,length,volume,cutoff){const n=this.context.createBufferSource(),f=this.context.createBiquadFilter(),g=this.context.createGain();n.buffer=this.noise;f.type='highpass';f.frequency.value=cutoff;g.gain.setValueAtTime(volume,time);g.gain.exponentialRampToValueAtTime(.0001,time+length);n.connect(f).connect(g).connect(this.musicGain);n.start(time);n.stop(time+length);}
  tone(freq=440,length=.08,type='square',volume=.035){const s=this.settings();if(s.mute||s.effectsMute||document.hidden||!this.context||this.context.state!=='running')return;this.effectsGain.gain.setTargetAtTime(s.effectsVolume??.7,this.context.currentTime,.01);this.note(freq,this.context.currentTime+.005,length,type,volume*2,undefined,this.effectsGain);}
  jump(){this.tone(310,.08,'square',.025);}
  fire(){this.tone(650,.055,'square',.025);}
  hit(){this.tone(90,.14,'sawtooth',.04);}
  good(){[520,660,880].forEach((n,i)=>setTimeout(()=>this.tone(n,.13,'square',.035),i*90));}
  wrong(){this.tone(230,.11,'triangle',.035);setTimeout(()=>this.tone(170,.16,'triangle',.035),100);}
  tick(up=true){this.tone(up?500:380,.035,'square',.018);}
}
