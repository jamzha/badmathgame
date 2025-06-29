import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function FeedbackScreen() {
  const {
    correct,
    operation,
    range,
    questions,
    current,
    score,
    responseType,
    correctReward,
    wrongPenalty,
    correctFeedback,
    wrongFeedback,
    questionText,
    correctAnswer,
    selectedAnswer,
    responseTime,
    correctCount = '0',
    correctQuestions,
    incorrectQuestions,
    endSummary,
    allResponses,
    configData, 
  } = useLocalSearchParams();

  const router = useRouter();

  const isCorrect = correct === 'true';
  const total = parseInt(questions as string);
  const currentIndex = parseInt((current as string) || '1');
  const selected = parseInt(selectedAnswer as string);
  const correctAns = parseInt(correctAnswer as string);
  const currentCorrectCount = parseInt(correctCount as string || '0');

  const showReward =
    (isCorrect && correctReward !== 'No Reward') ||
    (!isCorrect && wrongPenalty !== 'No Penalty');

  const scoreChange = isCorrect
    ? `+${parseInt(correctReward as string) || 0}`
    : `${parseInt(wrongPenalty as string) || 0}`;

  const handleNext = () => {
    const isLastQuestion = currentIndex >= total;
    const nextCorrectCount = currentCorrectCount;

    const nextParams = {
      operation,
      range,
      questions,
      responseType,
      correctReward,
      wrongPenalty,
      correctFeedback,
      wrongFeedback,
      correctCount: nextCorrectCount.toString(),
      correctQuestions,
      incorrectQuestions,
      endSummary,
      score,
      allResponses, 
      configData, 
      current: (currentIndex + 1).toString(),
    };

    if (isLastQuestion) {
      router.push({ pathname: '/result', params: nextParams });
    } else {
      router.push({ pathname: '/question', params: nextParams });
    }
  };

  const getExtraFeedback = () => {
    const cleanedQuestion = (questionText as string)?.replace('What is ', '').replace('?', '');

    if (isCorrect) {
      if (correctFeedback === 'Show me the question again' && cleanedQuestion && correctAnswer) {
        return <Text style={styles.subFeedback}>{`${cleanedQuestion} = ${correctAnswer}`}</Text>;
      }
      if (correctFeedback === 'Show me how quickly I answered' && responseTime) {
        return <Text style={styles.subFeedback}>You answered in {responseTime} seconds.</Text>;
      }
    } else {
      if (wrongFeedback === 'Show me the correct answer' && correctAnswer) {
        return <Text style={styles.subFeedback}>The correct answer is {correctAnswer}.</Text>;
      }
      if (wrongFeedback === 'Tell me how close I was' && !isNaN(selected) && !isNaN(correctAns)) {
        const diff = Math.abs(correctAns - selected);
        return <Text style={styles.subFeedback}>You were off by {diff}.</Text>;
      }
    }
    return null;
  };

  return (
    <LinearGradient colors={['#5F91FF', '#A6A9FF']} style={styles.gradient}>
      <View style={styles.pointsContainer}><Text style={styles.pointsText}>⭐ {score}</Text></View>
      <View style={styles.container}>
        {showReward && (
          <Text style={[styles.rewardText, !isCorrect && styles.negative]}>
            {scoreChange}
          </Text>
        )}
        <Text style={styles.feedbackText}>
          {isCorrect ? "That's correct!" : "That's incorrect!"}
        </Text>
        {getExtraFeedback()}
        <Pressable onPress={handleNext} style={styles.nextButton}>
          <Text style={styles.nextButtonText}>
            {currentIndex >= total ? 'View Results' : 'Next Question'}
          </Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  rewardText: { fontSize: 20, fontStyle: 'italic', color: '#2979FF', marginBottom: 10 },
  negative: { color: '#FF5252' },
  feedbackText: { fontSize: 30, fontWeight: 'bold', color: '#fff', marginBottom: 10, textAlign: 'center' },
  subFeedback: { fontSize: 18, color: '#fff', marginBottom: 20, textAlign: 'center' },
  nextButton: { backgroundColor: '#0047AB', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 20 },
  nextButtonText: { color: '#fff', fontSize: 18 },
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
