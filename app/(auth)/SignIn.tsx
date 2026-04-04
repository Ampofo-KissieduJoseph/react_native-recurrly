import React from 'react';
import { View, Text } from 'react-native';
import {Link} from "expo-router";

const signIn = () => {
  return (
    <View>
      <Text>signIn</Text>
      <Link href="/(auth)/SignUp">Create Account</Link>
    </View>
  );
};

export default signIn;