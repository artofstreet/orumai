/**
 * 보증금·면적·집주인·메모 입력 블록
 */
import { useState } from 'react';
import { Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { registerStyles as styles } from './registerStyles';
import type { DealKind, RelationKind } from './registerTypes';

type Props = {
  deal: DealKind; // 거래 종류(매매/전세/월세에 따라 가격 입력란 분기)
  salePrice: string; // 매매가
  setSalePrice: (v: string) => void;
  jeonsePrice: string; // 전세금
  setJeonsePrice: (v: string) => void;
  deposit: string; // 보증금(월세)
  setDeposit: (v: string) => void;
  monthly: string; // 월세
  setMonthly: (v: string) => void;
  areaSqm: string;
  setAreaSqm: (v: string) => void;
  floor: string;
  setFloor: (v: string) => void;
  totalFloors: string;
  setTotalFloors: (v: string) => void;
  direction: string;
  setDirection: (v: string) => void;
  moveInDate: string;
  setMoveInDate: (v: string) => void;
  ownerName: string;
  setOwnerName: (v: string) => void;
  relation: RelationKind | undefined; // 미선택 시 undefined
  setRelation: (v: RelationKind) => void;
  ownerPhone: string;
  onPhoneChange: (v: string) => void;
  ownerMemo: string; // 집주인 섹션 메모
  setOwnerMemo: (v: string) => void;
  memo: string;
  setMemo: (v: string) => void;
};

/** 숫자만 추출 후 최대 길이 자르기 */
function digitsOnly(raw: string, maxLen: number): string {
  return raw.replace(/\D/g, '').slice(0, maxLen);
}

/** 면적: 숫자만 입력 → 표시 84㎡ */
export function formatAreaSqmInput(raw: string): string {
  const d = digitsOnly(raw, 6);
  return d ? `${d}㎡` : '';
}

/** 층수: 숫자만 입력 → 표시 25층 */
export function formatFloorInput(raw: string): string {
  const d = digitsOnly(raw, 4);
  return d ? `${d}층` : '';
}

/** 입주일: 숫자만(최대 8자리) → 하이픈 자동(YYYY-MM-DD) */
export function formatMoveInDateInput(raw: string): string {
  const d = digitsOnly(raw, 8);
  if (d.length <= 4) return d;
  if (d.length <= 6) return `${d.slice(0, 4)}-${d.slice(4)}`;
  return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
}

const RELATION_OPTIONS: RelationKind[] = ['집주인', '대리인']; // 모달 관계 선택지

const MEMO_LINE_HEIGHT = 24;
const MEMO_BASE_HEIGHT = 80;

/** 줄바꿈(\\n) 개수 기준 멀티라인 메모 높이(네이티브) */
function memoHeightFromNewlines(text: string): number {
  const newlines = (text.match(/\n/g) || []).length;
  return Math.max(MEMO_BASE_HEIGHT, MEMO_BASE_HEIGHT + newlines * MEMO_LINE_HEIGHT);
}

const webMemoTextareaStyle = {
  ...StyleSheet.flatten(styles.input),
  minHeight: 80,
  overflow: 'hidden' as const,
  resize: 'none' as const,
  width: '100%' as const,
  boxSizing: 'border-box' as const,
};

type MemoFieldProps = {
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  scrollEnabled?: boolean;
};

/** 멀티라인 메모: 웹은 textarea + scrollHeight, 네이티브는 TextInput */
function RegisterMemoField({ value, onChangeText, placeholder, scrollEnabled }: MemoFieldProps) {
  if (Platform.OS === 'web') {
    return (
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          const el = e.target as HTMLTextAreaElement;
          el.style.height = 'auto';
          el.style.height = `${el.scrollHeight}px`;
          onChangeText(el.value);
        }}
        style={webMemoTextareaStyle}
      />
    );
  }

  return (
    <TextInput
      style={[
        styles.input,
        {
          height: memoHeightFromNewlines(value),
          minHeight: MEMO_BASE_HEIGHT,
          textAlignVertical: 'top',
        },
      ]}
      value={value}
      onChangeText={onChangeText}
      multiline
      scrollEnabled={scrollEnabled}
      placeholder={placeholder}
      placeholderTextColor="#9AA5B4"
    />
  );
}

/** 가격·상세·집주인·메모 섹션 */
export function RegisterMoreFields(p: Props) {
  const [relationModalOpen, setRelationModalOpen] = useState<boolean>(false); // 관계 선택 모달

  return (
    <>
      <View style={styles.section}>
        {p.deal === '매매' && (
          <>
            <Text style={styles.sectionLabel}>매매가</Text>
            <TextInput
              style={styles.input}
              value={p.salePrice}
              onChangeText={p.setSalePrice}
              keyboardType="numeric"
              placeholder="매매가"
              placeholderTextColor="#9AA5B4"
            />
          </>
        )}
        {p.deal === '전세' && (
          <>
            <Text style={styles.sectionLabel}>전세금</Text>
            <TextInput
              style={styles.input}
              value={p.jeonsePrice}
              onChangeText={p.setJeonsePrice}
              keyboardType="numeric"
              placeholder="전세금"
              placeholderTextColor="#9AA5B4"
            />
          </>
        )}
        {p.deal === '월세' && (
          <>
            <Text style={styles.sectionLabel}>보증금 / 월세</Text>
            <TextInput style={styles.input} value={p.deposit} onChangeText={p.setDeposit} keyboardType="numeric" placeholder="보증금" placeholderTextColor="#9AA5B4" />
            <TextInput style={styles.input} value={p.monthly} onChangeText={p.setMonthly} keyboardType="numeric" placeholder="월세" placeholderTextColor="#9AA5B4" />
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>면적·층·방향·입주</Text>
        <TextInput
          style={styles.input}
          value={p.areaSqm}
          onChangeText={(t) => p.setAreaSqm(formatAreaSqmInput(t))}
          keyboardType="number-pad"
          placeholder="면적(㎡)"
          placeholderTextColor="#9AA5B4"
        />
        <TextInput
          style={styles.input}
          value={p.floor}
          onChangeText={(t) => p.setFloor(formatFloorInput(t))}
          keyboardType="number-pad"
          placeholder="해당 층"
          placeholderTextColor="#9AA5B4"
        />
        <TextInput
          style={styles.input}
          value={p.totalFloors}
          onChangeText={(t) => p.setTotalFloors(formatFloorInput(t))}
          keyboardType="number-pad"
          placeholder="총 층수"
          placeholderTextColor="#9AA5B4"
        />
        <TextInput style={styles.input} value={p.direction} onChangeText={p.setDirection} placeholder="방향 (예: 남향)" placeholderTextColor="#9AA5B4" />
        <TextInput
          style={styles.input}
          value={p.moveInDate}
          onChangeText={(t) => p.setMoveInDate(formatMoveInDateInput(t))}
          keyboardType="number-pad"
          placeholder="입주일 예: 2026-05-01"
          placeholderTextColor="#9AA5B4"
        />
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.relationPickerBtn} onPress={() => setRelationModalOpen(true)} activeOpacity={0.85}>
          <Text style={styles.relationPickerBtnTxt}>
            {p.relation === undefined ? '관계 선택' : p.relation}
          </Text>
        </TouchableOpacity>
        <TextInput style={styles.input} value={p.ownerName} onChangeText={p.setOwnerName} placeholder="이름" placeholderTextColor="#9AA5B4" />
        <Modal visible={relationModalOpen} transparent animationType="fade" onRequestClose={() => setRelationModalOpen(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => setRelationModalOpen(false)}
              accessibilityRole="button"
            />
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>관계 선택</Text>
              {RELATION_OPTIONS.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={styles.modalOptionRow}
                  onPress={() => {
                    p.setRelation(r);
                    setRelationModalOpen(false);
                  }}
                  activeOpacity={0.85}>
                  <Text style={styles.modalOptionTxt}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>
        <TextInput style={styles.input} value={p.ownerPhone} onChangeText={p.onPhoneChange} keyboardType="phone-pad" placeholder="전화번호" placeholderTextColor="#9AA5B4" />
        <RegisterMemoField value={p.ownerMemo} onChangeText={p.setOwnerMemo} placeholder="메모" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>메모</Text>
        <RegisterMemoField value={p.memo} onChangeText={p.setMemo} placeholder="메모" scrollEnabled={false} />
      </View>
    </>
  );
}
