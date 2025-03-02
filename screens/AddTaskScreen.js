import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Button, TextInput, Menu } from 'react-native-paper';
import { DatePickerInput } from 'react-native-paper-dates';

export default function AddTaskScreen({ navigation, route }) {
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  const [deadline, setDeadline] = useState(new Date());
  const [priority, setPriority] = useState('Medium');
  const [courseMenuVisible, setCourseMenuVisible] = useState(false);
  const [priorityMenuVisible, setPriorityMenuVisible] = useState(false);

  const courseOptions = [
    { label: 'Mathematics', value: 'Mathematics' },
    { label: 'Science', value: 'Science' },
    { label: 'History', value: 'History' },
    { label: 'English', value: 'English' },
    { label: 'Geography', value: 'Geography' },
  ];

  const handleSave = async () => {
    // Validate inputs
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }
    if (!course.trim()) {
      Alert.alert('Error', 'Please select a course');
      return;
    }

    // Create new task object
    const newTask = {
      id: Date.now().toString(), // Unique ID
      title,
      course,
      deadline: deadline.toISOString().split('T')[0], // Format as YYYY-MM-DD
      priority,
      progress: 0, // Default progress
    };

    console.log('New Task:', newTask); // Debugging log

    // Pass the new task back to HomeScreen
    if (route.params?.saveTask) {
      await route.params.saveTask(newTask);
    }

    // Navigate back to HomeScreen
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      {/* Task Title Input */}
      <TextInput
        label="Task Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
        mode="outlined"
      />

      {/* Course Selection Menu */}
      <View style={styles.menuContainer}>
        <Menu
          visible={courseMenuVisible}
          onDismiss={() => setCourseMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setCourseMenuVisible(true)}
              style={styles.input}
              icon="book"
            >
              {course ? `Course: ${course}` : 'Select Course'}
            </Button>
          }
        >
          {courseOptions.map((option) => (
            <Menu.Item
              key={option.value}
              title={option.label}
              onPress={() => {
                setCourse(option.value);
                setCourseMenuVisible(false);
              }}
            />
          ))}
        </Menu>
      </View>

      {/* Deadline Date Picker */}
      <DatePickerInput
        label="Deadline"
        value={deadline}
        onChange={(date) => setDeadline(date)}
        style={styles.input}
        locale="en"
        mode="outlined"
      />

      {/* Priority Selection Menu */}
      <Menu
        visible={priorityMenuVisible}
        onDismiss={() => setPriorityMenuVisible(false)}
        anchor={
          <Button
            mode="outlined"
            onPress={() => setPriorityMenuVisible(true)}
            style={styles.input}
            icon="alert-circle"
          >
            Priority: {priority}
          </Button>
        }
      >
        <Menu.Item
          onPress={() => {
            setPriority('High');
            setPriorityMenuVisible(false);
          }}
          title="High"
        />
        <Menu.Item
          onPress={() => {
            setPriority('Medium');
            setPriorityMenuVisible(false);
          }}
          title="Medium"
        />
        <Menu.Item
          onPress={() => {
            setPriority('Low');
            setPriorityMenuVisible(false);
          }}
          title="Low"
        />
      </Menu>

      {/* Save Button */}
      <Button
        mode="contained"
        onPress={handleSave}
        style={styles.button}
        icon="content-save"
      >
        Save Task
      </Button>
    </ScrollView>
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
  button: {
    marginTop: 20,
  }
});