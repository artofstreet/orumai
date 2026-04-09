import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const STORAGE_KEY = 'orumai_agent_profile';

export type AgentProfile = {
  officeName: string;
  agentName: string;
  position: string;
  phone: string;
  plan: string;
  memo: string;
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
  embedded?: boolean;
};

export default function ProfileScreen({ embedded = false }: ScreenProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<AgentProfile>(defaultProfile);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  useEffect(() => {
    setProfile(loadAgentProfile());
  }, []);

  const handleSave = () => {
    saveAgentProfile(profile);
    setSaved(true);
    setIsEdit(false);
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

  const firstChar = (profile.agentName || '?').trim()[0];

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
      contentContainerStyle={styles.content}>

      <View style={styles.header}>
        {!embedded && (
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backTxt}>←</Text>
          </Pressable>
        )}
        <Text style={styles.title}>마이</Text>
        {isEdit ? (
          <Pressable style={styles.doneBtn} onPress={handleSave}>
            <Text style={styles.doneBtnTxt}>{saved ? '저장됐어요 ✅' : '완료'}</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.editBtn} onPress={() => setIsEdit(true)}>
            <Text style={styles.editBtnTxt}>편집</Text>
          </Pressable>
        )}
      </View>

      {!isEdit && (
        <>
          <LinearGradient
            colors={['#6B7280', '#D1D5DB', '#9CA3AF', '#E5E7EB', '#6B7280']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.idCard}>
            <View style={styles.profileRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarTxt}>{firstChar}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.nameText}>
                  {profile.agentName || '이름 없음'}
                  {profile.position ? <Text style={{ fontSize: 14, fontWeight: '400', color: '#555555' }}>  {profile.position}</Text> : null}
                </Text>
                <Text style={styles.subText}>{profile.officeName}</Text>
                <Text style={styles.subText}>{profile.phone}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.planRow}>
              <Text style={styles.planLabel}>요금제</Text>
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeTxt}>{profile.plan || 'FREE'}</Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.memoBox}>
            <Text style={styles.memoLabel}>메모</Text>
            <Text style={styles.memoTxt}>{profile.memo || '메모 없음'}</Text>
          </View>
        </>
      )}

      {isEdit && (
        <View style={styles.card}>
          <Text style={styles.label}>상호</Text>
          <TextInput style={styles.input} value={profile.officeName} onChangeText={(v) => setProfile((p) => ({ ...p, officeName: v }))} placeholder="예: 오름부동산" placeholderTextColor="#94A3B8" />

          <Text style={styles.label}>중개사 이름</Text>
          <TextInput style={styles.input} value={profile.agentName} onChangeText={(v) => setProfile((p) => ({ ...p, agentName: v }))} placeholder="예: 홍길동" placeholderTextColor="#94A3B8" />

          <Text style={styles.label}>직급</Text>
          <TextInput style={styles.input} value={profile.position} onChangeText={(v) => setProfile((p) => ({ ...p, position: v }))} placeholder="예: 공인중개사" placeholderTextColor="#94A3B8" />

          <Text style={styles.label}>전화번호</Text>
          <TextInput style={styles.input} value={profile.phone} onChangeText={handlePhoneChange} placeholder="예: 010-1234-5678" placeholderTextColor="#94A3B8" keyboardType="phone-pad" />

          <Text style={styles.label}>나의 요금제</Text>
          <TextInput style={styles.input} value={profile.plan} onChangeText={(v) => setProfile((p) => ({ ...p, plan: v }))} placeholder="예: PRO" placeholderTextColor="#94A3B8" />

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
              scrollEnabled={false}
              placeholder="메모를 입력하세요"
              placeholderTextColor="#94A3B8"
            />
          )}
        </View>
      )}
    </ScrollView>
  );
}

const SILVER = '#9CA3AF';

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F0F4FF' },
  content: { padding: 24, gap: 16, maxWidth: 480, alignSelf: 'center', width: '100%' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  backBtn: { padding: 4 },
  backTxt: { fontSize: 20, color: '#0F172A' },
  title: { fontSize: 20, fontWeight: '800', color: '#0F172A', flex: 1, marginLeft: 4 },
  editBtn: { borderWidth: 1, borderColor: '#D8DCE6', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6 },
  editBtnTxt: { fontSize: 14, color: '#1E293B', fontWeight: '600' },
  doneBtn: { backgroundColor: SILVER, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 7 },
  doneBtnTxt: { color: '#fff', fontWeight: '800', fontSize: 14 },
  idCard: { borderRadius: 16, padding: 28, gap: 20, borderWidth: 1.5, borderColor: '#E5E7EB' },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  avatar: { width: 72, height: 72, borderRadius: 999, borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.3)' },
  avatarTxt: { color: '#fff', fontSize: 28, fontWeight: '800' },
  profileInfo: { flex: 1, gap: 5 },
  nameText: { fontSize: 22, fontWeight: '800', color: '#1A1A1A' },
  subText: { fontSize: 15, color: '#444444' },
  divider: { borderTopWidth: 0.5, borderTopColor: 'rgba(0,0,0,0.15)' },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  planLabel: { fontSize: 14, color: '#444444' },
  planBadge: { backgroundColor: '#FFC107', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4 },
  planBadgeTxt: { fontSize: 13, fontWeight: '700', color: '#7B4F00' },
  memoBox: { backgroundColor: '#F8FAFF', borderRadius: 12, borderLeftWidth: 4, borderLeftColor: SILVER, padding: 20, gap: 10 },
  memoLabel: { fontSize: 13, fontWeight: '700', color: '#888' },
  memoTxt: { fontSize: 15, color: '#222', lineHeight: 24 },
  card: { backgroundColor: '#F8FAFF', borderRadius: 16, padding: 20, gap: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  label: { fontSize: 12, color: '#64748B', fontWeight: '600', marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 10, fontSize: 15, color: '#0F172A', backgroundColor: '#F8FAFF' },
});