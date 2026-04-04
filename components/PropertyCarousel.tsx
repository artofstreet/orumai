import { useState } from 'react'
import { View, Image, TouchableOpacity, StyleSheet, Text, ScrollView } from 'react-native'
import PhotoDetailModal from './PhotoDetailModal'

const COLOR_ORANGE = '#FF6B35'
const COLOR_BADGE_BG = 'rgba(0,0,0,0.55)'
const THUMB_COUNT = 4
const SAMPLE = ['https://picsum.photos/seed/a1/400/700','https://picsum.photos/seed/a2/400/700','https://picsum.photos/seed/a3/400/700','https://picsum.photos/seed/a4/400/700','https://picsum.photos/seed/a5/400/700','https://picsum.photos/seed/a6/400/700','https://picsum.photos/seed/a7/400/700']

export default function PropertyCarousel({ photos = [] }: { photos: string[] }) {
  const list = photos.length > 0 ? photos : SAMPLE
  const [startIdx, setStartIdx] = useState(0)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [savedPhotos, setSavedPhotos] = useState<any[]>([])
  const canPrev = startIdx > 0
  const canNext = startIdx < list.length - THUMB_COUNT
  const visible = list.slice(startIdx, startIdx + THUMB_COUNT)

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {visible.map((photo, i) => (
          <TouchableOpacity key={startIdx + i} style={styles.thumb} onPress={() => { setSelectedIdx(startIdx + i); setModalVisible(true) }} activeOpacity={0.85}>
            <Image source={{ uri: photo }} style={styles.img} resizeMode="cover" />
            <View style={styles.badge}><Text style={styles.badgeTxt}>{startIdx + i + 1}/{list.length}</Text></View>
          </TouchableOpacity>
        ))}
      </View>
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
          const on = i >= startIdx && i < startIdx + THUMB_COUNT
          return <View key={i} style={[styles.dot, on ? styles.dotOn : styles.dotOff]} />
        })}
      </View>
      {savedPhotos.length > 0 && (
        <View style={styles.savedSection}>
          <Text style={styles.savedTitle}>✦ 저장된 AI 인테리어 ({savedPhotos.length}장)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {savedPhotos.map(sp => (
              <View key={sp.id} style={styles.savedItem}>
                <Image source={{ uri: sp.uri }} style={styles.savedImg} resizeMode="cover" />
                <View style={styles.savedLabel}><Text style={styles.savedLabelTxt}>{sp.emoji} {sp.style}</Text></View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
      <PhotoDetailModal
        visible={modalVisible}
        photo={list[selectedIdx]}
        photoIndex={selectedIdx}
        photos={list}
        totalPhotos={list.length}
        onClose={() => setModalVisible(false)}
        onSave={(p: any) => setSavedPhotos(prev => [{ ...p, id: Date.now() }, ...prev])}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { width: '100%', position: 'relative' },
  row: { flexDirection: 'row', width: '100%' },
  thumb: { width: '25%', aspectRatio: 9/16, position: 'relative' },
  img: { width: '100%', height: '100%' },
  badge: { position: 'absolute', bottom: 4, right: 4, backgroundColor: COLOR_BADGE_BG, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  badgeTxt: { color: '#fff', fontSize: 9 },
  arrow: { position: 'absolute', top: 0, bottom: 0, zIndex: 10, justifyContent: 'center', paddingHorizontal: 6 },
  circle: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.8)', alignItems: 'center', justifyContent: 'center' },
  arrowTxt: { fontSize: 24, color: '#333', lineHeight: 28 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 4, marginTop: 8 },
  dot: { height: 4, borderRadius: 2 },
  dotOn: { width: 16, backgroundColor: COLOR_ORANGE },
  dotOff: { width: 5, backgroundColor: '#ddd' },
  savedSection: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  savedTitle: { fontSize: 12, fontWeight: '500', color: '#888', marginBottom: 8, paddingHorizontal: 12 },
  savedItem: { width: 80, marginRight: 8, borderRadius: 6, overflow: 'hidden', borderWidth: 1.5, borderColor: COLOR_ORANGE },
  savedImg: { width: '100%', aspectRatio: 9/16 },
  savedLabel: { backgroundColor: COLOR_ORANGE, paddingVertical: 3, alignItems: 'center' },
  savedLabelTxt: { color: '#fff', fontSize: 9, fontWeight: '500' },
})
