import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

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
          style={[styles.button, isSelected && styles.buttonSelected]}
        >
          <Text style={[styles.buttonText, isSelected && styles.buttonTextSelected]}>
            {option}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

export default function HomeScreen() {
  const router = useRouter();

  const [operation, setOperation] = useState<string | null>(null);
  const [range, setRange] = useState<string | null>(null);
  const [questions, setQuestions] = useState<string | null>(null);
  const [responseType, setResponseType] = useState<string | null>(null);

  const handleStart = () => {
    if (operation && range && questions && responseType) {
      router.push({
        pathname: '/config',
        params: {
          operation,
          range,
          questions,
          responseType,
        },
      });
    }
  };

  return (
    <LinearGradient colors={['#5F91FF', '#A6A9FF']} style={styles.gradientContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Welcome to Bad Math Game</Text>

        <Text style={styles.subtitle}>What do you want to be tested on?</Text>
        <ButtonGroup options={['Addition', 'Subtraction']} selected={operation} setSelected={setOperation} />

        <Text style={styles.subtitle}>What number range do you want to use?</Text>
        <ButtonGroup options={['1 - 10', '1 - 50', '1 - 100']} selected={range} setSelected={setRange} />

        <Text style={styles.subtitle}>How many questions do you want to try?</Text>
        <ButtonGroup options={['3', '4', '5']} selected={questions} setSelected={setQuestions} />

        <Text style={styles.subtitle}>Select a response format.</Text>
        <ButtonGroup options={['Multiple Choice', 'Free Response', 'Show Your Work']} selected={responseType} setSelected={setResponseType} />

        <Pressable onPress={handleStart} style={styles.goButton}>
          <Text style={styles.goButtonText}>Next</Text>
        </Pressable>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginVertical: 10,
    color: '#fff',
    textAlign: 'center',
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 10,
  },
  button: {
    borderColor: '#fff',
    borderWidth: 2,
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    margin: 8,
    backgroundColor: 'transparent',
  },
  buttonSelected: {
    borderColor: '#2979FF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
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
