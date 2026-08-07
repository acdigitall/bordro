import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import {
  DEFAULT_MIN_GROSS_WAGE,
  DEFAULT_SGK_CEILING,
  DEFAULT_STAMP_TAX_RATE,
  DEFAULT_TAX_BRACKETS,
} from '@/lib/payroll-engine';

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

    let taxSetting = await prisma.taxSetting.findFirst({
      where: { companyId },
    });

    if (!taxSetting) {
      taxSetting = await prisma.taxSetting.create({
        data: {
          companyId,
          year: 2026,
          minimumGrossWage: DEFAULT_MIN_GROSS_WAGE,
          sgkCeiling: DEFAULT_SGK_CEILING,
          stampTaxRate: DEFAULT_STAMP_TAX_RATE,
          bracketsJson: JSON.stringify(DEFAULT_TAX_BRACKETS),
        },
      });
    }

    return NextResponse.json({
      success: true,
      taxSetting: {
        minimumGrossWage: taxSetting.minimumGrossWage,
        sgkCeiling: taxSetting.sgkCeiling,
        stampTaxRate: taxSetting.stampTaxRate,
        bracketsJson: taxSetting.bracketsJson,
      },
    });
  } catch (error) {
    console.error('Fetch tax settings error:', error);
    return NextResponse.json({ error: 'Ayarlar getirilirken hata oluştu.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
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

    const body = await request.json();
    const { minimumGrossWage, sgkCeiling, stampTaxRate } = body;

    const minWageVal = parseFloat(minimumGrossWage) || DEFAULT_MIN_GROSS_WAGE;
    const sgkCeilVal = parseFloat(sgkCeiling) || DEFAULT_SGK_CEILING;
    const stampRateVal = parseFloat(stampTaxRate) || DEFAULT_STAMP_TAX_RATE;

    let existing = await prisma.taxSetting.findFirst({
      where: { companyId },
    });

    if (existing) {
      await prisma.taxSetting.update({
        where: { id: existing.id },
        data: {
          minimumGrossWage: minWageVal,
          sgkCeiling: sgkCeilVal,
          stampTaxRate: stampRateVal,
        },
      });
    } else {
      await prisma.taxSetting.create({
        data: {
          companyId,
          year: 2026,
          minimumGrossWage: minWageVal,
          sgkCeiling: sgkCeilVal,
          stampTaxRate: stampRateVal,
          bracketsJson: JSON.stringify(DEFAULT_TAX_BRACKETS),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Vergi ve Asgari Ücret ayarları veritabanına başarıyla kaydedildi.',
    });
  } catch (error) {
    console.error('Update tax settings error:', error);
    return NextResponse.json({ error: 'Ayarlar kaydedilirken hata oluştu.' }, { status: 500 });
  }
}
