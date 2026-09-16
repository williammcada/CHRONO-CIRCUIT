# Environment and score production — v0.7

Seven low-contrast raster background plates unify the three later original stages and the four expansion stages. Furnace Run retains its original foundry illustration. Each new plate was created with the built-in image-generation tool; the exact prompt and full source PNG are beside this file. `prepare.mjs` performs only nearest-neighbor registration to the 320×180 engine grid. It needs Sharp for optional art export; the game has no runtime dependency on it.

The plates are distant scenery. They contain no playable platform geometry or gameplay objects. `scenery.js` uses the committed PNGs and adds sparse decorative drift behind the foreground; supplying `time=0` holds that decoration still. No flashing backdrop is used. Native and 2× sample crops are in `environment-review.png`; the bright sample platform edges are intentionally separate from background architecture. Always outline actual solid platforms with the shared dark rim.

| Stage | Production plate | Foreground palette | Score |
|---|---|---|---|
| Midnight Metro | metro.png | steel blue / cyan / red | Last Express, 152 BPM |
| Bell Tower | tower.png | violet / brass | Clockwork Chimes, 132 BPM |
| Sky Dial | sky.png | blue / pale cyan | Dawn Current, 140 BPM |
| Tidal Exchange | tidal.png | navy / turquoise / warm coral | Sluice Swing, 132 BPM |
| Verdant Engine | garden.png | green / copper / orchid | Copper Canopy, 138 BPM |
| Prism Archive | prism.png | ink / lilac / amber | Light Between Shelves, 126 BPM |
| Dynamo Fair | fair.png | navy / raspberry / yellow | Carousel Voltage, 150 BPM |

All eight scores in `public/music.js` are now forty 4/4 bars. This creates a 63–76 second stage loop, with an introduction, theme, contrasting middle, break/build, and return. The four expansion compositions have separate note sequences, harmony, bass patterns, percussion, and synthesis: swung mallets with short brass responses; flowing plucked arpeggios; spacious FM glass; and driving brass call-and-response. Boss variants use tighter drum patterns and their own low-register response material. A boss does not open the math screen. The existing quiet math-screen bus level is preserved. No commercial melody, recording, or external audio asset is used.

`tests/scenery-audio.test.mjs` checks the production score's loop duration, valid note ranges, differing stage arrangements and middle phrasing, boss variants, asset sizes, and the actual synthesizer's finite scheduling/voice cleanup. It does not claim physical iPad speaker validation.
