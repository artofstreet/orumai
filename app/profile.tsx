import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

// TODO-AUTH: 로그인 후 실제 중개사 정보로 교체 예정
const STORAGE_KEY = 'orumai_agent_profile'; // 로컬 저장 키

export type AgentProfile = {
  officeName: string;  // 상호
  agentName: string;   // 중개사 이름
  position: string;    // 직급
  phone: string;       // 전화번호
  plan: string;        // 요금제
  memo: string;        // 메모
};

export const defaultProfile: AgentProfile = {
  officeName: '',
  agentName: '',
  position: '',
  phone: '',
  plan: '',
  memo: '',
};

export const loadAgentProfile = (): AgentProfile => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultProfile, ...JSON.parse(raw) } : defaultProfile;
  } catch {
    return defaultProfile;
  }
};

export const saveAgentProfile = (profile: AgentProfile): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {}
};

type ScreenProps = {
  embedded?: boolean; // true면 슬라이드 패널 모드
};

export default function ProfileScreen({ embedded = false }: ScreenProps) {
  const router = useRouter();
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

  // 웹 메모 textarea 스타일
  const webMemoStyle = {
    ...StyleSheet.flatten(styles.input),
    minHeight: 80,
    overflow: 'hidden' as const,
    resize: 'none' as const,
    width: '100%' as const,
    boxSizing: 'border-box' as const,
  };

  return (
    <ScrollView
      style={[styles.page, embedded && { flex: 1, width: '100%' }]}
      contentContainerStyle={[styles.content, embedded && { maxWidth: undefined }]}>

      {/* 헤더 */}
      <View style={styles.header}>
        {!embedded && (
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backTxt}>←</Text>
          </Pressable>
        )}
        <Text style={styles.title}>내 정보</Text>
        <Pressable style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>{saved ? '저장됐어요! ✅' : '완료'}</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        {/* 상호 */}
        <Text style={styles.label}>상호</Text>
        <TextInput
          style={styles.input}
          value={profile.officeName}
          onChangeText={(v) => setProfile((p) => ({ ...p, officeName: v }))}
          placeholder="예: 오름부동산"
          placeholderTextColor="#94A3B8"
        />

        {/* 중개사 이름 */}
        <Text style={styles.label}>중개사 이름</Text>
        <TextInput
          style={styles.input}
          value={profile.agentName}
          onChangeText={(v) => setProfile((p) => ({ ...p, agentName: v }))}
          placeholder="예: 홍길동"
          placeholderTextColor="#94A3B8"
        />

        {/* 직급 */}
        <Text style={styles.label}>직급</Text>
        <TextInput
          style={styles.input}
          value={profile.position}
          onChangeText={(v) => setProfile((p) => ({ ...p, position: v }))}
          placeholder="예: 공인중개사"
          placeholderTextColor="#94A3B8"
        />

        {/* 전화번호 */}
        <Text style={styles.label}>전화번호</Text>
        <TextInput
          style={styles.input}
          value={profile.phone}
          onChangeText={handlePhoneChange}
          placeholder="예: 010-1234-5678"
          placeholderTextColor="#94A3B8"
          keyboardType="phone-pad"
        />

        {/* 요금제 */}
        <Text style={styles.label}>나의 요금제</Text>
        <TextInput
          style={styles.input}
          value={profile.plan}
          onChangeText={(v) => setProfile((p) => ({ ...p, plan: v }))}
          placeholder="예: 스탠다드"
          placeholderTextColor="#94A3B8"
        />

        {/* 메모 */}
        <Text style={styles.label}>메모</Text>
        {Platform.OS === 'web' ? (
          <textarea
            value={profile.memo}
            placeholder="메모를 입력하세요"
            onChange={(e) => {
              const el = e.target as HTMLTextAreaElement;
              el.style.height = 'auto';
              el.style.height = `${el.scrollHeight}px`;
              setProfile((p) => ({ ...p, memo: el.value }));
            }}
            style={webMemoStyle}
          />
        ) : (
          <TextInput
            style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
            value={profile.memo}
            onChangeText={(v) => setProfile((p) => ({ ...p, memo: v }))}
            multiline
            placeholder="메모를 입력하세요"
            placeholderTextColor="#94A3B8"
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 24, maxWidth: 480, alignSelf: 'center', width: '100%', gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  backBtn: { padding: 4 },
  backTxt: { fontSize: 20, color: '#0F172A' },
  title: { fontSize: 20, fontWeight: '800', color: '#0F172A', flex: 1, marginLeft: 8 },
  saveBtn: { backgroundColor: '#1D4ED8', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 7 },
  saveBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, gap: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  label: { fontSize: 12, color: '#64748B', fontWeight: '600', marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 10, fontSize: 15, color: '#0F172A', backgroundColor: '#F8FAFC' },
});