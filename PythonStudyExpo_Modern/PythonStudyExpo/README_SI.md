# Python Study — Modern Purple & White (Expo Go)

## Requirements
- Node.js LTS
- Expo Go compatible with Expo SDK 57
- Windows CMD or PowerShell

## Install and run (Windows)
1. Extract this ZIP.
2. Open CMD in the `PythonStudyExpo` folder.
3. Run these commands:

```bat
npm install
npx expo install --fix
npx expo-doctor
npx expo start --clear
```

4. Scan the QR code using Expo Go. Keep your phone and computer on the same Wi-Fi network.

## Features
- Three-page onboarding carousel with working Next / Back / Skip / Get Started controls
- Modern purple-and-white UI with a header, bottom navigation/footer, and responsive cards
- 41 Python multiple-choice questions from basics through functions, collections, loops, exceptions, files, comprehensions and OOP
- Immediate answer feedback and explanations, quiz progress, final score and summary
- Automatic logout after the quiz result screen (about 5 seconds), plus a manual Logout button
- Logout confirmation from the header
- Python theory examples, searchable keywords, sticky notes, progress dashboard and settings
- AsyncStorage persistence for onboarding, quiz answers, notes, settings and study tasks

## Notes
This is a local learning app and does not use a real authentication server. Logout ends the current app session view; it is not server-side account authentication. Data is stored on the device. Clearing app storage or uninstalling the app may remove it.

## Troubleshooting
If the app fails to start, run:

```bat
npx expo install --fix
npx expo-doctor
npx expo start --clear
```

If there is still an error, send the full terminal error output.
