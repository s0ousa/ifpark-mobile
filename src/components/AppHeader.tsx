import React from 'react';
import { View } from 'react-native';
import { Text, Surface, IconButton, useTheme } from 'react-native-paper';

type AppHeaderProps = {
    title: string;
    showBackButton?: boolean;
    onBackPress?: () => void;
    showRightIcon?: boolean;
    rightIcon?: string;
    onRightIconPress?: () => void;
};

export default function AppHeader({
    title,
    showBackButton = false,
    onBackPress,
    showRightIcon = false,
    rightIcon = 'dots-vertical',
    onRightIconPress,
}: AppHeaderProps) {
    const theme = useTheme();

    return (
        <Surface
            elevation={2}
            style={{
                backgroundColor: theme.colors.primary,
                paddingTop: 60,
                paddingBottom: 8,
                paddingHorizontal: 16,
                zIndex: 10
            }}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    {showBackButton && (
                        <IconButton
                            icon="arrow-left"
                            iconColor={theme.colors.onPrimary}
                            size={24}
                            onPress={onBackPress}
                            style={{ marginLeft: -12 }}
                        />
                    )}
                    <Text variant="headlineSmall" style={{ color: theme.colors.onPrimary, fontWeight: 'bold' }}>
                        {title}
                    </Text>
                </View>

                {showRightIcon && (
                    <IconButton
                        icon={rightIcon}
                        iconColor={theme.colors.onPrimary}
                        size={24}
                        onPress={onRightIconPress}
                    />
                )}
            </View>
        </Surface>
    );
}
