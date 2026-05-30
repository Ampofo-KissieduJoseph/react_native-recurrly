import { useUser } from "@clerk/expo";
import {FlatList, Image, Text, View} from "react-native";
import "@/global.css";
import {SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";
import {styled} from "nativewind";
import {HOME_BALANCE, HOME_SUBSCRIPTIONS, UPCOMING_SUBSCRIPTIONS} from "@/constant/data"
import {icons} from "@/constant/icons"
import {formatCurrency} from "@/lib/utils";
import dayjs from "dayjs";
import ListHeadings from "@/app-example/components/ListHeadings";
import UpcomingSubcriptionsCard from "@/app-example/components/UpcomingSubcriptionsCard";
import SubscriptionCard from "@/app-example/components/SubscriptionCard";
import {useState} from "react";
import { colors } from "@/constant/theme";

const SafeAreaView = styled(RNSafeAreaView);

export default function Index() {
    const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
    const { user } = useUser();

    // Derive display name: full name → email prefix → "There"
    const displayName = user?.fullName
        || (user?.firstName ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`.trim() : null)
        || user?.primaryEmailAddress?.emailAddress?.split('@')[0]
        || 'There';

    // First initial for fallback avatar
    const initial = displayName[0]?.toUpperCase() ?? '?';

  return (
    <SafeAreaView className={"flex-1 bg-background p-5"}>
            <FlatList
                ListHeaderComponent={() => (
                    <>
                        <View className={"home-header"}>
                            <View className={"home-user"}>
                                {/* Avatar: Clerk profile photo OR lettered fallback */}
                                {user?.imageUrl ? (
                                    <Image
                                        source={{ uri: user.imageUrl }}
                                        className={"home-avatar"}
                                    />
                                ) : (
                                    <View
                                        className={"home-avatar items-center justify-center"}
                                        style={{ backgroundColor: colors.accent + '33' }}>
                                        <Text
                                            className={"text-2xl font-sans-bold"}
                                            style={{ color: colors.accent }}>
                                            {initial}
                                        </Text>
                                    </View>
                                )}
                                <Text className={"home-user-name"}>{displayName}</Text>
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
    </SafeAreaView>
  );
}
