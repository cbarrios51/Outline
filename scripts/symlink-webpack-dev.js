/**
 * Coloca webpack.config.dev.js en build/ para modo dev.
 * Si hay permisos, crea un enlace simbólico; si no, copia el archivo
 * y corrige el require para que apunte a la raíz (../webpack.config).
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const buildPath = path.join(root, "build", "webpack.config.dev.js");
const targetPath = path.join(root, "webpack.config.dev.js");

try {
  if (fs.existsSync(buildPath)) fs.unlinkSync(buildPath);
  fs.symlinkSync(targetPath, buildPath);
  console.log("Enlace creado: build/webpack.config.dev.js -> webpack.config.dev.js");
} catch (err) {
  let content = fs.readFileSync(targetPath, "utf8");
  content = content.replace(
    'require("./webpack.config")',
    'require("../webpack.config")'
  );
  fs.writeFileSync(buildPath, content);
  console.log("Copiado build/webpack.config.dev.js (require corregido a ../webpack.config)");
}
