import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import log, { type LogLevelName } from '../../services/IdentityService';

export default function LogLevelCheck() {
  const [currentLevel, setCurrentLevel] = useState<LogLevelName | ''>('');
  const [isFocus, setIsFocus] = useState(false);
  const [lastLog, setLastLog] = useState<string>('No tests run yet');

  // Format data for the dropdown
  const data = log.LOG_LEVEL_NAMES.map((name) => ({
    label: name,
    value: name,
  }));

  useEffect(() => {
    setCurrentLevel(log.logLevelName());
  }, []);

  const handleLevelChange = (item: { label: string; value: LogLevelName }) => {
    log.setLevel(item.value);
    setCurrentLevel(item.value);
    setIsFocus(false);
  };


  const testLoglevel = () => {
    log.info('Manual Debug Test', { timestamp: Date.now() });
    setLastLog('Info Log sent to Watermelon & Breadcrumbs');
  };

  const testBugsinkError = () => {
    try {
      throw new Error("Triggered Manual Bugsink Error");
    } catch (e: any) {
      log.error(e);
      setLastLog('Error sent to Bugsink');
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.statusText}>Loglevel is {currentLevel}</Text>

      <View style={styles.dropdownContainer}>
        <Text style={styles.subLabel}>Change Log Level:</Text>
        <Dropdown
          style={[styles.dropdown, isFocus && { borderColor: '#007AFF' }]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          data={data}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={!isFocus ? 'Select Level' : '...'}
          value={currentLevel}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={handleLevelChange}
        />
      </View>

      <View style={styles.statusText}>
        <TouchableOpacity style={styles.leftButton} onPress={testLoglevel}>
          <Text style={[styles.buttonText, { color: '#007AFF' }]}>1. Send Info Log</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.leftButton} onPress={testBugsinkError}>
          <Text style={[styles.buttonText, { color: '#ff4444' }]}>2. Trigger Bugsink Error</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.status}>Status: {lastLog}</Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  label: {
    fontSize: 12,
    color: '#8e8e93',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1c1e',
    marginBottom: 20,
  },
  dropdownContainer: {
    width: '100%',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f2f2f7',
  },
  subLabel: {
    fontSize: 14,
    color: '#3a3a3c',
    marginBottom: 8,
    fontWeight: '600',
  },
  dropdown: {
    height: 40,
    borderColor: '#d1d1d6',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  placeholderStyle: {
    fontSize: 14,
    color: '#c7c7cc',
  },
  selectedTextStyle: {
    fontSize: 15,
    color: '#000',
  },
  inputSearchStyle: {
    height: 20,
    fontSize: 14,
  },
    leftButton: {
    paddingVertical: 10,
    paddingRight: 20,
    alignSelf: 'flex-start',
  },
  buttonText: { marginTop: 0, fontSize: 16, fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#ccc', width: '100%', marginVertical: 10 },
  status: { color: '#333', padding: 10, backgroundColor: '#eee', borderRadius: 4 },
  warning: { marginTop: 20, color: 'red', fontWeight: 'bold' }

});