import { StyleSheet, Text, View } from "react-native";

export default function Index() {
  const name = "Diaz Mark Angelo"
  return (
    <View style={styles.container}>
      <Text>Hello World {name} to React Native Expo!</Text>
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
