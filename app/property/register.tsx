/**
 * 매물 등록/편집 화면
 * TODO-DB: 저장 시 Supabase `properties` insert / update
 * TODO-AUTH: 작성자 user_id 바인딩
 * TODO-STORAGE: 매물 사진 업로드·URL 저장
 */
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { detailStyles } from '@/components/property/detailStyles';
import { RegisterDealChips, RegisterPropChips } from '@/components/property/registerChipBlocks';
import { MOCK_ADDRESS_ROWS, formatPhoneHyphen } from '@/components/property/registerMocks';
import { RegisterMoreFields, formatAreaSqmInput, formatFloorInput } from '@/components/property/registerMoreFields';
import { registerStyles as styles } from '@/components/property/registerStyles';
import { PROP_OPTIONS, type DealKind, type PropKind, type RelationKind } from '@/components/property/registerTypes';
import { DEAL_TYPES, PROPERTY_TYPES } from '@/types';
import { clearEditData, closeRegisterPanel } from '@/utils/registerEvents';

type ScreenProps = {
  embedded?: boolean;
  initialData?: Record<string, unknown> | null;
};

// 숫자/문자 등 원시값을 문자열로 통일 (서버 number 등 방어)
const str = (v: unknown): string => { if (v === null || v === undefined) return ''; return String(v); };

export default function PropertyRegisterScreen({ embedded = false, initialData }: ScreenProps) {
  const router = useRouter();
  // 블러 타이머 ref — 언마운트 시 정리용
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const d = initialData ?? null;
  const isEdit = d !== null;

  const stripUnit = (v: unknown) => str(v).replace('㎡', '').trim();

  const [address, setAddress] = useState<string>(() => str(d?.addr));
  const [buildingName, setBuildingName] = useState<string>(() => str(d?.buildingName));
  const [deal, setDeal] = useState<DealKind>(() => {
    const dealValue = str(d?.deal);
    const initialDeal: DealKind = DEAL_TYPES.includes(dealValue as DealKind) ? (dealValue as DealKind) : '월세';
    return initialDeal;
  });
  const [propType, setPropType] = useState<PropKind>(() => {
    const typeValue = str(d?.type);
    // PROPERTY_TYPES 허용 + 화면 칩 PropKind와 교집합 (사무실 등 타입 불일치 방어)
    const initialProp: PropKind = PROPERTY_TYPES.includes(typeValue as (typeof PROPERTY_TYPES)[number]) && (PROP_OPTIONS as readonly string[]).includes(typeValue)
      ? (typeValue as PropKind)
      : '아파트';
    return initialProp;
  });
  const [salePrice, setSalePrice] = useState<string>(() => str(d?.salePrice));
  const [jeonsePrice, setJeonsePrice] = useState<string>(() => str(d?.jeonsePrice));
  const [deposit, setDeposit] = useState<string>(() => str(d?.deposit));
  const [monthly, setMonthly] = useState<string>(() => str(d?.monthly));
  const [areaSqm, setAreaSqm] = useState<string>(() => stripUnit(d?.area));
  const [floor, setFloor] = useState<string>(() => str(d?.floor));
  const [totalFloors, setTotalFloors] = useState<string>(() => str(d?.totalFloors));
  const [direction, setDirection] = useState<string>(() => str(d?.dir));
  const [moveInDate, setMoveInDate] = useState<string>(() => str(d?.moveInDate));
  const [ownerName, setOwnerName] = useState<string>('');
  const [relation, setRelation] = useState<RelationKind | undefined>(undefined);
  const [ownerPhone, setOwnerPhone] = useState<string>('');
  const [ownerMemo, setOwnerMemo] = useState<string>('');
  const [memo, setMemo] = useState<string>(() => str(d?.memo));
  const [showSuggest, setShowSuggest] = useState<boolean>(false);

  useEffect(() => () => { clearTimeout(blurTimerRef.current ?? undefined); }, []);

  const suggestions = useMemo(() => {
    const q = address.trim();
    if (q.length < 1) return [];
    return MOCK_ADDRESS_ROWS.filter((r) => r.label.includes(q)).slice(0, 3);
  }, [address]);

  const onPhoneChange = (t: string) => setOwnerPhone(formatPhoneHyphen(t));

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
      <Text style={styles.title}>{isEdit ? '매물 편집' : '매물 등록'}</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
        <TouchableOpacity
          style={[detailStyles.headerBtn, { paddingHorizontal: 20, paddingVertical: 8 }]}
          activeOpacity={0.6}
          onPress={onSave}>
          <Text style={[detailStyles.headerBtnText, { fontSize: 15 }]}>저장</Text>
        </TouchableOpacity>
      </View>

      {/* 주소 */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>주소</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={(t) => { setAddress(t); setShowSuggest(true); }}
          onFocus={() => setShowSuggest(true)}
          onBlur={() => {
            if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
            blurTimerRef.current = setTimeout(() => setShowSuggest(false), 200);
          }}
          placeholder="주소를 입력하세요"
          placeholderTextColor="#9AA5B4"
        />
        {showSuggest && suggestions.length > 0 && (
          <View style={styles.suggestBox}>
            {suggestions.map((s) => (
              <TouchableOpacity key={s.id} style={styles.suggestRow} onPress={() => {
                setAddress(s.label);
                setAreaSqm(formatAreaSqmInput(s.areaSqm));
                setFloor(formatFloorInput(s.floor));
                setTotalFloors(formatFloorInput(s.totalFloors));
                setShowSuggest(false);
              }}>
                <Text style={styles.suggestTxt}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* 건물명 */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>건물명</Text>
        <TextInput
          style={styles.input}
          value={buildingName}
          onChangeText={setBuildingName}
          placeholder="건물명 (선택)"
          placeholderTextColor="#9AA5B4"
        />
      </View>

      <RegisterDealChips deal={deal} setDeal={setDeal} />
      <RegisterPropChips propType={propType} setPropType={setPropType} />
      <RegisterMoreFields
        deal={deal}
        salePrice={salePrice} setSalePrice={setSalePrice}
        jeonsePrice={jeonsePrice} setJeonsePrice={setJeonsePrice}
        deposit={deposit} setDeposit={setDeposit}
        monthly={monthly} setMonthly={setMonthly}
        areaSqm={areaSqm} setAreaSqm={setAreaSqm}
        floor={floor} setFloor={setFloor}
        totalFloors={totalFloors} setTotalFloors={setTotalFloors}
        direction={direction} setDirection={setDirection}
        moveInDate={moveInDate} setMoveInDate={setMoveInDate}
        ownerName={ownerName} setOwnerName={setOwnerName}
        relation={relation} setRelation={setRelation}
        ownerPhone={ownerPhone} onPhoneChange={onPhoneChange}
        ownerMemo={ownerMemo} setOwnerMemo={setOwnerMemo}
        memo={memo} setMemo={setMemo}
      />
      </ScrollView>
    </SafeAreaView>
  );
}

// 루트 SafeArea: 인셋 영역까지 스크롤 배경(#F0F4FF)과 톤 맞춤
const safeAreaStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F0F4FF' },
});