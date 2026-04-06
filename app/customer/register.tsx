/**
 * 고객 등록/편집 화면
 * TODO-DB: 저장 시 Supabase `customers` insert / update
 * TODO-AUTH: 작성자 user_id 바인딩
 */
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { clearEditData } from '@/utils/registerEvents';
import { detailStyles } from '../property/detailStyles';
import { formatPhoneHyphen } from '../property/registerMocks';
import { registerStyles as styles } from '../property/registerStyles';

type ScreenProps = {
  embedded?: boolean; // true면 뒤로가기 숨김
  initialData?: Record<string, unknown> | null; // 편집 시 기존 데이터
};

/** 문자열 안전 추출 헬퍼 */
const str = (v: unknown): string => (typeof v === 'string' ? v : '');

/** 고객 등록/편집 화면 */
export default function CustomerRegisterScreen({ embedded = false, initialData }: ScreenProps) {
  const router = useRouter();

  const d = initialData ?? null; // 편집 데이터
  const isEdit = d !== null; // 편집 모드 여부

  const [name, setName] = useState<string>(() => str(d?.name)); // 고객 이름
  const [phone, setPhone] = useState<string>(() => str(d?.phone)); // 전화번호
  const [memo, setMemo] = useState<string>(() => str(d?.memo)); // 메모

  const onPhoneChange = (t: string) => setPhone(formatPhoneHyphen(t));

  const onSave = () => {
    clearEditData();
    // TODO-DB: isEdit ? supabase.update() : supabase.insert()
  };

  return (
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
          <Text style={[detailStyles.headerBtnText, { fontSize: 15 }]}>완료</Text>
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
      <Text style={styles.hint}>TODO-DB: 저장 시 서버 스키마에 맞게 필드 매핑</Text>
    </ScrollView>
  );
}