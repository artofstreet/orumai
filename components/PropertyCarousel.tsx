import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import PhotoDetailModal, { SavePayload } from './PhotoDetailModal';

const COLOR_ORANGE    = '#FF6B35';
const COLOR_BADGE_BG  = 'rgba(0,0,0,0.55)';
const THUMB_COUNT     = 4;

// 저장된 AI 인테리어 사진 타입
type SavedPhoto = {
  id: number;
  uri: string;
  style: string;
  emoji: string;
};

export default function PropertyCarousel({ photos = [] }: { photos: string[] }) {
  const list = photos;
  const [startIdx, setStartIdx]       = useState<number>(0);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [savedPhotos, setSavedPhotos] = useState<SavedPhoto[]>([]);

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
            <View key={`empty-${startIdx}-${slotIdx}`} style={[styles.thumb, styles.emptySlot]}>
              <Text style={styles.emptyTxt}>📷 사진 없음</Text>
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

      {savedPhotos.length > 0 && (
        <View style={styles.savedSection}>
          <Text style={styles.savedTitle}>✦ 저장된 AI 인테리어 ({savedPhotos.length}장)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {savedPhotos.map(sp => (
              <View key={sp.id} style={styles.savedItem}>
                <Image source={{ uri: sp.uri }} style={styles.savedImg} resizeMode="cover" />
                <View style={styles.savedLabel}>
                  <Text style={styles.savedLabelTxt}>{sp.emoji} {sp.style}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {list.length > 0 && (
        <PhotoDetailModal
          visible={modalVisible}
          photo={list[selectedIdx]}
          photoIndex={selectedIdx}
          totalPhotos={list.length}
          onClose={() => setModalVisible(false)}
          onSave={(p: SavePayload) => setSavedPhotos(prev => [{ ...p, id: Date.now() }, ...prev])}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:          { width: '100%', position: 'relative' },
  emptySlot:     { backgroundColor: '#E5E7EB', borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2 },
  emptyTxt:      { fontSize: 10, color: '#94A3B8', fontWeight: '500', textAlign: 'center' },
  row:           { flexDirection: 'row', width: '100%' },
  thumb:         { width: '25%', aspectRatio: 9/16, position: 'relative' },
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
  savedSection:  { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  savedTitle:    { fontSize: 12, fontWeight: '500', color: '#888', marginBottom: 8, paddingHorizontal: 12 },
  savedItem:     { width: 80, marginRight: 8, borderRadius: 6, overflow: 'hidden', borderWidth: 1.5, borderColor: COLOR_ORANGE },
  savedImg:      { width: '100%', aspectRatio: 9/16 },
  savedLabel:    { backgroundColor: COLOR_ORANGE, paddingVertical: 3, alignItems: 'center' },
  savedLabelTxt: { color: '#fff', fontSize: 9, fontWeight: '500' },
});