const fs = require('fs')
const path = require('path')

const src = path.join(__dirname, 'node_modules', 'web-ifc')
const dest = path.join(__dirname, 'public')

for (const file of ['web-ifc.wasm', 'web-ifc-mt.wasm']) {
  fs.copyFileSync(path.join(src, file), path.join(dest, file))
  console.log(`copied ${file} -> public/`)
}
