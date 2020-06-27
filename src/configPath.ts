import npmPath from './npmPath';
import {join} from 'path';
import {homedir} from 'os';
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
 * @param typ path type (project/user/global/builtin) [user]
 * @param opt options
 */
function configPath(typ: string='user', opt: IConfig=null, ref: boolean=false): string {
  var o = opt || {};
  if(ref || !PBUILTIN) configPathFind();
  if(typ==='project') return o.projectconfig || null;
  if(typ==='global') return o.globalconfig || PGLOBAL;
  if(typ==='builtin') return PBUILTIN;
  return o.userconfig || PUSER;
}
export default configPath;
