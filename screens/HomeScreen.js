import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { FAB, Card, Text, ProgressBar, Slider, Menu, Button, Divider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleTaskReminder, requestNotificationPermission } from '../utils/notifications';

const STORAGE_KEY = '@tasks';


export default function HomeScreen({ navigation, route }) {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [progressValue, setProgressValue] = useState(0);
  const [menuVisibleTaskId, setMenuVisibleTaskId] = useState(null); // Track which menu is open

  useEffect(() => {
    loadTasks();
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (tasks.length > 0) {
      console.log('Tasks have changed:', tasks);
      saveTasks(tasks);
    }
  }, [tasks]);
  

  useEffect(() => {
    if (route.params?.newTask) {
      console.log('New task received:', route.params.newTask);
      setTasks(prev => {
        const updatedTasks = [...prev, route.params.newTask];
        saveTasks(updatedTasks); // Save immediately after adding
        return updatedTasks;
      });
      scheduleTaskReminder(route.params.newTask);
    }
  }, [route.params?.newTask]);

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks);
        setTasks(parsedTasks);
        console.log('Loaded tasks:', parsedTasks);
      }
    } catch (e) {
      console.error('Failed to load tasks:', e);
    }
  };
  
  

  const saveTasks = async (tasksToSave = tasks) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasksToSave));
      console.log('Saved tasks:', tasksToSave);
    } catch (e) {
      console.error('Failed to save tasks:', e);
    }
  };

  const handleProgressChange = (taskId, newProgress) => {
    console.log('Changing progress for task', taskId, 'to', newProgress); // Debugging log
    setProgressValue(newProgress); // Update progress value for the slider
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, progress: newProgress } : task
      )
    );
  };
  
  
  const confirmDelete = (taskId) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: () => handleDelete(taskId),
          style: 'destructive' 
        }
      ]
    );
  };
  
  const handleDelete = async (taskId) => {
    try {
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks); // Update state immediately
      await saveTasks(updatedTasks); // Save to AsyncStorage
      console.log('Task deleted and saved:', updatedTasks);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };
  
  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text variant="titleMedium">{item.title}</Text>
    
          {/* Task Options Menu */}
          <Menu
            visible={menuVisibleTaskId === item.id}
            onDismiss={() => setMenuVisibleTaskId(null)}
            anchor={
              <Button 
                icon="dots-vertical" 
                onPress={() => setMenuVisibleTaskId(item.id)} // Open the menu for this task
              />
            }>
            <Menu.Item
              onPress={() => {
                console.log('Editing progress for task:', item.id); // Debugging log
                setEditingTask({ ...item, progress: item.progress });
                setProgressValue(item.progress);
                setMenuVisibleTaskId(null); // Close the menu
              }}
              title="Edit Progress"
            />
            <Divider />
            <Menu.Item
              onPress={() => {
                setMenuVisibleTaskId(null); // Close menu first
                confirmDelete(item.id); // Directly confirm deletion
              }}
              title="Delete"
              titleStyle={{ color: 'red' }}
            />
          </Menu>
        </View>
    
        <Text variant="bodyMedium">Course: {item.course}</Text>
        <Text variant="bodyMedium">Deadline: {item.deadline}</Text>
        <Text variant="bodyMedium">Priority: {item.priority}</Text>
        <ProgressBar 
          progress={item.progress / 100} 
          style={styles.progressBar}
          color={getProgressColor(item.progress)}
        />
        <Text variant="bodySmall">{item.progress}% Complete</Text>
      </Card.Content>
    
      {/* Progress Edit Slider */}
      {editingTask?.id === item.id && (
        <Card.Actions style={styles.editModal}>
          <Slider
            style={styles.slider}
            value={progressValue}
            minimumValue={0}
            maximumValue={100}
            step={5}
            onValueChange={setProgressValue}
          />
          <View style={styles.modalButtons}>
            <Button
              mode="contained"
              onPress={() => {
                console.log('Saving progress for task:', item.id, 'New progress:', progressValue); // Debugging log
                handleProgressChange(item.id, progressValue);
                setEditingTask(null);
              }}>
              Save {progressValue}%
            </Button>
            <Button
              mode="outlined"
              onPress={() => setEditingTask(null)}>
              Cancel
            </Button>
          </View>
        </Card.Actions>
      )}
    </Card>
  );

  const getProgressColor = (progress) => {
    if (progress >= 100) return '#4CAF50';
    if (progress >= 50) return '#FFC107';
    return '#F44336';
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()} // Ensure the key is unique
      />
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('AddTask')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  card: {
    margin: 5,
    padding: 5,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  progressBar: {
    height: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slider: {
    width: '100%',
    marginVertical: 10,
  },
  editModal: {
    flexDirection: 'column',
    padding: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 10,
  },
});
