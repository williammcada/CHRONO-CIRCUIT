export const MODES=['teach','guide','independent','mastery'];
export const modeOf=value=>MODES.includes(value)?value:'guide';
export function answerPolicy(value){const mode=modeOf(value);return {mode,manual:mode==='independent'||mode==='mastery',worked:mode==='teach',mastery:mode==='mastery'};}
