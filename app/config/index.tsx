import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

type ButtonGroupProps = {
  options: string[];
  selected: string | null;
  setSelected: (value: string) => void;
};

const ButtonGroup: React.FC<ButtonGroupProps> = ({ options, selected, setSelected }) => (
  <View style={styles.buttonGroup}>
    {options.map(option => {
      const isSelected = selected === option;
      return (
        <Pressable
          key={option}
          onPress={() => setSelected(option)}
          style={[styles.button, isSelected && styles.buttonSelected]}>
          <Text style={[styles.buttonText, isSelected && styles.buttonTextSelected]}>
            {option}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

export default function ConfigScreen() {
  const router = useRouter();
  const { operation, range, questions, responseType } = useLocalSearchParams();

  // Config state
  const [rightReward, setRightReward] = useState<string | null>(null);
  const [rightFeedback, setRightFeedback] = useState<string | null>(null);
  const [wrongPenalty, setWrongPenalty] = useState<string | null>(null);
  const [wrongFeedback, setWrongFeedback] = useState<string | null>(null);
  const [endSummary, setEndSummary] = useState<string | null>(null);

  const allSelected = rightReward && rightFeedback && wrongPenalty && wrongFeedback && endSummary;

  const handleStartGame = () => {
    if (!allSelected) return;
    const configData = {
      operation,
      range,
      questions,
      responseType,
      correctReward: rightReward,
      correctFeedback: rightFeedback,
      wrongPenalty,
      wrongFeedback,
      endSummary,
    };

    router.push({
        pathname: '/question',
        params: {
          operation,
          range,
          questions,
          responseType,
          current: '1',
          score: '0',
          correctReward: rightReward,
          correctFeedback: rightFeedback,
          wrongPenalty,
          wrongFeedback,
          endSummary,
          allResponses: encodeURIComponent(JSON.stringify([])), // initialize
          configData: encodeURIComponent(JSON.stringify(configData)), // save full config
        },
      });
      
  };
  

  return (
    <LinearGradient colors={['#5F91FF', '#A6A9FF']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Welcome to Bad Math Game</Text>

        <Text style={styles.subtitle}>If you get a question <Text style={styles.bold}>right</Text>, what should happen to your score?</Text>
        <ButtonGroup options={['No Reward', '+50', '+100']} selected={rightReward} setSelected={setRightReward} />

        <Text style={styles.subtitle}>If you get a question <Text style={styles.bold}>right</Text>, what do you want to be told?</Text>
        <ButtonGroup
          options={[
            'No additional feedback',
            'Show me the question again',
            'Show me how quickly I answered',
          ]}
          selected={rightFeedback}
          setSelected={setRightFeedback}
        />

        <Text style={styles.subtitle}>If you get a question <Text style={styles.bold}>wrong</Text>, what should happen to your score?</Text>
        <ButtonGroup options={['No Penalty', '-50', '-100']} selected={wrongPenalty} setSelected={setWrongPenalty} />

        <Text style={styles.subtitle}>If you get a question <Text style={styles.bold}>wrong</Text>, what do you want to be told?</Text>
        <ButtonGroup
          options={[
            'No additional feedback',
            'Show me the correct answer',
            'Tell me how close I was',
          ]}
          selected={wrongFeedback}
          setSelected={setWrongFeedback}
        />

        <Text style={styles.subtitle}>What do you want to be shown at the end of the game?</Text>
        <ButtonGroup
          options={['How many questions I got correct', 'Summarize my answers']}
          selected={endSummary}
          setSelected={setEndSummary}
        />

        <Pressable onPress={handleStartGame} style={styles.goButton}>
          <Text style={styles.goButtonText}>Go</Text>
        </Pressable>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginVertical: 10,
    color: '#fff',
    textAlign: 'center',
  },
  bold: {
    fontWeight: 'bold',
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 10,
  },
  button: {
    borderColor: '#fff',
    borderWidth: 2,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    margin: 6,
  },
  buttonSelected: {
    borderColor: '#2979FF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
  buttonTextSelected: {
    color: '#2979FF',
  },
  goButton: {
    marginTop: 30,
    backgroundColor: '#0047AB',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
  },
  goButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});
