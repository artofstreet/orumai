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

export const printProperty = (property: Property): void => {
  const agent = loadAgentProfile();
  const title = escapeHtml(property.buildingName ?? property.name);
  const priceColor = DEAL_COLOR[property.deal] ?? '#0F172A';
  const photos = (property.photos ?? []).slice(0, 4);

  const photoHtml = photos.length > 0
    ? `<div style="display:flex;gap:8px;margin-bottom:16px;">
        ${photos.map((url) => `<img src="${escapeHtml(url)}" style="width:calc(25% - 6px);height:120px;object-fit:cover;border-radius:6px;" />`).join('')}
      </div>`
    : '';

  const safeAddr = escapeHtml(property.addr);
  const safeType = escapeHtml(property.type);
  const safeDeal = escapeHtml(property.deal);
  const safePrice = escapeHtml(property.price);
  const safeArea = escapeHtml(property.area);
  const safeFloor = escapeHtml(property.floor);
  const safeTotalFloors = escapeHtml(String(property.totalFloors ?? '—'));
  const safeDir = escapeHtml(property.dir ?? '—');
  const safeMoveInDate = escapeHtml(property.moveInDate ?? '—');
  const safeBuiltYear = escapeHtml(String(property.builtYear ?? '—'));
  const safeParking = escapeHtml(property.parking ?? '—');
  const safeHeating = escapeHtml(property.heating ?? '—');
  const safePhone = escapeHtml(property.phone);
  const safeMemo = property.memo ? escapeHtml(property.memo) : '';

  const safeOfficeName = escapeHtml(agent.officeName);
  const safeAgentName = escapeHtml(agent.agentName);
  const safePosition = escapeHtml(agent.position);
  const safeAgentPhone = escapeHtml(agent.phone);

  const html = `
    <!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"/>
    <title>${title} - 오름AI</title>
    <style>
      body { font-family: 'Noto Sans KR', sans-serif; padding: 32px; max-width: 680px; margin: 0 auto; color: #0F172A; }
      .logo { font-size: 18px; font-weight: 800; color: #1D4ED8; margin-bottom: 12px; }
      .badge { display: inline-block; background: #EEF2FF; color: #4338CA; border-radius: 6px; padding: 3px 10px; font-size: 12px; font-weight: 700; margin-right: 6px; }
      .title { font-size: 22px; font-weight: 800; margin: 8px 0 4px; }
      .addr { font-size: 13px; color: #64748B; margin-bottom: 8px; }
      .price { font-size: 24px; font-weight: 800; color: ${priceColor}; }
      .specs { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden; margin-bottom: 16px; }
      .spec-item { padding: 8px 16px; border-bottom: 1px solid #E2E8F0; }
      .spec-item:nth-child(odd) { border-right: 1px solid #E2E8F0; }
      .spec-label { font-size: 10px; color: #94A3B8; font-weight: 600; margin-bottom: 2px; }
      .spec-value { font-size: 13px; font-weight: 700; }
      .memo-box { background: #F8FAFC; border-radius: 8px; padding: 14px 16px; }
      .memo-label { font-size: 11px; color: #94A3B8; font-weight: 600; margin-bottom: 6px; }
      .memo-text { font-size: 15px; color: #334155; line-height: 1.8; }
      .footer { margin-top: 24px; font-size: 11px; color: #CBD5E1; text-align: right; }
      @media print { body { padding: 16px; } }
    </style>
    </head><body>
      <div class="logo">오름AI</div>
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:16px;border-bottom:2px solid #E2E8F0;padding-bottom:16px;">
        <div>
          <div class="title">${title}</div>
          <div class="addr">📍 ${safeAddr}</div>
          <div style="margin-bottom:6px;">
            <span class="badge">${safeType}</span>
            <span class="badge">${safeDeal}</span>
          </div>
          <div class="price">${safeDeal} ${safePrice}</div>
        </div>
        <div style="text-align:right;color:#334155;flex-shrink:0;margin-left:16px;">
          <div style="font-weight:800;font-size:18px;margin-bottom:4px;">${safeOfficeName}</div>
          <div style="font-size:15px;margin-bottom:4px;">${safeAgentName} ${safePosition}</div>
          <div style="font-weight:700;font-size:24px;">${safeAgentPhone}</div>
        </div>
      </div>
      ${photoHtml}
      <div class="specs">
        <div class="spec-item"><div class="spec-label">면적</div><div class="spec-value">${safeArea}</div></div>
        <div class="spec-item"><div class="spec-label">층수/총층수</div><div class="spec-value">${safeFloor}/${safeTotalFloors}</div></div>
        <div class="spec-item"><div class="spec-label">방향</div><div class="spec-value">${safeDir}</div></div>
        <div class="spec-item"><div class="spec-label">입주일</div><div class="spec-value">${safeMoveInDate}</div></div>
        <div class="spec-item"><div class="spec-label">건축연도</div><div class="spec-value">${safeBuiltYear}</div></div>
        <div class="spec-item"><div class="spec-label">주차</div><div class="spec-value">${safeParking}</div></div>
        <div class="spec-item"><div class="spec-label">난방</div><div class="spec-value">${safeHeating}</div></div>
        <div class="spec-item"><div class="spec-label">연락처</div><div class="spec-value">${safePhone}</div></div>
      </div>
      ${safeMemo ? `<div class="memo-box"><div class="memo-label">메모</div><div class="memo-text">${safeMemo}</div></div>` : ''}
      <div class="footer">오름AI · ${new Date().toLocaleDateString('ko-KR')}</div>
    </body></html>
  `;

  // iframe으로 인쇄 → 탭/창 전환 없음 → 포커스 유지
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);

  const cleanup = (): void => {
    if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
  };

  // 문서 로딩이 끝난 뒤 인쇄를 실행 (브라우저별 타이밍 이슈 완화)
  iframe.onload = () => {
    const win = iframe.contentWindow;
    if (!win) {
      cleanup();
      throw new Error('인쇄 프레임 생성 실패');
    }
    win.focus();
    win.print();
    setTimeout(cleanup, 1000);
  };

  const doc = iframe.contentDocument;
  if (!doc) {
    cleanup();
    throw new Error('인쇄 프레임 생성 실패');
  }
  doc.open();
  doc.write(html);
  doc.close();
};