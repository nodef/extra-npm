import ini from 'ini';
import readConfig from './readConfig';
import type {IConfig} from './_types';

/**
 * Lists all configs.
 * @param opt options
 */
function listConfig(opt: IConfig=null) {
  var a = readConfig(opt);
  return ini.parse(a);
}
export default listConfig;
