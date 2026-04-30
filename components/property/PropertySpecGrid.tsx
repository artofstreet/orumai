import React from 'react';
import { Platform, Text, View } from 'react-native';
import { detailStyles, specFontStyles, specLayoutStyles, specMobileStyles } from '@/components/property/detailStyles';

// 스펙 항목 타입
interface SpecItem {
  label: string;
  value: string;
}

interface PropertySpecGridProps {
  specs: SpecItem[];
  specs2: SpecItem[];
  specs3: SpecItem[];
  narrow: boolean;
  isUltraWide: boolean;
}

/** 매물 상세 스펙 그리드 — 웹 3행4열 / 모바일 6행2열 */
export default function PropertySpecGrid({ specs, specs2, specs3, narrow, isUltraWide }: PropertySpecGridProps) {
  const webSpecsRow1 = [
    { label: '전용면적', value: specs[0]?.value ?? '—' },
    specs[1],
    specs[2],
    specs[3],
  ];
  const webSpecsRow2 = [specs2[0], specs2[1], specs2[2], specs2[3]];
  const webSpecsRow3 = [specs3[0], specs3[1], specs3[2], specs3[3]];

  return (
    <View style={[detailStyles.specGrid, narrow && detailStyles.specGridFull, isUltraWide && detailStyles.specGridUltra, !narrow && detailStyles.specGridFlex, Platform.OS === 'web' && !isUltraWide && { flexDirection: 'column' as const }, Platform.OS !== 'web' && { flexDirection: 'column' as const }]}>
      {Platform.OS === 'web' ? (
        isUltraWide ? (
          <>
            {[webSpecsRow1, webSpecsRow2, webSpecsRow3].map((row, ri) => (
              <View key={`ur-${ri}`} style={[detailStyles.specRow, detailStyles.specRowBottom, specLayoutStyles.specRow]}>
                {row.map((spec, idx) => (
                  <View key={`u-${ri}-${idx}`} style={[detailStyles.specCellUltra2col, specLayoutStyles.specItem, idx < row.length - 1 && detailStyles.specCellRight]}>
                    <Text style={[detailStyles.specLabel, specFontStyles.specLabel, specLayoutStyles.specTextVertical]} numberOfLines={1} ellipsizeMode="tail">{spec.label}</Text>
                    <Text style={[detailStyles.specValue, specFontStyles.specValue, specLayoutStyles.specTextVertical]} numberOfLines={1} ellipsizeMode="tail">{spec.value}</Text>
                  </View>
                ))}
              </View>
            ))}
          </>
        ) : (
          <>
            {[webSpecsRow1, webSpecsRow2, webSpecsRow3].map((row, ri) => (
              <View key={`wr-${ri}`} style={[detailStyles.specRow, ri === 0 && detailStyles.specRowBottom, specLayoutStyles.specRow]}>
                {row.map((spec, idx) => (
                  <View key={`w-${ri}-${idx}`} style={[detailStyles.specCell, specLayoutStyles.specItem, idx < row.length - 1 && detailStyles.specCellRight]}>
                    <Text style={[detailStyles.specLabel, specFontStyles.specLabel]} numberOfLines={1} ellipsizeMode="tail">{spec.label}</Text>
                    <Text style={[detailStyles.specValue, specFontStyles.specValue]} numberOfLines={1} ellipsizeMode="tail">{spec.value}</Text>
                  </View>
                ))}
              </View>
            ))}
          </>
        )
      ) : (
        <>
          {[
            [specs[0], specs[1]],
            [specs[2], specs[3]],
            [specs2[0], specs2[1]],
            [specs2[2], specs2[3]],
            [specs3[0], specs3[1]],
            [specs3[2], specs3[3]],
          ].map((row, rowIdx) => (
            <View key={`mrow-${rowIdx}`} style={specMobileStyles.specRowMobile}>
              <View style={[specMobileStyles.specCellMobile, specMobileStyles.specCellMobileRight]}>
                <Text style={specMobileStyles.specLabelMobile}>{row[0].label}</Text>
                <Text style={specMobileStyles.specValueMobile}>{row[0].value}</Text>
              </View>
              <View style={specMobileStyles.specCellMobile}>
                <Text style={specMobileStyles.specLabelMobile}>{row[1].label}</Text>
                <Text style={specMobileStyles.specValueMobile}>{row[1].value}</Text>
              </View>
            </View>
          ))}
        </>
      )}
    </View>
  );
}
