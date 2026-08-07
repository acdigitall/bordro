import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
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

    const backupData = await request.json();

    if (!backupData || !backupData.company) {
      return NextResponse.json(
        { error: 'Geçersiz yedek dosyası formatı.' },
        { status: 400 }
      );
    }

    // Restore Departments
    if (Array.isArray(backupData.departments)) {
      for (const dept of backupData.departments) {
        await prisma.department.upsert({
          where: { id: dept.id },
          create: {
            id: dept.id,
            companyId,
            name: dept.name,
          },
          update: {
            name: dept.name,
          },
        });
      }
    }

    // Restore Employees
    if (Array.isArray(backupData.employees)) {
      for (const emp of backupData.employees) {
        await prisma.employee.upsert({
          where: { id: emp.id },
          create: {
            id: emp.id,
            companyId,
            employeeCode: emp.employeeCode,
            tcNo: emp.tcNo,
            firstName: emp.firstName,
            lastName: emp.lastName,
            gender: emp.gender,
            title: emp.title,
            hireDate: new Date(emp.hireDate || Date.now()),
            baseSalary: parseFloat(emp.baseSalary) || 20002.5,
            iban: emp.iban,
            taxExemptionType: emp.taxExemptionType || 'STANDARD',
            cumulativeMatrah: parseFloat(emp.cumulativeMatrah) || 0,
          },
          update: {
            firstName: emp.firstName,
            lastName: emp.lastName,
            title: emp.title,
            baseSalary: parseFloat(emp.baseSalary) || 20002.5,
            iban: emp.iban,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Şirket yedeği veritabanına başarıyla geri yüklendi.',
    });
  } catch (error) {
    console.error('Backup restore error:', error);
    return NextResponse.json(
      { error: 'Yedek geri yüklenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
