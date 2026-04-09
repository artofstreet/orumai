import { useState } from 'react'
import { ActivityIndicator, Dimensions, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const { width: SCREEN_W } = Dimensions.get('window')
const COLOR_ORANGE = '#FF6B35'
const COLOR_ORANGE_BG = 'rgba(255,107,53,0.10)'
const COLOR_GRAY = '#888'
const COLOR_BORDER = '#e0e0e0'

const AI_STYLES = [
  { id: 'modern',     label: '모던 심플',     emoji: '🏙' },
  { id: 'scandi',     label: '스칸디나비안',  emoji: '🌿' },
  { id: 'industrial', label: '인더스트리얼',  emoji: '⚙️' },
  { id: 'luxury',     label: '럭셔리 클래식', emoji: '✦'  },
  { id: 'minimal',    label: '미니멀',        emoji: '◻'  },
  { id: 'natural',    label: '내추럴 우드',   emoji: '🪵' },
]

export default function PhotoDetailModal({ visible, photo, photoIndex, totalPhotos, onClose, onSave }: any) {
  const [phase, setPhase] = useState('view')
  const [selectedStyle, setSelectedStyle] = useState<any>(null)
  const [generatedUri, setGeneratedUri] = useState<string | null>(null)
  const photoH = Math.floor(Math.min(SCREEN_W, 480) * 1.2)

  const handleClose = () => {
    setPhase('view'); setSelectedStyle(null); setGeneratedUri(null); onClose?.()
  }
  const handleGenerate = async () => {
    if (!selectedStyle) return
    setPhase('loading')
    try {
      await new Promise(r => setTimeout(r, 2500))
      setGeneratedUri('https://picsum.photos/seed/' + selectedStyle.id + '_result/600/450')
      setPhase('result')
    } catch { setPhase('styles') }
  }
  const handleSave = () => {
    if (!generatedUri || !selectedStyle) return
    onSave?.({ uri: generatedUri, style: selectedStyle.label, emoji: selectedStyle.emoji })
    setPhase('saved')
  }

  if (!photo) return null
  const displayUri = (phase === 'result' || phase === 'saved') ? generatedUri! : photo

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <Text style={styles.closeTxt}>✕</Text>
          </TouchableOpacity>
          <Image source={{ uri: displayUri }} style={[styles.photo, { height: photoH }]} resizeMode="cover" />
          {phase === 'view' && (
            <View style={styles.bottom}>
              <Text style={styles.numTxt}>{photoIndex + 1} / {totalPhotos}</Text>
              <TouchableOpacity style={styles.mainBtn} onPress={() => setPhase('styles')}>
                <Text style={styles.mainBtnTxt}>✨  가상 AI 인테리어 생성</Text>
              </TouchableOpacity>
            </View>
          )}
          {phase === 'styles' && (
            <View style={styles.bottom}>
              <Text style={styles.sectionLabel}>인테리어 스타일을 선택하세요</Text>
              <View style={styles.grid}>
                {AI_STYLES.map(s => (
                  <TouchableOpacity key={s.id} style={[styles.styleBtn, selectedStyle?.id === s.id && styles.styleBtnSel]} onPress={() => setSelectedStyle(s)}>
                    <Text style={styles.styleEmoji}>{s.emoji}</Text>
                    <Text style={[styles.styleTxt, selectedStyle?.id === s.id && styles.styleTxtSel]}>{s.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={[styles.mainBtn, !selectedStyle && styles.mainBtnOff]} onPress={handleGenerate} disabled={!selectedStyle}>
                <Text style={styles.mainBtnTxt}>{selectedStyle ? '"' + selectedStyle.label + '"로 생성하기 →' : '스타일 선택 후 생성'}</Text>
              </TouchableOpacity>
            </View>
          )}
          {phase === 'loading' && (
            <View style={[styles.bottom, { alignItems: 'center' }]}>
              <ActivityIndicator color={COLOR_ORANGE} />
              <Text style={styles.loadingTxt}>"{selectedStyle?.label}" 인테리어 생성 중...</Text>
            </View>
          )}
          {(phase === 'result' || phase === 'saved') && (
            <View style={styles.bottom}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>{selectedStyle?.emoji}  {selectedStyle?.label}</Text>
                {phase === 'saved'
                  ? <View style={styles.savedBadge}><Text style={styles.savedBadgeTxt}>✓ 저장됨</Text></View>
                  : <TouchableOpacity style={styles.saveBtn} onPress={handleSave}><Text style={styles.saveBtnTxt}>저장하기</Text></TouchableOpacity>
                }
              </View>
              <TouchableOpacity style={styles.retryBtn} onPress={() => { setPhase('styles'); setSelectedStyle(null) }}>
                <Text style={styles.retryTxt}>다른 스타일 시도하기</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, width: '100%', maxWidth: 480 },
  closeBtn: { position: 'absolute', top: 10, right: 10, zIndex: 10, width: 28, height: 28, borderRadius: 14, backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' },
  closeTxt: { fontSize: 14, color: '#444' },
  photo: { width: '100%', borderRadius: 10, backgroundColor: '#eee' },
  bottom: { marginTop: 12, gap: 8 },
  numTxt: { fontSize: 13, color: COLOR_GRAY },
  mainBtn: { backgroundColor: COLOR_ORANGE, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  mainBtnOff: { backgroundColor: '#ccc' },
  mainBtnTxt: { color: '#fff', fontSize: 14, fontWeight: '500' },
  sectionLabel: { fontSize: 13, color: COLOR_GRAY, fontWeight: '500' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  styleBtn: { width: '30.5%', paddingVertical: 10, borderRadius: 8, borderWidth: 1.5, borderColor: COLOR_BORDER, alignItems: 'center', backgroundColor: '#f8f8f8' },
  styleBtnSel: { borderColor: COLOR_ORANGE, backgroundColor: COLOR_ORANGE_BG },
  styleEmoji: { fontSize: 18 },
  styleTxt: { fontSize: 11, color: '#555', marginTop: 3, textAlign: 'center' },
  styleTxtSel: { color: COLOR_ORANGE, fontWeight: '500' },
  loadingTxt: { fontSize: 13, color: COLOR_GRAY, marginTop: 6 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultLabel: { fontSize: 13, color: COLOR_GRAY },
  saveBtn: { backgroundColor: COLOR_ORANGE, borderRadius: 6, paddingHorizontal: 14, paddingVertical: 6 },
  saveBtnTxt: { color: '#fff', fontSize: 12, fontWeight: '500' },
  savedBadge: { borderWidth: 1.5, borderColor: COLOR_ORANGE, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  savedBadgeTxt: { color: COLOR_ORANGE, fontSize: 11, fontWeight: '500' },
  retryBtn: { borderWidth: 1, borderColor: COLOR_BORDER, borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  retryTxt: { fontSize: 12, color: COLOR_GRAY },
})
