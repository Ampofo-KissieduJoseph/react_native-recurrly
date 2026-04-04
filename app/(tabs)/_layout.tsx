import { Tabs } from "expo-router";
import {tabs} from "@/constant/data";
import {colors, components } from "@/constant/theme";
import {View, Image} from "react-native";
import clsx from "clsx";
// import {Image} from "expo-images";
import {useSafeAreaInsets} from "react-native-safe-area-context";

const tabBar = components.tabBar;

export default function TabLayout() {
    const insets = useSafeAreaInsets();

    const TabIcon = ({focus, icon}: TabIconProps) => {
        return (
            <View className="tabs-icon">
                <View className={clsx('tabs-pill', focus &&
                    'tabs-active')}>
                    <Image source={icon}
                    resizeMode={"contain"}
                    className="tabs-glyph"/>
                </View>
            </View>
        )
    }
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: Math.max(insets.bottom, tabBar.horizontalInset),
                    height: tabBar.height,
                    marginHorizontal: tabBar.horizontalInset,
                    borderRadius: tabBar.radius,
                    backgroundColor: colors.primary,
                    borderTopWidth: 0,
                    elevation: 0,
                },
                tabBarItemStyle: {
                    paddingVertical: tabBar.height / 2 - tabBar.iconFrame / 1.6
                },
                tabBarIconStyle: {
                    width: tabBar.iconFrame,
                    height: tabBar.iconFrame,
                    alignItems: "center",
                }
        }}>
            {tabs.map((tab) => (
                <Tabs.Screen
                    key={tab.name}
                    name={tab.name}
                    options={{
                        title: tab.title,
                        tabBarIcon:({focused}) => (
                            <TabIcon focus={focused} icon={tab.icons} />
                        )
                }}/>
            ))}
        </Tabs>
            // <Tabs.Screen name="index" options={{ title: "Home" }} />
            // <Tabs.Screen name="Subscriptions" options={{ title: "Subscriptions" }} />
            // <Tabs.Screen name="Insights" options={{ title: "Insights" }} />
            // <Tabs.Screen name="Settings" options={{ title: "Settings" }} />
    );
}


// import { Tabs } from "expo-router";
//
// export default function TabLayout() {
//   return (
//     <Tabs screenOptions={{ headerShown: false }}>
//       <Tabs.Screen name="index" options={{ title: "Home" }} />
//       <Tabs.Screen name="Subscriptions" options={{ title: "Subscriptions" }} />
//       <Tabs.Screen name="Insights" options={{ title: "Insights" }} />
//       <Tabs.Screen name="Settings" options={{ title: "Settings" }} />
//     </Tabs>
//   );
// }
//
