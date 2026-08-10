import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function escapeXml(unsafe: string | null | undefined): string {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export async function GET() {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
  }

  try {
    const companyId = sessionUser.companyId;

    if (!companyId) {
      return NextResponse.json({ error: 'Şirket bulunamadı.' }, { status: 400 });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        employees: true,
      },
    });

    if (!company) {
      return NextResponse.json({ error: 'Şirket kaydı bulunamadı.' }, { status: 404 });
    }

    const year = 2026;
    const month = 8;

    // Generate SGK E-Bildirge v2 MPHBY XML with Sanitized XML Escaping
    let xmlContent = `<?xml version="1.0" encoding="ISO-8859-9"?>\n`;
    xmlContent += `<SGK_E_BILDIRGE_V2>\n`;
    xmlContent += `  <ISYERI_BILGILERI>\n`;
    xmlContent += `    <ISYERI_UNVAN>${escapeXml(company.name)}</ISYERI_UNVAN>\n`;
    xmlContent += `    <VERGI_NO>${escapeXml(company.taxNo || '0000000000')}</VERGI_NO>\n`;
    xmlContent += `    <VERGI_DAIRESI>${escapeXml(company.taxOffice || 'VD')}</VERGI_DAIRESI>\n`;
    xmlContent += `    <DONEM_AY>${month}</DONEM_AY>\n`;
    xmlContent += `    <DONEM_YIL>${year}</DONEM_YIL>\n`;
    xmlContent += `  </ISYERI_BILGILERI>\n`;
    xmlContent += `  <SIGORTALILAR>\n`;

    company.employees.forEach((emp) => {
      const gross = emp.baseSalary;
      const sgkMatrah = Math.min(gross, 150018.75);
      const sgkIsci = sgkMatrah * 0.14;
      const issizlikIsci = sgkMatrah * 0.01;
      const sgkIsveren = sgkMatrah * 0.155;

      xmlContent += `    <SIGORTALI>\n`;
      xmlContent += `      <TCKN>${escapeXml(emp.tcNo)}</TCKN>\n`;
      xmlContent += `      <ADI>${escapeXml(emp.firstName)}</ADI>\n`;
      xmlContent += `      <SOYADI>${escapeXml(emp.lastName)}</SOYADI>\n`;
      xmlContent += `      <SICIL_NO>${escapeXml(emp.employeeCode)}</SICIL_NO>\n`;
      xmlContent += `      <PRIM_GUN_SAYISI>30</PRIM_GUN_SAYISI>\n`;
      xmlContent += `      <HAKEDILEN_UCRET>${gross.toFixed(2)}</HAKEDILEN_UCRET>\n`;
      xmlContent += `      <PRIME_ESAS_KAZANC>${sgkMatrah.toFixed(2)}</PRIME_ESAS_KAZANC>\n`;
      xmlContent += `      <SGK_ISCI_PRIMI>${sgkIsci.toFixed(2)}</SGK_ISCI_PRIMI>\n`;
      xmlContent += `      <ISSIZLIK_ISCI_PRIMI>${issizlikIsci.toFixed(2)}</ISSIZLIK_ISCI_PRIMI>\n`;
      xmlContent += `      <SGK_ISVEREN_PRIMI>${sgkIsveren.toFixed(2)}</SGK_ISVEREN_PRIMI>\n`;
      xmlContent += `      <EKSİK_GUN_SAYISI>0</EKSİK_GUN_SAYISI>\n`;
      xmlContent += `      <EKSİK_GUN_NEDENI></EKSİK_GUN_NEDENI>\n`;
      xmlContent += `    </SIGORTALI>\n`;
    });

    xmlContent += `  </SIGORTALILAR>\n`;
    xmlContent += `</SGK_E_BILDIRGE_V2>`;

    const fileName = `sgk_mphby_2026_08_${company.name.replace(/[^a-zA-Z0-9]/g, '_')}.xml`;

    return new NextResponse(xmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('SGK XML export error:', error);
    return NextResponse.json(
      { error: 'SGK XML beyannamesi oluşturulurken hata oluştu.' },
      { status: 500 }
    );
  }
}
