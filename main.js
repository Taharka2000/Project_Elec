import { app, BrowserWindow, dialog } from "electron";
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import path from "path";
import { fileURLToPath } from "url";
import net from "net";
import { autoUpdater } from "electron-updater";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let httpServer;
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

autoUpdater.on('update-downloaded', (info) => {
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

    // Déterminer le chemin de travail
    const dir = app.isPackaged
      ? __dirname.replace('app.asar', 'app.asar.unpacked')
      : __dirname;

    console.log("Working directory:", dir);

    try {
      // Créer l'application Next.js
      const nextApp = next({
        dev: isDev,
        hostname: 'localhost',
        port: PORT,
        dir: dir
      });

      const handle = nextApp.getRequestHandler();

      await nextApp.prepare();
      console.log("Next.js prepared successfully");

      httpServer = createServer(async (req, res) => {
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
    } catch (error) {
      console.error("Failed to start Next.js server:", error);
      reject(error);
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
  if (httpServer) {
    httpServer.close();
  }
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on("before-quit", () => {
  if (httpServer) {
    httpServer.close();
  }
});
