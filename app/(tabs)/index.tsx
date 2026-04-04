import { Link } from "expo-router";
import { Text, View } from "react-native";
import "@/global.css";
import {SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";
import {styled} from "nativewind";

const SafeAreaView = styled(RNSafeAreaView);
export default function Index() {
  return (
    <SafeAreaView className={"flex-1 bg-background p-5"}>
      <Text className="text-xl font-bold text-success">Home</Text>
      <Link className="mt-4 rounded bg-primary p-4 text-white" href="/onboarding">
        Go to Onboarding
      </Link>
      <Link className="mt-4 rounded bg-primary p-4 text-white" href="/(auth)/SignIn">
        Sign In
      </Link>
        <Link className="mt-4 rounded bg-primary text-white p-4" href="/(auth)/SignUp">
            Sign Up
        </Link>
      <Link href="/subscriptions/spotify">
        Spotify Subscription
      </Link>
        <Link href={{pathname: "/subscriptions/[id]", params: {id: "Claude"},}}>
            Claude Max Subscription
        </Link>
    </SafeAreaView>
  );
}
