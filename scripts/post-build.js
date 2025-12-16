import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

async function postBuild() {
  console.log('Running post-build script...');

  const standaloneDir = path.join(rootDir, '.next', 'standalone');
  const staticDir = path.join(rootDir, '.next', 'static');
  const publicDir = path.join(rootDir, 'public');

  // Copier les fichiers statiques
  if (fs.existsSync(staticDir)) {
    const targetStaticDir = path.join(standaloneDir, '.next', 'static');
    console.log(`Copying static files to ${targetStaticDir}...`);
    await fs.copy(staticDir, targetStaticDir);
  }

  // Copier le dossier public
  if (fs.existsSync(publicDir)) {
    const targetPublicDir = path.join(standaloneDir, 'public');
    console.log(`Copying public files to ${targetPublicDir}...`);
    await fs.copy(publicDir, targetPublicDir);
  }

  console.log('Post-build script completed!');
}

postBuild().catch(console.error);
