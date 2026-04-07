import { loadAgentProfile } from '@/app/profile';
import type { Customer, Property } from '@/types';

// 매물 목록 전체 인쇄
export const printPropertyList = (properties: Property[]): void => {
  const agent = loadAgentProfile();

  const rows = properties.map((p) => `
    <tr>
      <td>${p.buildingName ?? p.name}</td>
      <td>${p.addr}</td>
      <td>${p.type}</td>
      <td>${p.deal}</td>
      <td style="font-weight:700;color:#DB2777;">${p.price}</td>
      <td>${p.area}</td>
      <td>${p.floor}/${p.totalFloors ?? '—'}</td>
      <td>${p.moveInDate ?? '—'}</td>
      <td>${p.phone}</td>
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
        .header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 16px; border-bottom: 2px solid #E2E8F0; padding-bottom: 12px; }
        .logo { font-size: 18px; font-weight: 800; color: #1D4ED8; }
        .agent { text-align: right; font-size: 12px; color: #334155; }
        .agent strong { font-size: 15px; }
        h2 { font-size: 16px; font-weight: 800; margin: 0 0 12px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #F1F5F9; color: #64748B; font-size: 10px; font-weight: 700; padding: 6px 8px; text-align: left; border-bottom: 1px solid #E2E8F0; }
        td { padding: 7px 8px; border-bottom: 1px solid #F1F5F9; font-size: 11px; color: #1E293B; }
        tr:hover td { background: #F8FAFC; }
        .footer { margin-top: 16px; font-size: 10px; color: #CBD5E1; text-align: right; }
        @media print { body { padding: 12px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">오름AI</div>
          <h2>매물 목록 (총 ${properties.length}건)</h2>
        </div>
        <div class="agent">
          <div><strong>${agent.officeName}</strong></div>
          <div>${agent.agentName} ${agent.position}</div>
          <div>${agent.phone}</div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>건물명</th>
            <th>주소</th>
            <th>종류</th>
            <th>거래</th>
            <th>가격</th>
            <th>면적</th>
            <th>층/총층</th>
            <th>입주일</th>
            <th>연락처</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="footer">오름AI · ${new Date().toLocaleDateString('ko-KR')}</div>
    </body>
    </html>
  `;

  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 500);
};

// 고객 목록 전체 인쇄
export const printCustomerList = (customers: Customer[]): void => {
  const agent = loadAgentProfile();

  const rows = customers.map((c) => `
    <tr>
      <td>${c.name}</td>
      <td>${c.phone}</td>
      <td>${c.memo.length > 40 ? c.memo.slice(0, 40) + '...' : c.memo}</td>
      <td>${c.createdAt?.slice(0, 10) ?? '—'}</td>
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
        .header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 16px; border-bottom: 2px solid #E2E8F0; padding-bottom: 12px; }
        .logo { font-size: 18px; font-weight: 800; color: #1D4ED8; }
        .agent { text-align: right; font-size: 12px; color: #334155; }
        .agent strong { font-size: 15px; }
        h2 { font-size: 16px; font-weight: 800; margin: 0 0 12px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #F1F5F9; color: #64748B; font-size: 10px; font-weight: 700; padding: 6px 8px; text-align: left; border-bottom: 1px solid #E2E8F0; }
        td { padding: 7px 8px; border-bottom: 1px solid #F1F5F9; font-size: 11px; color: #1E293B; }
        tr:hover td { background: #F8FAFC; }
        .footer { margin-top: 16px; font-size: 10px; color: #CBD5E1; text-align: right; }
        @media print { body { padding: 12px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">오름AI</div>
          <h2>고객 목록 (총 ${customers.length}건)</h2>
        </div>
        <div class="agent">
          <div><strong>${agent.officeName}</strong></div>
          <div>${agent.agentName} ${agent.position}</div>
          <div>${agent.phone}</div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>이름</th>
            <th>연락처</th>
            <th>메모</th>
            <th>등록일</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="footer">오름AI · ${new Date().toLocaleDateString('ko-KR')}</div>
    </body>
    </html>
  `;

  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 500);
};