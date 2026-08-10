import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signJWT, setSessionCookie, SessionUser } from '@/lib/auth';
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

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Şifreniz en az 6 karakter olmalıdır.' },
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

    // Hash password with bcrypt
    const hashedPassword = await hashPassword(password);

    // Create Company and Admin User in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: companyName.trim(),
          taxOffice: taxOffice ? taxOffice.trim() : null,
          taxNo: taxNo ? taxNo.trim() : null,
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

      // Admin User with hashed password
      const user = await tx.user.create({
        data: {
          companyId: company.id,
          name: adminName.trim(),
          email: email.toLowerCase().trim(),
          passwordHash: hashedPassword,
          role: Role.TENANT_ADMIN,
          status: 'ACTIVE',
        },
      });

      return { company, user };
    });

    // Prepare session payload
    const sessionData: SessionUser = {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role,
      companyId: result.company.id,
      companyName: result.company.name,
    };

    // Sign JWT token
    const token = await signJWT(sessionData);

    // Set Session Cookie
    setSessionCookie(token);

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
