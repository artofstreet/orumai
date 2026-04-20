import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/utils/supabase';

export type Notice = {
  id: string;
  title: string;
  body: string;
  type: 'notice' | 'event';
  created_at: string;
};

/** Supabase `notices` 테이블 행(스네이크 케이스 컬럼 가정) */
interface NoticeRow {
  id: string;
  title: string;
  body: string;
  type: 'notice' | 'event';
  created_at: string;
}

function rowToNotice(row: NoticeRow): Notice {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    type: row.type,
    created_at: row.created_at,
  };
}

export interface UseNoticesReturn {
  notices: Notice[];
  loading: boolean;
  error: string | null;
  getNoticeById: (id: string) => Notice | undefined;
}

export function useNotices(): UseNoticesReturn {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 마운트 시 목록 조회 (최신 공지 우선)
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('notices')
        .select('*')
        .order('created_at', { ascending: false });
      if (cancelled) return;
      setLoading(false);
      if (fetchError) {
        setError(fetchError.message);
        return;
      }
      const rows = (data ?? []) as NoticeRow[];
      setNotices(rows.map(rowToNotice));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const getNoticeById = useCallback((id: string) => notices.find((n) => n.id === id), [notices]);

  return {
    notices,
    loading,
    error,
    getNoticeById,
  };
}
