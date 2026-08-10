import { NextResponse } from 'next/server';
import { getSessionUser, hasRole, signJWT, setSessionCookie } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    });

    if (!company) {
      return NextResponse.json({ error: 'Şirket kaydı bulunamadı.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      company: {
        id: company.id,
        name: company.name,
        taxOffice: company.taxOffice || '',
        taxNo: company.taxNo || '',
        address: company.address || '',
        logoUrl: company.logoUrl || '',
      },
    });
  } catch (error) {
    console.error('Fetch company error:', error);
    return NextResponse.json(
      { error: 'Şirket bilgileri alınırken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
  }

  if (!hasRole(sessionUser, ['TENANT_ADMIN', 'SUPER_ADMIN'])) {
    return NextResponse.json({ error: 'Şirket bilgilerini güncelleme yetkiniz yok.' }, { status: 403 });
  }

  try {
    const companyId = sessionUser.companyId;

    if (!companyId) {
      return NextResponse.json({ error: 'Şirket kaydı bulunamadı.' }, { status: 400 });
    }

    const body = await request.json();
    const { name, taxOffice, taxNo, address, logoUrl } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Lütfen resmi şirket unvanını giriniz.' },
        { status: 400 }
      );
    }

    // Update Company in Prisma DB
    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: {
        name: name.trim(),
        taxOffice: taxOffice ? taxOffice.trim() : null,
        taxNo: taxNo ? taxNo.trim() : null,
        address: address ? address.trim() : null,
        logoUrl: logoUrl ? logoUrl.trim() : null,
      },
    });

    // Refresh JWT session cookie with new company name
    const newSession = {
      ...sessionUser,
      companyName: updatedCompany.name,
    };

    const newToken = await signJWT(newSession);
    setSessionCookie(newToken);

    return NextResponse.json({
      success: true,
      message: 'Şirket bilgileri veritabanında başarıyla güncellendi.',
      company: updatedCompany,
    });
  } catch (error) {
    console.error('Update company error:', error);
    return NextResponse.json(
      { error: 'Şirket bilgileri güncellenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
