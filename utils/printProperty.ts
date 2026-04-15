import { loadAgentProfile } from '@/app/profile';
import type { Property } from '@/types';

const DEAL_COLOR: Record<string, string> = {
  매매: '#1D4ED8',
  전세: '#16A34A',
  월세: '#DB2777',
};

// 사용자 입력(또는 외부 데이터)이 HTML에 주입될 수 있으므로 escape 처리
const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// 공통 iframe 인쇄 함수
const printViaIframe = (html: string): void => {
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);

  const cleanup = (): void => {
    if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
  };

  iframe.onload = () => {
    const win = iframe.contentWindow;
    if (!win) { cleanup(); return; }
    win.focus();
    win.print();
    setTimeout(cleanup, 1000);
  };

  const doc = iframe.contentDocument;
  if (!doc) { cleanup(); return; }
  doc.open();
  doc.write(html);
  doc.close();
};

// ─────────────────────────────────────────
// 1. 게시용: 사무실 앞 유리창 부착용
//    글씨 크게, 핵심 정보만, A4 꽉 채우기
// ─────────────────────────────────────────
export const printPropertyPost = (property: Property): void => {
  const agent = loadAgentProfile();
  const title = escapeHtml(property.buildingName ?? property.name);
  const priceColor = DEAL_COLOR[property.deal] ?? '#0F172A';

  const html = `
<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"/>
<title>${title} - 오름AI</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Noto Sans KR', sans-serif;
         width: 794px; min-height: 1123px; color: #0F172A;
         display: flex; flex-direction: column; background: #fff; }

  /* 상단 파란 띠 */
  .header-bar { background: #1e3a8a; padding: 24px 32px;
                display: flex; justify-content: space-between; align-items: center; }
  .deal-type { font-size: 36px; font-weight: 900; color: #1e293b; letter-spacing: 6px; }
  .building-name { font-size: 42px; font-weight: 900; color: #0f172a; }
  .addr { font-size: 16px; color: #475569; margin-top: 4px; }

  /* 가격 영역 - 제일 크게 */
  .price-section { padding: 32px; text-align: center;
                   border-bottom: 3px solid #E2E8F0; }
  .price-value { font-size: 80px; font-weight: 900; color: ${priceColor};
                 line-height: 1; }
  .price-label { font-size: 22px; font-weight: 700; color: ${priceColor};
                 margin-bottom: 8px; }

  /* 핵심 스펙 3~4개만 */
  .specs { padding: 24px 32px; flex: 1; }
  .spec-row { display: flex; align-items: center;
              border-bottom: 2px solid #F1F5F9; padding: 16px 0; }
  .spec-row:last-child { border-bottom: none; }
  .spec-label { width: 140px; font-size: 20px; font-weight: 700;
                color: #64748B; }
  .spec-value { font-size: 40px; font-weight: 900; color: #0F172A; }

  /* 하단 연락처 - 크게 */
  .footer-bar { background: #0F172A; padding: 24px 32px;
                display: flex; justify-content: space-between; align-items: center; }
  .office-name { font-size: 24px; font-weight: 900; color: #fff; }
  .agent-name { font-size: 16px; color: #94A3B8; margin-top: 4px; }
  .phone { font-size: 40px; font-weight: 900; color: #60A5FA; }

  @media print { body { padding: 0; } }
</style>
</head><body>

  <!-- 상단 파란 띠: 거래유형 + 건물명 -->
  <div class="header-bar">
    <div>
      <div class="deal-type">${escapeHtml(property.type)} &nbsp; ${escapeHtml(property.deal)}</div>
      <div class="building-name">${title}</div>
      <div class="addr">${escapeHtml(property.addr)}</div>
    </div>
    <div style="color:#BFDBFE;font-size:14px;text-align:right;">
      <div>오름AI</div>
    </div>
  </div>

  <!-- 가격: 제일 크게 -->
  <div class="price-section">
    <div class="price-label">${escapeHtml(property.deal)}</div>
    <div class="price-value">${escapeHtml(property.price)}</div>
  </div>

  <!-- 핵심 스펙 4개만 -->
  <div class="specs">
    <div class="spec-row">
      <div class="spec-label">면적</div>
      <div class="spec-value">${escapeHtml(property.area)}</div>
    </div>
    <div class="spec-row">
      <div class="spec-label">층수</div>
      <div class="spec-value">${escapeHtml(String(property.floor).replace(/층$/, ''))}층 / ${escapeHtml(String(property.totalFloors ?? '—')).replace(/층$/, '')}층</div>
    </div>
    <div class="spec-row">
      <div class="spec-label">방향</div>
      <div class="spec-value">${escapeHtml(property.dir ?? '—')}</div>
    </div>
    <div class="spec-row">
      <div class="spec-label">입주</div>
      <div class="spec-value">${escapeHtml(property.moveInDate ?? '즉시입주')}</div>
    </div>
    <div class="spec-row">
      <div class="spec-label">난방</div>
      <div class="spec-value">${escapeHtml(property.heating ?? '—')}</div>
    </div>
    <div class="spec-row">
      <div class="spec-label">주차</div>
      <div class="spec-value">${escapeHtml(property.parking ?? '—')}</div>
    </div>
  </div>

  <!-- 하단 연락처 크게 -->
  <div class="footer-bar">
    <div>
      <div class="office-name">${escapeHtml(agent.officeName)}</div>
      <div class="agent-name">${escapeHtml(agent.agentName)} ${escapeHtml(agent.position)}</div>
    </div>
    <div class="phone">${escapeHtml(agent.phone)}</div>
  </div>

</body></html>
`;

  printViaIframe(html);
};

// ─────────────────────────────────────────
// 2. 상담용: 손님과 테이블에서 같이 보는 용도
//    상세 정보 전부, 메모란 포함
// ─────────────────────────────────────────
export const printPropertyConsult = (property: Property): void => {
  const agent = loadAgentProfile();
  const title = escapeHtml(property.buildingName ?? property.name);
  const priceColor = DEAL_COLOR[property.deal] ?? '#0F172A';
  const safeMemo = property.memo ? escapeHtml(property.memo) : '';

  const html = `
    <!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"/>
    <title>${title} - 오름AI</title>
    <style>
      body { font-family: 'Noto Sans KR', sans-serif; padding: 32px; max-width: 680px; margin: 0 auto; color: #0F172A; max-height: 277mm; overflow: hidden; }
      .logo { font-size: 18px; font-weight: 800; color: #1D4ED8; margin-bottom: 12px; }
      .badge { display: inline-block; background: #EEF2FF; color: #4338CA; border-radius: 6px; padding: 3px 10px; font-size: 12px; font-weight: 700; margin-right: 6px; }
      .title { font-size: 22px; font-weight: 800; margin: 8px 0 4px; }
      .addr { font-size: 13px; color: #64748B; margin-bottom: 8px; }
      .price { font-size: 24px; font-weight: 800; color: ${priceColor}; }
      .specs { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden; margin-bottom: 16px; }
      .spec-item { display: flex; flex-direction: row; align-items: center; gap: 16px; padding: 8px 16px; border-bottom: 1px solid #E2E8F0; }
      .spec-item:nth-child(odd) { border-right: 1px solid #E2E8F0; }
      .spec-label { font-size: 13px; color: #555; font-weight: 600; margin-bottom: 0; white-space: nowrap; }
      .spec-value { font-size: 15px; font-weight: bold; color: #111; white-space: nowrap; }
      .memo-box { background: #F8FAFC; border-radius: 8px; padding: 14px 16px; margin-bottom: 16px; overflow: hidden; }
      .memo-label { font-size: 11px; color: #94A3B8; font-weight: 600; margin-bottom: 6px; }
      .memo-text { font-size: 15px; color: #334155; line-height: 1.8; }
      .memo-overflow-warning { font-size: 10px; color: #94A3B8; margin-top: 6px; }
      /* 상담 메모란 */
      .consult-memo { margin-top: 20px; page-break-inside: avoid; }
      .consult-memo-label { font-size: 11px; font-weight: 700; color: #94A3B8; margin-bottom: 6px; }
      .consult-memo-line { height: 28px; border-bottom: 1px solid #E2E8F0; margin-bottom: 4px; }
      .footer { margin-top: 16px; font-size: 10px; color: #94A3B8; text-align: right; }
      @media print { body { padding: 16px; } }
    </style>
    </head><body>
      <div class="logo">오름AI</div>
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:16px;border-bottom:2px solid #E2E8F0;padding-bottom:16px;">
        <div>
          <div class="title">${title}</div>
          <div class="addr">${escapeHtml(property.addr)}</div>
          <div style="margin-bottom:6px;">
            <span class="badge">${escapeHtml(property.type)}</span>
            <span class="badge">${escapeHtml(property.deal)}</span>
          </div>
          <div class="price">${escapeHtml(property.deal)} ${escapeHtml(property.price)}</div>
        </div>
        <div style="text-align:right;color:#334155;flex-shrink:0;margin-left:16px;">
          <div style="font-weight:800;font-size:18px;margin-bottom:4px;">${escapeHtml(agent.officeName)}</div>
          <div style="font-size:15px;margin-bottom:4px;">${escapeHtml(agent.agentName)} ${escapeHtml(agent.position)}</div>
          <div style="font-weight:700;font-size:24px;">${escapeHtml(agent.phone)}</div>
        </div>
      </div>

      <div class="specs">
        <div class="spec-item"><div class="spec-label">면적</div><div class="spec-value">${escapeHtml(property.area)}</div></div>
        <div class="spec-item"><div class="spec-label">층수/총층수</div><div class="spec-value">${escapeHtml(property.floor)}/${escapeHtml(String(property.totalFloors ?? '—'))}</div></div>
        <div class="spec-item"><div class="spec-label">방향</div><div class="spec-value">${escapeHtml(property.dir ?? '—')}</div></div>
        <div class="spec-item"><div class="spec-label">입주일</div><div class="spec-value">${escapeHtml(property.moveInDate ?? '—')}</div></div>
        <div class="spec-item"><div class="spec-label">건축연도</div><div class="spec-value">${escapeHtml(String(property.builtYear ?? '—'))}</div></div>
        <div class="spec-item"><div class="spec-label">주차</div><div class="spec-value">${escapeHtml(property.parking ?? '—')}</div></div>
        <div class="spec-item"><div class="spec-label">난방</div><div class="spec-value">${escapeHtml(property.heating ?? '—')}</div></div>
        <div class="spec-item"><div class="spec-label">연락처</div><div class="spec-value">${escapeHtml(property.phone)}</div></div>
      </div>

      ${safeMemo ? `<div class="memo-box"><div class="memo-label">메모</div><div class="memo-text">${safeMemo}</div><div class="memo-overflow-warning">※ 내용이 많으면 글자가 잘려 나갈 수 있습니다.</div></div>` : ''}

      <div class="consult-memo">
        <div class="consult-memo-label">▪ 상담 메모</div>
        <div class="consult-memo-line"></div>
        <div class="consult-memo-line"></div>
      </div>

      <div class="footer">오름AI &nbsp;|&nbsp; ${new Date().toLocaleDateString('ko-KR')}</div>
    </body></html>
  `;

  printViaIframe(html);
};

// 기존 호환성 유지 (상담용으로 연결)
export const printProperty = printPropertyConsult;