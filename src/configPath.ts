import {join} from 'path';
import {homedir} from 'os';
import npmPath from './npmPath';
import type {IConfig} from './_types';

var PBUILTIN = null;
var PGLOBAL = null;
var PUSER = null;

function configPathFind(): void {
  const E = process.env;
  PBUILTIN = join(npmPath(), 'npmrc');
  PGLOBAL = E.NPM_CONFIG_GLOBALCONFIG || join(E.PREFIX||'/', 'etc', 'npmrc');
  PUSER = E.NPM_CONFIG_USERCONFIG || join(homedir(), '.npmrc');
}

/**
 * Gets path to npmrc file.
 * @param opt options
 */
function configPath(opt: IConfig=null, ref: boolean=false): string {
  if(ref || !PBUILTIN) configPathFind();
  var o = opt||{};
  switch(o.type) {
    case 'project': return o.projectconfig || null;
    case 'global':  return o.globalconfig || PGLOBAL;
    case 'builtin': return PBUILTIN;
    default: return o.userconfig || PUSER;
  }
}
export default configPath;
