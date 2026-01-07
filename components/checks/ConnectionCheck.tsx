import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ConnectivityService } from '../../services/ConnectivityService';

export default function ConnectionCheck() {
  const [status, setStatus] = useState<string>('Checking...');

  useEffect(() => {
    const check = async () => {
      const reachable = await ConnectivityService.isSupabaseReachable();
      setStatus(reachable ? 'Supabase Online ✅' : 'Supabase Offline ❌');
    };
    check();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.statusText}>{status}</Text>
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
  },
  dropdownContainer: {
    width: '100%',
    paddingTop: 15,
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
    height: 50,
    borderColor: '#d1d1d6',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#c7c7cc',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#000',
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});