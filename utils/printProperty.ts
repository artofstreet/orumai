import { loadAgentProfile } from '@/app/profile';
import type { Property } from '@/types';

const DEAL_COLOR: Record<string, string> = {
  매매: '#1D4ED8',
  전세: '#16A34A',
  월세: '#DB2777',
};

export const printProperty = (property: Property): void => {
  const agent = loadAgentProfile();
  const title = property.buildingName ?? property.name;
  const priceColor = DEAL_COLOR[property.deal] ?? '#0F172A';
  const photos = (property.photos ?? []).slice(0, 4);

  const photoHtml = photos.length > 0
    ? `<div style="display:flex;gap:8px;margin-bottom:16px;">
        ${photos.map(url => `<img src="${url}" style="width:calc(25% - 6px);height:120px;object-fit:cover;border-radius:6px;" />`).join('')}
      </div>`
    : '';

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
          <div class="addr">📍 ${property.addr}</div>
          <div style="margin-bottom:6px;">
            <span class="badge">${property.type}</span>
            <span class="badge">${property.deal}</span>
          </div>
          <div class="price">${property.deal} ${property.price}</div>
        </div>
        <div style="text-align:right;color:#334155;flex-shrink:0;margin-left:16px;">
          <div style="font-weight:800;font-size:18px;margin-bottom:4px;">${agent.officeName}</div>
          <div style="font-size:15px;margin-bottom:4px;">${agent.agentName} ${agent.position}</div>
          <div style="font-weight:700;font-size:24px;">${agent.phone}</div>
        </div>
      </div>
      ${photoHtml}
      <div class="specs">
        <div class="spec-item"><div class="spec-label">면적</div><div class="spec-value">${property.area}</div></div>
        <div class="spec-item"><div class="spec-label">층수/총층수</div><div class="spec-value">${property.floor}/${property.totalFloors ?? '—'}</div></div>
        <div class="spec-item"><div class="spec-label">방향</div><div class="spec-value">${property.dir ?? '—'}</div></div>
        <div class="spec-item"><div class="spec-label">입주일</div><div class="spec-value">${property.moveInDate ?? '—'}</div></div>
        <div class="spec-item"><div class="spec-label">건축연도</div><div class="spec-value">${property.builtYear ?? '—'}</div></div>
        <div class="spec-item"><div class="spec-label">주차</div><div class="spec-value">${property.parking ?? '—'}</div></div>
        <div class="spec-item"><div class="spec-label">난방</div><div class="spec-value">${property.heating ?? '—'}</div></div>
        <div class="spec-item"><div class="spec-label">연락처</div><div class="spec-value">${property.phone}</div></div>
      </div>
      ${property.memo ? `<div class="memo-box"><div class="memo-label">메모</div><div class="memo-text">${property.memo}</div></div>` : ''}
      <div class="footer">오름AI · ${new Date().toLocaleDateString('ko-KR')}</div>
    </body></html>
  `;

  // iframe으로 인쇄 → 탭/창 전환 없음 → 포커스 유지
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  iframe.contentDocument!.write(html);
  iframe.contentDocument!.close();
  iframe.contentWindow!.focus();
  iframe.contentWindow!.print();
  setTimeout(() => document.body.removeChild(iframe), 1000);
};