import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

// TODO-AUTH: 로그인 후 실제 중개사 정보로 교체 예정
const STORAGE_KEY = 'orumai_agent_profile'; // 로컬 저장 키

export type AgentProfile = {
  officeName: string;  // 상호
  agentName: string;   // 중개사 이름
  position: string;    // 직급
  phone: string;       // 전화번호
};

export const defaultProfile: AgentProfile = {
  officeName: '',
  agentName: '',
  position: '',
  phone: '',
};

export const loadAgentProfile = (): AgentProfile => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultProfile;
  } catch {
    return defaultProfile;
  }
};

export const saveAgentProfile = (profile: AgentProfile): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {}
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState<AgentProfile>(defaultProfile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProfile(loadAgentProfile());
  }, []);

  const handleSave = () => {
    saveAgentProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePhoneChange = (v: string) => {
    const clean = v.replace(/[^0-9]/g, '');
    let formatted = clean;
    if (clean.length <= 3) formatted = clean;
    else if (clean.length <= 7) formatted = `${clean.slice(0, 3)}-${clean.slice(3)}`;
    else formatted = `${clean.slice(0, 3)}-${clean.slice(3, 7)}-${clean.slice(7, 11)}`;
    setProfile((p) => ({ ...p, phone: formatted }));
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </Pressable>
        <Text style={styles.title}>내 정보</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>상호</Text>
        <TextInput
          style={styles.input}
          value={profile.officeName}
          onChangeText={(v) => setProfile((p) => ({ ...p, officeName: v }))}
          placeholder="예: 오름부동산"
          placeholderTextColor="#94A3B8"
        />

        <Text style={styles.label}>중개사 이름</Text>
        <TextInput
          style={styles.input}
          value={profile.agentName}
          onChangeText={(v) => setProfile((p) => ({ ...p, agentName: v }))}
          placeholder="예: 홍길동"
          placeholderTextColor="#94A3B8"
        />

        <Text style={styles.label}>직급</Text>
        <TextInput
          style={styles.input}
          value={profile.position}
          onChangeText={(v) => setProfile((p) => ({ ...p, position: v }))}
          placeholder="예: 공인중개사"
          placeholderTextColor="#94A3B8"
        />

        <Text style={styles.label}>전화번호</Text>
        <TextInput
          style={styles.input}
          value={profile.phone}
          onChangeText={handlePhoneChange}
          placeholder="예: 010-1234-5678"
          placeholderTextColor="#94A3B8"
          keyboardType="phone-pad"
        />

        <Pressable style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>{saved ? '저장됐어요! ✅' : '저장'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 24, maxWidth: 480, alignSelf: 'center', width: '100%' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  backBtn: { padding: 4 },
  title: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, gap: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  label: { fontSize: 12, color: '#64748B', fontWeight: '600', marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 10, fontSize: 15, color: '#0F172A', backgroundColor: '#F8FAFC' },
  saveBtn: { backgroundColor: '#1D4ED8', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
});