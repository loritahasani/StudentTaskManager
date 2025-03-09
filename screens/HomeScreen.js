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
  const [menuVisibleTaskId, setMenuVisibleTaskId] = useState(null);

  useEffect(() => {
    loadTasks();
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (route.params?.newTask) {
      const newTask = route.params.newTask;
      setTasks(prevTasks => {
        const updatedTasks = [...prevTasks, newTask];
        saveTasks(updatedTasks);
        return updatedTasks;
      });
      scheduleTaskReminder(newTask);
    }
  }, [route.params?.newTask]);

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks);
        setTasks(parsedTasks);
      }
    } catch (e) {
      console.error('Failed to load tasks:', e);
    }
  };

  const saveTasks = async (tasksToSave) => {
    try {
      const tasksString = JSON.stringify(tasksToSave);
      await AsyncStorage.setItem(STORAGE_KEY, tasksString);
    } catch (e) {
      console.error('Failed to save tasks:', e);
    }
  };

  const saveTask = async (newTask) => {
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
  };

  const confirmDelete = (taskId) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: () => {
            setMenuVisibleTaskId(null); // Close menu first
            handleDelete(taskId); // Directly confirm deletion
          },
          style: 'destructive' 
        }
      ]
    );
  };

  const handleDelete = async (taskId) => {
    try {
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      await saveTasks(updatedTasks);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleProgressChange = async (taskId, newProgress) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, progress: newProgress } : task
    );
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
  };

  const markTaskAsDone = async (taskId) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, progress: 100 } : task
    );
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text variant="titleMedium" style={styles.cardTitle}>{item.title}</Text>
    
          {/* Task Options Menu */}
          <Menu
            visible={menuVisibleTaskId === item.id}
            onDismiss={() => setMenuVisibleTaskId(null)}
            anchor={
              <Button 
                icon="dots-vertical" 
                onPress={() => setMenuVisibleTaskId(item.id)}
                textColor="#FFF"
              />
            }>
            <Divider />
            <Menu.Item
              onPress={() => {
                setMenuVisibleTaskId(null);
                confirmDelete(item.id);
              }}
              title="Delete"
              titleStyle={{ color: 'red' }}
            />
            <Menu.Item
              onPress={() => {
                setMenuVisibleTaskId(null);
                markTaskAsDone(item.id);
              }}
              title="Mark as Done"
              titleStyle={{ color: 'green' }}
            />
          </Menu>
        </View>
    
        <Text variant="bodyMedium" style={styles.cardText}>Course: {item.course}</Text>
        <Text variant="bodyMedium" style={styles.cardText}>Deadline: {item.deadline}</Text>
        <Text variant="bodyMedium" style={styles.cardText}>Priority: {item.priority}</Text>
        <ProgressBar 
          progress={item.progress / 100} 
          style={styles.progressBar}
          color={getProgressColor(item.progress)}
        />
        <Text variant="bodySmall" style={styles.cardText}>{item.progress}% Complete</Text>
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
        keyExtractor={item => item.id.toString()}
      />
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('AddTask', { saveTask })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  card: {
    margin: 10,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    backgroundColor: '#6a11cb',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardText: {
    color: '#FFF',
    marginVertical: 3,
  },
  progressBar: {
    height: 8,
    marginVertical: 10,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6a11cb',
  },
});
