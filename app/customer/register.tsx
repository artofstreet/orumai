/**
 * 고객 등록 화면
 * TODO-DB: 저장 시 Supabase `customers` insert
 * TODO-AUTH: 작성자 user_id 바인딩
 */
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { formatPhoneHyphen } from '../property/registerMocks';
import { registerStyles as styles } from '../property/registerStyles';

type ScreenProps = {
  embedded?: boolean; // true면 뒤로가기 숨김(슬라이드 패널용)
};

/** 고객 등록 화면 */
export default function CustomerRegisterScreen({ embedded = false }: ScreenProps) {
  const router = useRouter();

  const [name, setName] = useState<string>(''); // 고객 이름
  const [phone, setPhone] = useState<string>(''); // 전화번호(하이픈 자동)
  const [memo, setMemo] = useState<string>(''); // 메모(녹음 내용 포함)

  /** 전화 입력 시 하이픈 자동 */
  const onPhoneChange = (t: string) => {
    setPhone(formatPhoneHyphen(t));
  };

  /** 저장 (DB 미연동) */
  const onSave = () => {
    // TODO-DB: supabase.from('customers').insert({ name, phone, memo })
  };

  return (
    <ScrollView
      style={[
        styles.page,
        embedded ? { flex: 1, width: '100%' } : { maxWidth: 480, alignSelf: 'center', width: '100%' },
      ]}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled">
      {!embedded && (
        <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
          <Text style={styles.backTxt}>← 뒤로</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.title}>고객 등록</Text>

      {/* 이름 */}
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

      {/* 전화번호 */}
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

      {/* 메모 — 웹: textarea 자동 확장 / 앱: TextInput 멀티라인 */}
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

      <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
        <Text style={styles.saveBtnTxt}>저장</Text>
      </TouchableOpacity>
      <Text style={styles.hint}>TODO-DB: 저장 시 서버 스키마에 맞게 필드 매핑</Text>
    </ScrollView>
  );
}