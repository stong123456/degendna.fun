// MIME is part of executable release correctness, in addition to byte identity.
import {extname} from 'node:path';
export function allowedContentType(path,type){
 const base=String(type).split(';')[0].trim().toLowerCase();
 const expected={'.html':['text/html'],'.js':['text/javascript','application/javascript'],'.css':['text/css'],'.json':['application/json'],'.png':['image/png'],'.ico':['image/x-icon','image/vnd.microsoft.icon','application/octet-stream']};
 // This extensionless license is a download, never executable app content.
 // The external publisher assigns unknown extensions application/octet-stream.
 return (expected[extname(path)]||(path==='mental-lab/vendor/lucide-LICENSE'?['text/plain','application/octet-stream']:[])).includes(base);
}
