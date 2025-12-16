# Guide d'Installation - Dioko Actionnaire

## Installation sur Mac (Apple Silicon - M1/M2/M3)

### Fichiers disponibles
- **Dioko Actionnaire-0.1.0-arm64.dmg** (400 MB) - Recommandé
- **Dioko Actionnaire-0.1.0-arm64-mac.zip** (392 MB) - Alternative

### Étapes d'installation

1. **Via le fichier DMG** (Recommandé)
   - Double-cliquez sur `Dioko Actionnaire-0.1.0-arm64.dmg`
   - Une fenêtre s'ouvrira avec l'application
   - Glissez l'icône "Dioko Actionnaire" dans le dossier Applications
   - Éjectez l'image disque
   - Allez dans Applications et lancez "Dioko Actionnaire"

2. **Via le fichier ZIP**
   - Décompressez `Dioko Actionnaire-0.1.0-arm64-mac.zip`
   - Déplacez l'application dans le dossier Applications
   - Lancez l'application

### Premier lancement

Comme l'application n'est pas signée par Apple, vous devrez :
1. Clic droit sur l'application → "Ouvrir"
2. Cliquez sur "Ouvrir" dans la boîte de dialogue de sécurité

OU

1. Allez dans Préférences Système → Sécurité et confidentialité
2. Cliquez sur "Ouvrir quand même" pour Dioko Actionnaire

## Installation sur Windows

### Prérequis
- Windows 10 ou supérieur
- Node.js installé (version 18 ou supérieur)

### Construction du build Windows

Depuis un Mac, vous ne pouvez pas créer directement un build Windows. Vous devez :

**Option 1 : Utiliser une machine Windows**
```bash
# Sur la machine Windows
git clone <votre-repo>
cd "frontend copy"
npm install
npm run build
npm run dist:win
```

Cela créera :
- `Dioko Actionnaire Setup-0.1.0.exe` - Installateur Windows
- `Dioko Actionnaire-0.1.0.exe` - Version portable

**Option 2 : Utiliser GitHub Actions / CI/CD**
Configurez un workflow GitHub Actions pour construire automatiquement pour toutes les plateformes.

## Installation sur Linux

### Construction du build Linux

```bash
npm install
npm run build
npm run dist:linux
```

Cela créera :
- `Dioko-Actionnaire-0.1.0.AppImage` - Application portable
- `dioko-actionnaire_0.1.0_amd64.deb` - Package Debian

### Installation sur Ubuntu/Debian
```bash
sudo dpkg -i dioko-actionnaire_0.1.0_amd64.deb
```

### Utilisation de l'AppImage
```bash
chmod +x Dioko-Actionnaire-0.1.0.AppImage
./Dioko-Actionnaire-0.1.0.AppImage
```

## Distribution sur d'autres machines

### Pour Mac
1. Partagez le fichier DMG ou ZIP
2. Les utilisateurs doivent avoir macOS 10.12 ou supérieur
3. Les utilisateurs devront autoriser l'ouverture de l'application (voir "Premier lancement")

### Pour Windows
1. Partagez le fichier Setup.exe ou la version portable
2. Les utilisateurs auront peut-être besoin d'autoriser l'exécution via Windows Defender

### Pour Linux
1. Partagez le fichier AppImage ou .deb
2. Les utilisateurs devront peut-être le rendre exécutable

## Configuration requise

### Toutes les plateformes
- RAM : 4 GB minimum, 8 GB recommandé
- Espace disque : 500 MB d'espace libre
- Connexion Internet : Requise pour les fonctionnalités en ligne

### Ports utilisés
- Port 3000 : Serveur Next.js local (automatiquement géré par l'application)

## Dépannage

### L'application ne démarre pas
1. Vérifiez que le port 3000 n'est pas utilisé par une autre application
2. Fermez complètement l'application (Cmd+Q sur Mac) et relancez
3. Consultez les logs dans la console :
   - Mac: Lancez Console.app et cherchez "Dioko Actionnaire"
   - Ou lancez depuis le Terminal : `open -a "Dioko Actionnaire"`

### Écran blanc au démarrage
L'application affiche "Chargement de Dioko Actionnaire..." pendant le démarrage du serveur.

**Si l'écran reste blanc :**
1. Attendez jusqu'à 30 secondes (première ouverture peut être lente)
2. Fermez complètement (Cmd+Q) et relancez
3. Vérifiez qu'aucun autre serveur n'utilise le port 3000 :
   ```bash
   lsof -ti:3000
   # Si quelque chose utilise le port, tuez le processus :
   kill $(lsof -ti:3000)
   ```
4. Si le problème persiste, ouvrez l'application depuis le Terminal pour voir les logs :
   ```bash
   open -a "Dioko Actionnaire"
   ```

### Page blanche après installation
Si vous avez installé une version précédente, supprimez-la complètement :
1. Déplacez l'ancienne application vers la Corbeille
2. Videz la Corbeille
3. Installez la nouvelle version

### Problèmes de connexion
Vérifiez votre connexion Internet et les paramètres dans les fichiers .env

## Build pour production avec code signing

Pour une distribution professionnelle :

### Mac
```bash
# Nécessite un certificat Apple Developer
export CSC_LINK=<chemin-vers-certificat.p12>
export CSC_KEY_PASSWORD=<mot-de-passe>
npm run dist:mac
```

### Windows
```bash
# Nécessite un certificat de signature de code
npm run dist:win
```

## Contact

Pour toute question ou problème, contactez l'équipe de support Dioko.
