import { loadAgentProfile } from '@/app/profile';
import type { Customer, Property } from '@/types';

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// 층 표시: "25층/35층" → "25/35"
const formatFloor = (floor: string, total: string | number | undefined): string => {
  const f = String(floor).replace('층', '');
  const t = String(total ?? '—').replace('층', '');
  return `${escapeHtml(f)}/${escapeHtml(t)}`;
};

// 날짜 2줄: "2026-05-01" → 위: 2026 / 아래: 05-01
const formatDateTwoLine = (dateStr: string | undefined): string => {
  if (!dateStr || dateStr === '—') return '—';
  const s = dateStr.slice(0, 10);
  const parts = s.split('-');
  if (parts.length >= 3) {
    return `<span style="display:block">${escapeHtml(parts[0])}</span>`
      + `<span style="display:block">${escapeHtml(parts[1])}-${escapeHtml(parts[2])}</span>`;
  }
  return escapeHtml(s);
};

// 가격 표기 통일
// 매매: 2.8억 / 전세: 8000만 / 월세: 보200 / 월30
const formatPrice = (deal: string, price: string): string => {
  const p = price.replace(/원$/, '').trim();

  if (deal === '월세') {
    const slashIdx = p.indexOf('/');
    if (slashIdx !== -1) {
      const deposit = p.slice(0, slashIdx).trim().replace(/만$/, '');
      const monthly = p.slice(slashIdx + 1).trim()
        .replace(/^월\s*/, '')
        .replace(/만$/, '');
      return `보${deposit} / 월${monthly}`;
    }
    return p;
  }

  // 매매/전세: 원만 제거
  return p;
};

const printViaIframe = (html: string): void => {
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);

  const cleanup = (): void => {
    if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
  };

  const win = iframe.contentWindow;
  const doc = iframe.contentDocument;
  if (!win || !doc) {
    cleanup();
    throw new Error('인쇄 프레임 생성 실패');
  }

  win.addEventListener('afterprint', cleanup, { once: true });
  doc.open();
  doc.write(html);
  doc.close();
  win.focus();
  win.print();
};

export const printPropertyList = (properties: Property[]): void => {
  const agent = loadAgentProfile();

  // 등록일 최신순 정렬
  const sorted = [...properties].sort((a, b) => {
    const da = a.createdAt ?? '';
    const db = b.createdAt ?? '';
    return db.localeCompare(da);
  });

  const rows = sorted.map((p) => `
    <tr>
      <td class="col-name">${escapeHtml(p.buildingName ?? p.name)}</td>
      <td class="col-addr">${escapeHtml(p.addr)}</td>
      <td>${escapeHtml(p.type)}</td>
      <td>
        <span style="display:block;font-weight:400;color:#64748B;font-size:10px;">${escapeHtml(p.deal)}</span>
        <span style="display:block;font-weight:700;color:#DB2777;">${escapeHtml(formatPrice(p.deal, p.price))}</span>
      </td>
      <td>${escapeHtml(p.area)}</td>
      <td>${formatFloor(p.floor, p.totalFloors)}</td>
      <td>${formatDateTwoLine(p.moveInDate)}</td>
      <td>${escapeHtml(p.phone)}</td>
      <td>${escapeHtml(p.createdAt?.slice(0, 10) ?? '—')}</td>
    </tr>
  `).join('');

  // 하단 메모란: 빈 줄 4개
  const memoRows = Array(4).fill(`
    <tr class="memo-row">
      <td colspan="9">&nbsp;</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8"/>
      <title>매물 목록 - 오름AI</title>
      <style>
        body { font-family: 'Noto Sans KR', sans-serif; padding: 24px; color: #0F172A; font-size: 12px; max-width: 794px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 16px; border-bottom: 2px solid #CBD5E1; padding-bottom: 12px; }
        .logo { font-size: 18px; font-weight: 800; color: #1D4ED8; }
        .agent { text-align: right; font-size: 12px; color: #334155; }
        .agent strong { font-size: 15px; }
        h2 { font-size: 17px; font-weight: 900; margin: 0 0 12px; color: #0F172A; letter-spacing: -0.3px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #F1F5F9; color: #64748B; font-size: 11px; font-weight: 700; padding: 7px 8px; text-align: left; border-bottom: 2px solid #CBD5E1; }
        td { padding: 8px 8px; border-bottom: 1px solid #E2E8F0; font-size: 12px; color: #1E293B; vertical-align: top; line-height: 1.5; }
        tbody tr:nth-child(odd) td { background: #FAFBFC; }
        tbody tr:nth-child(even) td { background: #FFFFFF; }
        .col-name { max-width: 80px; word-break: keep-all; white-space: normal; }
        .col-addr { word-break: keep-all; min-width: 120px; max-width: 160px; white-space: normal; }
        .memo-section { margin-top: 20px; }
        .memo-label { font-size: 11px; font-weight: 700; color: #94A3B8; margin-bottom: 6px; letter-spacing: 0.5px; }
        .memo-row td { height: 28px; border-bottom: 1px solid #E2E8F0; background: #FFFFFF !important; }
        .footer { margin-top: 16px; font-size: 10px; color: #94A3B8; text-align: right; }
        .footer-notice { margin-top: 8px; font-size: 9px; color: #CBD5E1; text-align: center; }
        @media print {
          body { padding: 12px; }
          tbody tr:nth-child(odd) td { background: #FAFBFC !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">오름AI</div>
          <h2>매물 목록 (총 ${properties.length}건)</h2>
        </div>
        <div class="agent">
          <div><strong>${escapeHtml(agent.officeName)}</strong></div>
          <div>${escapeHtml(agent.agentName)} ${escapeHtml(agent.position)}</div>
          <div>${escapeHtml(agent.phone)}</div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>건물명</th><th>주소</th><th>종류</th><th>가격</th>
            <th>면적</th><th>층/총층</th><th>입주일</th><th>연락처</th><th>등록일</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <div class="memo-section">
        <div class="memo-label">▪ 상담 메모</div>
        <table>
          <tbody>${memoRows}</tbody>
        </table>
      </div>

      <div class="footer-notice">본 자료는 오름AI로 관리되며 외부 무단 배포를 금합니다.</div>
      <div class="footer">오름AI &nbsp;|&nbsp; ${new Date().toLocaleDateString('ko-KR')} &nbsp;|&nbsp; 1/1</div>
    </body>
    </html>
  `;

  printViaIframe(html);
};

export const printCustomerList = (customers: Customer[]): void => {
  const agent = loadAgentProfile();

  const rows = customers.map((c) => `
    <tr>
      <td>${escapeHtml(c.name)}</td>
      <td>${escapeHtml(c.phone)}</td>
      <td>${escapeHtml(c.memo.length > 40 ? c.memo.slice(0, 40) + '...' : c.memo)}</td>
      <td>${escapeHtml(c.createdAt?.slice(0, 10) ?? '—')}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8"/>
      <title>고객 목록 - 오름AI</title>
      <style>
        body { font-family: 'Noto Sans KR', sans-serif; padding: 24px; color: #0F172A; font-size: 12px; max-width: 794px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 16px; border-bottom: 2px solid #CBD5E1; padding-bottom: 12px; }
        .logo { font-size: 18px; font-weight: 800; color: #1D4ED8; }
        .agent { text-align: right; font-size: 12px; color: #334155; }
        .agent strong { font-size: 15px; }
        h2 { font-size: 17px; font-weight: 900; margin: 0 0 12px; color: #0F172A; letter-spacing: -0.3px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #F1F5F9; color: #64748B; font-size: 11px; font-weight: 700; padding: 7px 8px; text-align: left; border-bottom: 2px solid #CBD5E1; }
        td { padding: 8px 8px; border-bottom: 1px solid #E2E8F0; font-size: 12px; color: #1E293B; line-height: 1.5; }
        tbody tr:nth-child(odd) td { background: #FAFBFC; }
        tbody tr:nth-child(even) td { background: #FFFFFF; }
        .footer { margin-top: 16px; font-size: 10px; color: #94A3B8; text-align: right; }
        @media print {
          body { padding: 12px; }
          tbody tr:nth-child(odd) td { background: #FAFBFC !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">오름AI</div>
          <h2>고객 목록 (총 ${customers.length}건)</h2>
        </div>
        <div class="agent">
          <div><strong>${escapeHtml(agent.officeName)}</strong></div>
          <div>${escapeHtml(agent.agentName)} ${escapeHtml(agent.position)}</div>
          <div>${escapeHtml(agent.phone)}</div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>이름</th><th>연락처</th><th>메모</th><th>등록일</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="footer">오름AI &nbsp;|&nbsp; ${new Date().toLocaleDateString('ko-KR')} &nbsp;|&nbsp; 1/1</div>
    </body>
    </html>
  `;

  printViaIframe(html);
};