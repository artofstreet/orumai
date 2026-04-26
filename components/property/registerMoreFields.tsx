/** 보증금·면적·집주인·메모 입력 블록 */
import { useState } from 'react';
import { Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { registerStyles as styles } from './registerStyles';
import { REL_OPTIONS, type DealKind, type RelationKind } from './registerTypes';

type Props = {
  deal: DealKind; // 거래 종류(매매/전세/월세에 따라 가격 입력란 분기)
  salePrice: string; setSalePrice: (v: string) => void;
  jeonsePrice: string; setJeonsePrice: (v: string) => void;
  deposit: string; setDeposit: (v: string) => void;
  monthly: string; setMonthly: (v: string) => void;
  areaSqm: string; setAreaSqm: (v: string) => void;
  floor: string; setFloor: (v: string) => void;
  totalFloors: string; setTotalFloors: (v: string) => void;
  direction: string; setDirection: (v: string) => void;
  moveInDate: string; setMoveInDate: (v: string) => void;
  parking: string; setParking: (v: string) => void;       // 주차
  heating: string; setHeating: (v: string) => void;       // 난방방식
  builtYear: string; setBuiltYear: (v: string) => void;   // 건축년도
  extra1: string; setExtra1: (v: string) => void;         // 예비 필드
  ownerName: string; setOwnerName: (v: string) => void;
  relation: RelationKind | undefined; setRelation: (v: RelationKind) => void; // 미선택 시 undefined
  ownerPhone: string; onPhoneChange: (v: string) => void;
  ownerMemo: string; setOwnerMemo: (v: string) => void; // 집주인 섹션 메모
  memo: string; setMemo: (v: string) => void;
};

/** 숫자만 추출 후 최대 길이 자르기 */
function digitsOnly(raw: string, maxLen: number): string {
  return raw.replace(/\D/g, '').slice(0, maxLen);
}

/** 면적: 숫자만 추출 (접미사는 TextInput 밖 Text에서 표시) */
export function formatAreaSqmInput(raw: string): string {
  return digitsOnly(raw, 6);
}

/** 층수: 숫자만 추출 후 반환 (접미사 붙이지 않음) */
export function formatFloorInput(raw: string): string {
  return digitsOnly(raw, 4);
}

const MEMO_LINE_HEIGHT = 24;
const MEMO_BASE_HEIGHT = 80;

/** 줄바꿈(\\n) 개수 기준 멀티라인 메모 높이(네이티브) */
function memoHeightFromNewlines(text: string): number {
  const newlines = (text.match(/\n/g) || []).length;
  return Math.max(MEMO_BASE_HEIGHT, MEMO_BASE_HEIGHT + newlines * MEMO_LINE_HEIGHT);
}

const webMemoTextareaStyle = {
  ...StyleSheet.flatten(styles.input),
  height: 250,
  overflow: 'auto' as const,
  resize: 'none' as const,
  width: '100%' as const,
  boxSizing: 'border-box' as const,
};

type MemoFieldProps = {
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  scrollEnabled?: boolean;
  maxLength?: number; // 최대 글자 수 (미지정 시 제한 없음)
};

/** 멀티라인 메모: 웹은 textarea + scrollHeight, 네이티브는 TextInput */
function RegisterMemoField({ value, onChangeText, placeholder, scrollEnabled, maxLength }: MemoFieldProps) {
  // 웹: 고정 높이 250px + 넘치면 스크롤
  if (Platform.OS === 'web') {
    return (
      <textarea
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => {
          onChangeText((e.target as HTMLTextAreaElement).value);
        }}
        style={webMemoTextareaStyle}
      />
    );
  }
  return (
    <TextInput
      style={[styles.input, { height: memoHeightFromNewlines(value), minHeight: MEMO_BASE_HEIGHT, textAlignVertical: 'top' }]}
      value={value}
      onChangeText={onChangeText}
      multiline
      scrollEnabled={scrollEnabled}
      maxLength={maxLength}
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
            <TextInput style={styles.input} value={p.salePrice} onChangeText={p.setSalePrice} keyboardType="numeric" placeholder="매매가" placeholderTextColor="#9AA5B4" />
          </>
        )}
        {p.deal === '전세' && (
          <>
            <Text style={styles.sectionLabel}>전세금</Text>
            <TextInput style={styles.input} value={p.jeonsePrice} onChangeText={p.setJeonsePrice} keyboardType="numeric" placeholder="전세금" placeholderTextColor="#9AA5B4" />
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
        <TextInput style={styles.input} value={p.areaSqm} onChangeText={(t: string) => p.setAreaSqm(formatAreaSqmInput(t))} keyboardType="number-pad" placeholder="면적(㎡)" placeholderTextColor="#9AA5B4" maxLength={6} />
        <TextInput style={styles.input} value={p.floor} onChangeText={(t: string) => p.setFloor(formatFloorInput(t))} keyboardType="number-pad" placeholder="해당 층" placeholderTextColor="#9AA5B4" maxLength={4} />
        <TextInput style={styles.input} value={p.totalFloors} onChangeText={(t: string) => p.setTotalFloors(formatFloorInput(t))} keyboardType="number-pad" placeholder="총 층수" placeholderTextColor="#9AA5B4" maxLength={4} />
        <TextInput style={styles.input} value={p.direction} onChangeText={p.setDirection} placeholder="방향 (예: 남향)" placeholderTextColor="#9AA5B4" />
        <TextInput style={styles.input} value={p.moveInDate} onChangeText={(t) => p.setMoveInDate(t)} placeholder="예: 2026-06-01 또는 즉시입주" placeholderTextColor="#9AA5B4" />
      </View>

      {/* 주차·난방·건축년·예비 */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>주차·난방·건축년</Text>
        <TextInput style={styles.input} value={p.parking} onChangeText={p.setParking} placeholder="주차 (예: 1대)" placeholderTextColor="#9AA5B4" />
        <TextInput style={styles.input} value={p.heating} onChangeText={p.setHeating} placeholder="난방 (예: 지역난방)" placeholderTextColor="#9AA5B4" />
        <TextInput style={styles.input} value={p.builtYear} onChangeText={p.setBuiltYear} keyboardType="number-pad" placeholder="건축년도 (예: 2015)" placeholderTextColor="#9AA5B4" />
        <TextInput style={styles.input} value={p.extra1} onChangeText={p.setExtra1} placeholder="(예비)" placeholderTextColor="#9AA5B4" />
      </View>
      <View style={styles.section}>
        <TouchableOpacity style={styles.relationPickerBtn} onPress={() => setRelationModalOpen(true)} activeOpacity={0.85}>
          <Text style={styles.relationPickerBtnTxt}>{p.relation === undefined ? '관계 선택' : p.relation}</Text>
        </TouchableOpacity>
        <TextInput style={styles.input} value={p.ownerName} onChangeText={p.setOwnerName} placeholder="이름" placeholderTextColor="#9AA5B4" />
        <Modal visible={relationModalOpen} transparent animationType="fade" onRequestClose={() => setRelationModalOpen(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setRelationModalOpen(false)} accessibilityRole="button" />
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>관계 선택</Text>
              {REL_OPTIONS.map((r) => (
                <TouchableOpacity key={r} style={styles.modalOptionRow} onPress={() => { p.setRelation(r); setRelationModalOpen(false); }} activeOpacity={0.85}>
                  <Text style={styles.modalOptionTxt}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>
        <TextInput style={styles.input} value={p.ownerPhone} onChangeText={p.onPhoneChange} keyboardType="phone-pad" placeholder="전화번호" placeholderTextColor="#9AA5B4" />
        <RegisterMemoField value={p.ownerMemo} onChangeText={p.setOwnerMemo} placeholder="메모" maxLength={300} />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>메모</Text>
        <RegisterMemoField value={p.memo} onChangeText={p.setMemo} placeholder="메모" scrollEnabled={false} maxLength={500} />
      </View>
    </>
  );
}
