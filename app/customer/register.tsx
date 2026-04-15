/**
 * 고객 등록/편집 화면
 * TODO-DB: 저장 시 Supabase `customers` insert / update
 * TODO-AUTH: 작성자 user_id 바인딩
 */
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Keyboard, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { detailStyles } from '@/components/property/detailStyles';
import { formatPhoneHyphen } from '@/components/property/registerMocks';
import { registerStyles as styles } from '@/components/property/registerStyles';
import { clearEditData, closeRegisterPanel } from '@/utils/registerEvents';

type ScreenProps = {
  embedded?: boolean;
  initialData?: Record<string, unknown> | null;
};

// 숫자/문자 모두 안전하게 string 변환 (서버 연동 시 number 타입 대비)
const str = (v: unknown): string => { if (v === null || v === undefined) return ''; return String(v); };

export default function CustomerRegisterScreen({ embedded = false, initialData }: ScreenProps) {
  const router = useRouter();

  const d = initialData ?? null;
  const isEdit = d !== null;

  const [name, setName] = useState<string>(() => str(d?.name));
  const [phone, setPhone] = useState<string>(() => str(d?.phone));
  const [memo, setMemo] = useState<string>(() => str(d?.memo));

  const onPhoneChange = (t: string) => setPhone(formatPhoneHyphen(t));

  const onSave = () => {
    Keyboard.dismiss();
    clearEditData();
    // TODO-DB: isEdit ? supabase.update() : supabase.insert()
    closeRegisterPanel();
  };

  return (
    <SafeAreaView style={safeAreaStyles.root}>
      <ScrollView
        style={[styles.page, embedded ? { flex: 1, width: '100%' } : { maxWidth: 480, alignSelf: 'center', width: '100%' }]}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
      {!embedded && (
        <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
          <Text style={styles.backTxt}>← 뒤로</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.title}>{isEdit ? '고객 편집' : '고객 등록'}</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
        <TouchableOpacity
          style={[detailStyles.headerBtn, { paddingHorizontal: 20, paddingVertical: 8 }]}
          activeOpacity={0.6}
          onPress={onSave}>
          <Text style={[detailStyles.headerBtnText, { fontSize: 15 }]}>저장</Text>
        </TouchableOpacity>
      </View>

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
            onInput={(e) => {
              const el = e.target as HTMLTextAreaElement;
              el.style.height = 'auto';
              el.style.height = el.scrollHeight + 'px';
            }}
            placeholder="고객 메모 (녹음 내용이 여기에 입력됩니다)"
            rows={3}
            maxLength={300}
            style={{
              width: '100%',
              border: '1px solid #D8DCE6',
              borderRadius: 8,
              padding: '10px 12px',
              fontSize: 15,
              color: '#18202E',
              backgroundColor: '#FFFFFF',
              resize: 'none',
              overflow: 'hidden',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              minHeight: 80,
              lineHeight: '1.5',
            } as object}
          />
        ) : (
          <TextInput
            style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
            value={memo}
            onChangeText={setMemo}
            placeholder="고객 메모 (녹음 내용이 여기에 입력됩니다)"
            placeholderTextColor="#9AA5B4"
            multiline
          />
        )}
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// 루트 SafeArea: 인셋 영역까지 스크롤 배경(#F0F4FF)과 톤 맞춤
const safeAreaStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F0F4FF' },
});