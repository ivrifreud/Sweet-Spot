import "./global.css";
import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';

export default function App() {
  const [status, setStatus] = useState('Loading...');

  useEffect(() => {
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/health`)
      .then((res) => res.json())
      .then((data) => setStatus(JSON.stringify(data)))
      .catch((err) => setStatus(`Error: ${err.message}`));
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg">Backend says: {status}</Text>
    </View>
  );
}