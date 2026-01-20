import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import ConnectionCheck from "@/components/checks/ConnectionCheck";
import LogLevelCheck from "@/components/checks/LogLevelCheck";
import { DebugTableInspector } from "@/components/checks/DebugTableInspector";

export default function DebugScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      nestedScrollEnabled={true}
    >
      <Text style={styles.title}>Developer Debug Menu</Text>

      <View style={styles.section}>
        <ConnectionCheck />
        <LogLevelCheck />
      </View>

      {/* Die neue Komponente ersetzt die alte Map-Schleife der Buttons */}
      <DebugTableInspector />

      {!__DEV__ && (
        <Text style={styles.warning}>
          Warning: This menu should be hidden in production.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40, // Genug Platz am Ende
  },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  section: {
    gap: 10,
    alignItems: "flex-start",
  },
  leftButton: {
    paddingVertical: 10,
    paddingRight: 20,
    alignSelf: "flex-start",
  },
  buttonText: { fontSize: 16, fontWeight: "500" },
  divider: {
    height: 1,
    backgroundColor: "#ccc",
    width: "100%",
    marginVertical: 10,
  },
  status: {
    marginTop: 30,
    color: "#333",
    padding: 10,
    backgroundColor: "#eee",
    borderRadius: 4,
  },
  warning: { marginTop: 20, color: "red", fontWeight: "bold" },
});
