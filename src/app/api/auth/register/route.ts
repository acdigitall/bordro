import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { Role } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const { companyName, taxOffice, taxNo, adminName, email, password } = await request.json();

    if (!companyName || !adminName || !email || !password) {
      return NextResponse.json(
        { error: 'Lütfen zorunlu alanları (Şirket Adı, Ad Soyad, E-posta, Şifre) doldurunuz.' },
        { status: 400 }
      );
    }

    // Check if email already registered
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu e-posta adresi ile zaten kayıtlı bir hesap var.' },
        { status: 400 }
      );
    }

    // Create Company and Admin User in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: companyName.trim(),
          taxOffice: taxOffice || null,
          taxNo: taxNo || null,
          status: 'ACTIVE',
        },
      });

      // Default Department
      await tx.department.create({
        data: {
          companyId: company.id,
          name: 'Genel Yönetim',
        },
      });

      // Admin User
      const user = await tx.user.create({
        data: {
          companyId: company.id,
          name: adminName.trim(),
          email: email.toLowerCase().trim(),
          passwordHash: password, // In production use bcrypt
          role: Role.TENANT_ADMIN,
          status: 'ACTIVE',
        },
      });

      return { company, user };
    });

    // Set Session Cookie
    const sessionData = {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role,
      companyId: result.company.id,
      companyName: result.company.name,
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
      message: 'Şirket kaydı başarıyla tamamlandı.',
      user: sessionData,
      redirectUrl: '/dashboard',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Şirket kaydı oluşturulurken bir sunucu hatası meydana geldi.' },
      { status: 500 }
    );
  }
}
