import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Notice, useNotices } from '@/hooks/useNotices';

// 화면 표시용 공지 타입(기존 JSX 구조 유지 목적)
type NoticeItem = Notice & {
  date: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  panelW?: number;
};

export default function NotificationPanel({ visible, onClose, panelW = 340 }: Props) {
  const { notices: fetchedNotices } = useNotices();
  // 서버 데이터는 유지하고, UI에서만 "숨김(삭제)" 처리
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => new Set());
  const notices = useMemo<NoticeItem[]>(
    () =>
      fetchedNotices
        .filter((n) => !hiddenIds.has(n.id))
        .map((n) => ({
          ...n,
          // 기존 UI에서 date 필드를 쓰고 있어 created_at을 변환해서 채움
          date: n.created_at.slice(0, 10),
        })),
    [fetchedNotices, hiddenIds],
  );
  const [mounted, setMounted] = useState<boolean>(visible);
  const slideAnim = useRef<Animated.Value>(new Animated.Value(panelW)).current;

  // 삭제 확인 후 삭제 처리
  const handleDelete = (id: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const ok = window.confirm('정말 삭제하시겠습니까?');
      if (ok) setHiddenIds((prev) => new Set(prev).add(id));
    } else {
      Alert.alert(
        '알림 삭제',
        '정말 삭제하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          { text: '삭제', style: 'destructive', onPress: () => setHiddenIds((prev) => new Set(prev).add(id)) },
        ],
      );
    }
  };

  // visible 변화에 맞춰 오른쪽에서 슬라이드 인/아웃 (애니메이션 완료 후 언마운트)
  useEffect(() => {
    // 패널 너비가 바뀌면 "오른쪽 밖" 위치도 함께 갱신
    const offscreenX = panelW;

    if (visible) {
      setMounted(true);
      slideAnim.setValue(offscreenX);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      return;
    }

    // 닫기: 0 → 오른쪽 밖으로 이동 후 언마운트
    Animated.timing(slideAnim, {
      toValue: offscreenX,
      duration: 300,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setMounted(false);
    });
  }, [panelW, slideAnim, visible]);

  if (!mounted) return null;

  return (
    <View style={styles.root}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <Animated.View
        style={[
          styles.panel,
          {
            width: panelW,
            top: 0,
            transform: [{ translateX: slideAnim }],
          },
        ]}>
        {/* 상단 노치/상태바 영역은 SafeAreaView로 패딩 */}
        <SafeAreaView style={styles.safeArea}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.title}>알림</Text>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="닫기">
              <Text style={styles.headerClose}>✕</Text>
            </Pressable>
          </View>

          {/* 알림 목록 */}
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {notices.length === 0 && (
              <Text style={styles.empty}>알림이 없습니다</Text>
            )}
            {notices.map((n) => (
              <View key={n.id} style={styles.item}>
                <View style={styles.itemTop}>
                  <View style={[styles.badge, n.type === 'event' && styles.badgeEvent]}>
                    <Text style={[styles.badgeTxt, n.type === 'event' && styles.badgeTxtEvent]}>
                      {n.type === 'notice' ? '공지' : '이벤트'}
                    </Text>
                  </View>
                  <Text style={styles.itemDate}>{n.date}</Text>
                  {/* 중개사는 삭제만 가능 */}
                  <Pressable onPress={() => handleDelete(n.id)} style={styles.delBtn}>
                    <Text style={styles.delTxt}>삭제</Text>
                  </Pressable>
                </View>
                <Text style={styles.itemTitle}>{n.title}</Text>
                <Text style={styles.itemBody}>{n.body}</Text>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  // 패널: 상단은 top 0 + 내부 SafeAreaView로 안전 영역 처리
  panel: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    // 패널 배경: 앱 기본 배경 톤에 맞춤
    backgroundColor: '#F0F4FF',
  },
  safeArea: { flex: 1 },
  header:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#ddd', backgroundColor: '#fff', height: 64 },
  title:         { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  headerClose:   { fontSize: 22, color: '#666', paddingHorizontal: 4 },
  list:          { flex: 1, padding: 16 },
  empty:         { textAlign: 'center', color: '#94A3B8', marginTop: 40, fontSize: 14 },
  item:          { borderBottomWidth: 0.5, borderBottomColor: '#F1F5F9', paddingVertical: 14, gap: 6 },
  itemTop:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge:         { backgroundColor: '#EFF6FF', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 },
  badgeEvent:    { backgroundColor: '#FFF7ED' },
  badgeTxt:      { fontSize: 11, fontWeight: '700', color: '#1D4ED8' },
  badgeTxtEvent: { color: '#C2410C' },
  itemDate:      { fontSize: 11, color: '#94A3B8', flex: 1 },
  delBtn:        { padding: 2 },
  delTxt:        { fontSize: 11, color: '#EF4444' },
  itemTitle:     { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  itemBody:      { fontSize: 13, color: '#475569', lineHeight: 20 },
});
