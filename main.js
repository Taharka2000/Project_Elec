import { app, BrowserWindow, dialog } from "electron";
import { spawn } from 'child_process';
import path from "path";
import { fileURLToPath } from "url";
import net from "net";
import pkg from 'electron-updater';
const { autoUpdater } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let serverProcess;
const PORT = 3000;

// Configuration de l'autoUpdater
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

// Gestion des événements de mise à jour
autoUpdater.on('checking-for-update', () => {
  console.log('Vérification des mises à jour...');
});

autoUpdater.on('update-available', (info) => {
  console.log('Mise à jour disponible:', info.version);

  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Mise à jour disponible',
    message: `Une nouvelle version (${info.version}) est disponible.`,
    buttons: ['Télécharger', 'Plus tard'],
    defaultId: 0,
    cancelId: 1
  }).then(result => {
    if (result.response === 0) {
      autoUpdater.downloadUpdate();
    }
  });
});

autoUpdater.on('update-not-available', () => {
  console.log('Application à jour');
});

autoUpdater.on('error', (err) => {
  console.error('Erreur de mise à jour:', err);
});

autoUpdater.on('download-progress', (progressObj) => {
  let message = `Vitesse: ${progressObj.bytesPerSecond} - Téléchargé: ${progressObj.percent}%`;
  console.log(message);
});

autoUpdater.on('update-downloaded', () => {
  console.log('Mise à jour téléchargée');

  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Mise à jour prête',
    message: 'La mise à jour a été téléchargée. L\'application va redémarrer pour installer la mise à jour.',
    buttons: ['Redémarrer maintenant', 'Plus tard'],
    defaultId: 0,
    cancelId: 1
  }).then(result => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall(false, true);
    }
  });
});

// Fonction pour vérifier si le port est disponible
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

function startNextServer() {
  return new Promise(async (resolve, reject) => {
    const isDev = !app.isPackaged;

    // Vérifier si le serveur est déjà en cours d'exécution
    const portAvailable = await isPortAvailable(PORT);
    if (!portAvailable) {
      console.log("Server already running on port", PORT);
      resolve();
      return;
    }

    console.log("Starting Next.js server...");
    console.log("Is packaged:", app.isPackaged);
    console.log("Is dev:", isDev);

    if (isDev) {
      // Mode développement: utiliser next dev
      const { createServer } = await import('http');
      const { parse } = await import('url');
      const next = (await import('next')).default;

      const nextApp = next({
        dev: true,
        hostname: 'localhost',
        port: PORT,
        dir: __dirname
      });

      const handle = nextApp.getRequestHandler();

      await nextApp.prepare();
      console.log("Next.js prepared successfully");

      const httpServer = createServer(async (req, res) => {
        try {
          const parsedUrl = parse(req.url, true);
          await handle(req, res, parsedUrl);
        } catch (err) {
          console.error('Error occurred handling', req.url, err);
          res.statusCode = 500;
          res.end('Internal server error');
        }
      });

      httpServer.once('error', (err) => {
        console.error('Server error:', err);
        reject(err);
      });

      httpServer.listen(PORT, () => {
        console.log(`> Ready on http://localhost:${PORT}`);
        resolve();
      });
    } else {
      // Mode production: utiliser le serveur standalone
      const standaloneDir = path.join(__dirname, '.next', 'standalone');
      const serverPath = path.join(standaloneDir, 'server.js');

      console.log("Standalone directory:", standaloneDir);
      console.log("Server path:", serverPath);

      // Définir les variables d'environnement pour le serveur Next.js
      const env = {
        ...process.env,
        PORT: PORT.toString(),
        HOSTNAME: 'localhost',
        NODE_ENV: 'production'
      };

      // Lancer le serveur Next.js standalone
      serverProcess = spawn(process.execPath, [serverPath], {
        cwd: standaloneDir,
        env: env,
        stdio: 'inherit'
      });

      serverProcess.on('error', (err) => {
        console.error('Failed to start server:', err);
        reject(err);
      });

      serverProcess.on('exit', (code) => {
        if (code !== 0) {
          console.error(`Server exited with code ${code}`);
        }
      });

      // Attendre que le serveur soit prêt
      let retries = 0;
      const maxRetries = 30;
      const checkServer = setInterval(async () => {
        retries++;
        const available = !(await isPortAvailable(PORT));

        if (available) {
          clearInterval(checkServer);
          console.log(`> Server ready on http://localhost:${PORT}`);
          resolve();
        } else if (retries >= maxRetries) {
          clearInterval(checkServer);
          reject(new Error('Server failed to start in time'));
        }
      }, 100);
    }
  });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
  });

  // Afficher la fenêtre de chargement
  mainWindow.loadURL(`data:text/html,<html><body style="background:#1a1a1a;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:Arial;"><h2>Chargement de Dioko Actionnaire...</h2></body></html>`);
  mainWindow.show();

  try {
    // Attendre que le serveur Next.js soit prêt
    await startNextServer();

    // Charger l'application Next.js
    console.log("Loading application...");
    await mainWindow.loadURL(`http://localhost:${PORT}`);
  } catch (error) {
    console.error("Failed to start application:", error);
    mainWindow.loadURL(`data:text/html,<html><body style="background:#1a1a1a;color:#fff;padding:20px;font-family:Arial;"><h2>Erreur de démarrage</h2><p>${error.message}</p><p>Veuillez réessayer.</p></body></html>`);
  }
}

app.whenReady().then(() => {
  createWindow();

  // Vérifier les mises à jour au démarrage (seulement en production)
  if (!app.isPackaged) {
    console.log('Mode développement - vérification des mises à jour désactivée');
  } else {
    // Vérifier les mises à jour 5 secondes après le démarrage
    setTimeout(() => {
      autoUpdater.checkForUpdates();
    }, 5000);
  }
});

app.on("window-all-closed", () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on("before-quit", () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});
