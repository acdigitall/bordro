import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, hashPassword, signJWT, setSessionCookie, SessionUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Lütfen e-posta ve şifrenizi giriniz.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Search user in DB
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        company: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı.' },
        { status: 401 }
      );
    }

    // Verify password securely using bcrypt/fallback
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Şifreniz hatalı. Lütfen tekrar deneyiniz.' },
        { status: 401 }
      );
    }

    // Upgrade unhashed legacy password to bcrypt hash in DB
    if (!user.passwordHash.startsWith('$2a$') && !user.passwordHash.startsWith('$2b$')) {
      const newHash = await hashPassword(password);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      }).catch((e) => console.error('Failed to auto-upgrade password hash:', e));
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Hesabınız pasif durumdadır. Lütfen yöneticinizle iletişime geçin.' },
        { status: 403 }
      );
    }

    // Prepare session data
    const sessionData: SessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      companyName: user.company?.name || (user.role === 'SUPER_ADMIN' ? 'Bordro SaaS Sistem Yönetimi' : 'Şirketiniz'),
    };

    // Sign JWT token
    const token = await signJWT(sessionData);

    // Set HTTP-Only signed cookie
    setSessionCookie(token);

    const redirectUrl = user.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard';

    return NextResponse.json({
      success: true,
      user: sessionData,
      redirectUrl,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Giriş yapılırken sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}
