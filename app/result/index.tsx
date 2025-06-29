
import React, { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ResultScreen() {
  const {
    score,
    questions,
    correctCount,
    endSummary,
    correctQuestions,
    incorrectQuestions,
    configData,
    allResponses,
  } = useLocalSearchParams();

  const router = useRouter();
  const total = parseInt(questions as string) || 0;
  const correct = parseInt(correctCount as string) || 0;

  const handleNewGame = () => {
    router.replace('/');
  };

  const config = configData ? JSON.parse(decodeURIComponent(configData as string)) : {};
  const responses = allResponses ? JSON.parse(decodeURIComponent(allResponses as string)) : [];

  useEffect(() => {
    const submitToMongo = async () => {
      try {
        console.log("Submitting:", {
          config : config,
          results: responses,
          finalScore: score,
          timestamp: new Date().toISOString(),
        });
        
        const res = await fetch('http://cogtoolslab.org:8877/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            config : config,
            results: responses,
            finalScore: score,
            timestamp: new Date().toISOString(),
          }),
        });
        
        if (!res.ok) {
          const errMsg = await res.text();
          throw new Error(`Server responded with ${res.status}: ${errMsg}`);
        }

      } catch (error) {
        console.error('Failed to submit data to MongoDB:', error);
      }
    };

    submitToMongo();
  }, []);
  
  const renderSummary = () => {
    if (endSummary === 'Summarize my answers' && correctQuestions && incorrectQuestions) {
      const correctList = (correctQuestions as string).split(';');
      const incorrectList = (incorrectQuestions as string).split(';');
      return (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Great Job!</Text>
          <View style={styles.columns}>
            <View style={styles.column}>
              <Text style={styles.columnHeader}>Correctly Answered</Text>
              {correctList.map((q, i) => (
                <Text key={i} style={styles.questionText}>{q}</Text>
              ))}
            </View>
            <View style={styles.column}>
              <Text style={styles.columnHeader}>Incorrectly Answered</Text>
              {incorrectList.map((q, i) => (
                <Text key={i} style={styles.questionText}>{q}</Text>
              ))}
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Nice Job! You got {correct} questions out of {total} correct.</Text>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#5F91FF', '#A6A9FF']} style={styles.gradient}>
      <View style={styles.container}>
        <View style={styles.scoreWrapper}>
          <Text style={styles.scoreText}>⭐ {score}</Text>
        </View>
        {renderSummary()}
        <Pressable onPress={handleNewGame} style={styles.newGameButton}>
          <Text style={styles.newGameText}>New Game</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  scoreWrapper: {
    backgroundColor: '#ffffff55',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  scoreText: { fontSize: 20, fontWeight: '600', color: '#0047AB' },
  summaryContainer: { alignItems: 'center', marginBottom: 30 },
  summaryTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 20 },
  columns: { flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 30, },
  column: { minWidth: 150, 
    marginHorizontal: 15, 
    alignItems: 'center', },
  columnHeader: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 10 },
  questionText: { color: '#fff', fontSize: 16, marginBottom: 4 },
  newGameButton: {
    backgroundColor: '#0047AB',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
  },
  newGameText: { color: '#fff', fontSize: 18 },
});
