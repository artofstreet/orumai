/** 매물 등록/편집 화면 — 저장: useProperties(Supabase `properties`) */
import { useRouter } from 'expo-router';
import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RegisterDealChips, RegisterPropChips } from '@/components/property/registerChipBlocks';
import { formatPhoneHyphen } from '@/components/property/registerMocks';
import { RegisterMoreFields, formatAreaSqmInput, formatFloorInput } from '@/components/property/registerMoreFields';
import { registerStyles as styles } from '@/components/property/registerStyles';
import { PROP_OPTIONS, type DealKind, type PropKind, type RelationKind } from '@/components/property/registerTypes';
import { useKakaoAddress } from '@/hooks/useKakaoAddress';
import { type AddPropertyInput } from '@/hooks/useProperties';
import { usePropertiesContext } from '@/contexts/PropertiesContext';
import { DEAL_TYPES, PROPERTY_TYPES, type Property } from '@/types';
import { clearEditData, closeRegisterPanel } from '@/utils/registerEvents';
type ScreenProps = { embedded?: boolean; initialData?: Record<string, unknown> | null };
const str = (v: unknown): string => { if (v === null || v === undefined) return ''; return String(v); };
const RegisterMoreFieldsCompat = RegisterMoreFields as unknown as ((
  props: React.ComponentProps<typeof RegisterMoreFields> & {
    supplyAreaSqm: string;
    setSupplyAreaSqm: Dispatch<SetStateAction<string>>;
  }
) => React.ReactElement | null);
export default function PropertyRegisterScreen({ embedded = false, initialData }: ScreenProps) {
  const router = useRouter();
  const { addProperty, updateProperty, loading } = usePropertiesContext();
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
  // 편집 시 price 필드에서 가격 텍스트 추출 (자유 텍스트 방식)
  const [salePrice, setSalePrice] = useState<string>(() => {
    if (d?.deal === '매매' && d?.price) return String(d.price).trim();
    return str(d?.salePrice);
  });
  const [jeonsePrice, setJeonsePrice] = useState<string>(() => {
    if (d?.deal === '전세' && d?.price) return String(d.price).trim();
    return str(d?.jeonsePrice);
  });
  const [deposit, setDeposit] = useState<string>(() => {
    if (d?.deal === '월세' && d?.price) {
      const m = String(d.price).match(/보([^/]*)/);
      return m ? m[1].trim() : str(d?.deposit);
    }
    return str(d?.deposit);
  });
  const [monthly, setMonthly] = useState<string>(() => {
    if (d?.deal === '월세' && d?.price) {
      const m = String(d.price).match(/월(.*)/);
      return m ? m[1].trim() : str(d?.monthly);
    }
    return str(d?.monthly);
  });
  const [areaSqm, setAreaSqm] = useState<string>(() => stripUnit(d?.area));
  const [supplyAreaSqm, setSupplyAreaSqm] = useState<string>(() => stripUnit(d?.supplyArea));
  const [floor, setFloor] = useState<string>(() => str(d?.floor));
  const [totalFloors, setTotalFloors] = useState<string>(() => str(d?.totalFloors));
  const [direction, setDirection] = useState<string>(() => str(d?.dir));
  const [moveInDate, setMoveInDate] = useState<string>(() => str(d?.moveInDate));
  const [parking, setParking] = useState<string>(() => str(d?.parking));
  const [heating, setHeating] = useState<string>(() => str(d?.heating));
  const [builtYear, setBuiltYear] = useState<string>(() => str(d?.builtYear));
  const [ownerName, setOwnerName] = useState<string>(() => str(d?.ownerName));
  const [relation, setRelation] = useState<RelationKind | undefined>(() => str(d?.relation) as RelationKind || undefined);
  const [ownerPhone, setOwnerPhone] = useState<string>(() => formatPhoneHyphen(str(d?.phone ?? d?.ownerPhone)));
  const [ownerMemo, setOwnerMemo] = useState<string>(() => str(d?.ownerMemo));
  const [memo, setMemo] = useState<string>(() => str(d?.memo));
  const [showSuggest, setShowSuggest] = useState<boolean>(false);
  const [bCode, setBCode] = useState<string>('');
  const [bun, setBun] = useState<string>('');
  const [ji, setJi] = useState<string>('');
  const [hhldCnt, setHhldCnt] = useState<string>(() => str(d?.hhldCnt));
  const [vlRat, setVlRat] = useState<string>(() => str(d?.vlRat));
  const [totArea, setTotArea] = useState<string>(() => str(d?.totArea));
  const [totPkngCnt, setTotPkngCnt] = useState<string>(() => str(d?.totPkngCnt));
  useEffect(() => () => { clearTimeout(blurTimerRef.current ?? undefined); }, []);
  const { results: suggestions, search: searchAddress, clear: clearSuggestions } = useKakaoAddress();
  const fetchBuildingInfo = async (code: string, bunVal: string, jiVal: string) => {
    const sigunguCd = code.slice(0, 5);
    const bjdongCd = code.slice(5, 10);
    try {
      const res = await fetch(
        (process.env.EXPO_PUBLIC_SUPABASE_URL ?? '') + '/functions/v1/building-info',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sigunguCd, bjdongCd, bun: bunVal, ji: jiVal }),
        }
      );
      const json = await res.json();
      const buildings = json.buildings ?? [];
      if (buildings.length === 0) return;
      const b = buildings.reduce((max: Record<string, unknown>, cur: Record<string, unknown>) =>
        (Number(cur.grndFlrCnt) || 0) > (Number(max.grndFlrCnt) || 0) ? cur : max
      , buildings[0] as Record<string, unknown>);
      if (b.buildingName) setBuildingName(b.buildingName);
      if (b.totalArea) setSupplyAreaSqm(String(Math.round(Number(b.totalArea))));
      if (b.grndFlrCnt) setTotalFloors(String(b.grndFlrCnt));
      if (b.useAprDay) setBuiltYear(b.useAprDay.slice(0, 4));
      const recap = json.recap;
      if (recap) {
        if (recap.hhldCnt) setHhldCnt(String(recap.hhldCnt));
        if (recap.vlRat) setVlRat(String(recap.vlRat));
        if (recap.totArea) setTotArea(String(Math.round(recap.totArea)));
        if (recap.totPkngCnt) setTotPkngCnt(String(recap.totPkngCnt));
      }
    } catch {
      // 국토부 API 실패 시 무시 (수동 입력 가능)
    }
  };
  const onPhoneChange = (t: string) => setOwnerPhone(formatPhoneHyphen(t));
  const onSave = async () => {
    const addrTrim = address.trim();
    if (!addrTrim) {
      Alert.alert('', '주소를 입력해주세요');
      return;
    }
    if (isEdit && !str(d?.id)) {
      Alert.alert('', '편집할 매물 정보가 없습니다.');
      return;
    }
    const sN = Number(salePrice) || 0;
    const jN = Number(jeonsePrice) || 0;
    const dN = Number(deposit) || 0;
    const mN = Number(monthly) || 0;
    // 가격 표시: 입력값 그대로 사용 (자유 텍스트)
    const price = deal === '매매'
      ? salePrice.trim() || '—'
      : deal === '전세'
        ? jeonsePrice.trim() || '—'
        : `보${deposit.trim()}/월${monthly.trim()}`;
    const name = buildingName.trim() || addrTrim;
    const payload: AddPropertyInput = {
      type: propType as Property['type'],
      name,
      addr: addrTrim,
      deal,
      price,
      area: `${areaSqm.trim().replace(/㎡/g, '')}㎡`,
      floor: floor.trim() || '—',
      ...(totalFloors.trim() ? { totalFloors: Number(totalFloors.trim().replace(/[^0-9]/g, '')) || undefined } : {}),
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
      ...(parking.trim() ? { parking: parking.trim() } : {}),
      ...(heating.trim() ? { heating: heating.trim() } : {}),
      ...(builtYear.trim() ? { builtYear: Number(builtYear.trim()) || undefined } : {}),
      ...(supplyAreaSqm.trim() ? { supplyArea: `${supplyAreaSqm.trim().replace(/㎡/g, '')}㎡` } : {}),
      ...(relation ? { relation } : {}),
      ...(hhldCnt.trim() ? { hhldCnt: Number(hhldCnt.trim()) || undefined } : {}),
      ...(vlRat.trim() ? { vlRat: Number(vlRat.trim()) || undefined } : {}),
      ...(totArea.trim() ? { totArea: Number(totArea.trim()) || undefined } : {}),
      ...(totPkngCnt.trim() ? { totPkngCnt: Number(totPkngCnt.trim()) || undefined } : {}),
    };
    try {
      if (isEdit) {
        await updateProperty(str(d?.id), { ...payload, status: str(d?.status) === 'active' ? 'active' : 'draft' });
      } else {
        const newId = await addProperty(payload);
        if (newId) {
          clearEditData();
          closeRegisterPanel();
          router.push(`/property/${newId}`);
          return;
        }
      }
      clearEditData();
      closeRegisterPanel();
    } catch (err: unknown) {
      Alert.alert('저장 실패', String(err));
    }
  };
  return (
    <SafeAreaView style={safeAreaStyles.root}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        minHeight: 64,
      }}>
        <Text style={styles.title}>{isEdit ? '매물 편집' : '매물 등록'}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Pressable style={({ pressed }) => [{
            borderWidth: 1,
            borderColor: '#D8DCE6',
            borderRadius: 6,
            height: 36,
            minWidth: 68,
            paddingHorizontal: 16,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
          }, pressed ? { opacity: 0.6 } : null]} onPress={onSave}>
            <Text allowFontScaling={false} numberOfLines={1} style={{ color: '#18202E', fontSize: 15, lineHeight: 18, fontWeight: '600', textAlign: 'center' as const }}>저장</Text>
          </Pressable>
          <TouchableOpacity
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            activeOpacity={0.5}
            onPress={() => { clearEditData(); closeRegisterPanel(); }}>
            <Text style={{ fontSize: 22, color: '#666', paddingHorizontal: 12 }}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={safeAreaStyles.keyboardAvoiding}>
        {Platform.OS === 'web' ? (
          <ScrollView
            style={[styles.page, embedded ? { flex: 1, width: '100%' } : { maxWidth: 480, alignSelf: 'center', width: '100%' }]}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: 200 }]}
            keyboardShouldPersistTaps="handled">
      {!embedded && (
        <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
          <Text style={styles.backTxt}>← 뒤로</Text>
        </TouchableOpacity>
      )}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>주소</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={(t) => { setAddress(t); setShowSuggest(true); searchAddress(t); }}
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
            {suggestions.map((s, idx) => (
              <TouchableOpacity key={s.bCode + String(idx)} style={styles.suggestRow} onPress={() => {
                setAddress(s.addressName);
                setBCode(s.bCode);
                setBun(s.bun);
                setJi(s.ji);
                setShowSuggest(false);
                clearSuggestions();
                fetchBuildingInfo(s.bCode, s.bun, s.ji);
              }}>
                <Text style={styles.suggestTxt}>{s.addressName}</Text>
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
      <RegisterMoreFieldsCompat deal={deal} salePrice={salePrice} setSalePrice={setSalePrice} jeonsePrice={jeonsePrice} setJeonsePrice={setJeonsePrice} deposit={deposit} setDeposit={setDeposit} monthly={monthly} setMonthly={setMonthly} areaSqm={areaSqm} setAreaSqm={setAreaSqm} supplyAreaSqm={supplyAreaSqm} setSupplyAreaSqm={setSupplyAreaSqm} floor={floor} setFloor={setFloor} totalFloors={totalFloors} setTotalFloors={setTotalFloors} direction={direction} setDirection={setDirection} moveInDate={moveInDate} setMoveInDate={setMoveInDate} parking={parking} setParking={setParking} heating={heating} setHeating={setHeating} builtYear={builtYear} setBuiltYear={setBuiltYear} hhldCnt={hhldCnt} setHhldCnt={setHhldCnt} vlRat={vlRat} setVlRat={setVlRat} totArea={totArea} setTotArea={setTotArea} totPkngCnt={totPkngCnt} setTotPkngCnt={setTotPkngCnt} ownerName={ownerName} setOwnerName={setOwnerName} relation={relation} setRelation={setRelation} ownerPhone={ownerPhone} onPhoneChange={onPhoneChange} ownerMemo={ownerMemo} setOwnerMemo={setOwnerMemo} memo={memo} setMemo={setMemo} />
          </ScrollView>
        ) : (
          <KeyboardAwareScrollView
            bottomOffset={50}
            style={[styles.page, embedded ? { flex: 1, width: '100%' } : { maxWidth: 480, alignSelf: 'center', width: '100%' }]}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: 200 }]}
            keyboardShouldPersistTaps="handled">
            {!embedded && (
              <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
                <Text style={styles.backTxt}>← 뒤로</Text>
              </TouchableOpacity>
            )}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>주소</Text>
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={(t) => { setAddress(t); setShowSuggest(true); searchAddress(t); }}
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
                  {suggestions.map((s, idx) => (
                    <TouchableOpacity key={s.bCode + String(idx)} style={styles.suggestRow} onPress={() => {
                      setAddress(s.addressName);
                      setBCode(s.bCode);
                      setBun(s.bun);
                      setJi(s.ji);
                      setShowSuggest(false);
                      clearSuggestions();
                      fetchBuildingInfo(s.bCode, s.bun, s.ji);
                    }}>
                      <Text style={styles.suggestTxt}>{s.addressName}</Text>
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
            <RegisterMoreFieldsCompat deal={deal} salePrice={salePrice} setSalePrice={setSalePrice} jeonsePrice={jeonsePrice} setJeonsePrice={setJeonsePrice} deposit={deposit} setDeposit={setDeposit} monthly={monthly} setMonthly={setMonthly} areaSqm={areaSqm} setAreaSqm={setAreaSqm} supplyAreaSqm={supplyAreaSqm} setSupplyAreaSqm={setSupplyAreaSqm} floor={floor} setFloor={setFloor} totalFloors={totalFloors} setTotalFloors={setTotalFloors} direction={direction} setDirection={setDirection} moveInDate={moveInDate} setMoveInDate={setMoveInDate} parking={parking} setParking={setParking} heating={heating} setHeating={setHeating} builtYear={builtYear} setBuiltYear={setBuiltYear} hhldCnt={hhldCnt} setHhldCnt={setHhldCnt} vlRat={vlRat} setVlRat={setVlRat} totArea={totArea} setTotArea={setTotArea} totPkngCnt={totPkngCnt} setTotPkngCnt={setTotPkngCnt} ownerName={ownerName} setOwnerName={setOwnerName} relation={relation} setRelation={setRelation} ownerPhone={ownerPhone} onPhoneChange={onPhoneChange} ownerMemo={ownerMemo} setOwnerMemo={setOwnerMemo} memo={memo} setMemo={setMemo} />
          </KeyboardAwareScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
const safeAreaStyles = StyleSheet.create({ root: { flex: 1, backgroundColor: '#F0F4FF' }, keyboardAvoiding: { flex: 1 }, headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ddd', height: 64 } });
