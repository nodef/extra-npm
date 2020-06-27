import {writeFileSync} from 'fs';
import configPath from './configPath';
import type {IConfig} from './_types';

/**
 * Overwrites config to npmrc file.
 * @param ini config to write, in INI format
 * @param opt options
 */
function writeConfig(ini: string, opt: IConfig=null): void {
  writeFileSync(configPath(opt), ini);
}
export default writeConfig;
