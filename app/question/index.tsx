import React, { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

const getRandomInt = (max: number) => Math.floor(Math.random() * max) + 1;

const getMaxFromRange = (range: string): number => {
  switch (range) {
    case '1 - 10': return 10;
    case '1 - 50': return 50;
    case '1 - 100': return 100;
    default: return 10;
  }
};

const generateQuestion = (operation: string, max: number) => {
  let a = getRandomInt(max);
  let b = getRandomInt(max);
  if (operation === 'Subtraction' && b > a) [a, b] = [b, a];
  const correctAnswer = operation === 'Addition' ? a + b : a - b;
  const questionText = `What is ${a} ${operation === 'Addition' ? '+' : '-'} ${b}`;
  const options = new Set([correctAnswer]);
  while (options.size < 4) {
    const fake = correctAnswer + Math.floor(Math.random() * 10 - 5);
    if (fake >= 0 && fake !== correctAnswer) options.add(fake);
  }
  return {
    questionText,
    correctAnswer,
    options: Array.from(options).sort(() => Math.random() - 0.5),
  };
};

export default function QuestionScreen() {
  const params = useLocalSearchParams();
  const {
    operation, range, questions, current, score, responseType,
    correctReward, correctFeedback, wrongPenalty, wrongFeedback,
    endSummary, correctCount, correctQuestions, incorrectQuestions
  } = params;

  const router = useRouter();
  const total = parseInt(questions as string);
  const currentIndex = parseInt((current as string) || '1');
  const currentScore = parseInt((score as string) || '0');
  const numCorrect = parseInt((correctCount as string) || '0');

  const [selected, setSelected] = useState<number | null>(null);
  const [textAnswer, setTextAnswer] = useState<string>('');
  const [paths, setPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [question, setQuestion] = useState<ReturnType<typeof generateQuestion> | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());

  useEffect(() => {
    const op = operation as string;
    const max = getMaxFromRange(range as string);
    setQuestion(generateQuestion(op, max));
    setStartTime(Date.now());
  }, [operation, range]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        setPaths(prev => [...prev, `M${locationX},${locationY}`]);  // Start a new path
      },
      onPanResponderMove: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        setPaths(prev => {
          const updated = [...prev];
          const last = updated.pop() || '';
          const newPath = `${last} L${locationX},${locationY}`;
          return [...updated, newPath];
        });
      },
      onPanResponderRelease: () => {
        // Do nothing: path already added
      },
    })
  ).current;

  const handleClearCanvas = () => {
    setPaths([]);
    setCurrentPath('');
  };

  const rewardMap: Record<string, number> = {
    'No Reward': 0,
    '+50': 50,
    '+100': 100,
  };

  const penaltyMap: Record<string, number> = {
    'No Penalty': 0,
    '-50': 50,
    '-100': 100,
  };

  const handleSubmit = () => {
    if (!question) return;

    const isCorrect =
      responseType === 'Free Response'
        ? parseInt(textAnswer.trim()) === question.correctAnswer
        : responseType === 'Show Your Work'
        ? false
        : selected === question.correctAnswer;

    const rewardPoints = isCorrect ? rewardMap[correctReward as string] ?? 0 : 0;
    const penaltyPoints = !isCorrect ? penaltyMap[wrongPenalty as string] ?? 0 : 0;
    const updatedScore = isCorrect ? currentScore + rewardPoints : currentScore - penaltyPoints;
    const responseDuration = ((Date.now() - startTime) / 1000).toFixed(1);

    const cleanText = question.questionText.replace('What is ', '');

    const updatedCorrect = isCorrect ? numCorrect + 1 : numCorrect;
    const currentCorrectQs = (correctQuestions as string)?.split(';').filter(Boolean) || [];
    const updatedCorrectQs = isCorrect ? [...currentCorrectQs, cleanText] : currentCorrectQs;

    const currentIncorrectQs = (incorrectQuestions as string)?.split(';').filter(Boolean) || [];
    const updatedIncorrectQs = !isCorrect ? [...currentIncorrectQs, cleanText] : currentIncorrectQs;

    router.push({
      pathname: '/feedback',
      params: {
        correct: isCorrect.toString(),
        operation,
        range,
        questions,
        current: currentIndex.toString(),
        score: updatedScore.toString(),
        responseType,
        correctReward: correctReward as string,
        correctFeedback,
        wrongPenalty: wrongPenalty as string,
        wrongFeedback,
        questionText: cleanText,
        correctAnswer: question.correctAnswer.toString(),
        selectedAnswer: selected?.toString() ?? textAnswer,
        responseTime: responseDuration,
        correctCount: updatedCorrect.toString(),
        correctQuestions: updatedCorrectQs.join(';'),
        incorrectQuestions: updatedIncorrectQs.join(';'),
        endSummary
      },
    });
  };

  const isDisabled =
    (responseType === 'Free Response' && textAnswer.trim() === '') ||
    (responseType === 'Multiple Choice' && selected === null);

  return (
    <LinearGradient colors={['#5F91FF', '#A6A9FF']} style={styles.gradient}>
      <View style={styles.pointsContainer}><Text style={styles.pointsText}>⭐ {score}</Text></View>
      <View style={styles.container}>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${(currentIndex / total) * 100}%` }]} />
          <Text style={styles.progressLabel}>Qn {currentIndex} of {total}</Text>
        </View>

        {question && (
          <>
            <Text style={styles.questionText}>{question.questionText}</Text>

            {responseType === 'Free Response' ? (
              <TextInput
                style={styles.input}
                placeholder="Type your answer here..."
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={textAnswer}
                onChangeText={setTextAnswer}
              />
            ) : responseType === 'Show Your Work' ? (
              <>
                <View style={styles.canvasWrapper} {...panResponder.panHandlers}>
                  <Svg style={styles.canvas}>
                    {paths.map((d, i) =>
                      d !== '' ? <Path key={i} d={d} stroke="black" strokeWidth={3} fill="none" /> : null
                    )}
                  </Svg>
                </View>
                <Pressable onPress={handleClearCanvas} style={styles.clearButton}>
                  <Text style={styles.clearText}>Clear</Text>
                </Pressable>
              </>
            ) : (
              <View style={styles.optionsContainer}>
                {question.options.map((opt, i) => (
                  <Pressable
                    key={i}
                    onPress={() => setSelected(opt)}
                    style={[
                      styles.option,
                      selected === opt && styles.optionSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selected === opt && styles.optionTextSelected,
                      ]}
                    >
                      {opt}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            <Pressable onPress={handleSubmit} disabled={isDisabled} style={styles.submitButton}>
              <Text style={styles.submitText}>Submit Answer</Text>
            </Pressable>
          </>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  questionText: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 30, textAlign: 'center' },
  optionsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 30 },
  option: { borderColor: '#fff', borderWidth: 2, borderRadius: 16, padding: 16, margin: 10 },
  optionSelected: { borderColor: '#2979FF' },
  optionText: { color: '#fff', fontSize: 20 },
  optionTextSelected: { color: '#2979FF' },
  input: {
    width: 250,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#000',
  },
  canvasWrapper: {
    width: 320,
    height: 200,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 30,
    overflow: 'hidden',
  },
  canvas: {
    width: '100%',
    height: '100%',
  },
  clearButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 20,
  },
  clearText: {
    color: '#0047AB',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#0047AB',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
  },
  submitText: { color: '#fff', fontSize: 18 },
  progressContainer: {
    width: '80%',
    height: 20,
    backgroundColor: '#ffffff33',
    borderRadius: 10,
    marginBottom: 30,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  progressLabel: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    zIndex: 1,
  },
  pointsContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#ffffff88',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0047AB',
  }
});
