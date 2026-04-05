import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { DUMMY_CUSTOMERS } from '@/constants/dummyData';

// TODO-DB: DUMMY_CUSTOMERS를 supabase.from('customers')로 교체

// 아바타 배경색 배열 (CustomerCard와 동일)
const 아바타배경색배열 = [
  '#5B8DEF', '#52B788', '#9B72CF', '#F4845F',
  '#F06595', '#4DABF7', '#63C9A8', '#FFB347',
];

// 이름 첫 글자 추출
const getInitialChar = (name) => {
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed[0] : '?';
};

// charCode 기반 색상 선택
const getAvatarBg = (name) => {
  const code = getInitialChar(name).charCodeAt(0);
  return 아바타배경색배열[code % 아바타배경색배열.length];
};

export default function CustomerDetailScreen() {
  const params = useLocalSearchParams();
  const rawId = params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const router = useRouter();

  // TODO-DB: supabase.from('customers').select().eq('id', id)로 교체
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
  const 첫글자 = getInitialChar(고객.name);
  const 등록일 = 고객.createdAt?.slice(0, 10) ?? '';

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>

      {/* 뒤로가기 */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backTxt}>← 뒤로</Text>
      </TouchableOpacity>

      {/* 아바타 + 이름 + 전번 */}
      <View style={styles.profileRow}>
        <View style={[styles.avatar, { backgroundColor: 아바타색 }]}>
          <Text style={styles.avatarTxt}>{첫글자}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{고객.name}</Text>
          <Text style={styles.phone}>{고객.phone}</Text>
          <Text style={styles.date}>등록일 {등록일}</Text>
        </View>
      </View>

      {/* 메모 */}
      <View style={styles.memoBox}>
        <Text style={styles.memoLabel}>메모</Text>
        <Text style={styles.memoTxt}>{고객.memo || '메모 없음'}</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 32, gap: 20, maxWidth: 1200, width: '100%', alignSelf: 'center' },
  errorWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  errorTxt: { fontSize: 16, color: '#888' },
  backLink: { fontSize: 14, color: '#FF6B35' },
  backBtn: { paddingVertical: 8 },
  backTxt: { fontSize: 15, color: '#FF6B35', fontWeight: '600' },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: { width: 64, height: 64, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { color: '#fff', fontSize: 24, fontWeight: '800' },
  profileInfo: { flex: 1, gap: 4 },
  name: { fontSize: 22, fontWeight: '800', color: '#111827' },
  phone: { fontSize: 15, fontWeight: '600', color: '#555' },
  date: { fontSize: 12, color: '#aaa' },
  memoBox: { backgroundColor: '#f8f8f8', borderRadius: 12, padding: 16, gap: 8, minHeight: 200 },
  memoLabel: { fontSize: 13, fontWeight: '700', color: '#888' },
  memoTxt: { fontSize: 15, color: '#222', lineHeight: 24 },
});
