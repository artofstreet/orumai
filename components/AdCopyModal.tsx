import * as Clipboard from 'expo-clipboard';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import type { Property } from '@/types';
import { generateAdCopy, type AdCopyResult } from '@/utils/generateAdCopy';

// 탭 목록
const TABS = [
  { key: 'naver', label: '네이버', emoji: '🏠' },
  { key: 'kakao', label: '카카오', emoji: '💬' },
  { key: 'sns',   label: 'SNS',   emoji: '📸' },
] as const;

type TabKey = typeof TABS[number]['key']; // 'naver' | 'kakao' | 'sns'

interface AdCopyModalProps {
  visible: boolean;    // 모달 표시 여부
  property: Property;  // 대상 매물
  onClose: () => void; // 닫기 콜백
}

export default function AdCopyModal({ visible, property, onClose }: AdCopyModalProps) {
  const [loading, setLoading]     = useState<boolean>(false);       // 생성 중 여부
  const [result, setResult]       = useState<AdCopyResult | null>(null); // 생성 결과
  const [error, setError]         = useState<string>('');           // 오류 메시지
  const [activeTab, setActiveTab] = useState<TabKey>('naver');      // 현재 탭
  const [copied, setCopied]       = useState<boolean>(false);       // 복사 완료 표시

  // 모달 열릴 때마다 자동 생성
  useEffect(() => {
    if (!visible) return;
    setResult(null);
    setError('');
    setCopied(false);
    setActiveTab('naver');
    void handleGenerate();
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  // Claude API 호출
  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError('');
    setCopied(false);
    try {
      const data = await generateAdCopy(property);
      setResult(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '알 수 없는 오류';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [property]);

  // 현재 탭 텍스트 클립보드 복사
  const handleCopy = useCallback(async () => {
    if (!result) return;
    await Clipboard.setStringAsync(result[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // 2초 후 초기화
  }, [result, activeTab]);

  const activeText = result ? result[activeTab] : ''; // 현재 탭 문구

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      {/* 반투명 배경 — 탭 밖 누르면 닫힘 */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.sheet}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>✨ AI 광고문구</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* 탭 */}
        <View style={styles.tabRow}>
          {TABS.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tab, activeTab === t.key && styles.tabActive]}
              onPress={() => { setActiveTab(t.key); setCopied(false); }}>
              <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>
                {t.emoji} {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 본문 */}
        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
          {loading && (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#F97316" />
              <Text style={styles.loadingText}>Claude가 광고문구를 생성 중이에요...</Text>
            </View>
          )}
          {!loading && error !== '' && (
            <View style={styles.center}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}
          {!loading && result && (
            <Text style={styles.copyText}>{activeText}</Text>
          )}
        </ScrollView>

        {/* 하단 버튼 */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.footerBtn, styles.footerBtnSecondary]}
            onPress={handleGenerate}
            disabled={loading}>
            <Text style={styles.footerBtnSecondaryText}>🔄 다시 생성</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.footerBtn, styles.footerBtnPrimary, (!result || loading) && styles.footerBtnDisabled]}
            onPress={handleCopy}
            disabled={!result || loading}>
            <Text style={styles.footerBtnPrimaryText}>{copied ? '✅ 복사됨!' : '📋 복사'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop:               { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet:                  { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 32, maxHeight: '75%' },
  header:                 { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerTitle:            { fontSize: 17, fontWeight: '700', color: '#0F172A' },
  closeBtn:               { padding: 4 },
  closeBtnText:           { fontSize: 18, color: '#94A3B8' },
  tabRow:                 { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, gap: 8 },
  tab:                    { flex: 1, paddingVertical: 8, borderRadius: 8, backgroundColor: '#F8FAFC', alignItems: 'center' },
  tabActive:              { backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#F97316' },
  tabText:                { fontSize: 13, fontWeight: '600', color: '#94A3B8' },
  tabTextActive:          { color: '#F97316' },
  body:                   { maxHeight: 260, marginTop: 4 },
  bodyContent:            { padding: 20 },
  center:                 { alignItems: 'center', paddingVertical: 32, gap: 12 },
  loadingText:            { fontSize: 14, color: '#64748B', textAlign: 'center' },
  errorText:              { fontSize: 14, color: '#DC2626', textAlign: 'center' },
  copyText:               { fontSize: 15, color: '#1E293B', lineHeight: 24 },
  footer:                 { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 12 },
  footerBtn:              { flex: 1, paddingVertical: 13, borderRadius: 10, alignItems: 'center' },
  footerBtnSecondary:     { backgroundColor: '#F1F5F9' },
  footerBtnPrimary:       { backgroundColor: '#F97316' },
  footerBtnDisabled:      { opacity: 0.4 },
  footerBtnSecondaryText: { fontSize: 15, fontWeight: '600', color: '#475569' },
  footerBtnPrimaryText:   { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});