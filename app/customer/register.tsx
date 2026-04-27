/**
 * 고객 등록/편집 화면
 * 저장: useCustomers → Supabase `customers` insert / update
 * TODO-AUTH: 작성자 user_id 바인딩
 */
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, type GestureResponderEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { detailStyles } from '@/components/property/detailStyles';
import { formatPhoneHyphen } from '@/components/property/registerMocks';
import { registerStyles as styles } from '@/components/property/registerStyles';
import { useCustomersContext } from '@/contexts/CustomersContext';
import { clearEditData, closeRegisterPanel } from '@/utils/registerEvents';

type ScreenProps = {
  embedded?: boolean;
  initialData?: Record<string, unknown> | null;
};

// 숫자/문자 모두 안전하게 string 변환 (서버 연동 시 number 타입 대비)
const str = (v: unknown): string => { if (v === null || v === undefined) return ''; return String(v); };

export default function CustomerRegisterScreen({ embedded = false, initialData }: ScreenProps) {
  const router = useRouter();
  const { addCustomer, updateCustomer, loading, error } = useCustomersContext();

  const d = initialData ?? null;
  const isEdit = d !== null;

  const [name, setName] = useState<string>(() => str(d?.name));
  const [phone, setPhone] = useState<string>(() => str(d?.phone));
  const [memo, setMemo] = useState<string>(() => str(d?.memo));

  /** 저장 요청 직후 훅의 loading/error로 성공·실패 판별 */
  const pendingSaveRef = useRef(false);

  const onPhoneChange = (t: string) => setPhone(formatPhoneHyphen(t));

  useEffect(() => {
    if (!pendingSaveRef.current || loading) return;
    pendingSaveRef.current = false;
    if (error) {
      Alert.alert('저장 실패', error);
      return;
    }
    clearEditData();
    closeRegisterPanel();
  }, [loading, error]);

  const onSave = async () => {
    Keyboard.dismiss();
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    if (!trimmedName || !trimmedPhone) {
      Alert.alert('', '이름과 전화번호를 입력해주세요');
      return;
    }
    if (isEdit && !str(d?.id)) {
      Alert.alert('', '편집할 고객 정보가 없습니다.');
      return;
    }
    pendingSaveRef.current = true;
    if (isEdit) {
      await updateCustomer(str(d?.id), { name: trimmedName, phone: trimmedPhone, memo });
    } else {
      await addCustomer({ name: trimmedName, phone: trimmedPhone, memo });
    }
  };

  return (
    <SafeAreaView style={safeAreaStyles.root}>
      <View style={safeAreaStyles.headerBar}>
        <Text style={styles.title}>{isEdit ? '고객 편집' : '고객 등록'}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Pressable style={({ pressed }) => [detailStyles.headerBtn, { paddingHorizontal: 20, paddingVertical: 8 }, pressed ? { opacity: 0.6 } : null]} onPressIn={() => {}} onTouchStart={(e: GestureResponderEvent) => e.preventDefault()} onPress={onSave}>
            <Text style={[detailStyles.headerBtnText, { fontSize: 15 }]}>저장</Text>
          </Pressable>
          <TouchableOpacity activeOpacity={0.6} onPress={() => { clearEditData(); closeRegisterPanel(); }}>
            <Text style={{ fontSize: 22, color: '#666', paddingHorizontal: 4 }}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* 모바일: 키보드가 메모 입력란을 가리지 않도록 보정 */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={keyboardStyles.kavRoot}
        // iOS 슬라이드 패널 헤더 높이 보정값
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
        <ScrollView
          style={[styles.page, embedded ? { flex: 1, width: '100%' } : { maxWidth: 480, alignSelf: 'center', width: '100%' }]}
          contentContainerStyle={[styles.scrollContent, keyboardStyles.scrollContentExtra]}
          keyboardShouldPersistTaps="handled">
      {!embedded && (
        <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
          <Text style={styles.backTxt}>← 뒤로</Text>
        </TouchableOpacity>
      )}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>이름</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="고객 이름"
          placeholderTextColor="#9AA5B4"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>전화번호</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={onPhoneChange}
          placeholder="010-0000-0000"
          placeholderTextColor="#9AA5B4"
          keyboardType="phone-pad"
          maxLength={13}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>메모</Text>
        {Platform.OS === 'web' ? (
          <textarea
            value={memo}
            onChange={(e) => setMemo((e.target as HTMLTextAreaElement).value)}
            placeholder="고객 메모 (녹음 내용이 여기에 입력됩니다)"
            rows={3}
            maxLength={300}
            // 웹 textarea는 React Native StyleSheet 타입과 달라서 CSSProperties로 캐스팅
            style={customerRegisterStyles.memoTextarea as unknown as CSSProperties}
          />
        ) : (
          <TextInput
            style={[styles.input, customerRegisterStyles.memoTextInput]}
            value={memo}
            onChangeText={setMemo}
            placeholder="고객 메모 (녹음 내용이 여기에 입력됩니다)"
            placeholderTextColor="#9AA5B4"
            multiline
            scrollEnabled
          />
        )}
      </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// 루트 SafeArea: 인셋 영역까지 스크롤 배경(#F0F4FF)과 톤 맞춤
const safeAreaStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F0F4FF' },
  headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ddd', height: 64 },
});

const keyboardStyles = StyleSheet.create({
  kavRoot: { flex: 1 },
  // 메모박스 아래 여백 확보(키보드에 가려지는 것 방지)
  scrollContentExtra: { paddingBottom: 200 },
});

const customerRegisterStyles = StyleSheet.create({
  // 웹 메모 textarea 스타일
  memoTextarea: {
    width: '100%',
    border: '1px solid #D8DCE6',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 15,
    color: '#18202E',
    backgroundColor: '#FFFFFF',
    resize: 'none',
    overflow: 'auto',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    height: 250,
    lineHeight: '1.5',
  } as unknown as object,

  // 앱(네이티브) 메모 TextInput 스타일
  memoTextInput: {
    height: 250,
    maxHeight: 250,
    textAlignVertical: 'top',
  },
});