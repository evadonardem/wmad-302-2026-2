import { StyleSheet, Text, View } from "react-native";

export default function Index() {
  const name = "Balinggan Arjhey"
  return (
    <View style={styles.container}>
      <Text>Welcom {name} To React Native Expo!</Text>
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
