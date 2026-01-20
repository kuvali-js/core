// @/components/checks/ConnectionCheck.tsx

import React from "react";
import { StyleSheet, Text, View } from "react-native";

// --- core
import { useConnection } from "@kuvali-js/core";

export default function ConnectionCheck() {
  const { isConnected, isReachable, connectionType } = useConnection();

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Connectivity Status</Text>
      
      <View style={styles.row}>
        <View style={[styles.indicator, { backgroundColor: isConnected ? "#28a745" : "#dc3545" }]} />
        <Text style={styles.text}>
          {isConnected ? `Connected via ${connectionType}` : "Offline"}
        </Text>
      </View>

      <View style={styles.row}>
        <View style={[styles.indicator, { backgroundColor: isReachable ? "#28a745" : "#dc3545" }]} />
        <Text style={styles.text}>
          {isReachable ? "Internet OK" : "No Internet Access"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    width: "100%",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  label: { fontSize: 14, fontWeight: "bold", color: "#666", marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  indicator: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  text: { fontSize: 15, color: "#333" },
});


//### END #################################################