import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { detailStyles } from '@/components/property/detailStyles';
import { DUMMY_CUSTOMERS } from '@/constants/dummyData';
import { openRegisterPanel } from '@/utils/registerEvents';

// 날짜 포맷 유틸 (ISO 문자열 → YYYY-MM-DD)
const formatDateShort = (v?: string): string => {
  if (!v) return '';
  const d = new Date(v);
  if (isNaN(d.getTime())) return v.slice(0, 10);
  return d.toISOString().slice(0, 10);
};

// TODO-STYLE: _layout.tsx와 중복 — 나중에 constants/theme.ts로 통합 예정
// 플랫폼별 그림자 유틸
const makeShadow = (h: number, r: number, o: number, elev: number) =>
  Platform.OS === 'web'
    ? ({ boxShadow: `0 ${h}px ${r * 2}px rgba(0,0,0,${o})` } as object)
    : { shadowColor: '#000' as const, shadowOffset: { width: 0, height: h }, shadowOpacity: o, shadowRadius: r, elevation: elev };

const 아바타배경색배열: string[] = [
  '#5B8DEF', '#52B788', '#9B72CF', '#F4845F',
  '#F06595', '#4DABF7', '#63C9A8', '#FFB347',
];

const getInitialChar = (name: string): string => {
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed[0] : '?';
};

const getAvatarBg = (name: string): string => {
  const code = getInitialChar(name).charCodeAt(0);
  return 아바타배경색배열[code % 아바타배경색배열.length];
};

export default function CustomerDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();

  const 고객 = DUMMY_CUSTOMERS.find((c) => c.id === id);

  if (!고객) {
    return (
      <View style={styles.errorWrap}>
        <Text style={styles.errorTxt}>고객 정보를 찾을 수 없어요.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>← 돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const 아바타색 = getAvatarBg(고객.name);
  const 첫글자  = getInitialChar(고객.name);
  const 등록일  = formatDateShort(고객.createdAt);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#111827" />
      </TouchableOpacity>

      <View style={styles.profileRow}>
        <View style={[styles.avatar, { backgroundColor: 아바타색 }]}>
          <Text style={styles.avatarTxt}>{첫글자}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{고객.name}</Text>
          <Text style={styles.phone}>{고객.phone}</Text>
          <Text style={styles.date}>등록일 {등록일}</Text>
        </View>
        <TouchableOpacity
          style={[detailStyles.headerBtn, { alignSelf: 'flex-end', marginBottom: 4 }]}
          activeOpacity={0.6}
          onPress={() => openRegisterPanel('customer', 고객.id, 고객 as Record<string, unknown>)}>
          <Text style={detailStyles.headerBtnText}>편집</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.memoBox}>
        <Text style={styles.memoLabel}>메모</Text>
        <Text style={styles.memoTxt}>{고객.memo || '메모 없음'}</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page:        { flex: 1, backgroundColor: '#F0F4FF' },
  content:     { padding: 32, gap: 20, maxWidth: 1200, width: '100%', alignSelf: 'center' },
  errorWrap:   { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  errorTxt:    { fontSize: 16, color: '#888' },
  backLink:    { fontSize: 14, color: '#FF6B35' },
  backBtn:     { paddingVertical: 8 },
  profileRow:  { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar:      { width: 64, height: 64, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  avatarTxt:   { color: '#fff', fontSize: 24, fontWeight: '800' },
  profileInfo: { flex: 1, gap: 4 },
  name:        { fontSize: 22, fontWeight: '800', color: '#111827' },
  phone:       { fontSize: 16, fontWeight: '600', color: '#64748B' },
  date:        { fontSize: 12, color: '#aaa' },
  memoBox:     { backgroundColor: '#F8FAFF', borderRadius: 12, padding: 16, gap: 8, minHeight: 200, ...makeShadow(2, 8, 0.06, 2) },
  memoLabel:   { fontSize: 13, fontWeight: '700', color: '#888' },
  memoTxt:     { fontSize: 15, color: '#222', lineHeight: 24 },
});