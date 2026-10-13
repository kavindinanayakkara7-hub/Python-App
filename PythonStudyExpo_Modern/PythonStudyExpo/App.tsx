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
  { eyebrow: "WELCOME TO", title: "Python Study", subtitle: "Learn • Practice • Grow", emoji: "🐍", detail: "Your friendly space to learn Python, one small step at a time.", color: "#E9E7FF" },
  { eyebrow: "LEARN SOMETHING NEW", title: "Understand Python", subtitle: "Simple lessons. Clear examples.", emoji: "💻", detail: "Explore variables, data types, loops and functions with easy explanations.", color: "#DFF4FF" },
  { eyebrow: "YOUR JOURNEY STARTS HERE", title: "Practice every day", subtitle: "Quizzes • Notes • Progress", emoji: "🚀", detail: "Test your knowledge, save revision notes and keep track of your learning.", color: "#E0F9EF" },
];

const questions = [
  { id: "q1", question: "Which symbol is used for a single-line comment in Python?", options: ["//", "#", "<!--", "**"], answer: "#", explanation: "Python single-line comments begin with the hash symbol (#)." },
  { id: "q2", question: "Which is a valid Python variable assignment?", options: ["2name = 'Sam'", "name = 'Sam'", "name := 'Sam'", "var name = 'Sam'"], answer: "name = 'Sam'", explanation: "A variable name cannot start with a digit, and Python does not use the var keyword." },
  { id: "q3", question: "What is the type of 7 in Python?", options: ["float", "str", "int", "bool"], answer: "int", explanation: "An integer literal without a decimal point has type int." },
  { id: "q4", question: "What is the type of 7.0?", options: ["int", "float", "complex", "str"], answer: "float", explanation: "A numeric literal with a decimal point is a float." },
  { id: "q5", question: "Which value is a Boolean?", options: ["'False'", "0", "False", "'True'"], answer: "False", explanation: "False without quotation marks is a Boolean value; quoted values are strings." },
  { id: "q6", question: "Which function displays text in the console?", options: ["echo()", "write()", "print()", "show()"], answer: "print()", explanation: "print() writes values to the standard output." },
  { id: "q7", question: "Which function reads keyboard input as text?", options: ["scan()", "input()", "readline()", "keyboard()"], answer: "input()", explanation: "input() reads a line from the user and returns it as a string." },
  { id: "q8", question: "What is the result of 10 // 3?", options: ["3.33", "1", "3", "4"], answer: "3", explanation: "The // operator performs floor division and returns 3 for 10 // 3." },
  { id: "q9", question: "What is the result of 10 % 3?", options: ["3", "1", "0", "3.33"], answer: "1", explanation: "The modulo operator % returns the remainder; 10 divided by 3 leaves 1." },
  { id: "q10", question: "Which brackets create a list?", options: ["( )", "{ }", "[ ]", "< >"], answer: "[ ]", explanation: "Lists are written with square brackets." },
  { id: "q11", question: "Which collection is immutable?", options: ["list", "tuple", "set", "dict"], answer: "tuple", explanation: "A tuple cannot be modified after it is created." },
  { id: "q12", question: "Which collection stores key-value pairs?", options: ["set", "tuple", "dict", "list"], answer: "dict", explanation: "Dictionaries map keys to values." },
  { id: "q13", question: "Which collection stores unique values?", options: ["list", "set", "tuple", "string"], answer: "set", explanation: "A set contains distinct elements and removes duplicate values." },
  { id: "q14", question: "What does len([4, 5, 6]) return?", options: ["2", "3", "4", "6"], answer: "3", explanation: "The list contains three elements, so len() returns 3." },
  { id: "q15", question: "What is the first index in a Python list?", options: ["1", "-1", "0", "Depends on list size"], answer: "0", explanation: "Python sequences use zero-based indexing." },
  { id: "q16", question: "What does nums.append(8) do?", options: ["Removes 8", "Adds 8 to the end", "Sorts the list", "Returns the list length"], answer: "Adds 8 to the end", explanation: "append() adds one item to the end of a list." },
  { id: "q17", question: "Which keyword starts a conditional branch?", options: ["when", "if", "check", "case"], answer: "if", explanation: "if begins a conditional statement in Python." },
  { id: "q18", question: "Which keyword checks another condition after if?", options: ["elseif", "elsif", "elif", "otherwise"], answer: "elif", explanation: "elif means else-if and checks another condition when earlier conditions are false." },
  { id: "q19", question: "Which loop is commonly used to iterate over a list?", options: ["repeat", "foreach", "for", "loop"], answer: "for", explanation: "A for loop iterates over items in an iterable such as a list." },
  { id: "q20", question: "What values does range(4) produce?", options: ["1, 2, 3, 4", "0, 1, 2, 3", "0, 1, 2, 3, 4", "4 only"], answer: "0, 1, 2, 3", explanation: "range(4) starts at 0 and stops before 4." },
  { id: "q21", question: "Which keyword exits a loop immediately?", options: ["stop", "exit", "break", "skip"], answer: "break", explanation: "break terminates the nearest enclosing loop." },
  { id: "q22", question: "Which keyword skips to the next loop iteration?", options: ["pass", "continue", "break", "next"], answer: "continue", explanation: "continue skips the rest of the current iteration." },
  { id: "q23", question: "Which keyword defines a function?", options: ["func", "function", "def", "lambda"], answer: "def", explanation: "A named function is defined using def." },
  { id: "q24", question: "What does return do in a function?", options: ["Repeats the function", "Sends a value back to the caller", "Prints a value automatically", "Imports a module"], answer: "Sends a value back to the caller", explanation: "return ends the function call and optionally provides a result." },
  { id: "q25", question: "What is the result of 'Py' + 'thon'?", options: ["Py thon", "Python", "Error always", "Py+thon"], answer: "Python", explanation: "The + operator concatenates strings." },
  { id: "q26", question: "Which method converts 'hello' to uppercase?", options: ["upper()", "capitalize_all()", "uppercase()", "toUpper()"], answer: "upper()", explanation: "The str.upper() method returns an uppercase version of a string." },
  { id: "q27", question: "Which slice gets the first three items of items?", options: ["items[1:3]", "items[:3]", "items[3:]", "items[-3:]"], answer: "items[:3]", explanation: "A slice ending at index 3 includes indices 0, 1 and 2." },
  { id: "q28", question: "How do you handle an exception?", options: ["try / except", "if / else only", "for / catch", "test / error"], answer: "try / except", explanation: "A try block contains risky code and except handles matching exceptions." },
  { id: "q29", question: "Which block runs whether an exception occurs or not?", options: ["except", "finally", "raise", "assert"], answer: "finally", explanation: "A finally block is used for cleanup that should run in either case." },
  { id: "q30", question: "Which keyword imports a module?", options: ["include", "using", "import", "require"], answer: "import", explanation: "Python uses import to make a module available." },
  { id: "q31", question: "What does len('cat') return?", options: ["2", "3", "4", "'cat'"], answer: "3", explanation: "The string 'cat' has three characters." },
  { id: "q32", question: "Which expression checks equality?", options: ["x = 5", "x == 5", "x === 5", "x equals 5"], answer: "x == 5", explanation: "== compares values; = assigns a value." },
  { id: "q33", question: "Which operator means logical AND?", options: ["&&", "AND", "and", "&"], answer: "and", explanation: "Python's logical conjunction operator is the keyword and." },
  { id: "q34", question: "What is None used to represent?", options: ["An empty string", "No value / absence of a value", "The number zero only", "False in every context"], answer: "No value / absence of a value", explanation: "None is Python's singleton used to represent the absence of a value." },
  { id: "q35", question: "What is the correct way to create a class?", options: ["object Person:", "class Person:", "define Person:", "new class Person"], answer: "class Person:", explanation: "A class definition starts with the class keyword." },
  { id: "q36", question: "In a normal instance method, what does self refer to?", options: ["The current instance", "The parent class only", "The Python interpreter", "A global variable"], answer: "The current instance", explanation: "self conventionally refers to the instance on which the method is called." },
  { id: "q37", question: "Which method is commonly used to initialize a new instance?", options: ["__start__()", "__main__()", "__init__()", "__newclass__()"], answer: "__init__()", explanation: "__init__() initializes instance attributes after an instance is created." },
  { id: "q38", question: "What does open('data.txt', 'r') do?", options: ["Opens a file for reading", "Deletes the file", "Opens only for writing", "Renames the file"], answer: "Opens a file for reading", explanation: "The mode 'r' opens an existing file for reading." },
  { id: "q39", question: "Why use 'with open(...) as file:'?", options: ["It automatically sorts file lines", "It helps close the file reliably", "It encrypts the file", "It prevents all exceptions"], answer: "It helps close the file reliably", explanation: "A with statement uses a context manager to clean up the file handle reliably." },
  { id: "q40", question: "Which is a list comprehension?", options: ["[x * 2 for x in nums]", "(for x in nums: x * 2)", "{x * 2; nums}", "list = x * 2 for nums"], answer: "[x * 2 for x in nums]", explanation: "A list comprehension uses square brackets with an expression and a for clause." },
  { id: "q41", question: "What does lambda create?", options: ["A named class", "A small anonymous function", "A loop", "A package manager"], answer: "A small anonymous function", explanation: "lambda creates a small anonymous function expression." }
];

const defaultNotes: Note[] = [
  { id: "n1", title: "Python Basics", body: "Variables\nData Types\nInput / Output\nOperators", color: "#FFF0A8", date: "Today" },
  { id: "n2", title: "Remember!", body: "Use [ ] for lists\nUse ( ) for tuples\nUse { } for sets", color: "#F9D9ED", date: "Today" },
  { id: "n3", title: "Study Plan", body: "Finish Python basics\nDo 10 MCQs\nPractice coding\nRevise key concepts", color: "#CFF8E5", date: "Today" },
  { id: "n4", title: "Motivation", body: "“Consistency builds confidence.”", color: "#D8ECFF", date: "Today" },
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
      Alert.alert("Missing details", "Please enter a title and note.");
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
      <Text style={{ color: palette.text, fontSize: 28, fontWeight: "900", textAlign: "center" }}>You are logged out</Text>
      <Text style={{ color: palette.muted, fontSize: 14, textAlign: "center", lineHeight: 22, marginTop: 10, marginBottom: 24 }}>Your quiz progress has been saved on this device. Come back when you are ready to learn more Python.</Text>
      <Button title="Continue learning  →" onPress={() => { setScreen("Home"); setQuizIndex(0); setSelectedAnswer(""); setShowAnswer(false); }} />
      <Text style={{ color: palette.muted, fontSize: 11, marginTop: 28 }}>PYTHON STUDY • LEARN WITH CONFIDENCE</Text>
    </SafeAreaView>;
  }

  if (!onboardingDone) {
    return <SafeAreaView style={[styles.onboarding, { backgroundColor: palette.bg }]}>
      <StatusBar barStyle={dark ? "light-content" : "dark-content"} />
      <View style={styles.onboardTop}>
        <View style={styles.brandMark}><Text style={{ fontSize: 25 }}>🐍</Text></View>
        <Text style={[styles.brandText, { color: palette.text }]}>Python Study</Text>
        <TouchableOpacity onPress={finishOnboarding}><Text style={styles.skipText}>Skip</Text></TouchableOpacity>
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
        <Button title={slideIndex === 2 ? "Get Started  →" : "Next  →"} onPress={() => { if (slideIndex === 2) { finishOnboarding(); } else { const next = Math.min(2, slideIndex + 1); setSlideIndex(next); onboardingListRef.current?.scrollToIndex({ index: next, animated: true }); } }} />
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
      <View style={{ flex: 1 }}><Text style={[styles.welcomeSmall, { color: palette.muted }]}>HELLO, STUDENT!</Text><Text style={[styles.welcomeTitle, { color: palette.text }]}>Keep learning, keep improving!</Text><Text style={[styles.muted, { marginTop: 6 }]}>Your next small step starts today.</Text></View>
      <Text style={{ fontSize: 44 }}>👩‍💻</Text>
    </View>
    <View style={styles.statsRow}>
      <View style={[styles.statCard, cardStyle]}><Text style={styles.statEmoji}>🧠</Text><Text style={[styles.statNumber, { color: palette.text }]}>{answers.length}</Text><Text style={[styles.muted, { fontSize: 11 }]}>Questions tried</Text></View>
      <View style={[styles.statCard, cardStyle]}><Text style={styles.statEmoji}>✅</Text><Text style={[styles.statNumber, { color: palette.text }]}>{answers.filter(a => a.correct).length}</Text><Text style={[styles.muted, { fontSize: 11 }]}>Correct answers</Text></View>
      <View style={[styles.statCard, cardStyle]}><Text style={styles.statEmoji}>📝</Text><Text style={[styles.statNumber, { color: palette.text }]}>{notes.length}</Text><Text style={[styles.muted, { fontSize: 11 }]}>Saved notes</Text></View>
    </View>
    <View style={styles.sectionHeader}><SectionTitle title="Continue learning" subtitle="Pick up where you left off"/></View>
    <TouchableOpacity onPress={startQuiz} style={[styles.featureCard, { backgroundColor: "#ECE9FF" }]}>
      <View style={[styles.featureIcon, { backgroundColor: "#6A55E8" }]}><Text style={{ fontSize: 24 }}>🧩</Text></View>
      <View style={{ flex: 1 }}><Text style={[styles.featureTitle, { color: "#202D50" }]}>Python Quiz</Text><Text style={{ color: "#596783", fontSize: 12, marginTop: 3 }}>Test your knowledge with quick MCQs</Text><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.min(100, answers.length / questions.length * 100)}%` }]} /></View></View>
      <Text style={{ color: COLORS.purple, fontWeight: "800" }}>→</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => setScreen("Theory")} style={[styles.featureCard, { backgroundColor: "#E1F4FF" }]}>
      <View style={[styles.featureIcon, { backgroundColor: "#3A79E8" }]}><Text style={{ fontSize: 24 }}>📘</Text></View>
      <View style={{ flex: 1 }}><Text style={[styles.featureTitle, { color: "#202D50" }]}>Python Theory</Text><Text style={{ color: "#596783", fontSize: 12, marginTop: 3 }}>Understand concepts with examples</Text></View><Text style={{ color: "#3A79E8", fontWeight: "800" }}>→</Text>
    </TouchableOpacity>
    <View style={styles.sectionHeader}><SectionTitle title="Your study plan" subtitle="Small steps every day"/></View>
    {["Finish Python basics", "Complete 10 MCQs", "Practice coding", "Revise key concepts"].map(task => <TouchableOpacity key={task} onPress={() => setCompletedTasks(prev => prev.includes(task) ? prev.filter(x => x !== task) : [...prev, task])} style={[styles.taskRow, cardStyle]}><Text style={{ fontSize: 19, marginRight: 10 }}>{completedTasks.includes(task) ? "☑️" : "⬜"}</Text><Text style={[styles.taskText, { color: palette.text }, completedTasks.includes(task) && styles.taskDone]}>{task}</Text></TouchableOpacity>)}
  </ScrollView>;

  const renderQuiz = () => {
    const q = questions[quizIndex];
    const correctCount = answers.filter(a => a.correct).length;
    const progress = ((quizIndex + (showAnswer ? 1 : 0)) / questions.length) * 100;
    return <ScrollView contentContainerStyle={styles.pageContent}>
      <View style={[styles.quizHero, { backgroundColor: "#EEE9FF" }]}>
        <Text style={{ color: COLORS.purple, fontWeight: "900", fontSize: 11, letterSpacing: 1.5 }}>PYTHON KNOWLEDGE CHECK</Text>
        <Text style={{ color: "#28214F", fontSize: 25, fontWeight: "900", marginTop: 7 }}>Challenge yourself.</Text>
        <Text style={{ color: "#6C6687", fontSize: 12, marginTop: 5 }}>41 questions • Fundamentals to OOP</Text>
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
        {showAnswer && <View style={[styles.explanation, { backgroundColor: selectedAnswer === q.answer ? "#E3F8EF" : "#FFF0E9" }]}><Text style={{ fontWeight: "900", color: selectedAnswer === q.answer ? "#12845F" : "#B65A26" }}>{selectedAnswer === q.answer ? "Correct! Great job." : "Keep going — learning takes practice."}</Text><Text style={{ color: "#343A51", marginTop: 5, lineHeight: 20 }}>{q.explanation}</Text></View>}
        <Button title={!showAnswer ? "Select an answer" : quizIndex === questions.length - 1 ? "Finish quiz  →" : "Next question  →"} onPress={showAnswer ? nextQuestion : () => Alert.alert("Choose an answer", "Tap one of the options first.")} />
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
        <Text style={{ color: "#6C6687", textAlign: "center", marginTop: 6 }}>You finished all {questions.length} Python questions.</Text>
        <Text style={{ color: COLORS.purple, fontSize: 52, fontWeight: "900", textAlign: "center", marginTop: 20 }}>{correct}/{questions.length}</Text>
        <Text style={{ color: "#514A70", textAlign: "center", fontWeight: "800" }}>{percent}% accuracy</Text>
        <View style={[styles.progressTrack, { backgroundColor: "#D7CEF9", marginTop: 18 }]}><View style={[styles.progressFill, { width: `${percent}%` }]} /></View>
        <Text style={{ color: "#514A70", textAlign: "center", lineHeight: 22, marginTop: 18 }}>{percent >= 80 ? "Excellent work! Your Python basics are looking strong." : percent >= 50 ? "Good effort. Review the explanations and try again." : "Every attempt helps. Review the lessons and give it another try."}</Text>
      </View>
      <View style={[cardStyle, { marginTop: 14 }]}><Text style={[styles.theoryTitle, { color: palette.text }]}>Session summary</Text><View style={styles.summaryRow}><Text style={styles.muted}>Questions answered</Text><Text style={[styles.summaryValue, { color: palette.text }]}>{answers.length}/{questions.length}</Text></View><View style={styles.summaryRow}><Text style={styles.muted}>Correct answers</Text><Text style={[styles.summaryValue, { color: palette.text }]}>{correct}</Text></View><View style={styles.summaryRow}><Text style={styles.muted}>Incorrect answers</Text><Text style={[styles.summaryValue, { color: palette.text }]}>{answers.length - correct}</Text></View></View>
      <Button title="Logout now" onPress={logout} />
      <Text style={[styles.muted, { textAlign: "center", marginTop: 10 }]}>For your security, this session will log out automatically in a few seconds.</Text>
    </ScrollView>;
  };

  const renderTheory = () => <ScrollView contentContainerStyle={styles.pageContent}>
    <SectionTitle title="Python Theory" subtitle="Quick and clear explanations"/>
    {[
      ["1. Variables", "A variable is a name given to a value. Python determines the type automatically.", 'name = "Kavindi"\nage = 18\nis_student = True', "Variable names can contain letters, numbers and underscores. They cannot start with a number."],
      ["2. Data Types", "Python has built-in types such as int, float, str, bool, list, tuple, set and dict.", 'age = 20\nprice = 12.5\nlanguage = "Python"', "Use type(value) to inspect a value's type."],
      ["3. Conditions", "Use if, elif and else to run code based on a condition.", 'if age >= 18:\n    print("Adult")\nelse:\n    print("Under 18")', "Python uses indentation to define code blocks."],
      ["4. Loops", "Loops repeat a block of code. for is useful for iterating through a sequence.", 'for number in range(3):\n    print(number)', "range(3) produces 0, 1 and 2."],
    ].map(([title, body, code, tip]) => <View key={title} style={[cardStyle, { marginBottom: 14 }]}><Text style={[styles.theoryTitle, { color: palette.text }]}>{title}</Text><Text style={[styles.theoryBody, { color: palette.muted }]}>{body}</Text><View style={styles.codeBox}><Text style={styles.codeLabel}>PYTHON</Text><Text style={styles.codeText}>{code}</Text></View><Text style={[styles.tipText, { color: palette.text }]}>💡 {tip}</Text></View>)}
  </ScrollView>;

  const renderNotes = () => <ScrollView contentContainerStyle={styles.pageContent}>
    <View style={styles.rowBetween}><View><SectionTitle title="Sticky Notes" subtitle="Your revision notes stay on this device"/></View><Button title="+ Add Note" onPress={() => setNoteModal(true)}/></View>
    {noteModal && <View style={[cardStyle, { marginBottom: 14 }]}><TextInput placeholder="Note title" placeholderTextColor={palette.muted} value={newNoteTitle} onChangeText={setNewNoteTitle} style={[styles.input, { color: palette.text, borderColor: palette.border }]}/><TextInput placeholder="Write your note..." placeholderTextColor={palette.muted} value={newNoteBody} onChangeText={setNewNoteBody} multiline style={[styles.input, styles.noteInput, { color: palette.text, borderColor: palette.border }]}/><View style={styles.rowBetween}><Button title="Cancel" secondary onPress={() => setNoteModal(false)}/><Button title="Save Note" onPress={addNote}/></View></View>}
    <View style={styles.notesGrid}>{notes.map(note => <View key={note.id} style={[styles.noteCard, { backgroundColor: note.color, width: "48%" }]}><Text style={styles.noteTitle}>{note.title}</Text><Text style={styles.noteBody}>{note.body}</Text><View style={styles.noteFooter}><Text style={styles.noteDate}>{note.date}</Text><TouchableOpacity onPress={() => Alert.alert("Delete note?", note.title, [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: () => setNotes(prev => prev.filter(n => n.id !== note.id)) }])}><Text style={{ fontSize: 17 }}>🗑️</Text></TouchableOpacity></View></View>)}</View>
  </ScrollView>;

  const renderKeywords = () => {
    const words = ["if", "else", "elif", "for", "while", "break", "continue", "def", "return", "class", "import", "from", "as", "try", "except", "finally", "with", "lambda", "and", "or", "not", "in", "is", "pass", "global", "nonlocal", "assert", "del", "None", "True", "False", "print", "input", "range", "len"];
    return <ScrollView contentContainerStyle={styles.pageContent}><SectionTitle title="Python Keywords" subtitle="Explore useful Python words"/><TextInput value={keyword} onChangeText={setKeyword} placeholder="Search a keyword..." placeholderTextColor={palette.muted} style={[styles.input, { color: palette.text, borderColor: palette.border, backgroundColor: palette.card, marginBottom: 16 }]}/><View style={styles.keywordsGrid}>{words.filter(w => w.toLowerCase().includes(keyword.toLowerCase())).map((word, i) => <View key={word} style={[styles.keywordPill, { backgroundColor: ["#DFF5FF", "#FFE6EF", "#FFF0BC", "#D7F8E8", "#E9DEFF"][i % 5] }]}><Text style={{ color: "#26365B", fontWeight: "700" }}>{word}</Text></View>)}</View><Text style={[styles.muted, { marginTop: 16 }]}>Tip: keywords have special meanings in Python. Some words, such as print and input, are built-in functions.</Text></ScrollView>;
  };

  const renderProgress = () => <ScrollView contentContainerStyle={styles.pageContent}><SectionTitle title="Your Progress" subtitle="Every practice session counts"/><View style={[cardStyle, { alignItems: "center" }]}><Text style={{ fontSize: 46 }}>🏆</Text><Text style={[styles.bigProgress, { color: palette.text }]}>{answers.length ? Math.round(answers.filter(a => a.correct).length / answers.length * 100) : 0}%</Text><Text style={[styles.muted, { textAlign: "center" }]}>Quiz accuracy based on answered questions</Text><View style={[styles.progressTrack, { width: "100%", marginTop: 18 }]}><View style={[styles.progressFill, { width: `${answers.length ? answers.filter(a => a.correct).length / answers.length * 100 : 0}%` }]}/></View></View><View style={[cardStyle, { marginTop: 14 }]}><Text style={[styles.theoryTitle, { color: palette.text }]}>Learning summary</Text>{[["Questions answered", answers.length], ["Correct answers", answers.filter(a => a.correct).length], ["Notes saved", notes.length], ["Study tasks complete", completedTasks.length]].map(([label, value]) => <View key={String(label)} style={styles.summaryRow}><Text style={[styles.muted, { color: palette.muted }]}>{label}</Text><Text style={[styles.summaryValue, { color: palette.text }]}>{value}</Text></View>)}</View></ScrollView>;

  const renderSettings = () => <ScrollView contentContainerStyle={styles.pageContent}><SectionTitle title="Settings" subtitle="Make your study space yours"/><View style={cardStyle}><View style={styles.settingRow}><View style={{ flex: 1 }}><Text style={[styles.settingTitle, { color: palette.text }]}>Dark mode</Text><Text style={styles.muted}>Use a darker study theme</Text></View><Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ true: COLORS.purple }}/></View><View style={[styles.settingRow, { borderTopWidth: 1, borderColor: palette.border }]}><View style={{ flex: 1 }}><Text style={[styles.settingTitle, { color: palette.text }]}>Study reminders</Text><Text style={styles.muted}>Reminder preference saved locally</Text></View><Switch value={notifications} onValueChange={setNotifications} trackColor={{ true: COLORS.purple }}/></View><View style={{ marginTop: 18 }}><Button title="Replay onboarding" secondary onPress={() => { setSlideIndex(0); setOnboardingDone(false); AsyncStorage.setItem(KEYS.onboarding, "false").catch(console.warn); }}/></View><View style={{ marginTop: 12 }}><Button title="Reset quiz progress" secondary onPress={() => Alert.alert("Reset quiz?", "This will remove saved quiz answers.", [{ text: "Cancel", style: "cancel" }, { text: "Reset", style: "destructive", onPress: () => { setAnswers([]); setQuizIndex(0); setSelectedAnswer(""); setShowAnswer(false); } }])}/></View></View><Text style={[styles.muted, { textAlign: "center", marginTop: 18 }]}>Python Study • Learning made simple</Text></ScrollView>;

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
    <View style={[styles.topBar, { backgroundColor: palette.card, borderColor: palette.border }]}><View style={styles.brandMarkSmall}><Text style={{ fontSize: 21 }}>🐍</Text></View><View style={{ flex: 1 }}><Text style={[styles.topTitle, { color: palette.text }]}>Python Study</Text><Text style={[styles.topSubtitle, { color: palette.muted }]}>{screen === "Home" ? "Learn • Practice • Grow" : screen}</Text></View><TouchableOpacity onPress={() => setScreen("Settings")} style={styles.avatar}><Text style={{ fontSize: 20 }}>⚙️</Text></TouchableOpacity><TouchableOpacity onPress={() => Alert.alert("Log out?", "Leave your current study session?", [{ text: "Cancel", style: "cancel" }, { text: "Log out", style: "destructive", onPress: logout }])} style={[styles.avatar, { backgroundColor: "#F1ECFF" }]}><Text style={{ fontSize: 18 }}>↪</Text></TouchableOpacity></View>
    <View style={{ flex: 1 }}>{renderScreen()}</View>
    <View style={[styles.bottomNav, { backgroundColor: palette.card, borderColor: palette.border }]}>{[
      ["Home", "⌂"], ["Theory", "📖"], ["Quiz", "☑"], ["Notes", "📝"], ["Progress", "▥"],
    ].map(([label, emoji]) => <TouchableOpacity key={label} onPress={() => label === "Quiz" ? startQuiz() : setScreen(label)} style={[styles.bottomItem, screen === label && styles.bottomItemActive]}><Text style={{ fontSize: 19 }}>{emoji}</Text><Text style={[styles.bottomLabel, { color: screen === label ? COLORS.purple : palette.muted }]}>{label}</Text></TouchableOpacity>)}</View>
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
