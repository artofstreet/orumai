/**
 * 매물 등록/편집 화면 — 저장: useProperties(Supabase `properties`)
 * TODO-AUTH: 작성자 user_id · TODO-STORAGE: 사진 업로드
 */
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { detailStyles } from '@/components/property/detailStyles';
import { RegisterDealChips, RegisterPropChips } from '@/components/property/registerChipBlocks';
import { MOCK_ADDRESS_ROWS, formatPhoneHyphen } from '@/components/property/registerMocks';
import { RegisterMoreFields, formatAreaSqmInput, formatFloorInput } from '@/components/property/registerMoreFields';
import { registerStyles as styles } from '@/components/property/registerStyles';
import { PROP_OPTIONS, type DealKind, type PropKind, type RelationKind } from '@/components/property/registerTypes';
import { type AddPropertyInput } from '@/hooks/useProperties';
import { usePropertiesContext } from '@/contexts/PropertiesContext';
import { DEAL_TYPES, PROPERTY_TYPES, type Property } from '@/types';
import { clearEditData, closeRegisterPanel } from '@/utils/registerEvents';
type ScreenProps = {
  embedded?: boolean;
  initialData?: Record<string, unknown> | null;
};
const str = (v: unknown): string => { if (v === null || v === undefined) return ''; return String(v); };
export default function PropertyRegisterScreen({ embedded = false, initialData }: ScreenProps) {
  const router = useRouter();
  const { addProperty, updateProperty, loading, error } = usePropertiesContext();
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSaveRef = useRef(false);
  const d = initialData ?? null;
  const isEdit = d !== null;
  const stripUnit = (v: unknown) => str(v).replace('㎡', '').trim();
  const [address, setAddress] = useState<string>(() => str(d?.addr));
  const [buildingName, setBuildingName] = useState<string>(() => str(d?.buildingName));
  const [deal, setDeal] = useState<DealKind>(() => {
    const dealValue = str(d?.deal);
    return DEAL_TYPES.includes(dealValue as DealKind) ? (dealValue as DealKind) : '월세';
  });
  const [propType, setPropType] = useState<PropKind>(() => {
    const typeValue = str(d?.type);
    return PROPERTY_TYPES.includes(typeValue as (typeof PROPERTY_TYPES)[number]) && (PROP_OPTIONS as readonly string[]).includes(typeValue)
      ? (typeValue as PropKind)
      : '아파트';
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
  const [ownerName, setOwnerName] = useState<string>(() => str(d?.ownerName));
  const [relation, setRelation] = useState<RelationKind | undefined>(() => str(d?.relation) as RelationKind || undefined);
  const [ownerPhone, setOwnerPhone] = useState<string>(() => formatPhoneHyphen(str(d?.ownerPhone)));
  const [ownerMemo, setOwnerMemo] = useState<string>(() => str(d?.ownerMemo));
  const [memo, setMemo] = useState<string>(() => str(d?.memo));
  const [showSuggest, setShowSuggest] = useState<boolean>(false);
  useEffect(() => () => { clearTimeout(blurTimerRef.current ?? undefined); }, []);
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
  const suggestions = useMemo(() => {
    const q = address.trim();
    return q.length < 1 ? [] : MOCK_ADDRESS_ROWS.filter((r) => r.label.includes(q)).slice(0, 3);
  }, [address]);
  const onPhoneChange = (t: string) => setOwnerPhone(formatPhoneHyphen(t));
  const onSave = async () => {
    Keyboard.dismiss();
    const addrTrim = address.trim();
    if (!addrTrim) {
      Alert.alert('', '주소를 입력해주세요');
      return;
    }
    if (isEdit && !str(d?.id)) {
      Alert.alert('', '편집할 매물 정보가 없습니다.');
      return;
    }
    const sN = Number(salePrice);
    const jN = Number(jeonsePrice);
    const dN = Number(deposit);
    const mN = Number(monthly);
    const price = deal === '매매' ? `${sN}억` : deal === '전세' ? `${jN}억` : `보${dN}/월${mN}`;
    const name = buildingName.trim() || addrTrim;
    const payload: AddPropertyInput = {
      type: propType as Property['type'],
      name,
      addr: addrTrim,
      deal,
      price,
      area: `${areaSqm.trim()}㎡`,
      floor: floor.trim() || '—',
      ...(totalFloors.trim() ? { totalFloors: Number(totalFloors.trim()) || undefined } : {}),
      phone: ownerPhone.trim(),
      memo: memo.trim(),
      status: 'draft',
      ...(buildingName.trim() ? { buildingName: buildingName.trim() } : {}),
      ...(deal === '매매' && Number.isFinite(sN) ? { salePrice: sN } : {}),
      ...(deal === '전세' && Number.isFinite(jN) ? { jeonsePrice: jN } : {}),
      ...(deal === '월세' && Number.isFinite(dN) ? { deposit: dN } : {}),
      ...(deal === '월세' && Number.isFinite(mN) ? { monthly: mN } : {}),
      ...(direction.trim() ? { dir: direction.trim() } : {}),
      ...(moveInDate.trim() ? { moveInDate: moveInDate.trim() } : {}),
      ...(ownerName.trim() ? { ownerName: ownerName.trim() } : {}),
      ...(ownerMemo.trim() ? { ownerMemo: ownerMemo.trim() } : {}),
      ...(relation ? { relation } : {}),
    };
    pendingSaveRef.current = true;
    if (isEdit) {
      await updateProperty(str(d?.id), { ...payload, status: str(d?.status) === 'active' ? 'active' : 'draft' });
    } else {
      await addProperty(payload);
    }
  };
  return (
    <SafeAreaView style={safeAreaStyles.root}>
      {/* 키보드가 입력란을 가리지 않도록 플랫폼별 동작 */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={safeAreaStyles.keyboardAvoiding}>
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
        deal={deal} salePrice={salePrice} setSalePrice={setSalePrice}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const safeAreaStyles = StyleSheet.create({ root: { flex: 1, backgroundColor: '#F0F4FF' }, keyboardAvoiding: { flex: 1 } });
