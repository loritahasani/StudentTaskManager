import { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Text, IconButton, Menu, Button } from 'react-native-paper';
import { PieChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@study_sessions';

const courseColors = {
  Mathematics: '#E6E6FA', // Lavender
  Science: '#1E3A8A', // Deep Blue
  History: '#FFCE56', // Gold
  English: '#36A2EB', // Teal
  Geography: '#9966FF', // Purple shade
  Unknown: '#C9CBCF', // Neutral gray
};

const allowedCourses = ['Mathematics', 'Science', 'Unknown', 'History', 'English', 'Geography'];

export default function AnalyticsScreen() {
  const [sessions, setSessions] = useState([]);
  const [studyTime, setStudyTime] = useState(0);
  const [isStudying, setIsStudying] = useState(false);
  const [timer, setTimer] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState('Mathematics');
  const [courseMenuVisible, setCourseMenuVisible] = useState(false);

  const courseOptions = Object.keys(courseColors).map((course) => ({
    label: course,
    value: course,
  }));

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    let interval;
    if (isStudying) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStudying]);

  const loadSessions = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSessions(parsed);
        setStudyTime(parsed.reduce((acc, curr) => acc + curr.duration, 0));
      }
    } catch (e) {
      console.error('Failed to load sessions:', e);
    }
  };

  const saveSession = async () => {
    const newSession = {
      date: new Date().toISOString(),
      duration: timer,
      course: selectedCourse || 'Unknown',
    };
    try {
      const updated = [...sessions, newSession];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setSessions(updated);
      setStudyTime((prev) => prev + timer);
    } catch (e) {
      console.error('Failed to save session:', e);
    }
  };

  const handleTimerControl = () => {
    if (isStudying) {
      saveSession();
      setTimer(0);
    }
    setIsStudying(!isStudying);
  };

  const getCourseDistribution = () => {
    const courseDistribution = {};
    let totalHours = 0;

    // Calculate total study time in hours
    sessions.forEach((session) => {
      const course = session.course || 'Unknown';
      if (!allowedCourses.includes(course)) return; // Filter out non-allowed courses
      if (!courseDistribution[course]) {
        courseDistribution[course] = 0;
      }
      courseDistribution[course] += session.duration / 3600;
      totalHours += session.duration / 3600;
    });

    // Calculate percentages for each allowed course
    return Object.keys(courseDistribution).map((course) => {
      const hours = courseDistribution[course];
      const percentage = totalHours > 0 ? ((hours / totalHours) * 100).toFixed(1) : 0;
      return {
        name: course,
        hours: hours,
        percentage: parseFloat(percentage),  // Make sure percentage is a number
        color: courseColors[course] || '#000000',
      };
    });
  };

  const chartData = getCourseDistribution();

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
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
              {`Course: ${selectedCourse}`}
            </Button>
          }
        >
          {courseOptions.map((option) => (
            <Menu.Item
              key={option.value}
              title={option.label}
              onPress={() => {
                setSelectedCourse(option.value);
                setCourseMenuVisible(false);
              }}
            />
          ))}
        </Menu>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.centerText}>Study Timer</Text>
            <Text variant="displayMedium" style={styles.timer}>
              {String(Math.floor(timer / 3600)).padStart(2, '0')}:
              {String(Math.floor((timer % 3600) / 60)).padStart(2, '0')}:
              {String(timer % 60).padStart(2, '0')}
            </Text>
            <IconButton
              icon={isStudying ? 'stop' : 'play'}
              mode="contained"
              size={40}
              onPress={handleTimerControl}
              style={styles.timerButton}
              color={isStudying ? '#ff4444' : '#4CAF50'}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.centerText}>Study Statistics</Text>
            <Text variant="bodyLarge">Total Study Time: {(studyTime / 3600).toFixed(1)}h</Text>
            <Text variant="bodyLarge">Average Daily: {(studyTime / (sessions.length || 1) / 3600).toFixed(1)}h</Text>
            <PieChart
              data={chartData}
              width={300}
              height={150}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="percentage"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
              hideLegend={true} // Hide the default legend
              hideLabels={true} // Hide the default labels
            />
            {/* Custom Legend with Percentages */}

          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  input: {
    marginBottom: 10,
    alignSelf: 'center',
  },
  card: {
    margin: 10,
    padding: 10,
  },
  timer: {
    textAlign: 'center',
    marginVertical: 15,
  },
  timerButton: {
    alignSelf: 'center',
    margin: 10,
  },
  centerText: {
    textAlign: 'center',
    marginBottom: 10,
  },
  chart: {
    marginVertical: 15,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 5,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 5,
  },
  legendText: {
    fontSize: 14,
  },
});
