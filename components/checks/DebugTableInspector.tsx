import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { Dropdown } from 'react-native-element-dropdown';
import { database } from "../../core/databases/watermelon/DatabaseService";
import { debugTableToConsole } from "@/lib/debugTableToConsole";

export function DebugTableInspector() {
  // Get table names dynamically from the database schema
  const tableNames = Object.keys(database.schema.tables);
  const dropdownData = tableNames.map(name => ({ label: name, value: name }));

  const [selectedTable, setSelectedTable] = useState<string>(tableNames[0] || "");
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);

  const refreshData = async () => {
    if (!selectedTable) return;

    try {
      const records = await database.get(selectedTable).query().fetch();
      const plainData = records.map(r => r._raw);
      setData(plainData);

      if (plainData.length > 0) {
        setColumns(Object.keys(plainData[0]));
      } else {
        setColumns([]);
      }

      debugTableToConsole(selectedTable);
    } catch (error) {
      console.error("Failed to fetch table data", error);
    }
  };

  useEffect(() => {
    refreshData();
  }, [selectedTable]);

  const renderTableContent = () => {
    if (data.length === 0) {
      return <Text style={styles.emptyText}>No data in {selectedTable}</Text>;
    }

    return (
      <ScrollView horizontal style={styles.tableScroll}>
        <View>
          {/* Header */}
          <View style={styles.tableRow}>
            {columns.map(col => (
              <View key={`h-${col}`} style={[styles.cell, styles.headerCell]}>
                <Text style={styles.headerText}>{col}</Text>
              </View>
            ))}
          </View>

          {/* Body */}
          <ScrollView style={styles.verticalScroll}>
            {data.map((row, index) => (
              <View key={row.id || `r-${index}`} style={styles.tableRow}>
                {columns.map(col => (
                  <View key={`c-${index}-${col}`} style={styles.cell}>
                    <Text style={styles.cellText} numberOfLines={1}>
                      {String(row[col] ?? '')}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WatermelonDB Inspector</Text>

      <Dropdown
        style={styles.dropdown}
        data={dropdownData}
        labelField="label"
        valueField="value"
        value={selectedTable}
        placeholderStyle={styles.dropDownText}
        selectedTextStyle={styles.dropDownText}
        onChange={item => setSelectedTable(item.value)}
      />

      <TouchableOpacity style={styles.refreshButton} onPress={refreshData}>
        <Text style={styles.refreshButtonText}>Reload & Log to Console</Text>
      </TouchableOpacity>

      {renderTableContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    margin: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  dropdown: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  refreshButton: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 15,
  },
  refreshButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  tableScroll: {
    borderWidth: 1,
    borderColor: "#eee",
  },
  verticalScroll: {
    maxHeight: 400,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  cell: {
    width: 100,
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: "#eee",
  },
  headerCell: {
    backgroundColor: "#f8f8f8",
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 13,
  },
  dropDownText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  cellText: {
    fontSize: 13,
    color: "#333",
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    marginTop: 10,
    fontSize: 13,
  }
});