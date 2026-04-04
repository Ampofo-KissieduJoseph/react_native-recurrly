import type { ImageSourcePropType } from "react-native";

declare global {
    interface TabIconProps {
        focus: boolean;
        icon: ImageSourcePropType
    }
}

export {};