"""Register generated raster frames. No generated sheet is used directly at runtime.

Extraction uses measured row/cell bounds, shared per-actor scale, and explicit boss
body pivots. Pixels are resized once with nearest-neighbour filtering. Sources and
generation prompts remain under art-source/actors for reproducible art review.
"""
from pathlib import Path
import json, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'art-source'/'actors'
OUT=ROOT/'public'/'assets'
INK=(12,23,39,255)
ENEMIES={
 'beetle':(19,16),'drone':(22,19),'turret':(21,24),'railbug':(23,18),
 'signalbot':(20,27),'ticketdrone':(24,20),'gearling':(20,20),'bellguard':(25,26),
 'chimebat':(27,20),'cloudcrab':(26,17),'stormorb':(23,25),'skimmer':(27,20),
 'clamp_skater':(26,18),'wake_buoy':(22,22),'lamprey_drone':(28,18),'seed_watcher':(22,28),
 'root_weaver':(28,20),'pollen_moth':(26,19),'echo_scribe':(24,26),'index_wisp':(20,24),
 'prism_crawler':(23,18),'magnet_usher':(23,29),'fuse_juggler':(25,27),'ticket_runner':(24,19)
}
BOSSES={
 'pendula':dict(h=52,pivots=[(216,301),(631,301),(1055,301)],palette=['#352247','#d1a252','#e9d699']),
 'railox':dict(h=49,pivots=[(216,582),(630,582),(1040,582)],palette=['#40252e','#c7554c','#e9c079']),
 'ricochet':dict(h=51,pivots=[(196,900),(633,900),(1042,900)],palette=['#322748','#a891cb','#e4d5b5']),
 'vesper':dict(h=43,pivots=[(210,1208),(626,1208),(1050,1208)],palette=['#173548','#4dabbc','#eddfb5']),
 'brinejaw':dict(h=37,pivots=[(212,257),(629,257),(1040,257)],palette=['#133541','#278d96','#df7253']),
 'floravel':dict(h=66,pivots=[(214,591),(627,591),(1046,591)],palette=['#183c32','#77a55b','#db73a6']),
 'facet':dict(h=45,pivots=[(210,872),(626,872),(1041,872)],palette=['#2c2342','#a69bd1','#e5e7f4']),
 'jester':dict(h=50,pivots=[(219,1192),(625,1192),(1050,1192)],palette=['#162640','#d34b69','#f7ce43'])
}
SHEETS=[
 ('bosses-old-source.png','bosses',['pendula','railox','ricochet','vesper'],[0,318,590,905,1254],3),
 ('bosses-new-source.png','bosses',['brinejaw','floravel','facet','jester'],[0,270,600,873,1254],3),
 ('enemies-old-source.png','enemies',list(ENEMIES)[:12],[0,222,403,616,825,1017,1254],4),
 ('enemies-new-source.png','enemies',list(ENEMIES)[12:],[0,222,419,609,803,987,1254],4)
]

def remove_background(im):
 a=np.array(im.convert('RGBA'))
 # Only extraction-key pink; intentional pink flowers and eyes remain opaque.
 pink=(a[:,:,0]>220)&(a[:,:,2]>210)&(a[:,:,1]<80)
 # Defringe the extraction matte only at the immediate outer edge; enclosed
 # purple/pink eyes and petals are retained. This prevents magenta sparkles.
 near=np.array(Image.fromarray((pink*255).astype('uint8')).filter(ImageFilter.MaxFilter(5)))>0
 edge=(a[:,:,0]>110)&(a[:,:,2]>110)&(a[:,:,1]<85)&(a[:,:,0].astype(int)-a[:,:,1]>75)&(a[:,:,2].astype(int)-a[:,:,1]>75)
 pink=pink|(near&edge)
 a[pink,3]=0
 a[pink,:3]=0
 return Image.fromarray(a)

raw={};records={};source_info=[]
for filename,group,names,rows,cols in SHEETS:
 im=remove_background(Image.open(SRC/filename)); cw=im.width/cols
 source_info.append(dict(file=filename,width=im.width,height=im.height,rows=rows,columns=cols))
 for ri,(top,bottom) in enumerate(zip(rows,rows[1:])):
  for col in range(cols):
   key=names[ri] if group=='bosses' else names[ri*2+col//2]
   fi=col if group=='bosses' else col%2
   # Vesper's spread wing in the third source pose crosses the nominal grid
   # divider. Measured cuts preserve that wing without polluting pose two.
   edges=[0,420,790,1254] if key=='vesper' else None
   x0=edges[col] if edges else round(col*cw);x1=edges[col+1] if edges else round((col+1)*cw)
   cell=im.crop((x0,top,x1,bottom));bbox=cell.getbbox()
   if not bbox: raise RuntimeError(f'Empty frame {key}:{fi}')
   sprite=cell.crop(bbox)
   absolute=[x0+bbox[0],top+bbox[1],x0+bbox[2],top+bbox[3]]
   raw.setdefault(key,[]).append(sprite)
   records.setdefault(key,[]).append(dict(frame=fi,source=filename,bounds=absolute))

atlases={};metadata={'version':'0.7.0','groups':{},'actors':{},'sources':source_info}
for group,names,cell,pivot,count in [('bosses',list(BOSSES),96,(48,90),3),('enemies',list(ENEMIES),48,(24,43),2)]:
 atlas=Image.new('RGBA',(cell*count,cell*len(names)))
 metadata['groups'][group]=dict(url=f'./assets/actors-{group}.png',width=atlas.width,height=atlas.height)
 for row,key in enumerate(names):
  frames=raw[key];maxw=max(s.width for s in frames);maxh=max(s.height for s in frames)
  if group=='bosses':scale=min(BOSSES[key]['h']/maxh,88/maxw)
  else:
   w,h=ENEMIES[key];scale=min(44/maxw,(h+3)/maxh)
  entries=[]
  for fi,original in enumerate(frames):
   sprite=original.resize((max(1,round(original.width*scale)),max(1,round(original.height*scale))),Image.Resampling.NEAREST)
   if group=='bosses':
    ax,ay=BOSSES[key]['pivots'][fi];left,top,right,bottom=records[key][fi]['bounds']
    px=round(pivot[0]+(left-ax)*scale);py=round(pivot[1]+(top-ay)*scale)
   else:
    px=pivot[0]-sprite.width//2;py=pivot[1]-sprite.height
   if px<0 or py<0 or px+sprite.width>cell or py+sprite.height>cell:
    raise RuntimeError(f'Frame escapes its registered cell: {key}:{fi} {px,py,sprite.size}')
   prepared=Image.new('RGBA',(cell,cell));prepared.alpha_composite(sprite,(px,py))
   atlas.alpha_composite(prepared,(fi*cell,row*cell))
   entries.append(dict(rect=[fi*cell,row*cell,cell,cell],opaqueBounds=list(prepared.getbbox()),source=records[key][fi]))
  metadata['actors'][key]=dict(group=group,pivot=list(pivot),scale=scale,frames=entries,fps=6 if group=='enemies' else 5)
 atlas.save(OUT/f'actors-{group}.png',optimize=True);atlases[group]=atlas

# Stage-select portraits use these exact models, never a separately generated lookalike.
portraits=Image.new('RGBA',(64*8,64));portraitmeta={}
for i,key in enumerate(BOSSES):
 palette=BOSSES[key]['palette'];tile=Image.new('RGBA',(64,64),palette[0]);d=ImageDraw.Draw(tile)
 base=tuple(int(palette[0][j:j+2],16) for j in (1,3,5))
 accent=tuple(int(palette[1][j:j+2],16) for j in (1,3,5))
 line=tuple(min(255,v+8) for v in base)+(255,)
 motif=tuple(round(a*.78+b*.22) for a,b in zip(base,accent))+(255,)
 for y in range(4,60,8):d.line([(3,y),(60,y)],fill=line,width=1)
 d.polygon([(3,59),(3,42),(31,13),(60,42),(60,59)],fill=motif)
 d.line([(4,4),(23,4)],fill=palette[1],width=2);d.line([(42,59),(60,59)],fill=palette[1],width=2)
 sprite=raw[key][0]
 # Crop only the lower body for bust portraits; plants and geometry retain silhouette.
 if key in ['pendula','ricochet','jester']:sprite=sprite.crop((0,0,sprite.width,round(sprite.height*.76)))
 sc=min(58/sprite.width,58/sprite.height)
 sprite=sprite.resize((round(sprite.width*sc),round(sprite.height*sc)),Image.Resampling.NEAREST)
 tile.alpha_composite(sprite,((64-sprite.width)//2,62-sprite.height))
 d=ImageDraw.Draw(tile);d.rectangle((0,0,63,63),outline='#829caa',width=1);d.line((1,1,62,1),fill=palette[2],width=1)
 portraits.alpha_composite(tile,(i*64,0));portraitmeta[key]=[i*64,0,64,64]
portraits.save(OUT/'portraits-guardians.png',optimize=True)
metadata['portraits']={'url':'./assets/portraits-guardians.png','frames':portraitmeta}
(OUT/'actors-meta.json').write_text(json.dumps(metadata,indent=2))
(OUT/'actors-meta.js').write_text('// Generated by scripts/prepare-actors.py; source-of-truth frame registration.\nexport const ACTOR_META='+json.dumps(metadata,separators=(',',':'))+';\n')

# QA: neutral-background contact sheet at 3x native scale with actor names.
font=ImageFont.load_default()
sheet=Image.new('RGB',(1120,1300),'#101e31');d=ImageDraw.Draw(sheet)
d.text((16,12),'CHRONO CIRCUIT / REGISTERED ACTOR FRAMES / native pixels at 2x',fill='#f1dba9',font=font)
for i,key in enumerate(BOSSES):
 x=16+(i%2)*552;y=44+(i//2)*188
 d.text((x,y),key.upper(),fill='#c6e5e7',font=font)
 info=metadata['actors'][key]
 for f in range(3):
  rect=info['frames'][f]['rect'];tile=atlases['bosses'].crop((rect[0],rect[1],rect[0]+96,rect[1]+96))
  bounds=tile.getbbox();tile=tile.crop(bounds);tile=tile.resize((tile.width*2,tile.height*2),Image.Resampling.NEAREST)
  xx=x+f*176;yy=y+16
  sheet.paste(tile,(xx,yy+132-tile.height),tile)
for i,key in enumerate(ENEMIES):
 x=16+(i%6)*184;y=800+(i//6)*124
 d.text((x,y),key.upper(),fill='#c6e5e7',font=font)
 for fi in range(2):
  rect=metadata['actors'][key]['frames'][fi]['rect'];tile=atlases['enemies'].crop((rect[0],rect[1],rect[0]+48,rect[1]+48))
  tile=tile.resize((96,96),Image.Resampling.NEAREST);sheet.paste(tile,(x+fi*67-20,y+16),tile)
sheet.save(SRC/'actors-contact-sheet.png')
portraits.resize((1024,128),Image.Resampling.NEAREST).save(SRC/'actors-portrait-strip.png')
print(json.dumps({'bossFrames':24,'enemyFrames':48,'portraits':8,'files':[str(OUT/f) for f in ['actors-bosses.png','actors-enemies.png','actors-meta.json','portraits-guardians.png']]}))
