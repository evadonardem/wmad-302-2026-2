import { StyleSheet, Text, View } from "react-native";

export default function Index() {
  const name = "Bangon Norlyn";
  return (
    <View style={styles.container}>
      <Text>Welcome {name} to React Native Expo!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});