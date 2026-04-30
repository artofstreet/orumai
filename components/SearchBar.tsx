import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef } from 'react';
import type { TextInput as TextInputType, TextStyle } from 'react-native';
import { Platform, StyleSheet, TextInput, View } from 'react-native';

import { card, text, text3 } from '@/constants/colors';

// TODO: 공통 utils/shadow.ts 로 이동 예정 (여러 파일 중복)
// 플랫폼별 그림자 유틸
const makeShadow = (h: number, r: number, o: number, elev: number) =>
  Platform.OS === 'web'
    ? ({ boxShadow: `0 ${h}px ${r * 2}px rgba(0,0,0,${o})` } as object)
    : { shadowColor: '#000' as const, shadowOffset: { width: 0, height: h }, shadowOpacity: o, shadowRadius: r, elevation: elev };

export type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
};

const SearchBar = forwardRef<TextInputType, SearchBarProps>(
  ({ value, onChangeText, onSubmit }, ref) => {
    return (
      <View style={styles.root}>
        <View style={styles.inputShell}>
          <TextInput
            ref={ref}
            accessibilityLabel="검색어 입력"
            value={value}
            onChangeText={onChangeText}
            placeholder="오름검색"
            placeholderTextColor={text3}
            returnKeyType="search"
            onSubmitEditing={onSubmit}
            style={[styles.input, { outlineWidth: 0 } as TextStyle]}
          />
          <Ionicons name="search" size={28} color={'#E8857A'} />
        </View>
      </View>
    );
  }
);

SearchBar.displayName = 'SearchBar';

export default SearchBar;

const styles = StyleSheet.create({
  root: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
  },
  inputShell: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: card,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 25,
    paddingHorizontal: 14,
    paddingVertical: 0,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    color: text,
    padding: 0,
    fontSize: 16,
  },
});