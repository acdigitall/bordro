import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const cookieStore = cookies();
  const session = cookieStore.get('auth_session');

  if (!session?.value) {
    return NextResponse.json({ authenticated: false, user: null, company: null });
  }

  try {
    const sessionUser = JSON.parse(session.value);

    // Fetch fresh user and company from DB if possible
    if (sessionUser?.id) {
      const dbUser = await prisma.user.findUnique({
        where: { id: sessionUser.id },
        include: { company: true },
      });

      if (dbUser) {
        return NextResponse.json({
          authenticated: true,
          user: {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role,
            status: dbUser.status,
          },
          company: dbUser.company
            ? {
                id: dbUser.company.id,
                name: dbUser.company.name,
                taxOffice: dbUser.company.taxOffice || '',
                taxNo: dbUser.company.taxNo || '',
                address: dbUser.company.address || '',
              }
            : null,
        });
      }
    }

    return NextResponse.json({
      authenticated: true,
      user: sessionUser,
      company: {
        id: sessionUser.companyId,
        name: sessionUser.companyName || 'Şirketiniz',
      },
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false, user: null, company: null });
  }
}

export async function POST() {
  const cookieStore = cookies();
  cookieStore.delete('auth_session');
  return NextResponse.json({ success: true, redirectUrl: '/login' });
}

