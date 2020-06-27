import updateVersion from '../json/updateVersion';
import {readFileSync, writeFileSync} from 'fs';
import {join} from 'path';

function updateJson(x: string, o: object): void {
  var p = join(x, 'package.json');
  var d = readFileSync(p, 'utf-8');
  var j = JSON.parse(d);
  var {version} = updateVersion(j, o['version']) as any;
  var d = JSON.stringify(j, null, 2);
  return writeFileSync(p, d);
  // do the same with package lock
}
export default updateJson;
