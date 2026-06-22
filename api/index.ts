const _require = eval('require')
const mod = _require(_require('path').resolve(process.cwd(), 'dist', 'main'))
module.exports = mod.handler
