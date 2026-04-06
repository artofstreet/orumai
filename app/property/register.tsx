/**
 * 매물 등록/편집 화면
 * TODO-DB: 저장 시 Supabase `properties` insert / update
 * TODO-AUTH: 작성자 user_id 바인딩
 * TODO-STORAGE: 매물 사진 업로드·URL 저장
 */
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { detailStyles } from './detailStyles';
import { RegisterDealChips, RegisterPropChips } from './registerChipBlocks';
import { MOCK_ADDRESS_ROWS, formatPhoneHyphen } from './registerMocks';
import { RegisterMoreFields, formatAreaSqmInput, formatFloorInput } from './registerMoreFields';
import { registerStyles as styles } from './registerStyles';
import type { DealKind, PropKind, RelationKind } from './registerTypes';

type ScreenProps = {
  embedded?: boolean; // true면 뒤로가기 숨김(results 슬라이드 패널용)
};

/** 매물 등록/편집 화면 */
export default function PropertyRegisterScreen({ embedded = false }: ScreenProps) {
  const router = useRouter();

  const [address, setAddress] = useState<string>('');
  const [deal, setDeal] = useState<DealKind>('월세');
  const [propType, setPropType] = useState<PropKind>('아파트');
  const [salePrice, setSalePrice] = useState<string>('');
  const [jeonsePrice, setJeonsePrice] = useState<string>('');
  const [deposit, setDeposit] = useState<string>('');
  const [monthly, setMonthly] = useState<string>('');
  const [areaSqm, setAreaSqm] = useState<string>('');
  const [floor, setFloor] = useState<string>('');
  const [totalFloors, setTotalFloors] = useState<string>('');
  const [direction, setDirection] = useState<string>('');
  const [moveInDate, setMoveInDate] = useState<string>('');
  const [ownerName, setOwnerName] = useState<string>('');
  const [relation, setRelation] = useState<RelationKind | undefined>(undefined);
  const [ownerPhone, setOwnerPhone] = useState<string>('');
  const [ownerMemo, setOwnerMemo] = useState<string>('');
  const [memo, setMemo] = useState<string>('');

  const [showSuggest, setShowSuggest] = useState<boolean>(false);

  /** 주소 자동완성 후보 (Mock 3건 필터) */
  const suggestions = useMemo(() => {
    const q = address.trim();
    if (q.length < 1) return [];
    return MOCK_ADDRESS_ROWS.filter((r) => r.label.includes(q)).slice(0, 3);
  }, [address]);

  /** 전화 입력 시 하이픈 자동 */
  const onPhoneChange = (t: string) => {
    setOwnerPhone(formatPhoneHyphen(t));
  };

  /** 저장/완료 */
  const onSave = () => {
    // TODO-DB: supabase.from('properties').insert({ ... })
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
      <Text style={styles.title}>매물 등록</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={styles.sub}>Mock 음성·주소 자동완성은 개발용입니다.</Text>
        <TouchableOpacity
          style={[detailStyles.headerBtn, { paddingHorizontal: 20, paddingVertical: 8 }]}
          activeOpacity={0.6}
          onPress={onSave}>
          <Text style={[detailStyles.headerBtnText, { fontSize: 15 }]}>완료</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>주소</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={(t) => { setAddress(t); setShowSuggest(true); }}
          onFocus={() => setShowSuggest(true)}
          onBlur={() => setTimeout(() => setShowSuggest(false), 200)}
          placeholder="주소를 입력하세요"
          placeholderTextColor="#9AA5B4"
        />
        {showSuggest && suggestions.length > 0 && (
          <View style={styles.suggestBox}>
            {suggestions.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={styles.suggestRow}
                onPress={() => {
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

      <Text style={styles.hint}>TODO-DB: 저장 시 서버 스키마에 맞게 필드 매핑</Text>
    </ScrollView>
  );
}