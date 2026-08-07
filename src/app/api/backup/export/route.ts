import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const cookieStore = cookies();
  const session = cookieStore.get('auth_session');

  if (!session?.value) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
  }

  try {
    const sessionUser = JSON.parse(session.value);
    const companyId = sessionUser?.companyId;

    if (!companyId) {
      return NextResponse.json({ error: 'Şirket bulunamadı.' }, { status: 400 });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        employees: true,
        departments: true,
        banks: true,
        incomes: true,
        overtimes: true,
        commissions: true,
        deductions: true,
        loans: true,
        payrollPeriods: {
          include: {
            entries: true,
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: 'Şirket verisi bulunamadı.' }, { status: 404 });
    }

    const backupData = {
      meta: {
        version: '1.0',
        system: 'Türkiye Bordro SaaS',
        companyId: company.id,
        companyName: company.name,
        exportedAt: new Date().toISOString(),
      },
      company: {
        id: company.id,
        name: company.name,
        taxOffice: company.taxOffice,
        taxNo: company.taxNo,
        address: company.address,
        logoUrl: company.logoUrl,
      },
      departments: company.departments,
      banks: company.banks,
      employees: company.employees,
      incomes: company.incomes,
      overtimes: company.overtimes,
      commissions: company.commissions,
      deductions: company.deductions,
      loans: company.loans,
      payrollPeriods: company.payrollPeriods,
    };

    const fileName = `bordro_yedek_${company.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;

    return new NextResponse(JSON.stringify(backupData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Backup export error:', error);
    return NextResponse.json(
      { error: 'Yedekleme oluşturulurken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
