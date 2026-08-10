import { NextResponse } from 'next/server';
import { getSessionUser, hasRole, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
  }

  // Check RBAC role
  if (!hasRole(sessionUser, ['TENANT_ADMIN', 'SUPER_ADMIN', 'ACCOUNTANT'])) {
    return NextResponse.json({ error: 'Bu işlem için yetkiniz bulunmamaktadır.' }, { status: 403 });
  }

  try {
    const companyId = sessionUser.companyId;

    if (!companyId && sessionUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, users: [] });
    }

    const whereCondition = sessionUser.role === 'SUPER_ADMIN' && !companyId ? {} : { companyId: companyId! };

    const dbUsers = await prisma.user.findMany({
      where: whereCondition,
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
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
  }

  // Only TENANT_ADMIN and SUPER_ADMIN can create/invite users
  if (!hasRole(sessionUser, ['TENANT_ADMIN', 'SUPER_ADMIN'])) {
    return NextResponse.json({ error: 'Kullanıcı ekleme/davet etme yetkiniz yok.' }, { status: 403 });
  }

  try {
    const companyId = sessionUser.companyId;

    if (!companyId && sessionUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Şirket bulunamadı.' }, { status: 400 });
    }

    const body = await request.json();
    const { name, email, role, password } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Lütfen Ad Soyad ve E-Posta adresini giriniz.' },
        { status: 400 }
      );
    }

    // Privilege escalation prevention: TENANT_ADMIN cannot create SUPER_ADMIN
    let targetRole = role || 'ACCOUNTANT';
    if (targetRole === 'SUPER_ADMIN' && sessionUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Süper Admin rolü atama yetkiniz bulunmamaktadır.' },
        { status: 403 }
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

    // Hash the initial password with bcrypt
    const defaultPassword = password || 'Bordro2026!';
    const hashedPassword = await hashPassword(defaultPassword);

    const newUser = await prisma.user.create({
      data: {
        companyId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash: hashedPassword,
        role: targetRole,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Kullanıcı başarıyla kaydedildi.',
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
      { error: 'Kullanıcı eklenirken bir sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}
