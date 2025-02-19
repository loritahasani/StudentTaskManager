import { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { FAB, Card, Text, ProgressBar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Slider } from 'react-native-paper';
import { Alert } from 'react-native';
import { Menu, Button, Divider } from 'react-native-paper'; 
import { requestNotificationPermission, scheduleTaskReminder } from './utils/notifications';



const STORAGE_KEY = '@tasks';
const [editingTask, setEditingTask] = useState(null);
const [progressValue, setProgressValue] = useState(0);


export default function HomeScreen({ navigation, route }) {
  const [tasks, setTasks] = useState([]);

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, []);

  // Save tasks whenever they change
  useEffect(() => {
    saveTasks();
  }, [tasks]);

  // Handle new tasks from navigation
  useEffect(() => {
    if (route.params?.newTask) {
      setTasks((prev) => [...prev, route.params.newTask]);
    }
  }, [route.params?.newTask]);

  useEffect(() => {
    const requestPermission = async () => {
      const permissionGranted = await requestNotificationPermission();
      if (!permissionGranted) {
        alert('You need to enable notifications to get reminders for tasks.');
      }
    };
  
    requestPermission();
  }, []);

  useEffect(() => {
    if (tasks.length > 0) {
      tasks.forEach(task => {
        scheduleTaskReminder(task);
      });
    }
  }, [tasks]);
  

  // Load tasks from AsyncStorage
  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedTasks) setTasks(JSON.parse(storedTasks));
    } catch (e) {
      console.error('Failed to load tasks:', e);
    }
  };

  // Save tasks to AsyncStorage
  const saveTasks = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks:', e);
    }
  };

  // Render task item with progress bar and colors
  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text variant="titleMedium">{item.title}</Text>
          <Menu
            visible={editingTask?.id === item.id}
            onDismiss={() => setEditingTask(null)}
            anchor={
              <Button
                icon="dots-vertical"
                onPress={() => {
                  setEditingTask(item);
                  setProgressValue(item.progress);
                }}
              />
            }
          >
            <Menu.Item
              onPress={() => {
                setEditingTask({ ...item, progress: item.progress });
                setProgressValue(item.progress);
              }}
              title="Edit Progress"
            />
            <Divider />
            <Menu.Item
              onPress={() => confirmDelete(item.id)}
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
  
      {/* Progress Edit Modal */}
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
              }}
            >
              Save {progressValue}%
            </Button>
            <Button
              mode="outlined"
              onPress={() => setEditingTask(null)}
            >
              Cancel
            </Button>
          </View>
        </Card.Actions>
      )}
    </Card>
  );
  

  // Get color based on progress value
  const getProgressColor = (progress) => {
    if (progress >= 100) return '#4CAF50'; // Green for completed
    if (progress >= 50) return '#FFC107'; // Yellow for in progress
    return '#F44336'; // Red for low progress
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
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

const handleProgressChange = (taskId, newProgress) => {
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
        { text: 'Delete', onPress: () => handleDelete(taskId) }
      ]
    );
  };
  
  const handleDelete = (taskId) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };
  