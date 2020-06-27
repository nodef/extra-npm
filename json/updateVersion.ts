import {next, from} from 'extra-version';

/**
 * Updates version by given step.
 * @param x package.json
 * @param stp version step [0.0.1]
 */
function updateVersion(x: object, stp: string='0.0.1'): object {
  var v = from(x['version']);
  x['version'] = next(v, from(stp));
  return x;
}
export default updateVersion;
