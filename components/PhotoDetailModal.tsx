import { Image, Modal, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';

const COLOR_GRAY = '#888';

// 사진 상세 보기 모달 — 순수 사진 뷰어
type Props = {
  visible: boolean;
  photo: string;
  photoIndex: number;
  totalPhotos: number;
  onClose: () => void;
};

export default function PhotoDetailModal({ visible, photo, photoIndex, totalPhotos, onClose }: Props) {
  const { width: SCREEN_W } = useWindowDimensions();
  // 사진 높이 — 화면 너비 기준 비율 계산
  const photoH = Math.floor(Math.min(SCREEN_W, 480) * 1.2);

  if (!photo) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* 닫기 버튼 */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeTxt}>✕</Text>
          </TouchableOpacity>
          {/* 사진 */}
          <Image source={{ uri: photo }} style={[styles.photo, { height: photoH }]} resizeMode="cover" />
          {/* 사진 번호 */}
          <View style={styles.bottom}>
            <Text style={styles.numTxt}>{photoIndex + 1} / {totalPhotos}</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // 반투명 배경 오버레이
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  // 모달 카드
  card: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, width: '100%', maxWidth: 480 },
  // 닫기 버튼
  closeBtn: { position: 'absolute', top: 10, right: 10, zIndex: 10, width: 28, height: 28, borderRadius: 14, backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' },
  closeTxt: { fontSize: 14, color: '#444' },
  // 사진
  photo: { width: '100%', borderRadius: 10, backgroundColor: '#eee' },
  // 하단 영역
  bottom: { marginTop: 12, gap: 8 },
  // 사진 번호 텍스트
  numTxt: { fontSize: 13, color: COLOR_GRAY },
});