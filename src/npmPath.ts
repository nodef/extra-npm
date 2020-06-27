import {dirname, join} from 'path';
import {execSync} from 'child_process';

var PNPM = null;

function npmPathFind() {
  var ep = process.execPath;
  // Windows: `C:\Program Files\nodejs\node_modules\npm\npmrc`
  if (process.platform === 'win32') {
    var dir = dirname(ep);
    PNPM = join(dir, 'node_modules', 'npm');
  }
  // Homebrew special case: `$(brew --prefix)/lib/node_modules/npm/npmrc`
  else if (ep.includes('/Cellar/node')) {
    var dir = ep.slice(0, ep.indexOf('/Cellar/node'));
    PNPM = join(dir, 'lib', 'node_modules', 'npm');
  }
  else {
    var nodeDir = dirname(ep);
    var npmPath = execSync('readlink -f '+join(nodeDir, 'npm'), {encoding: 'utf8'});
    PNPM = dirname(dirname(npmPath.trim()));
  }
}

/**
 * Gives path to NPM directory.
 * @param ref refresh [false]
 */
function npmPath(ref: boolean=false): string {
  if(ref || !PNPM) npmPathFind();
  return PNPM;
}
export default npmPath;
