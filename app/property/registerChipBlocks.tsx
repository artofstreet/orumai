/**
 * 거래/매물/관계 칩 UI 블록
 */
import { Text, TouchableOpacity, View } from 'react-native';

import { registerStyles as styles } from './registerStyles';
import type { DealKind, PropKind, RelationKind } from './registerTypes';
import { DEAL_OPTIONS, PROP_OPTIONS, REL_OPTIONS } from './registerTypes';

type DealProps = { deal: DealKind; setDeal: (d: DealKind) => void }; // 거래 칩
type PropProps = { propType: PropKind; setPropType: (p: PropKind) => void }; // 매물 칩
type RelProps = { relation: RelationKind; setRelation: (r: RelationKind) => void }; // 관계 칩

/** 거래 종류 칩 */
export function RegisterDealChips({ deal, setDeal }: DealProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>거래 종류</Text>
      <View style={styles.rowChips}>
        {DEAL_OPTIONS.map((d) => {
          const on = deal === d;
          return (
            <TouchableOpacity
              key={d}
              style={[styles.chip, { borderRadius: 4 }, on && styles.chipOn]}
              onPress={() => setDeal(d)}>
              <Text style={[styles.chipTxt, on && styles.chipTxtOn]}>{d}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

/** 매물 종류 칩 */
export function RegisterPropChips({ propType, setPropType }: PropProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>매물 종류</Text>
      <View style={styles.rowChips}>
        {PROP_OPTIONS.map((p) => {
          const on = propType === p;
          return (
            <TouchableOpacity
              key={p}
              style={[styles.chip, { borderRadius: 4 }, on && styles.chipOn]}
              onPress={() => setPropType(p)}>
              <Text style={[styles.chipTxt, on && styles.chipTxtOn]}>{p}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

/** 집주인 관계 칩 */
export function RegisterRelationChips({ relation, setRelation }: RelProps) {
  return (
    <View style={styles.rowChips}>
      {REL_OPTIONS.map((r) => {
        const on = relation === r;
        return (
          <TouchableOpacity key={r} style={[styles.chip, on && styles.chipOn]} onPress={() => setRelation(r)}>
            <Text style={[styles.chipTxt, on && styles.chipTxtOn]}>{r}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
