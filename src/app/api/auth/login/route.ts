import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

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

    // Check if logging in as Super Admin (cagataydalaman@outlook.com)
    if (cleanEmail === 'cagataydalaman@outlook.com') {
      if (password !== '12345678') {
        return NextResponse.json(
          { error: 'Süper Admin şifreniz hatalı.' },
          { status: 401 }
        );
      }

      // Upsert Super Admin user in DB
      let superUser;
      try {
        superUser = await prisma.user.upsert({
          where: { email: 'cagataydalaman@outlook.com' },
          update: {
            passwordHash: '12345678',
            role: 'SUPER_ADMIN',
            status: 'ACTIVE',
          },
          create: {
            name: 'Çağatay Dalaman',
            email: 'cagataydalaman@outlook.com',
            passwordHash: '12345678',
            role: 'SUPER_ADMIN',
            status: 'ACTIVE',
          },
        });
      } catch (e) {
        console.error('Super Admin DB upsert error:', e);
        superUser = {
          id: 'super-admin-01',
          name: 'Çağatay Dalaman',
          email: 'cagataydalaman@outlook.com',
          role: 'SUPER_ADMIN',
          companyId: null,
          company: null,
        };
      }

      const sessionData = {
        id: superUser.id,
        name: superUser.name,
        email: superUser.email,
        role: 'SUPER_ADMIN',
        companyId: null,
        companyName: 'Bordro SaaS Sistem Yönetimi',
      };

      const cookieStore = cookies();
      cookieStore.set('auth_session', JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return NextResponse.json({
        success: true,
        user: sessionData,
        redirectUrl: '/admin',
      });
    }

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

    // Check password (In production, use bcrypt.compare)
    if (user.passwordHash !== password) {
      return NextResponse.json(
        { error: 'Şifreniz hatalı. Lütfen tekrar deneyiniz.' },
        { status: 401 }
      );
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Hesabınız pasif durumdadır. Lütfen yöneticinizle iletişime geçin.' },
        { status: 403 }
      );
    }

    // Set session cookie
    const sessionData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      companyName: user.company?.name || 'Sistem Admin',
    };

    const cookieStore = cookies();
    cookieStore.set('auth_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

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

