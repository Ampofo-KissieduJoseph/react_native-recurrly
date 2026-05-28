import { Link } from "expo-router";
import {FlatList, Image, Text, View} from "react-native";
import "@/global.css";
import {SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";
import {styled} from "nativewind";
import images from "@/constant/image"
import {HOME_BALANCE, HOME_SUBSCRIPTIONS, HOME_USER, UPCOMING_SUBSCRIPTIONS} from "@/constant/data"
import {icons} from "@/constant/icons"
import {formatCurrency} from "@/lib/utils";
import dayjs from "dayjs";
import ListHeadings from "@/app-example/components/ListHeadings";
import UpcomingSubcriptionsCard from "@/app-example/components/UpcomingSubcriptionsCard";
import SubscriptionCard from "@/app-example/components/SubscriptionCard";
import {useState} from "react";

const SafeAreaView = styled(RNSafeAreaView);
export default function Index() {
    const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
  return (
    <SafeAreaView className={"flex-1 bg-background p-5"}>
        {/*<View className="flex-1">*/}

            <FlatList
                ListHeaderComponent={() => (
                    <>
                        <View className={"home-header"}>
                            <View className={"home-user"}>
                                <Image source={images.avatar} className={"home-avatar"}/>
                                <Text className={"home-user-name"}>{HOME_USER.name}</Text>
                            </View>
                            <Image source={icons.add} className={"home-add-icon"} />
                        </View>
                        <View className={"home-balance-card"}>
                            <Text className={"home-balance-label"}>Balance</Text>
                            <View className={"home-balance-row"}>
                                <Text className={"home-balance-amount"}>
                                    {formatCurrency(HOME_BALANCE.amount)}
                                </Text>
                                <Text className={"home-balance-date"}>
                                    {dayjs(HOME_BALANCE.nextRenewalDate).format('MM/DD')}
                                </Text>
                            </View>
                        </View>
                        <View className={"mb-5"}>
                            <ListHeadings title={"Upcoming"} />
                            <FlatList
                                data={UPCOMING_SUBSCRIPTIONS}
                                renderItem={({ item }) => (<UpcomingSubcriptionsCard {...item} />)}
                                keyExtractor={(item) => item.id}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                ListEmptyComponent={<Text className={"home-empty-state"}>No upcoming renewals yet</Text>}
                            />
                        </View>
                        <ListHeadings title={"All Subscriptions"} />
                    </>
                )}
                data={HOME_SUBSCRIPTIONS}
                      keyExtractor={(item) => item.id}
                      renderItem={({item}) => (
                          <SubscriptionCard {...item}
                                            expanded={expandedSubscriptionId === item.id}
                                            onPress={() => setExpandedSubscriptionId((currentId) => (currentId === item.id ? null : item.id)) }
                          />
                      )}
                      extraData={expandedSubscriptionId}
                      ItemSeparatorComponent={() => <View className={"h-4"} />}
                      showsVerticalScrollIndicator={false}
                      ListEmptyComponent={<Text className={"home-empty-state"}>No subscriptions yet</Text>}
                      contentContainerClassName={"pb-20"}
            />

          {/*<SubscriptionCard*/}
          {/*    {...HOME_SUBSCRIPTIONS[0]}*/}
          {/*    expanded={expandedSubscriptionId === HOME_SUBSCRIPTIONS[0].id}*/}
          {/*    onPress={() => setExpandedSubscriptionId((currentId) =>(currentId === HOME_SUBSCRIPTIONS[0].id ? null : HOME_SUBSCRIPTIONS[0].id))}*/}
          {/*/>*/}
      {/*</View>*/}
    </SafeAreaView>
  );
}
