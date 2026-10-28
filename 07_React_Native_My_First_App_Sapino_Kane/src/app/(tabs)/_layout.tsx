import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// TODO 21 [Tab Bar Configuration]: Configure the bottom tab bar inside the empty
// screenOptions object below. At minimum set:
// - tabBarActiveTintColor / tabBarInactiveTintColor (pull colors from useTheme() if you like)
// - headerTitle styling (font weight, colors) to match your theme
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
    import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  // Feel free to replace these hardcoded string colors with values from your useTheme() hook
  const activeColor = '#007AFF';
  const inactiveColor = '#8E8E93';

  return (
    <Tabs
      screenOptions={{
        // TODO 21 [Tab Bar Configuration]
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
        headerTintColor: activeColor, // Optional: matches header text/buttons to your active theme
      }}
    >
      {/* TODO 22 [Tab Screen Registration] */}
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="favorites" 
        options={{ 
          title: 'Favorites',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="settings" 
        options={{ 
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }} 
      />
    </Tabs>
  );
}
    }}>
      {/* TODO 22 [Tab Screen Registration]: The three screens below are already routed by
          file name. For EACH <Tabs.Screen /> add an 'options' entry with:
          - title: a human-readable tab label
          - tabBarIcon: an Ionicons render function receiving { color, size }
            (suggested icons: "home", "heart", "settings") */}
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="favorites" options={{ title: 'Favorites' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
