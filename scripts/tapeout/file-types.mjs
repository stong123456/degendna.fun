// MIME is part of executable release correctness, in addition to byte identity.
import {extname} from 'node:path';
export function allowedContentType(path,type){
 const base=String(type).split(';')[0].trim().toLowerCase();
 const expected={'.html':['text/html'],'.js':['text/javascript','application/javascript'],'.css':['text/css'],'.json':['application/json'],'.png':['image/png']};
 return (expected[extname(path)]||(path==='mental-lab/vendor/lucide-LICENSE'?['text/plain']:[])).includes(base);
}
