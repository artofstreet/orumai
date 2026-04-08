import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

// TODO-DB: 나중에 Supabase로 교체
export type Notice = {
  id: string;
  type: 'notice' | 'event';
  title: string;
  body: string;
  date: string;
};

const DUMMY_NOTICES: Notice[] = [
  { id: '1', type: 'notice', title: '앱 업데이트 안내', body: '오름AI v2.0이 출시되었습니다. 새로운 AI 광고문구 기능을 확인해보세요!', date: '2026-04-09' },
  { id: '2', type: 'event', title: '봄 프로모션 🌸', body: 'PRO 플랜 첫 달 50% 할인! 4월 30일까지 적용됩니다.', date: '2026-04-07' },
  { id: '3', type: 'notice', title: '서버 점검 안내', body: '4월 15일 새벽 2시~4시 서버 점검이 있을 예정입니다.', date: '2026-04-05' },
];

// 관리자 여부 — TODO-AUTH: 나중에 실제 인증으로 교체
const IS_ADMIN = true;

type Props = {
  visible: boolean;
  onClose: () => void;
  panelW?: number;  // ← _layout에서 받아오는 너비
};

export default function NotificationPanel({ visible, onClose, panelW = 340 }: Props) {
  const [notices, setNotices] = useState<Notice[]>(DUMMY_NOTICES);
  const [isWriting, setIsWriting] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newType, setNewType] = useState<'notice' | 'event'>('notice');

  if (!visible) return null;

  const handleAdd = () => {
    if (!newTitle.trim() || !newBody.trim()) return;
    const item: Notice = {
      id: Date.now().toString(),
      type: newType,
      title: newTitle.trim(),
      body: newBody.trim(),
      date: new Date().toISOString().slice(0, 10),
    };
    setNotices([item, ...notices]);
    setNewTitle('');
    setNewBody('');
    setIsWriting(false);
  };

  const handleDelete = (id: string) => {
    setNotices(notices.filter((n) => n.id !== id));
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.panel, { width: panelW }]}>

        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>알림</Text>
          <View style={styles.headerRight}>
            {IS_ADMIN && !isWriting && (
              <Pressable style={styles.writeBtn} onPress={() => setIsWriting(true)}>
                <Text style={styles.writeBtnTxt}>+ 작성</Text>
              </Pressable>
            )}
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeTxt}>✕</Text>
            </Pressable>
          </View>
        </View>

        {/* 글쓰기 폼 (관리자) */}
        {isWriting && (
          <View style={styles.writeForm}>
            <View style={styles.typeRow}>
              <Pressable
                style={[styles.typeBtn, newType === 'notice' && styles.typeBtnActive]}
                onPress={() => setNewType('notice')}>
                <Text style={[styles.typeBtnTxt, newType === 'notice' && styles.typeBtnTxtActive]}>공지</Text>
              </Pressable>
              <Pressable
                style={[styles.typeBtn, newType === 'event' && styles.typeBtnActive]}
                onPress={() => setNewType('event')}>
                <Text style={[styles.typeBtnTxt, newType === 'event' && styles.typeBtnTxtActive]}>이벤트</Text>
              </Pressable>
            </View>
            <TextInput
              style={styles.formInput}
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="제목"
              placeholderTextColor="#94A3B8"
            />
            {Platform.OS === 'web' ? (
              <textarea
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                placeholder="내용을 입력하세요"
                style={{ ...webTextarea }}
              />
            ) : (
              <TextInput
                style={[styles.formInput, { minHeight: 80, textAlignVertical: 'top' }]}
                value={newBody}
                onChangeText={setNewBody}
                placeholder="내용을 입력하세요"
                placeholderTextColor="#94A3B8"
                multiline
                scrollEnabled={false}
              />
            )}
            <View style={styles.formBtns}>
              <Pressable style={styles.cancelBtn} onPress={() => setIsWriting(false)}>
                <Text style={styles.cancelBtnTxt}>취소</Text>
              </Pressable>
              <Pressable style={styles.submitBtn} onPress={handleAdd}>
                <Text style={styles.submitBtnTxt}>등록</Text>
              </Pressable>
            </View>
          </View>
        )}

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
                {IS_ADMIN && (
                  <Pressable onPress={() => handleDelete(n.id)} style={styles.delBtn}>
                    <Text style={styles.delTxt}>삭제</Text>
                  </Pressable>
                )}
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

const webTextarea = {
  width: '100%',
  minHeight: 80,
  padding: 10,
  fontSize: 14,
  border: '1px solid #E2E8F0',
  borderRadius: 8,
  resize: 'none' as const,
  backgroundColor: '#F8FAFC',
  color: '#0F172A',
  boxSizing: 'border-box' as const,
  fontFamily: 'inherit',
  outline: 'none',
};

const NAVY = '#1E3A5F';

const styles = StyleSheet.create({
  overlay:          { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999, flexDirection: 'row', justifyContent: 'flex-end' },
  backdrop:         { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  panel:            { backgroundColor: '#fff', height: '100%', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: -2, height: 0 } },
  header:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 0.5, borderBottomColor: '#E2E8F0' },
  title:            { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  headerRight:      { flexDirection: 'row', alignItems: 'center', gap: 8 },
  writeBtn:         { backgroundColor: NAVY, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 5 },
  writeBtnTxt:      { color: '#fff', fontSize: 12, fontWeight: '700' },
  closeBtn:         { padding: 4 },
  closeTxt:         { fontSize: 16, color: '#64748B' },
  writeForm:        { padding: 16, borderBottomWidth: 0.5, borderBottomColor: '#E2E8F0', gap: 8 },
  typeRow:          { flexDirection: 'row', gap: 8 },
  typeBtn:          { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 6, paddingHorizontal: 14, paddingVertical: 5 },
  typeBtnActive:    { backgroundColor: NAVY, borderColor: NAVY },
  typeBtnTxt:       { fontSize: 13, color: '#64748B' },
  typeBtnTxtActive: { color: '#fff', fontWeight: '700' },
  formInput:        { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 10, fontSize: 14, color: '#0F172A', backgroundColor: '#F8FAFC' },
  formBtns:         { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
  cancelBtn:        { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 6, paddingHorizontal: 16, paddingVertical: 6 },
  cancelBtnTxt:     { fontSize: 13, color: '#64748B' },
  submitBtn:        { backgroundColor: NAVY, borderRadius: 6, paddingHorizontal: 16, paddingVertical: 6 },
  submitBtnTxt:     { color: '#fff', fontSize: 13, fontWeight: '700' },
  list:             { flex: 1, padding: 16 },
  empty:            { textAlign: 'center', color: '#94A3B8', marginTop: 40, fontSize: 14 },
  item:             { borderBottomWidth: 0.5, borderBottomColor: '#F1F5F9', paddingVertical: 14, gap: 6 },
  itemTop:          { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge:            { backgroundColor: '#EFF6FF', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 },
  badgeEvent:       { backgroundColor: '#FFF7ED' },
  badgeTxt:         { fontSize: 11, fontWeight: '700', color: '#1D4ED8' },
  badgeTxtEvent:    { color: '#C2410C' },
  itemDate:         { fontSize: 11, color: '#94A3B8', flex: 1 },
  delBtn:           { padding: 2 },
  delTxt:           { fontSize: 11, color: '#EF4444' },
  itemTitle:        { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  itemBody:         { fontSize: 13, color: '#475569', lineHeight: 20 },
});