import { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';

export default function AddTaskScreen({ route, navigation }) {
  const { addTask } = route.params; // Receive the addTask function from HomeScreen

  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  const [deadline, setDeadline] = useState('');
  const [progress, setProgress] = useState('');

  const handleAddTask = () => {
    if (title && course && deadline && progress) {
      const newTask = {
        id: Date.now().toString(),
        title,
        course,
        deadline,
        priority: 'Normal', // Default priority
        progress: parseInt(progress),
      };
      addTask(newTask);
      navigation.goBack(); // Go back to HomeScreen after adding the task
    } else {
      alert('Please fill in all fields');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Task Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <TextInput
        label="Course"
        value={course}
        onChangeText={setCourse}
        style={styles.input}
      />
      <TextInput
        label="Deadline"
        value={deadline}
        onChangeText={setDeadline}
        style={styles.input}
      />
      <TextInput
        label="Progress (%)"
        value={progress}
        onChangeText={setProgress}
        keyboardType="numeric"
        style={styles.input}
      />
      <Button title="Add Task" onPress={handleAddTask} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    marginBottom: 10,
  },
});
