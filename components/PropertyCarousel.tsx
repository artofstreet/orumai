import React, { useState } from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

// TODO-STORAGE: photos 배열을 Supabase Storage URL로 교체 예정

interface Props {
  photos: string[]; // 사진 URL 배열
}

export default function PropertyCarousel({ photos }: Props) {
  const { width: winW, height: winH } = useWindowDimensions();
  const carouselHeight = Math.min(280, Math.max(180, Math.floor(Math.min(winW, 1320) * 0.22)));
  const [idx, setIdx] = useState<number>(0); // 현재 사진 인덱스 — 캐러셀·팝업 공유
  const [open, setOpen] = useState<boolean>(false); // 팝업 열림 여부

  const prev = () => setIdx((i) => (i - 1 + photos.length) % photos.length); // 이전 (순환)
  const next = () => setIdx((i) => (i + 1) % photos.length); // 다음 (순환)

  const modalH = Math.floor(winH * 0.8); // 팝업 사진 높이 — 화면의 80%
  const multi = photos.length > 1; // 사진 2장 이상 여부

  if (photos.length === 0) {
    return (
      <View style={[styles.empty, { height: carouselHeight }]}>
        <Text style={styles.emptyText}>📷 사진 없음</Text>
      </View>
    );
  }

  return (
    <>
      {/* ── 캐러셀 ── */}
      <View style={[styles.wrap, { height: carouselHeight }]}>
        {/* 사진 클릭 → 팝업 열기 */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => setOpen(true)} style={styles.photoTouch}>
          <Image source={{ uri: photos[idx] }} style={styles.photo} resizeMode="cover" />
        </TouchableOpacity>

        {/* 사진 2장 이상일 때만 화살표·dot 표시 */}
        {multi && (
          <>
            <TouchableOpacity style={styles.arrowLeft} onPress={prev}>
              <View style={styles.arrowCircle}><Text style={styles.arrowText}>‹</Text></View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.arrowRight} onPress={next}>
              <View style={styles.arrowCircle}><Text style={styles.arrowText}>›</Text></View>
            </TouchableOpacity>
            {/* 하단 dot 인디케이터 — 현재 위치 흰색, 나머지 반투명 */}
            <View style={styles.dots}>
              {photos.map((_, i) => (
                <View key={i} style={[styles.dot, i === idx && styles.dotActive]} />
              ))}
            </View>
          </>
        )}
      </View>

      {/* ── 팝업 라이트박스 ── */}
      <Modal visible={open} transparent animationType="none" onRequestClose={() => setOpen(false)}>
        <View style={styles.overlay}>
          {/* 배경 탭 → 닫기 (absoluteFill로 전체 덮기) */}
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={() => setOpen(false)}
          />

          {/* 사진 박스 — 배경 터치와 분리 */}
          <View style={[styles.modalBox, { height: modalH }]}>
            <Image
              source={{ uri: photos[idx] }}
              style={[styles.modalImg, { height: modalH }]}
              resizeMode="contain"
            />

            {/* X 닫기 버튼 — 우상단 absolute */}
            <TouchableOpacity style={styles.closeBtn} onPress={() => setOpen(false)}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>

            {/* 팝업 내 화살표 — 사진 2장 이상일 때만 */}
            {multi && (
              <>
                <TouchableOpacity style={styles.arrowLeft} onPress={prev}>
                  <View style={styles.arrowCircle}><Text style={styles.arrowText}>‹</Text></View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.arrowRight} onPress={next}>
                  <View style={styles.arrowCircle}><Text style={styles.arrowText}>›</Text></View>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  empty: { width: '100%', backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 16 },
  // ── 캐러셀 ──
  wrap: { position: 'relative', width: '100%', overflow: 'hidden', backgroundColor: '#E2E8F0' },
  photoTouch: { width: '100%', height: '100%' },
  photo: { width: '100%', height: '100%' },
  arrowLeft: { position: 'absolute', left: 12, top: 0, bottom: 0, justifyContent: 'center', zIndex: 10 },
  arrowRight: { position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center', zIndex: 10 },
  arrowCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.75)', alignItems: 'center', justifyContent: 'center' },
  arrowText: { color: '#F59E0B', fontSize: 26, fontWeight: '800', lineHeight: 30 },
  dots: { position: 'absolute', bottom: 10, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { backgroundColor: '#FFFFFF', width: 8, height: 8, borderRadius: 4 },
  // ── 팝업 ──
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', alignItems: 'center', justifyContent: 'center' },
  modalBox: { width: '90%', borderRadius: 12, overflow: 'hidden', backgroundColor: '#000', position: 'relative' },
  modalImg: { width: '100%' },
  closeBtn: { position: 'absolute', top: 10, right: 10, zIndex: 20, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 16, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  closeText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
