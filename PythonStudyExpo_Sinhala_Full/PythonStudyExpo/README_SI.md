# Python ඉගෙනුම — සිංහල සම්පූර්ණ යෙදුම (Expo Go)

## අවශ්‍ය දේ
- Node.js LTS
- Expo Go (project එකේ SDK එකට ගැළපෙන version එක)
- Windows CMD හෝ PowerShell

## Windows තුළ run කිරීම
1. ZIP file එක extract කරන්න.
2. `PythonStudyExpo` folder එක තුළ CMD open කරන්න.
3. පහත commands එකින් එක run කරන්න; එකම පේළියකට එකතු නොකරන්න.

```bat
npm install
npx expo install --fix
npx expo-doctor
npx expo start --clear
```

4. පෙන්වන QR code එක Expo Go මඟින් scan කරන්න. Phone සහ computer එක එකම Wi-Fi එකේ තිබීම සුදුසුය.

## විශේෂාංග
- සිංහල onboarding, home dashboard, header සහ bottom navigation
- Python පාඩම් 25ක්: syntax, variables, data types, casting, input/output, operators, strings, conditions, loops, collections, functions, modules, exceptions, file handling, OOP, inheritance සහ best practices
- සිංහල පැහැදිලි කිරීම් සහ Python code examples
- Python MCQ ප්‍රශ්න 41ක්; පිළිතුර තෝරාගත් පසු පැහැදිලි කිරීම පෙන්වයි
- Quiz score, summary සහ quiz අවසන් වූ පසු automatic logout
- සටහන්, keywords search, progress, settings, dark mode
- AsyncStorage මඟින් දත්ත දුරකථනයේම සුරැකීම

## වැදගත් සටහන
මෙය offline/local learning app එකකි. Real account login server එකක් නැත. Logout යනු app එකේ study session screen එකෙන් ඉවත් වීමයි; server-side authentication එකක් නොවේ.

## ගැටලුවක් ආවොත්
`npx expo install --fix` සහ `npx expo-doctor` run කරලා error message එක සම්පූර්ණයෙන්ම සුරකින්න. `npm audit fix --force` එක වහාම run නොකරන්න; breaking dependency changes ඇති විය හැක.
