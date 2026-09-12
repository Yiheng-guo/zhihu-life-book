import {content} from './content.mjs';
import {SOURCE_LENSES,SHORT_SOURCES} from './branches.mjs';
export const sourceAt=(s,id)=>s.sourceCatalog?.[id]||content.refs[id];
export const lensAt=(s,id)=>s.sourceCatalog?.[id]?.lens||SOURCE_LENSES[id];
export const questionAt=(s,id)=>s.sourceCatalog?.[id]?.question||content.sourceQuestion[id];
export const shortAt=(s,id)=>s.sourceCatalog?.[id]?.short_summary||SHORT_SOURCES[id];
