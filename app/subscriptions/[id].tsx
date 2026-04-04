import React from 'react';
import { View, Text } from 'react-native';
import { Link, useLocalSearchParams} from "expo-router";

const SubscriptionDetails = () => {
    const { id } = useLocalSearchParams<{ id: string }>()
  return (
    <View>
      <Text>{id}</Text>
      <Link href="/(tabs)">Back to Home</Link>
    </View>
  );
};

export default SubscriptionDetails;
