import {dirname, join} from 'path';
import {execSync} from 'child_process';

var NPM_PATH = null;

function npmPathGet() {
  var ep = process.execPath;
  // Windows: `C:\Program Files\nodejs\node_modules\npm\npmrc`
  if (process.platform === 'win32') {
    var dir = dirname(ep);
    return join(dir, 'node_modules', 'npm');
  }
  // Homebrew special case: `$(brew --prefix)/lib/node_modules/npm/npmrc`
  else if (ep.includes('/Cellar/node')) {
    var dir = ep.slice(0, ep.indexOf('/Cellar/node'));
    return join(dir, 'lib', 'node_modules', 'npm');
  }
  else {
    var nodeDir = dirname(ep);
    var npmPath = execSync('readlink -f ' + join(nodeDir, 'npm'), { encoding: 'utf8' });
    return dirname(dirname(npmPath.trim()));
  }
}

/**
 * Gives path to NPM executable.
 * @param ref refresh [false]
 */
function npmPath(ref: boolean=false): string {
  if(NPM_PATH && !ref) return NPM_PATH;
  return NPM_PATH = npmPathGet();
}
export default npmPath;
