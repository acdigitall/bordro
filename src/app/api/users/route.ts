import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const cookieStore = cookies();
  const session = cookieStore.get('auth_session');

  if (!session?.value) {
    return NextResponse.json({ success: false, users: [] }, { status: 401 });
  }

  try {
    const sessionUser = JSON.parse(session.value);
    const companyId = sessionUser?.companyId;

    if (!companyId) {
      return NextResponse.json({ success: false, users: [] });
    }

    const dbUsers = await prisma.user.findMany({
      where: { companyId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      success: true,
      users: dbUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
      })),
    });
  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json({ success: false, users: [] });
  }
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  const session = cookieStore.get('auth_session');

  if (!session?.value) {
    return NextResponse.json({ error: 'Yetkisiz işlem.' }, { status: 401 });
  }

  try {
    const sessionUser = JSON.parse(session.value);
    const companyId = sessionUser?.companyId;

    if (!companyId) {
      return NextResponse.json({ error: 'Şirket bulunamadı.' }, { status: 400 });
    }

    const body = await request.json();
    const { name, email, role } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Lütfen Ad Soyad ve E-Posta adresini giriniz.' },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Bu e-posta adresi ile zaten kayıtlı bir kullanıcı bulunuyor.' },
        { status: 400 }
      );
    }

    const newUser = await prisma.user.create({
      data: {
        companyId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash: '12345678',
        role: role || 'PAYROLL_OFFICER',
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Kullanıcı davet edildi ve kaydedildi.',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
      },
    });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Kullanıcı davet edilirken hata oluştu.' },
      { status: 500 }
    );
  }
}
