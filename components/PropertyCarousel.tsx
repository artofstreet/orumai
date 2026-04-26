import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import PhotoDetailModal from './PhotoDetailModal';

const COLOR_ORANGE    = '#FF6B35';
const COLOR_BADGE_BG  = 'rgba(0,0,0,0.55)';
const THUMB_COUNT     = 4;

export default function PropertyCarousel({ photos = [] }: { photos: string[] }) {
  const list = photos;
  const [startIdx, setStartIdx]       = useState<number>(0);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  useEffect(() => {
    setStartIdx(0); // photos 변경 시 슬라이드 위치 초기화
  }, [photos]);

  const canPrev = startIdx > 0;
  const canNext = startIdx < list.length - THUMB_COUNT;

  const visibleSlice = list.slice(startIdx, startIdx + THUMB_COUNT);
  const paddedRow: (string | null)[] = [...visibleSlice];
  while (paddedRow.length < THUMB_COUNT) {
    paddedRow.push(null);
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {paddedRow.map((photo, slotIdx) => {
          const listIdx = startIdx + slotIdx;
          if (photo !== null) {
            return (
              <TouchableOpacity
                key={`slot-${startIdx}-${slotIdx}`}
                style={styles.thumb}
                onPress={() => { setSelectedIdx(listIdx); setModalVisible(true); }}
                activeOpacity={0.85}>
                <Image source={{ uri: photo }} style={styles.img} resizeMode="cover" />
                <View style={styles.badge}>
                  <Text style={styles.badgeTxt}>{listIdx + 1}/{list.length}</Text>
                </View>
              </TouchableOpacity>
            );
          }
          return (
            <View
              key={`empty-${startIdx}-${slotIdx}`}
              style={[
                styles.thumb,
                slotIdx === THUMB_COUNT - 1 ? styles.mapSlot : styles.emptySlot,
              ]}>
              {slotIdx === THUMB_COUNT - 1 ? (
                <>
                  <Text style={styles.mapIcon}>🗺</Text>
                  <Text style={styles.mapTxt}>지도 미리보기</Text>
                  <Text style={styles.mapSubTxt}>준비중</Text>
                </>
              ) : (
                <Text style={styles.emptyTxt}>📷 사진 없음</Text>
              )}
            </View>
          );
        })}
      </View>

      {list.length > 0 && (
        <>
          {canPrev && (
            <TouchableOpacity style={[styles.arrow, { left: 0 }]} onPress={() => setStartIdx(i => i - 1)}>
              <View style={styles.circle}><Text style={styles.arrowTxt}>‹</Text></View>
            </TouchableOpacity>
          )}
          {canNext && (
            <TouchableOpacity style={[styles.arrow, { right: 0 }]} onPress={() => setStartIdx(i => i + 1)}>
              <View style={styles.circle}><Text style={styles.arrowTxt}>›</Text></View>
            </TouchableOpacity>
          )}

          <View style={styles.dots}>
            {list.map((_, i) => {
              const on = i >= startIdx && i < startIdx + THUMB_COUNT;
              return <View key={i} style={[styles.dot, on ? styles.dotOn : styles.dotOff]} />;
            })}
          </View>
        </>
      )}

      {list.length > 0 && (
        <PhotoDetailModal
          visible={modalVisible}
          photo={list[selectedIdx]}
          photoIndex={selectedIdx}
          totalPhotos={list.length}
          onClose={() => setModalVisible(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:          { width: '100%', position: 'relative' },
  emptySlot:     { backgroundColor: '#E5E7EB', borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2 },
  emptyTxt:      { fontSize: 10, color: '#94A3B8', fontWeight: '500', textAlign: 'center' },
  mapSlot:       { backgroundColor: '#F0F4FF', borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2, borderWidth: 1, borderColor: '#CBD5E1', borderStyle: 'dashed' },
  mapIcon:       { fontSize: 24, marginBottom: 4 },
  mapTxt:        { fontSize: 11, color: '#475569', fontWeight: '600', textAlign: 'center' },
  mapSubTxt:     { fontSize: 10, color: '#94A3B8', marginTop: 2 },
  row:           { flexDirection: 'row', width: '100%' },
  thumb:         { width: '25%', aspectRatio: 3/4, position: 'relative' }, // 사진 셀 높이 축소 (9:16 → 3:4)
  img:           { width: '100%', height: '100%' },
  badge:         { position: 'absolute', bottom: 4, right: 4, backgroundColor: COLOR_BADGE_BG, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  badgeTxt:      { color: '#fff', fontSize: 9 },
  arrow:         { position: 'absolute', top: 0, bottom: 0, zIndex: 10, justifyContent: 'center', paddingHorizontal: 6 },
  circle:        { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.8)', alignItems: 'center', justifyContent: 'center' },
  arrowTxt:      { fontSize: 24, color: '#333', lineHeight: 28 },
  dots:          { flexDirection: 'row', justifyContent: 'center', gap: 4, marginTop: 8 },
  dot:           { height: 4, borderRadius: 2 },
  dotOn:         { width: 16, backgroundColor: COLOR_ORANGE },
  dotOff:        { width: 5, backgroundColor: '#ddd' },
});