import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator, Alert, FlatList, SafeAreaView, ScrollView, StatusBar,
  StyleSheet, Switch, Text, TextInput, TouchableOpacity, View, useWindowDimensions
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Note = { id: string; title: string; body: string; color: string; date: string };
type QuizAnswer = { questionId: string; answer: string; correct: boolean };

const KEYS = {
  onboarding: "@pythonstudy/onboardingDone",
  notes: "@pythonstudy/notes",
  quiz: "@pythonstudy/quizAnswers",
  settings: "@pythonstudy/settings",
  progress: "@pythonstudy/progress",
};

const COLORS = {
  navy: "#10213B", blue: "#6854E8", purple: "#7254E8", bg: "#F8F7FF",
  text: "#142544", muted: "#71809C", white: "#FFFFFF", green: "#18A879",
};

const slides = [
  { eyebrow: "සාදරයෙන් පිළිගනිමු", title: "Python ඉගෙනුම", subtitle: "ඉගෙන ගන්න • පුහුණු වෙන්න • දියුණු වෙන්න", emoji: "🐍", detail: "Python පියවරෙන් පියවර සරලව ඉගෙන ගන්න ඔබේ ඉගෙනුම් අවකාශය.", color: "#E9E7FF" },
  { eyebrow: "අලුත් දෙයක් ඉගෙන ගන්න", title: "Python තේරුම් ගනිමු", subtitle: "සරල පාඩම් • පැහැදිලි උදාහරණ", emoji: "💻", detail: "Variables, data types, loops සහ functions සරල පැහැදිලි කිරීම් සමඟ ඉගෙන ගන්න.", color: "#DFF4FF" },
  { eyebrow: "ඔබේ ගමන මෙතැනින්", title: "දිනපතා පුහුණු වෙන්න", subtitle: "ප්‍රශ්නාවලි • සටහන් • ප්‍රගතිය", emoji: "🚀", detail: "ඔබේ දැනුම පරීක්ෂා කරන්න, නැවත කියවීමට සටහන් තබාගන්න, ප්‍රගතිය බලන්න.", color: "#E0F9EF" },
];

const questions = [
  { id: "q1", question: "Python හි එක් පේළියක comment එකක් ලිවීමට භාවිතා කරන සංකේතය කුමක්ද?", options: ["//", "#", "<!--", "**"], answer: "#", explanation: "Python හි single-line comment එකක් # සංකේතයෙන් ආරම්භ වේ." },
  { id: "q2", question: "නිවැරදි Python variable assignment එක කුමක්ද?", options: ["2name = 'Sam'", "name = 'Sam'", "name := 'Sam'", "var name = 'Sam'"], answer: "name = 'Sam'", explanation: "Variable නාමයක් ඉලක්කමකින් ආරම්භ කළ නොහැක. Python හි var keyword එක භාවිතා නොවේ." },
  { id: "q3", question: "Python හි 7 අගයේ data type එක කුමක්ද?", options: ["float", "str", "int", "bool"], answer: "int", explanation: "දශම ලක්ෂ්‍යයක් නොමැති පූර්ණ සංඛ්‍යා අගයක type එක int වේ." },
  { id: "q4", question: "7.0 අගයේ data type එක කුමක්ද?", options: ["int", "float", "complex", "str"], answer: "float", explanation: "දශම ලක්ෂ්‍යයක් සහිත සංඛ්‍යා අගයක් float වේ." },
  { id: "q5", question: "Boolean value එක කුමක්ද?", options: ["'False'", "0", "False", "'True'"], answer: "False", explanation: "උද්ධෘත ලකුණු නොමැති False යනු Boolean අගයකි. උද්ධෘත ලකුණු තුළ ඇති අගයන් string වේ." },
  { id: "q6", question: "Console එකේ පෙළ පෙන්වන්නේ කුමන function එකෙන්ද?", options: ["echo()", "write()", "print()", "show()"], answer: "print()", explanation: "print() මඟින් අගයන් output එකට පෙන්වයි." },
  { id: "q7", question: "Keyboard එකෙන් text input ලබාගන්නේ කුමන function එකෙන්ද?", options: ["scan()", "input()", "readline()", "keyboard()"], answer: "input()", explanation: "input() පරිශීලකයා ඇතුළත් කරන දත්ත string එකක් ලෙස ලබා දෙයි." },
  { id: "q8", question: "10 // 3 හි ප්‍රතිඵලය කුමක්ද?", options: ["3.33", "1", "3", "4"], answer: "3", explanation: "// operator එක floor division සිදු කරයි. 10 // 3 හි ප්‍රතිඵලය 3 වේ." },
  { id: "q9", question: "10 % 3 හි ප්‍රතිඵලය කුමක්ද?", options: ["3", "1", "0", "3.33"], answer: "1", explanation: "% operator එක බෙදීමෙන් ඉතිරි වන remainder එක ලබා දෙයි. 10 බෙදීම 3 කළ විට ඉතිරිය 1 වේ." },
  { id: "q10", question: "List එකක් සෑදීමට භාවිතා කරන්නේ කුමන වරහන් ද?", options: ["( )", "{ }", "[ ]", "< >"], answer: "[ ]", explanation: "List එකක් square brackets [ ] තුළ ලියයි." },
  { id: "q11", question: "වෙනස් කළ නොහැකි collection එක කුමක්ද?", options: ["list", "tuple", "set", "dict"], answer: "tuple", explanation: "Tuple එකක් සෑදූ පසු එහි අංග වෙනස් කළ නොහැක." },
  { id: "q12", question: "Key-value pairs ගබඩා කරන්නේ කුමන collection එකද?", options: ["set", "tuple", "dict", "list"], answer: "dict", explanation: "Dictionary එකක් keys සහ ඒවාට අදාළ values ගබඩා කරයි." },
  { id: "q13", question: "අනුපිටපත් නොමැති unique values තබන්නේ කුමන collection එකද?", options: ["list", "set", "tuple", "string"], answer: "set", explanation: "Set එකක unique elements පමණක් පවතින අතර duplicate අගයන් ඉවත් වේ." },
  { id: "q14", question: "len([4, 5, 6]) මඟින් ලැබෙන්නේ කුමක්ද?", options: ["2", "3", "4", "6"], answer: "3", explanation: "List එකේ elements තුනක් ඇති නිසා len() මඟින් 3 ලැබේ." },
  { id: "q15", question: "Python list එකක පළමු index එක කුමක්ද?", options: ["1", "-1", "0", "Depends on list size"], answer: "0", explanation: "Python sequence වල index කිරීම 0 සිට ආරම්භ වේ." },
  { id: "q16", question: "nums.append(8) මඟින් සිදුවන්නේ කුමක්ද?", options: ["Removes 8", "Adds 8 to the end", "Sorts the list", "Returns the list length"], answer: "Adds 8 to the end", explanation: "append() මඟින් list එකේ අවසානයට අලුත් item එකක් එකතු කරයි." },
  { id: "q17", question: "Condition එකක් ආරම්භ කිරීමට භාවිතා කරන keyword එක කුමක්ද?", options: ["when", "if", "check", "case"], answer: "if", explanation: "Python හි conditional statement එකක් if මඟින් ආරම්භ වේ." },
  { id: "q18", question: "if එකකට පසුව වෙනත් condition එකක් පරීක්ෂා කරන්නේ කුමන keyword එකෙන්ද?", options: ["elseif", "elsif", "elif", "otherwise"], answer: "elif", explanation: "පෙර conditions අසත්‍ය වූ විට තවත් condition එකක් පරීක්ෂා කිරීමට elif භාවිතා කරයි." },
  { id: "q19", question: "List එකක items හරහා යාමට සාමාන්‍යයෙන් භාවිතා කරන loop එක කුමක්ද?", options: ["repeat", "foreach", "for", "loop"], answer: "for", explanation: "for loop එක list එකක් වැනි iterable එකක items එකින් එක ලබාගනී." },
  { id: "q20", question: "range(4) මඟින් ලැබෙන අගයන් මොනවාද?", options: ["1, 2, 3, 4", "0, 1, 2, 3", "0, 1, 2, 3, 4", "4 only"], answer: "0, 1, 2, 3", explanation: "range(4) 0 සිට ආරම්භ වී 4 ට පෙර නවතී." },
  { id: "q21", question: "Loop එකක් වහාම නවත්වන්නේ කුමන keyword එකෙන්ද?", options: ["stop", "exit", "break", "skip"], answer: "break", explanation: "break මඟින් දැනට ක්‍රියාත්මක වන ආසන්නතම loop එක නවත්වයි." },
  { id: "q22", question: "Loop එකේ ඊළඟ iteration එකට යන්නේ කුමන keyword එකෙන්ද?", options: ["pass", "continue", "break", "next"], answer: "continue", explanation: "continue මඟින් වත්මන් iteration එකේ ඉතිරි කොටස මඟහැර ඊළඟ iteration එකට යයි." },
  { id: "q23", question: "Function එකක් define කිරීමට භාවිතා කරන keyword එක කුමක්ද?", options: ["func", "function", "def", "lambda"], answer: "def", explanation: "නමක් ඇති function එකක් def භාවිතයෙන් නිර්වචනය කරයි." },
  { id: "q24", question: "Function එකක return මඟින් සිදුවන්නේ කුමක්ද?", options: ["Repeats the function", "Sends a value back to the caller", "Prints a value automatically", "Imports a module"], answer: "Sends a value back to the caller", explanation: "return මඟින් function එකේ ක්‍රියාකාරිත්වය අවසන් කර අවශ්‍ය නම් ප්‍රතිඵලයක් ආපසු ලබා දෙයි." },
  { id: "q25", question: "'Py' + 'thon' හි ප්‍රතිඵලය කුමක්ද?", options: ["Py thon", "Python", "Error always", "Py+thon"], answer: "Python", explanation: "+ operator එක strings දෙකක් එකට සම්බන්ධ කරයි." },
  { id: "q26", question: "'hello' uppercase බවට පත් කරන method එක කුමක්ද?", options: ["upper()", "capitalize_all()", "uppercase()", "toUpper()"], answer: "upper()", explanation: "str.upper() මඟින් string එකේ අකුරු uppercase ලෙස ලබා දෙයි." },
  { id: "q27", question: "items වල පළමු items තුන ලබාගන්නා slice එක කුමක්ද?", options: ["items[1:3]", "items[:3]", "items[3:]", "items[-3:]"], answer: "items[:3]", explanation: "අවසාන index එක 3 වන slice එකට 0, 1, 2 යන index ඇතුළත් වේ." },
  { id: "q28", question: "Exception එකක් handle කරන්නේ කෙසේද?", options: ["try / except", "if / else only", "for / catch", "test / error"], answer: "try / except", explanation: "try block එකේ දෝෂයක් ඇතිවිය හැකි code ලියන අතර except මඟින් අදාළ exception එක handle කරයි." },
  { id: "q29", question: "Exception එකක් ඇති වුවත් නැතත් ක්‍රියාත්මක වන block එක කුමක්ද?", options: ["except", "finally", "raise", "assert"], answer: "finally", explanation: "finally block එක exception එකක් ඇති වුවත් නැතත් අවසානයේ කළ යුතු cleanup කටයුතු සඳහා භාවිතා කරයි." },
  { id: "q30", question: "Module එකක් import කිරීමට භාවිතා කරන keyword එක කුමක්ද?", options: ["include", "using", "import", "require"], answer: "import", explanation: "Module එකක් භාවිතයට ගැනීමට Python හි import keyword එක භාවිතා කරයි." },
  { id: "q31", question: "len('cat') මඟින් ලැබෙන්නේ කුමක්ද?", options: ["2", "3", "4", "'cat'"], answer: "3", explanation: "'cat' string එකේ අක්ෂර තුනක් ඇත." },
  { id: "q32", question: "අගයන් සමානදැයි පරීක්ෂා කරන්නේ කුමන expression එකෙන්ද?", options: ["x = 5", "x == 5", "x === 5", "x equals 5"], answer: "x == 5", explanation: "== අගයන් සසඳන අතර = මඟින් අගයක් assign කරයි." },
  { id: "q33", question: "Logical AND සඳහා භාවිතා කරන operator එක කුමක්ද?", options: ["&&", "AND", "and", "&"], answer: "and", explanation: "Python හි logical AND operator එක and keyword එකයි." },
  { id: "q34", question: "None මඟින් නිරූපණය කරන්නේ කුමක්ද?", options: ["An empty string", "No value / absence of a value", "The number zero only", "False in every context"], answer: "No value / absence of a value", explanation: "None යනු අගයක් නොමැති බව නිරූපණය කරන විශේෂ Python අගයකි." },
  { id: "q35", question: "Class එකක් නිර්මාණය කරන නිවැරදි ක්‍රමය කුමක්ද?", options: ["object Person:", "class Person:", "define Person:", "new class Person"], answer: "class Person:", explanation: "Class definition එකක් class keyword එකෙන් ආරම්භ වේ." },
  { id: "q36", question: "සාමාන්‍ය instance method එකක self යන්නෙන් අදහස් කරන්නේ කුමක්ද?", options: ["The current instance", "The parent class only", "The Python interpreter", "A global variable"], answer: "The current instance", explanation: "self යනු method එක කැඳවන ලද වත්මන් object instance එකට යොමු වේ." },
  { id: "q37", question: "අලුත් instance එකක ආරම්භක සැකසුම් සඳහා භාවිතා කරන method එක කුමක්ද?", options: ["__start__()", "__main__()", "__init__()", "__newclass__()"], answer: "__init__()", explanation: "Object instance එකක් නිර්මාණය වන විට එහි attributes ආරම්භ කිරීමට __init__() භාවිතා කරයි." },
  { id: "q38", question: "open('data.txt', 'r') මඟින් සිදුවන්නේ කුමක්ද?", options: ["Opens a file for reading", "Deletes the file", "Opens only for writing", "Renames the file"], answer: "Opens a file for reading", explanation: "'r' mode එක මඟින් දැනට ඇති file එකක් කියවීමට විවෘත කරයි." },
  { id: "q39", question: "'with open(...) as file:' භාවිතා කරන්නේ ඇයි?", options: ["It automatically sorts file lines", "It helps close the file reliably", "It encrypts the file", "It prevents all exceptions"], answer: "It helps close the file reliably", explanation: "with statement එක මඟින් file එක භාවිතයෙන් පසු නිවැරදිව close කිරීම සිදු කරයි." },
  { id: "q40", question: "List comprehension එකක් වන්නේ කුමක්ද?", options: ["[x * 2 for x in nums]", "(for x in nums: x * 2)", "{x * 2; nums}", "list = x * 2 for nums"], answer: "[x * 2 for x in nums]", explanation: "List comprehension එකක square brackets තුළ expression එකක් සහ for clause එකක් ඇත." },
  { id: "q41", question: "lambda මඟින් නිර්මාණය කරන්නේ කුමක්ද?", options: ["A named class", "A small anonymous function", "A loop", "A package manager"], answer: "A small anonymous function", explanation: "lambda මඟින් නමක් නොමැති කුඩා function එකක් නිර්මාණය කළ හැක." }
];

const defaultNotes: Note[] = [
  { id: "n1", title: "Python මූලික කරුණු", body: "Variables\nData Types\nInput / Output\nOperators", color: "#FFF0A8", date: "Today" },
  { id: "n2", title: "මතක තබාගන්න!", body: "List සඳහා [ ]\nTuple සඳහා ( )\nSet සඳහා { }", color: "#F9D9ED", date: "Today" },
  { id: "n3", title: "ඉගෙනුම් සැලැස්ම", body: "Python මූලික කරුණු\nMCQ 10ක්\nCoding පුහුණුව\nසංකල්ප නැවත කියවීම", color: "#CFF8E5", date: "Today" },
  { id: "n4", title: "දිරිගැන්වීම", body: "“අඛණ්ඩ පුහුණුව විශ්වාසය ගොඩනඟයි.”", color: "#D8ECFF", date: "Today" },
];

function Button({ title, onPress, secondary = false }: { title: string; onPress: () => void; secondary?: boolean }) {
  return <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[styles.button, secondary && styles.secondaryButton]}>
    <Text style={[styles.buttonText, secondary && styles.secondaryButtonText]}>{title}</Text>
  </TouchableOpacity>;
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return <View style={{ marginBottom: 12 }}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {!!subtitle && <Text style={styles.muted}>{subtitle}</Text>}
  </View>;
}

export default function App() {
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const onboardingListRef = useRef<FlatList<any>>(null);
  const [screen, setScreen] = useState("Home");
  const [notes, setNotes] = useState<Note[]>(defaultNotes);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteBody, setNewNoteBody] = useState("");
  const [noteModal, setNoteModal] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [onboard, savedNotes, savedAnswers, settings, progress] = await Promise.all([
          AsyncStorage.getItem(KEYS.onboarding), AsyncStorage.getItem(KEYS.notes),
          AsyncStorage.getItem(KEYS.quiz), AsyncStorage.getItem(KEYS.settings),
          AsyncStorage.getItem(KEYS.progress),
        ]);
        if (onboard === "true") setOnboardingDone(true);
        if (savedNotes) setNotes(JSON.parse(savedNotes));
        if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
        if (settings) {
          const s = JSON.parse(settings);
          setDarkMode(!!s.darkMode); setNotifications(s.notifications !== false);
        }
        if (progress) setCompletedTasks(JSON.parse(progress));
      } catch (e) {
        console.warn("Could not load saved data", e);
      } finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => { if (!loading) AsyncStorage.setItem(KEYS.notes, JSON.stringify(notes)).catch(console.warn); }, [notes, loading]);
  useEffect(() => { if (!loading) AsyncStorage.setItem(KEYS.quiz, JSON.stringify(answers)).catch(console.warn); }, [answers, loading]);
  useEffect(() => {
    if (!loading) AsyncStorage.setItem(KEYS.settings, JSON.stringify({ darkMode, notifications })).catch(console.warn);
  }, [darkMode, notifications, loading]);
  useEffect(() => { if (!loading) AsyncStorage.setItem(KEYS.progress, JSON.stringify(completedTasks)).catch(console.warn); }, [completedTasks, loading]);

  useEffect(() => {
    if (screen !== "QuizResult") return;
    const timer = setTimeout(() => setScreen("LoggedOut"), 5000);
    return () => clearTimeout(timer);
  }, [screen]);

  const startQuiz = () => {
    setAnswers([]);
    setQuizIndex(0);
    setSelectedAnswer("");
    setShowAnswer(false);
    setScreen("Quiz");
  };

  const logout = () => {
    setSelectedAnswer("");
    setShowAnswer(false);
    setScreen("LoggedOut");
  };

  const dark = darkMode;
  const palette = useMemo(() => ({
    bg: dark ? "#0D1728" : COLORS.bg, card: dark ? "#17243A" : "#FFFFFF",
    text: dark ? "#F3F6FF" : COLORS.text, muted: dark ? "#AAB8D0" : COLORS.muted,
    border: dark ? "#293B56" : "#E5EAF4",
  }), [dark]);

  const finishOnboarding = async () => {
    await AsyncStorage.setItem(KEYS.onboarding, "true");
    setOnboardingDone(true); setScreen("Home");
  };
  const addNote = () => {
    if (!newNoteTitle.trim() || !newNoteBody.trim()) {
      Alert.alert("විස්තර අඩුයි", "කරුණාකර මාතෘකාවක් සහ සටහනක් ඇතුළත් කරන්න.");
      return;
    }
    setNotes([{ id: Date.now().toString(), title: newNoteTitle.trim(), body: newNoteBody.trim(), color: ["#FFF0A8", "#F9D9ED", "#CFF8E5", "#D8ECFF"][notes.length % 4], date: new Date().toLocaleDateString() }, ...notes]);
    setNewNoteTitle(""); setNewNoteBody(""); setNoteModal(false);
  };
  const chooseAnswer = (option: string) => {
    if (showAnswer) return;
    setSelectedAnswer(option);
    setShowAnswer(true);
    const q = questions[quizIndex];
    const item = { questionId: q.id, answer: option, correct: option === q.answer };
    setAnswers(prev => [...prev.filter(a => a.questionId !== q.id), item]);
  };
  const nextQuestion = () => {
    if (quizIndex === questions.length - 1) {
      setScreen("QuizResult");
      return;
    }
    const nextIndex = quizIndex + 1;
    setQuizIndex(nextIndex);
    setSelectedAnswer("");
    setShowAnswer(false);
  };

  if (loading) return <SafeAreaView style={[styles.loading, { backgroundColor: palette.bg }]}><ActivityIndicator size="large" color={COLORS.purple}/><Text style={{ color: palette.text, marginTop: 10 }}>Loading your study space…</Text></SafeAreaView>;

  if (screen === "LoggedOut") {
    return <SafeAreaView style={[styles.loading, { backgroundColor: palette.bg, padding: 28 }]}>
      <StatusBar barStyle={dark ? "light-content" : "dark-content"} />
      <View style={[styles.brandMark, { width: 76, height: 76, borderRadius: 25, marginBottom: 22 }]}><Text style={{ fontSize: 42 }}>🐍</Text></View>
      <Text style={{ color: palette.text, fontSize: 28, fontWeight: "900", textAlign: "center" }}>ඔබ Logout වී ඇත</Text>
      <Text style={{ color: palette.muted, fontSize: 14, textAlign: "center", lineHeight: 22, marginTop: 10, marginBottom: 24 }}>Your quiz progress has been saved on this device. Come back when you are ready to learn more Python.</Text>
      <Button title="ඉගෙනීම දිගටම කරගෙන යන්න →" onPress={() => { setScreen("Home"); setQuizIndex(0); setSelectedAnswer(""); setShowAnswer(false); }} />
      <Text style={{ color: palette.muted, fontSize: 11, marginTop: 28 }}>PYTHON STUDY • LEARN WITH CONFIDENCE</Text>
    </SafeAreaView>;
  }

  if (!onboardingDone) {
    return <SafeAreaView style={[styles.onboarding, { backgroundColor: palette.bg }]}>
      <StatusBar barStyle={dark ? "light-content" : "dark-content"} />
      <View style={styles.onboardTop}>
        <View style={styles.brandMark}><Text style={{ fontSize: 25 }}>🐍</Text></View>
        <Text style={[styles.brandText, { color: palette.text }]}>Python ඉගෙනුම</Text>
        <TouchableOpacity onPress={finishOnboarding}><Text style={styles.skipText}>මඟහරින්න</Text></TouchableOpacity>
      </View>
      <FlatList
        ref={onboardingListRef}
        data={slides}
        horizontal pagingEnabled showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.title}
        initialScrollIndex={slideIndex}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        onMomentumScrollEnd={e => setSlideIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => <View style={[styles.slide, { width }]}>
          <View style={[styles.illustration, { backgroundColor: item.color, width: Math.min(width * 0.72, 300), height: Math.min(width * 0.72, 300) }]}>
            <View style={styles.illustrationCircle}><Text style={{ fontSize: 98 }}>{item.emoji}</Text></View>
            <View style={styles.floatBadge}><Text style={{ fontSize: 22 }}>✨</Text></View>
            <View style={styles.floatBadge2}><Text style={{ fontSize: 22 }}>📘</Text></View>
          </View>
          <Text style={styles.eyebrow}>{item.eyebrow}</Text>
          <Text style={[styles.slideTitle, { color: palette.text }]}>{item.title}</Text>
          <Text style={[styles.slideSubtitle, { color: COLORS.purple }]}>{item.subtitle}</Text>
          <Text style={[styles.slideDetail, { color: palette.muted }]}>{item.detail}</Text>
        </View>}
      />
      <View style={styles.onboardBottom}>
        <View style={styles.dots}>{slides.map((s, i) => <View key={s.title} style={[styles.dot, i === slideIndex && styles.activeDot]} />)}</View>
        <Button title={slideIndex === 2 ? "ආරම්භ කරමු →" : "ඊළඟට →"} onPress={() => { if (slideIndex === 2) { finishOnboarding(); } else { const next = Math.min(2, slideIndex + 1); setSlideIndex(next); onboardingListRef.current?.scrollToIndex({ index: next, animated: true }); } }} />
        {slideIndex > 0 && <TouchableOpacity style={styles.backLink} onPress={() => { const prev = Math.max(0, slideIndex - 1); setSlideIndex(prev); onboardingListRef.current?.scrollToIndex({ index: prev, animated: true }); }}><Text style={{ color: palette.muted }}>← Back</Text></TouchableOpacity>}
      </View>
    </SafeAreaView>;
  }

  const NavButton = ({ label, emoji }: { label: string; emoji: string }) => (
    <TouchableOpacity onPress={() => setScreen(label)} style={[styles.navItem, screen === label && styles.navActive]}>
      <Text style={styles.navEmoji}>{emoji}</Text><Text style={[styles.navLabel, screen === label && styles.navLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );

  const cardStyle = [styles.card, { backgroundColor: palette.card, borderColor: palette.border }];
  const renderHome = () => <ScrollView contentContainerStyle={styles.pageContent}>
    <View style={[styles.welcomeBanner, { backgroundColor: dark ? "#1B2D4B" : "#E8EDFF" }]}>
      <View style={{ flex: 1 }}><Text style={[styles.welcomeSmall, { color: palette.muted }]}>HELLO, STUDENT!</Text><Text style={[styles.welcomeTitle, { color: palette.text }]}>දිගටම ඉගෙන ගෙන දියුණු වෙන්න!</Text><Text style={[styles.muted, { marginTop: 6 }]}>ඔබේ ඊළඟ කුඩා පියවර අදින් ආරම්භ වේ.</Text></View>
      <Text style={{ fontSize: 44 }}>👩‍💻</Text>
    </View>
    <View style={styles.statsRow}>
      <View style={[styles.statCard, cardStyle]}><Text style={styles.statEmoji}>🧠</Text><Text style={[styles.statNumber, { color: palette.text }]}>{answers.length}</Text><Text style={[styles.muted, { fontSize: 11 }]}>උත්සාහ කළ ප්‍රශ්න</Text></View>
      <View style={[styles.statCard, cardStyle]}><Text style={styles.statEmoji}>✅</Text><Text style={[styles.statNumber, { color: palette.text }]}>{answers.filter(a => a.correct).length}</Text><Text style={[styles.muted, { fontSize: 11 }]}>නිවැරදි පිළිතුරු</Text></View>
      <View style={[styles.statCard, cardStyle]}><Text style={styles.statEmoji}>📝</Text><Text style={[styles.statNumber, { color: palette.text }]}>{notes.length}</Text><Text style={[styles.muted, { fontSize: 11 }]}>සුරැකි සටහන්</Text></View>
    </View>
    <View style={styles.sectionHeader}><SectionTitle title="ඉගෙනීම දිගටම" subtitle="නතර කළ තැනින් නැවත ආරම්භ කරන්න"/></View>
    <TouchableOpacity onPress={startQuiz} style={[styles.featureCard, { backgroundColor: "#ECE9FF" }]}>
      <View style={[styles.featureIcon, { backgroundColor: "#6A55E8" }]}><Text style={{ fontSize: 24 }}>🧩</Text></View>
      <View style={{ flex: 1 }}><Text style={[styles.featureTitle, { color: "#202D50" }]}>Python ප්‍රශ්නාවලිය</Text><Text style={{ color: "#596783", fontSize: 12, marginTop: 3 }}>MCQ ප්‍රශ්න මඟින් ඔබේ දැනුම පරීක්ෂා කරන්න</Text><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.min(100, answers.length / questions.length * 100)}%` }]} /></View></View>
      <Text style={{ color: COLORS.purple, fontWeight: "800" }}>→</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => setScreen("Theory")} style={[styles.featureCard, { backgroundColor: "#E1F4FF" }]}>
      <View style={[styles.featureIcon, { backgroundColor: "#3A79E8" }]}><Text style={{ fontSize: 24 }}>📘</Text></View>
      <View style={{ flex: 1 }}><Text style={[styles.featureTitle, { color: "#202D50" }]}>Python න්‍යාය</Text><Text style={{ color: "#596783", fontSize: 12, marginTop: 3 }}>උදාහරණ සමඟ සංකල්ප තේරුම් ගන්න</Text></View><Text style={{ color: "#3A79E8", fontWeight: "800" }}>→</Text>
    </TouchableOpacity>
    <View style={styles.sectionHeader}><SectionTitle title="ඔබේ ඉගෙනුම් සැලැස්ම" subtitle="දිනපතා කුඩා පියවර"/></View>
    {["Python මූලික කරුණු අවසන් කරන්න", "MCQ ප්‍රශ්න 10ක් කරන්න", "Code ලිවීම පුහුණු කරන්න", "වැදගත් සංකල්ප නැවත බලන්න"].map(task => <TouchableOpacity key={task} onPress={() => setCompletedTasks(prev => prev.includes(task) ? prev.filter(x => x !== task) : [...prev, task])} style={[styles.taskRow, cardStyle]}><Text style={{ fontSize: 19, marginRight: 10 }}>{completedTasks.includes(task) ? "☑️" : "⬜"}</Text><Text style={[styles.taskText, { color: palette.text }, completedTasks.includes(task) && styles.taskDone]}>{task}</Text></TouchableOpacity>)}
  </ScrollView>;

  const renderQuiz = () => {
    const q = questions[quizIndex];
    const correctCount = answers.filter(a => a.correct).length;
    const progress = ((quizIndex + (showAnswer ? 1 : 0)) / questions.length) * 100;
    return <ScrollView contentContainerStyle={styles.pageContent}>
      <View style={[styles.quizHero, { backgroundColor: "#EEE9FF" }]}>
        <Text style={{ color: COLORS.purple, fontWeight: "900", fontSize: 11, letterSpacing: 1.5 }}>PYTHON දැනුම පරීක්ෂාව</Text>
        <Text style={{ color: "#28214F", fontSize: 25, fontWeight: "900", marginTop: 7 }}>ඔබේ දැනුම අභියෝගයට ලක් කරන්න.</Text>
        <Text style={{ color: "#6C6687", fontSize: 12, marginTop: 5 }}>ප්‍රශ්න 41ක් • මූලික කරුණු සිට OOP දක්වා</Text>
        <View style={[styles.progressTrack, { backgroundColor: "#D7CEF9", marginTop: 15 }]}><View style={[styles.progressFill, { width: `${Math.min(100, progress)}%` }]} /></View>
      </View>
      <View style={styles.rowBetween}>
        <Text style={[styles.muted, { color: palette.muted }]}>QUESTION {quizIndex + 1} / {questions.length}</Text>
        <Text style={{ color: COLORS.purple, fontSize: 12, fontWeight: "900" }}>{correctCount} correct</Text>
      </View>
      <View style={[cardStyle, { marginTop: 10 }]}>
        <View style={styles.quizHeader}><View style={styles.questionBadge}><Text style={{ color: COLORS.purple, fontWeight: "900" }}>{String(quizIndex + 1).padStart(2, "0")}</Text></View><Text style={[styles.quizQuestion, { color: palette.text }]}>{q.question}</Text></View>
        {q.options.map((option, i) => {
          const isCorrect = showAnswer && option === q.answer;
          const isWrong = showAnswer && option === selectedAnswer && option !== q.answer;
          return <TouchableOpacity key={option} onPress={() => chooseAnswer(option)} style={[styles.option, { borderColor: palette.border, backgroundColor: palette.card }, isCorrect && styles.optionCorrect, isWrong && styles.optionWrong, selectedAnswer === option && !showAnswer && styles.optionSelected]}>
            <Text style={[styles.optionLetter, { color: palette.muted }]}>{String.fromCharCode(65 + i)}</Text><Text style={[styles.optionText, { color: palette.text }]}>{option}</Text><Text style={{ fontWeight: "900", color: isCorrect ? "#16865D" : "#D34C4C" }}>{isCorrect ? "✓" : isWrong ? "✕" : ""}</Text>
          </TouchableOpacity>;
        })}
        {showAnswer && <View style={[styles.explanation, { backgroundColor: selectedAnswer === q.answer ? "#E3F8EF" : "#FFF0E9" }]}><Text style={{ fontWeight: "900", color: selectedAnswer === q.answer ? "#12845F" : "#B65A26" }}>{selectedAnswer === q.answer ? "නිවැරදියි! ඉතා හොඳයි." : "දිගටම උත්සාහ කරන්න — පුහුණුවෙන් ඉගෙන ගත හැක."}</Text><Text style={{ color: "#343A51", marginTop: 5, lineHeight: 20 }}>{q.explanation}</Text></View>}
        <Button title={!showAnswer ? "පිළිතුරක් තෝරන්න" : quizIndex === questions.length - 1 ? "ප්‍රශ්නාවලිය අවසන් කරන්න →" : "ඊළඟ ප්‍රශ්නය →"} onPress={showAnswer ? nextQuestion : () => Alert.alert("පිළිතුරක් තෝරන්න", "පළමුව පිළිතුරු විකල්පයකට තට්ටු කරන්න.")} />
      </View>
      <Text style={[styles.muted, { textAlign: "center", marginTop: 4 }]}>Take your time. Explanations appear after each answer.</Text>
    </ScrollView>;
  };

  const renderQuizResult = () => {
    const correct = answers.filter(a => a.correct).length;
    const percent = Math.round((correct / questions.length) * 100);
    return <ScrollView contentContainerStyle={styles.pageContent}>
      <View style={[styles.resultCard, { backgroundColor: "#EEE9FF" }]}>
        <Text style={{ fontSize: 58, textAlign: "center" }}>{percent >= 80 ? "🏆" : percent >= 50 ? "🌟" : "💜"}</Text>
        <Text style={{ color: "#28214F", fontSize: 28, fontWeight: "900", textAlign: "center", marginTop: 12 }}>Quiz completed!</Text>
        <Text style={{ color: "#6C6687", textAlign: "center", marginTop: 6 }}>Python ප්‍රශ්න {questions.length}ටම ඔබ පිළිතුරු දුන්නා.</Text>
        <Text style={{ color: COLORS.purple, fontSize: 52, fontWeight: "900", textAlign: "center", marginTop: 20 }}>{correct}/{questions.length}</Text>
        <Text style={{ color: "#514A70", textAlign: "center", fontWeight: "800" }}>{percent}% accuracy</Text>
        <View style={[styles.progressTrack, { backgroundColor: "#D7CEF9", marginTop: 18 }]}><View style={[styles.progressFill, { width: `${percent}%` }]} /></View>
        <Text style={{ color: "#514A70", textAlign: "center", lineHeight: 22, marginTop: 18 }}>{percent >= 80 ? "විශිෂ්ටයි! ඔබේ Python මූලික දැනුම හොඳයි." : percent >= 50 ? "හොඳ උත්සාහයක්. පැහැදිලි කිරීම් නැවත කියවා උත්සාහ කරන්න." : "සෑම උත්සාහයකින්ම ඉගෙන ගත හැක. පාඩම් නැවත කියවා යළි උත්සාහ කරන්න."}</Text>
      </View>
      <View style={[cardStyle, { marginTop: 14 }]}><Text style={[styles.theoryTitle, { color: palette.text }]}>සැසියේ සාරාංශය</Text><View style={styles.summaryRow}><Text style={styles.muted}>පිළිතුරු දුන් ප්‍රශ්න</Text><Text style={[styles.summaryValue, { color: palette.text }]}>{answers.length}/{questions.length}</Text></View><View style={styles.summaryRow}><Text style={styles.muted}>නිවැරදි පිළිතුරු</Text><Text style={[styles.summaryValue, { color: palette.text }]}>{correct}</Text></View><View style={styles.summaryRow}><Text style={styles.muted}>වැරදි පිළිතුරු</Text><Text style={[styles.summaryValue, { color: palette.text }]}>{answers.length - correct}</Text></View></View>
      <Button title="දැන් Logout වෙන්න" onPress={logout} />
      <Text style={[styles.muted, { textAlign: "center", marginTop: 10 }]}>For your security, this session will log out automatically in a few seconds.</Text>
    </ScrollView>;
  };

  const renderTheory = () => <ScrollView contentContainerStyle={styles.pageContent}>
    <SectionTitle title="Python සම්පූර්ණ න්‍යාය" subtitle="මූලික කරුණු සිට OOP, files සහ advanced concepts දක්වා පාඩම් 25ක්"/>
    <View style={[cardStyle, { marginBottom: 14, backgroundColor: dark ? palette.card : "#EEE9FF" }]}>
      <Text style={[styles.theoryTitle, { color: palette.text }]}>📚 මේ පාඩම් භාවිතා කරන ආකාරය</Text>
      <Text style={[styles.theoryBody, { color: palette.muted, marginBottom: 0 }]}>එක් පාඩමක් කියවා code example එකේ අර්ථය තේරුම් ගන්න. ඉන්පසු code එක Python interpreter එකක run කරලා අත්හදා බලන්න. Code එකේ English keywords වෙනස් නොකරන්න.</Text>
    </View>
    {[
      ["01. Python හැඳින්වීම", "Python යනු කියවීමට සහ ලිවීමට පහසු, high-level, interpreted programming language එකකි. Web development, automation, data analysis, AI සහ scripting සඳහා භාවිතා කරයි.", `print("Hello, Python!")\nprint(2 + 3)`, "print() මඟින් output එක පෙන්වයි. Python code එක සාමාන්‍යයෙන් ඉහළ සිට පහළට ක්‍රියාත්මක වේ."],
      ["02. Syntax සහ Indentation", "Syntax යනු code ලියන නීති වේ. Python හි code block හඳුනාගැනීමට indentation (spaces) භාවිතා කරයි. එකම block එකේ indentation එක සමාන විය යුතුය.", `if True:\n    print("මේ block එක ඇතුළේ")\nprint("මේ block එකෙන් පිටත")`, "සාමාන්‍යයෙන් indentation සඳහා spaces 4ක් භාවිතා කරන්න."],
      ["03. Comments", "Comments යනු Python විසින් ක්‍රියාත්මක නොකරන පැහැදිලි කිරීමේ සටහන් වේ. එක් පේළියක comment සඳහා # භාවිතා කරයි.", `# මෙය comment එකකි\nname = "Nimal"  # නම ගබඩා කිරීම`, "Code එක ඇයි ලිව්වේද යන්න පැහැදිලි කිරීමට comments යොදන්න."],
      ["04. Variables සහ Naming", "Variable එකක් යනු අගයක් සම්බන්ධ කරන නමකි. Python හි variable එකක් නිර්මාණය කිරීමට type එක වෙනම සඳහන් කිරීමට අවශ්‍ය නැත. නමක් අකුරකින් හෝ underscore එකකින් ආරම්භ විය යුතුය.", `student_name = "Kamal"\nage = 21\n_is_active = True`, "2name වැනි නමක් වලංගු නොවේ. Python case-sensitive නිසා age සහ Age වෙනස් නම් වේ."],
      ["05. Data Types", "ප්‍රධාන built-in data types: int (පූර්ණ සංඛ්‍යා), float (දශම), complex, str (පෙළ), bool (True/False), list, tuple, set සහ dict.", `count = 10          # int\nprice = 25.50       # float\nname = "Python"     # str\nactive = True       # bool\nprint(type(price))`, "type(value) මඟින් අගයක data type එක පරීක්ෂා කළ හැක."],
      ["06. Type Conversion", "එක් data type එකක් තවත් type එකකට මාරු කිරීම type conversion හෝ casting ලෙස හැඳින්වේ. int(), float(), str() සහ bool() පොදු functions වේ.", `age_text = "23"\nage = int(age_text)\nprice = float("12.5")\nprint(age + 2)  # 25`, "වැරදි අන්තර්ගතයක් int() වෙත දුන්නොත් ValueError ඇති විය හැක."],
      ["07. Input සහ Output", "print() මඟින් output පෙන්වයි. input() මඟින් පරිශීලකයාගෙන් දත්ත ලබාගනී; input() ලබාදෙන අගය string එකකි. සංඛ්‍යාවක් අවශ්‍ය නම් conversion කරන්න.", `name = input("ඔබේ නම: ")\nage = int(input("වයස: "))\nprint(f"ආයුබෝවන් {name}! ඔබේ වයස {age}යි.")`, "f-string එකක් තුළ { } භාවිතයෙන් variable අගයන් text එකට ඇතුළත් කළ හැක."],
      ["08. Operators", "Arithmetic: +, -, *, /, //, %, **. Comparison: ==, !=, >, <, >=, <=. Logical: and, or, not. Assignment operators අගයන් assign හෝ update කරයි.", `print(10 / 3)   # 3.333...\nprint(10 // 3)  # 3\nprint(10 % 3)   # 1\nprint(2 ** 3)   # 8`, "/ මඟින් සාමාන්‍ය division ද, // මඟින් floor division ද, % මඟින් remainder ද ලැබේ."],
      ["09. Strings", "String යනු quotes තුළ ලියන text එකකි. Strings immutable වේ. Indexing, slicing සහ methods භාවිතයෙන් string එකක කොටස් හෝ වෙනස් ආකාරයේ ප්‍රතිඵල ලබාගත හැක.", `text = "Python Study"\nprint(text[0])\nprint(text[0:6])\nprint(text.upper())\nprint(text.replace("Study", "Class"))`, "Index 0 සිට ආරම්භ වේ. Slicing හි අවසාන index එක ඇතුළත් නොවේ."],
      ["10. If / Elif / Else", "Condition එකක් True ද False ද යන්න අනුව වෙනස් code ක්‍රියාත්මක කරයි. if පළමු condition එක පරීක්ෂා කරයි; elif වෙනත් condition පරීක්ෂා කරයි; else ඉතිරි අවස්ථාව සඳහා යොදාගනී.", `marks = 76\nif marks >= 75:\n    print("A")\nelif marks >= 50:\n    print("Pass")\nelse:\n    print("Try again")`, "Condition එකක අවසානයේ colon (:) යොදන්න; block එක indent කරන්න."],
      ["11. While Loop", "while loop එක condition එක True වන තුරු නැවත නැවත ක්‍රියාත්මක වේ. Condition එක වෙනස් නොවුණොත් infinite loop එකක් ඇති විය හැක.", `count = 1\nwhile count <= 3:\n    print(count)\n    count += 1`, "Loop එක අවසන් වන බව තහවුරු කිරීමට count වැනි variable එක update කරන්න."],
      ["12. For Loop සහ range()", "for loop එක list, string, tuple හෝ වෙනත් iterable එකක items එකින් එක ලබාගනී. range(stop) 0 සිට stop අගයට පෙර දක්වා අගයන් ලබාදෙයි.", `for fruit in ["ඇපල්", "අඹ", "දොඩම්"]:\n    print(fruit)\n\nfor n in range(1, 5):\n    print(n)`, "range(1, 5) මඟින් 1, 2, 3, 4 ලැබේ; 5 ඇතුළත් නොවේ."],
      ["13. Break, Continue, Pass", "break loop එක නවත්වයි. continue වත්මන් iteration එකේ ඉතිරිය මඟහැර ඊළඟ එකට යයි. pass කිසිවක් නොකර placeholder එකක් ලෙස භාවිතා වේ.", `for n in range(5):\n    if n == 2:\n        continue\n    if n == 4:\n        break\n    print(n)\n\ndef later():\n    pass`, "break සහ continue loop තුළ භාවිතා වන අතර pass function/class/block එකක් පසුව සම්පූර්ණ කිරීමට ඉඩ දෙයි."],
      ["14. Lists", "List යනු අනුපිළිවෙළක් ඇති, වෙනස් කළ හැකි collection එකකි. එකම list එකක විවිධ data types තබාගත හැක. append(), extend(), insert(), remove(), pop() සහ sort() වැදගත් methods වේ.", `fruits = ["අඹ", "ඇපල්"]\nfruits.append("දොඩම්")\nfruits[0] = "කෙසෙල්"\nprint(fruits)\nprint(len(fruits))`, "List එක mutable වේ. Indexing 0 සිට ආරම්භ වේ."],
      ["15. Tuples සහ Sets", "Tuple යනු අනුපිළිවෙළක් ඇති නමුත් වෙනස් කළ නොහැකි collection එකකි. Set එක unique values පමණක් තබන අතර සාමාන්‍යයෙන් duplicate අගයන් ඉවත් කරයි.", `point = (10, 20)\ncolors = {"රතු", "නිල්", "රතු"}\nprint(point[0])\nprint(colors)  # රතු එක වරක් පමණි`, "Tuple සඳහා ( ) සහ set සඳහා { } භාවිතා කරයි. හිස් set එකක් සෑදීමට set() භාවිතා කරන්න; {} යනු හිස් dictionary එකකි."],
      ["16. Dictionaries", "Dictionary එකක් key-value pairs ගබඩා කරයි. Keys සාමාන්‍යයෙන් unique විය යුතුය. අගයන් key එකක් හරහා ලබාගැනීමට, එකතු කිරීමට හෝ වෙනස් කිරීමට හැක.", `student = {"name": "Saman", "age": 20}\nprint(student["name"])\nstudent["age"] = 21\nstudent["city"] = "Galle"`, "get() මඟින් key එකක් නොමැති විට error එකක් නොදෙන ආකාරයට අගයක් ලබාගත හැක."],
      ["17. Functions සහ Parameters", "Function යනු නැවත භාවිතා කළ හැකි code කොටසකි. def මඟින් function එකක් define කරයි. Parameters මඟින් input ලබාගනී; return මඟින් ප්‍රතිඵලයක් ආපසු ලබාදෙයි.", `def add(a, b):\n    return a + b\n\nanswer = add(4, 6)\nprint(answer)  # 10`, "Function එක define කිරීම සහ එය call කිරීම වෙනස් දේවල් දෙකකි."],
      ["18. Default සහ Keyword Arguments", "Function parameters සඳහා default values ලබාදිය හැක. Function call කරන විට argument නම සඳහන් කිරීම keyword argument ලෙස හැඳින්වේ.", `def greet(name, message="ආයුබෝවන්"):\n    print(message, name)\n\ngreet("Nimali")\ngreet(name="Kamal", message="හායි")`, "Default value ඇති parameter එකක් නොදුන්නොත් එහි default value භාවිතා වේ."],
      ["19. Lambda සහ Comprehensions", "lambda යනු කුඩා anonymous function එකක් නිර්මාණය කරන syntax එකකි. List comprehension එකක් මඟින් iterable එකකින් නව list එකක් කෙටියෙන් සෑදිය හැක.", `square = lambda x: x * x\nprint(square(5))\n\nnumbers = [1, 2, 3, 4]\nsquares = [n * n for n in numbers]\nprint(squares)`, "Comprehension එකකට condition එකක්ද එකතු කළ හැක: [n for n in numbers if n % 2 == 0]."],
      ["20. Modules සහ Packages", "Module යනු Python code අඩංගු .py file එකකි. import මඟින් වෙනත් module එකක functions හෝ values භාවිතා කළ හැක. Packages යනු modules සංවිධානය කරන folder ව්‍යුහයකි.", `import math\nprint(math.sqrt(25))\n\nfrom datetime import date\nprint(date.today())`, "ඔබේ file එකට standard library module එකක නමම දීමෙන් import conflicts ඇති විය හැක."],
      ["21. Exception Handling", "වැඩසටහන ක්‍රියාත්මක වන විට ඇතිවන දෝෂයක් exception ලෙස හැඳින්වේ. try/except මඟින් එය handle කළ හැක. else දෝෂයක් නොමැති විටත් finally සෑම අවස්ථාවකම cleanup සඳහාත් භාවිතා වේ.", `try:\n    number = int(input("අංකයක්: "))\n    print(10 / number)\nexcept ValueError:\n    print("අංකයක් ඇතුළත් කරන්න")\nexcept ZeroDivisionError:\n    print("ශුන්‍යයෙන් බෙදිය නොහැක")\nfinally:\n    print("අවසන්")`, "අල්ලාගත හැකි නිශ්චිත exception type එකක් භාවිතා කිරීම වඩා හොඳය."],
      ["22. File Handling", "File එකක් කියවීමට හෝ ලිවීමට open() භාවිතා කරයි. ප්‍රධාන modes: r (කියවීම), w (නැවත ලිවීම), a (අගට එකතු කිරීම), x (අලුතින් නිර්මාණය කිරීම). with භාවිතයෙන් file එක නිසි ලෙස close වේ.", `with open("notes.txt", "w", encoding="utf-8") as file:\n    file.write("Python ඉගෙන ගනිමි")\n\nwith open("notes.txt", "r", encoding="utf-8") as file:\n    print(file.read())`, "w mode එක පැරණි content එක මකා නැවත ලියන නිසා ප්‍රවේශමෙන් භාවිතා කරන්න."],
      ["23. Object-Oriented Programming (OOP)", "OOP යනු data සහ ඒ මත ක්‍රියා කරන methods objects ලෙස සංවිධානය කරන ක්‍රමයකි. Class එක blueprint එකක් වන අතර object එක class එකකින් නිර්මාණය කළ instance එකකි. __init__ මඟින් instance attributes ආරම්භ කරයි.", `class Student:\n    def __init__(self, name):\n        self.name = name\n\n    def introduce(self):\n        return f"මම {self.name}"\n\ns = Student("Kavindi")\nprint(s.introduce())`, "self යනු වත්මන් instance එකට යොමු වන සාමාන්‍ය parameter නාමයයි."],
      ["24. Inheritance, Encapsulation, Polymorphism", "Inheritance මඟින් child class එකකට parent class එකේ features ලබාගත හැක. Encapsulation මඟින් data සහ methods එකට සංවිධානය කර අභ්‍යන්තර විස්තර සීමා කරයි. Polymorphism මඟින් එකම interface එක විවිධ objects සඳහා වෙනස් ලෙස ක්‍රියා කළ හැක.", `class Animal:\n    def speak(self):\n        return "ශබ්දයක්"\n\nclass Dog(Animal):\n    def speak(self):\n        return "බුරයි"\n\nprint(Dog().speak())`, "Method overriding යනු child class එකක parent method එකට තමන්ගේ implementation එකක් ලබාදීමයි."],
      ["25. Iterators, Boolean Logic සහ Best Practices", "Iterable එකකින් iterator එකක් ලබාගෙන next() මඟින් ඊළඟ අගය ලබාගත හැක. Boolean logic සඳහා and, or, not භාවිතා වේ. හොඳ code එක පැහැදිලි නම්, නිසි නම් භාවිතා කරයි, කුඩා functions වලට බෙදයි, tests සහ comments අවශ්‍ය තැන්වල යොදයි.", 'numbers = [10, 20, 30]\nit = iter(numbers)\nprint(next(it))\nprint(next(it))\n\nlogged_in = True\nprint(logged_in and len(numbers) > 0)', "Python style සඳහා PEP 8 මාර්ගෝපදේශ බලන්න. Code එක run කර පරීක්ෂා කිරීමත් වැදගත්ය."]
    ].map(([title, body, code, tip]) => <View key={title} style={[cardStyle, { marginBottom: 14 }]}><Text style={[styles.theoryTitle, { color: palette.text }]}>{title}</Text><Text style={[styles.theoryBody, { color: palette.muted }]}>{body}</Text><View style={styles.codeBox}><Text style={styles.codeLabel}>PYTHON CODE</Text><Text selectable style={styles.codeText}>{code}</Text></View><Text style={[styles.tipText, { color: palette.text }]}>💡 මතක තබාගන්න: {tip}</Text></View>)}
  </ScrollView>;

  const renderNotes = () => <ScrollView contentContainerStyle={styles.pageContent}>
    <View style={styles.rowBetween}><View><SectionTitle title="සටහන්" subtitle="ඔබේ නැවත කියවීමේ සටහන් මේ දුරකථනයේ සුරැකේ"/></View><Button title="+ සටහනක් එක් කරන්න" onPress={() => setNoteModal(true)}/></View>
    {noteModal && <View style={[cardStyle, { marginBottom: 14 }]}><TextInput placeholder="සටහනේ මාතෘකාව" placeholderTextColor={palette.muted} value={newNoteTitle} onChangeText={setNewNoteTitle} style={[styles.input, { color: palette.text, borderColor: palette.border }]}/><TextInput placeholder="ඔබේ සටහන ලියන්න..." placeholderTextColor={palette.muted} value={newNoteBody} onChangeText={setNewNoteBody} multiline style={[styles.input, styles.noteInput, { color: palette.text, borderColor: palette.border }]}/><View style={styles.rowBetween}><Button title="අවලංගු කරන්න" secondary onPress={() => setNoteModal(false)}/><Button title="සටහන සුරකින්න" onPress={addNote}/></View></View>}
    <View style={styles.notesGrid}>{notes.map(note => <View key={note.id} style={[styles.noteCard, { backgroundColor: note.color, width: "48%" }]}><Text style={styles.noteTitle}>{note.title}</Text><Text style={styles.noteBody}>{note.body}</Text><View style={styles.noteFooter}><Text style={styles.noteDate}>{note.date}</Text><TouchableOpacity onPress={() => Alert.alert("සටහන මකන්නද?", note.title, [{ text: "අවලංගු කරන්න", style: "cancel" }, { text: "මකන්න", style: "destructive", onPress: () => setNotes(prev => prev.filter(n => n.id !== note.id)) }])}><Text style={{ fontSize: 17 }}>🗑️</Text></TouchableOpacity></View></View>)}</View>
  </ScrollView>;

  const renderKeywords = () => {
    const words = ["if", "else", "elif", "for", "while", "break", "continue", "def", "return", "class", "import", "from", "as", "try", "except", "finally", "with", "lambda", "and", "or", "not", "in", "is", "pass", "global", "nonlocal", "assert", "del", "None", "True", "False", "print", "input", "range", "len"];
    return <ScrollView contentContainerStyle={styles.pageContent}><SectionTitle title="Python Keywords" subtitle="වැදගත් Python keywords සොයන්න"/><TextInput value={keyword} onChangeText={setKeyword} placeholder="Keyword එකක් සොයන්න..." placeholderTextColor={palette.muted} style={[styles.input, { color: palette.text, borderColor: palette.border, backgroundColor: palette.card, marginBottom: 16 }]}/><View style={styles.keywordsGrid}>{words.filter(w => w.toLowerCase().includes(keyword.toLowerCase())).map((word, i) => <View key={word} style={[styles.keywordPill, { backgroundColor: ["#DFF5FF", "#FFE6EF", "#FFF0BC", "#D7F8E8", "#E9DEFF"][i % 5] }]}><Text style={{ color: "#26365B", fontWeight: "700" }}>{word}</Text></View>)}</View><Text style={[styles.muted, { marginTop: 16 }]}>Tip: keywords have special meanings in Python. Some words, such as print and input, are built-in functions.</Text></ScrollView>;
  };

  const renderProgress = () => <ScrollView contentContainerStyle={styles.pageContent}><SectionTitle title="ඔබේ ප්‍රගතිය" subtitle="සෑම පුහුණු සැසියක්ම වැදගත්"/><View style={[cardStyle, { alignItems: "center" }]}><Text style={{ fontSize: 46 }}>🏆</Text><Text style={[styles.bigProgress, { color: palette.text }]}>{answers.length ? Math.round(answers.filter(a => a.correct).length / answers.length * 100) : 0}%</Text><Text style={[styles.muted, { textAlign: "center" }]}>පිළිතුරු දුන් ප්‍රශ්න අනුව නිවැරදි ප්‍රතිශතය</Text><View style={[styles.progressTrack, { width: "100%", marginTop: 18 }]}><View style={[styles.progressFill, { width: `${answers.length ? answers.filter(a => a.correct).length / answers.length * 100 : 0}%` }]}/></View></View><View style={[cardStyle, { marginTop: 14 }]}><Text style={[styles.theoryTitle, { color: palette.text }]}>ඉගෙනුම් සාරාංශය</Text>{[["පිළිතුරු දුන් ප්‍රශ්න", answers.length], ["නිවැරදි පිළිතුරු", answers.filter(a => a.correct).length], ["Notes saved", notes.length], ["සම්පූර්ණ කළ ඉගෙනුම් කාර්යයන්", completedTasks.length]].map(([label, value]) => <View key={String(label)} style={styles.summaryRow}><Text style={[styles.muted, { color: palette.muted }]}>{label}</Text><Text style={[styles.summaryValue, { color: palette.text }]}>{value}</Text></View>)}</View></ScrollView>;

  const renderSettings = () => <ScrollView contentContainerStyle={styles.pageContent}><SectionTitle title="සැකසුම්" subtitle="ඔබේ ඉගෙනුම් අවකාශය සකසන්න"/><View style={cardStyle}><View style={styles.settingRow}><View style={{ flex: 1 }}><Text style={[styles.settingTitle, { color: palette.text }]}>අඳුරු පෙනුම</Text><Text style={styles.muted}>අඳුරු තේමාව භාවිතා කරන්න</Text></View><Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ true: COLORS.purple }}/></View><View style={[styles.settingRow, { borderTopWidth: 1, borderColor: palette.border }]}><View style={{ flex: 1 }}><Text style={[styles.settingTitle, { color: palette.text }]}>ඉගෙනුම් මතක් කිරීම්</Text><Text style={styles.muted}>මතක් කිරීමේ සැකසුම දුරකථනයේ සුරැකේ</Text></View><Switch value={notifications} onValueChange={setNotifications} trackColor={{ true: COLORS.purple }}/></View><View style={{ marginTop: 18 }}><Button title="ආරම්භක හැඳින්වීම නැවත බලන්න" secondary onPress={() => { setSlideIndex(0); setOnboardingDone(false); AsyncStorage.setItem(KEYS.onboarding, "false").catch(console.warn); }}/></View><View style={{ marginTop: 12 }}><Button title="Quiz ප්‍රගතිය මකන්න" secondary onPress={() => Alert.alert("Quiz ප්‍රගතිය මකන්නද?", "සුරැකි Quiz පිළිතුරු ඉවත් වේ.", [{ text: "අවලංගු කරන්න", style: "cancel" }, { text: "මකන්න", style: "destructive", onPress: () => { setAnswers([]); setQuizIndex(0); setSelectedAnswer(""); setShowAnswer(false); } }])}/></View></View><Text style={[styles.muted, { textAlign: "center", marginTop: 18 }]}>Python ඉගෙනුම • ඉගෙනීම සරල කරමු</Text></ScrollView>;

  const renderScreen = () => {
    switch (screen) {
      case "Quiz": return renderQuiz();
      case "QuizResult": return renderQuizResult();
      case "Theory": return renderTheory();
      case "Notes": return renderNotes();
      case "Keywords": return renderKeywords();
      case "Progress": return renderProgress();
      case "Settings": return renderSettings();
      default: return renderHome();
    }
  };

  return <SafeAreaView style={[styles.app, { backgroundColor: palette.bg }]}><StatusBar barStyle={dark ? "light-content" : "dark-content"}/>
    <View style={[styles.topBar, { backgroundColor: palette.card, borderColor: palette.border }]}><View style={styles.brandMarkSmall}><Text style={{ fontSize: 21 }}>🐍</Text></View><View style={{ flex: 1 }}><Text style={[styles.topTitle, { color: palette.text }]}>Python ඉගෙනුම</Text><Text style={[styles.topSubtitle, { color: palette.muted }]}>{screen === "Home" ? "ඉගෙන ගන්න • පුහුණු වෙන්න • දියුණු වෙන්න" : ({ Theory: "න්‍යාය", Quiz: "ප්‍රශ්නාවලිය", QuizResult: "ප්‍රතිඵල", Notes: "සටහන්", Keywords: "Keywords", Progress: "ප්‍රගතිය", Settings: "සැකසුම්" } as Record<string, string>)[screen] || screen}</Text></View><TouchableOpacity onPress={() => setScreen("Settings")} style={styles.avatar}><Text style={{ fontSize: 20 }}>⚙️</Text></TouchableOpacity><TouchableOpacity onPress={() => Alert.alert("Logout වෙන්නද?", "දැනට ඇති ඉගෙනුම් සැසියෙන් ඉවත් වීමට අවශ්‍යද?", [{ text: "අවලංගු කරන්න", style: "cancel" }, { text: "Logout", style: "destructive", onPress: logout }])} style={[styles.avatar, { backgroundColor: "#F1ECFF" }]}><Text style={{ fontSize: 18 }}>↪</Text></TouchableOpacity></View>
    <View style={{ flex: 1 }}>{renderScreen()}</View>
    <View style={[styles.bottomNav, { backgroundColor: palette.card, borderColor: palette.border }]}>{[
      ["Home", "⌂"], ["Theory", "📖"], ["Quiz", "☑"], ["Notes", "📝"], ["Progress", "▥"],
    ].map(([label, emoji]) => <TouchableOpacity key={label} onPress={() => label === "Quiz" ? startQuiz() : setScreen(label)} style={[styles.bottomItem, screen === label && styles.bottomItemActive]}><Text style={{ fontSize: 19 }}>{emoji}</Text><Text style={[styles.bottomLabel, { color: screen === label ? COLORS.purple : palette.muted }]}>{({ Home: "මුල් පිටුව", Theory: "න්‍යාය", Quiz: "ප්‍රශ්නාවලිය", Notes: "සටහන්", Progress: "ප්‍රගතිය" } as Record<string, string>)[label] || label}</Text></TouchableOpacity>)}</View>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  app: { flex: 1 },
  onboarding: { flex: 1 },
  onboardTop: { height: 66, flexDirection: "row", alignItems: "center", paddingHorizontal: 22, gap: 10 },
  brandMark: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#E7E4FF", alignItems: "center", justifyContent: "center" },
  brandText: { fontSize: 18, fontWeight: "900", flex: 1 },
  skipText: { color: COLORS.purple, fontWeight: "700", padding: 8 },
  slide: { flex: 1, alignItems: "center", paddingHorizontal: 28, paddingTop: 24 },
  illustration: { borderRadius: 42, alignItems: "center", justifyContent: "center", marginBottom: 35, position: "relative" },
  illustrationCircle: { width: "72%", height: "72%", borderRadius: 999, backgroundColor: "rgba(255,255,255,0.68)", alignItems: "center", justifyContent: "center" },
  floatBadge: { position: "absolute", top: 24, right: 20, width: 52, height: 52, borderRadius: 18, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", elevation: 4 },
  floatBadge2: { position: "absolute", bottom: 24, left: 18, width: 52, height: 52, borderRadius: 18, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", elevation: 4 },
  eyebrow: { fontSize: 11, fontWeight: "900", color: COLORS.purple, letterSpacing: 2, marginBottom: 10, textAlign: "center" },
  slideTitle: { fontSize: 31, fontWeight: "900", textAlign: "center" },
  slideSubtitle: { fontSize: 16, fontWeight: "700", textAlign: "center", marginTop: 10 },
  slideDetail: { fontSize: 14, lineHeight: 23, textAlign: "center", marginTop: 15, maxWidth: 330 },
  onboardBottom: { paddingHorizontal: 26, paddingBottom: 18, alignItems: "center", gap: 12 },
  dots: { flexDirection: "row", gap: 7, marginBottom: 7 },
  dot: { height: 7, width: 7, borderRadius: 10, backgroundColor: "#CBD3E3" },
  activeDot: { width: 25, backgroundColor: COLORS.purple },
  button: { backgroundColor: COLORS.purple, paddingHorizontal: 20, paddingVertical: 13, borderRadius: 14, alignItems: "center", justifyContent: "center", minHeight: 46 },
  buttonText: { color: "#FFFFFF", fontWeight: "800", fontSize: 14 },
  secondaryButton: { backgroundColor: "#ECEAFF" },
  secondaryButtonText: { color: COLORS.purple },
  backLink: { padding: 3 },
  topBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 11, borderBottomWidth: 1, gap: 10 },
  brandMarkSmall: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#E9E6FF", alignItems: "center", justifyContent: "center" },
  topTitle: { fontSize: 17, fontWeight: "900" },
  topSubtitle: { fontSize: 11, marginTop: 2 },
  avatar: { width: 39, height: 39, borderRadius: 20, backgroundColor: "#EEF1F8", alignItems: "center", justifyContent: "center" },
  pageContent: { padding: 15, paddingBottom: 26 },
  welcomeBanner: { borderRadius: 22, padding: 18, flexDirection: "row", alignItems: "center", marginBottom: 14 },
  welcomeSmall: { fontSize: 10, letterSpacing: 1.5, fontWeight: "900" },
  welcomeTitle: { fontSize: 20, fontWeight: "900", marginTop: 5, maxWidth: 250 },
  muted: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
  statsRow: { flexDirection: "row", gap: 9, marginBottom: 22 },
  statCard: { flex: 1, borderRadius: 17, padding: 12, alignItems: "center", borderWidth: 1 },
  statEmoji: { fontSize: 21, marginBottom: 5 },
  statNumber: { fontSize: 22, fontWeight: "900" },
  card: { borderRadius: 20, padding: 16, borderWidth: 1, marginBottom: 12, elevation: 1 },
  sectionHeader: { marginTop: 3, marginBottom: 5 },
  sectionTitle: { fontSize: 20, fontWeight: "900", color: COLORS.text, marginBottom: 3 },
  featureCard: { borderRadius: 18, padding: 14, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  featureIcon: { width: 48, height: 48, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  featureTitle: { fontSize: 15, fontWeight: "900" },
  progressTrack: { height: 6, backgroundColor: "#D7DDF0", borderRadius: 9, marginTop: 10, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 9, backgroundColor: COLORS.purple },
  taskRow: { flexDirection: "row", alignItems: "center", padding: 13, borderRadius: 13, borderWidth: 1, marginBottom: 8 },
  taskText: { fontSize: 13, fontWeight: "600" },
  taskDone: { textDecorationLine: "line-through", color: COLORS.green },
  bottomNav: { flexDirection: "row", justifyContent: "space-around", paddingTop: 8, paddingBottom: 5, borderTopWidth: 1 },
  bottomItem: { flex: 1, alignItems: "center", gap: 3, paddingVertical: 5, borderRadius: 12 },
  bottomItemActive: { backgroundColor: "#F0EDFF" },
  bottomLabel: { fontSize: 10, fontWeight: "700" },
  quizHero: { borderRadius: 22, padding: 18, marginBottom: 18 },
  questionBadge: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#EEE9FF", alignItems: "center", justifyContent: "center" },
  resultCard: { borderRadius: 25, padding: 24, marginTop: 8 },
  quizHeader: { flexDirection: "row", gap: 10, alignItems: "flex-start", marginBottom: 18 },
  quizQuestion: { flex: 1, fontSize: 17, fontWeight: "800", lineHeight: 24 },
  option: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderRadius: 13, padding: 13, marginBottom: 9 },
  optionLetter: { width: 25, height: 25, borderRadius: 13, backgroundColor: "#EEF1FA", textAlign: "center", textAlignVertical: "center", overflow: "hidden", fontWeight: "800", paddingTop: 3 },
  optionText: { flex: 1, fontSize: 13 },
  optionCorrect: { backgroundColor: "#E2FAF0", borderColor: "#37C99B" },
  optionWrong: { backgroundColor: "#FFF0EE", borderColor: "#F28A80" },
  optionSelected: { borderColor: COLORS.purple, backgroundColor: "#F3F0FF" },
  explanation: { backgroundColor: "#E6F8F1", borderRadius: 13, padding: 13, marginVertical: 10 },
  theoryTitle: { fontSize: 17, fontWeight: "900", marginBottom: 8 },
  theoryBody: { fontSize: 13, lineHeight: 21, marginBottom: 12 },
  codeBox: { backgroundColor: "#172238", borderRadius: 13, padding: 15, marginBottom: 12 },
  codeLabel: { color: "#AAB9D5", fontSize: 10, fontWeight: "900", marginBottom: 8, letterSpacing: 1 },
  codeText: { color: "#9AF0C5", fontSize: 13, lineHeight: 22, fontFamily: "monospace" },
  tipText: { fontSize: 12, lineHeight: 19 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  notesGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 10 },
  noteCard: { minHeight: 165, borderRadius: 18, padding: 14, marginBottom: 3 },
  noteTitle: { color: "#1B2B49", fontWeight: "900", fontSize: 14, marginBottom: 10 },
  noteBody: { color: "#34415D", fontSize: 12, lineHeight: 20, flex: 1 },
  noteFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 14 },
  noteDate: { fontSize: 9, color: "#5C6780" },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11, marginBottom: 10, fontSize: 14 },
  noteInput: { minHeight: 90, textAlignVertical: "top" },
  keywordsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  keywordPill: { width: "17%", minWidth: 56, paddingVertical: 13, alignItems: "center", borderRadius: 12 },
  bigProgress: { fontSize: 45, fontWeight: "900", marginTop: 8 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#E8ECF5" },
  summaryValue: { fontWeight: "900", fontSize: 15 },
  settingRow: { flexDirection: "row", alignItems: "center", paddingVertical: 15, gap: 12 },
  settingTitle: { fontSize: 15, fontWeight: "800", marginBottom: 4 },
  navItem: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 5 },
  navActive: { backgroundColor: COLORS.blue },
  navEmoji: { fontSize: 18, width: 26, textAlign: "center" },
  navLabel: { color: "#CFD8EB", fontSize: 14, fontWeight: "600" },
  navLabelActive: { color: "#FFFFFF", fontWeight: "900" },
});
