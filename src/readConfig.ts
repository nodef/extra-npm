import {readFileSync} from 'fs';
import configPath from './configPath';
import type {IConfig} from './_types';

function readConfigType(typ: string, opt: IConfig): string {
  var a = '', o = Object.assign({type: typ}, opt);
  try { a += readFileSync(configPath(o), 'utf8')+'\n'; }
  catch (_) {}
  return a ? `; ${typ}\n` + a : a;
}

function shortenConfig(ini: string): string {
  var a = '', k = null;
  var m = new Map<string, string>();
  for (var l of ini.split('\n')) {
    if (/^[^;=]*(;|$)/.test(l)) k = Math.random()+''; // include comment
    else k = l.replace(/^\s*(\S+)\s*=/, '$1'); // unique key
    m.set(k, l);
  }
  for (var l of m.values())
    a += l + '\n';
  return a;
}

/**
 * Reads config from npmrc files.
 * @param opt options
 */
function readConfig(opt: IConfig=null) {
  var a = '', o = opt||{};
  do {
    a += readConfigType('builtin', o);
    a += readConfigType('global', o)
    if(o.type==='global') break;
    a += readConfigType('user', o);
    if(o.type!=='project' && !o.projectconfig) break;
    a += readConfigType('project', o);
  } while (false);
  if(!o.long) a = shortenConfig(a);
  return a.trimRight();
}
export default readConfig;
