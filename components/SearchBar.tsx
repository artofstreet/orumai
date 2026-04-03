import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import type { TextStyle } from 'react-native';

import { border, card, primary, text, text3 } from '@/constants/colors';

export type SearchBarProps = {
  // 현재 입력값
  value: string;
  // 입력값 변경 핸들러
  onChangeText: (text: string) => void;
  // 검색 실행 핸들러(부모에서 실제 라우팅 처리)
  onSubmit: () => void;
};

export default function SearchBar({ value, onChangeText, onSubmit }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState<boolean>(false); // 포커스 여부(테두리 색상 전환용)

  // 포커스 상태에 따라 테두리 색상을 계산합니다.
  const 테두리색 = useMemo<string>(() => (isFocused ? primary : border), [isFocused]);

  return (
    <View style={styles.root}>
      <View style={[styles.inputShell, { borderColor: 테두리색 }]}>
        {/* 돋보기 아이콘 */}
        <Ionicons name="search" size={18} color={text3} />
        {/* 입력창 */}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="오름검색"
          placeholderTextColor={text3}
          returnKeyType="search"
          onSubmitEditing={onSubmit} // 키보드 검색 실행
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[styles.input, { outlineWidth: 0 } as TextStyle]} // 웹 포커스 outline 제거
        />
      </View>

      {/* 입력창 접근성용 보조 텍스트(필요 시 제거 가능) */}
      <Text style={styles.srOnly} accessibilityElementsHidden>
        검색어 입력
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
  }, // 루트 컨테이너(폭 확장)
  inputShell: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: card,
    borderWidth: 2,
    borderRadius: 25,
    paddingHorizontal: 14,
    paddingVertical: 0,
    // 구글처럼 희미한 그림자 효과 (웹: boxShadow, 네이티브: shadow*)
    ...(Platform.OS === 'web'
      ? ({ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' } as unknown as object)
      : { elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 }),
  }, // 입력 전체 쉘(아이콘+입력+테두리)
  input: {
    flex: 1,
    marginLeft: 10,
    color: text,
    padding: 0,
    fontSize: 16,
  }, // 텍스트 입력 스타일
  srOnly: {
    height: 0,
    width: 0,
    overflow: 'hidden',
    opacity: 0,
  }, // 스크린리더용(보이지 않는 보조 텍스트)
});

