import React, { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

// 플랫폼별 그림자 유틸
const makeShadow = (h: number, r: number, o: number, elev: number) =>
  Platform.OS === 'web'
    ? ({ boxShadow: `0 ${h}px ${r * 2}px rgba(0,0,0,${o})` } as object)
    : { shadowColor: '#000' as const, shadowOffset: { width: 0, height: h }, shadowOpacity: o, shadowRadius: r, elevation: elev };

// TODO-DB: 나중에 Supabase로 교체
export type Notice = {
  id: string;
  type: 'notice' | 'event';
  title: string;
  body: string;
  date: string;
};

const DUMMY_NOTICES: Notice[] = [
  { id: '1', type: 'notice', title: '앱 업데이트 안내',  body: '오름AI v2.0이 출시되었습니다. 새로운 AI 광고문구 기능을 확인해보세요!', date: '2026-04-09' },
  { id: '2', type: 'event',  title: '봄 프로모션 🌸',   body: 'PRO 플랜 첫 달 50% 할인! 4월 30일까지 적용됩니다.',                   date: '2026-04-07' },
  { id: '3', type: 'notice', title: '서버 점검 안내',    body: '4월 15일 새벽 2시~4시 서버 점검이 있을 예정입니다.',                  date: '2026-04-05' },
];

type Props = {
  visible: boolean;
  onClose: () => void;
  panelW?: number;
};

export default function NotificationPanel({ visible, onClose, panelW = 340 }: Props) {
  const [notices, setNotices] = useState<Notice[]>(DUMMY_NOTICES);

  if (!visible) return null;

  // 삭제 확인 후 삭제 처리
  const handleDelete = (id: string) => {
    if (Platform.OS === 'web') {
      const ok = window.confirm('정말 삭제하시겠습니까?');
      if (ok) setNotices((prev) => prev.filter((n) => n.id !== id));
    } else {
      Alert.alert(
        '알림 삭제',
        '정말 삭제하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          { text: '삭제', style: 'destructive', onPress: () => setNotices((prev) => prev.filter((n) => n.id !== id)) },
        ],
      );
    }
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.panel, { width: panelW }]}>

        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>알림</Text>
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay:       { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999, flexDirection: 'row', justifyContent: 'flex-end' },
  backdrop:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  panel:         { backgroundColor: '#F0F4FF', height: '100%', ...makeShadow(0, 12, 0.2, 8) },
  header:        { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 0.5, borderBottomColor: '#E2E8F0' },
  title:         { fontSize: 18, fontWeight: '800', color: '#0F172A' },
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