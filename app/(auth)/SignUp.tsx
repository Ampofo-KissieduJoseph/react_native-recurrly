import React from 'react';
import { View, Text } from 'react-native';
import {Link} from "expo-router";

const signUp = () => {
  return (
    <View>
      <Text>signup</Text>
      <Link href="/(auth)/SignIn">Sign In</Link>
    </View>
  );
};

export default signUp;