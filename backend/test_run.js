const { spawnSync } = require('child_process');
const result = spawnSync('node', ['server.js'], { encoding: 'utf8' });
require('fs').writeFileSync('capture.log', result.stderr || '' + '\n---\n' + result.stdout || '');
