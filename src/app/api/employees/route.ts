import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const cookieStore = cookies();
  const session = cookieStore.get('auth_session');

  if (!session?.value) {
    return NextResponse.json({ success: false, employees: [] }, { status: 401 });
  }

  try {
    const sessionUser = JSON.parse(session.value);
    const companyId = sessionUser?.companyId;

    if (!companyId) {
      return NextResponse.json({ success: false, employees: [] });
    }

    // Fetch employees for active company from DB
    const employees = await prisma.employee.findMany({
      where: { companyId },
      include: { department: true, bank: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      employees: employees.map((emp) => ({
        id: emp.id,
        employeeCode: emp.employeeCode,
        tcNo: emp.tcNo,
        firstName: emp.firstName,
        lastName: emp.lastName,
        departmentId: emp.departmentId || 'dept-01',
        departmentName: emp.department?.name || 'Genel Yönetim',
        title: emp.title || 'Çalışan',
        hireDate: emp.hireDate ? emp.hireDate.toISOString().split('T')[0] : '2026-01-01',
        status: emp.status,
        baseSalary: emp.baseSalary,
        bankName: emp.bank?.name || 'Türkiye İş Bankası',
        iban: emp.iban || 'TR00 0000 0000 0000 0000 0000 00',
        taxExemptionType: emp.taxExemptionType,
        cumulativeMatrah: emp.cumulativeMatrah,
      })),
      companyId,
    });
  } catch (error) {
    console.error('Fetch employees error:', error);
    return NextResponse.json({ success: false, employees: [] });
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
    const { tcNo, firstName, lastName, baseSalary, title, iban } = body;

    if (!tcNo || !firstName || !lastName || !baseSalary) {
      return NextResponse.json(
        { error: 'Lütfen zorunlu alanları (TC No, Ad, Soyad, Brüt Ücret) doldurunuz.' },
        { status: 400 }
      );
    }

    // Auto-generate employee code
    const count = await prisma.employee.count({ where: { companyId } });
    const employeeCode = `SICIL-${String(count + 1).padStart(3, '0')}`;

    const newEmp = await prisma.employee.create({
      data: {
        companyId,
        employeeCode,
        tcNo: tcNo.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        title: title?.trim() || 'Personel',
        baseSalary: parseFloat(baseSalary),
        hireDate: new Date(),
        iban: iban?.trim() || null,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Çalışan başarıyla eklendi.',
      employee: newEmp,
    });
  } catch (error) {
    console.error('Create employee error:', error);
    return NextResponse.json(
      { error: 'Çalışan kaydedilirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
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
    const { id, tcNo, firstName, lastName, baseSalary, title, iban, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Çalışan ID zorunludur.' }, { status: 400 });
    }

    const updateData: any = {};
    if (tcNo) updateData.tcNo = tcNo.trim();
    if (firstName) updateData.firstName = firstName.trim();
    if (lastName) updateData.lastName = lastName.trim();
    if (title) updateData.title = title.trim();
    if (baseSalary) updateData.baseSalary = parseFloat(baseSalary);
    if (iban !== undefined) updateData.iban = iban ? iban.trim() : null;
    if (status) updateData.status = status;

    const updatedEmp = await prisma.employee.updateMany({
      where: { id, companyId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Çalışan bilgileri güncellendi.',
      updated: updatedEmp,
    });
  } catch (error) {
    console.error('Update employee error:', error);
    return NextResponse.json(
      { error: 'Çalışan güncellenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Çalışan ID gereklidir.' }, { status: 400 });
    }

    // Soft-delete employee by setting status to TERMINATED
    await prisma.employee.updateMany({
      where: { id, companyId },
      data: { status: 'TERMINATED' },
    });

    return NextResponse.json({
      success: true,
      message: 'Çalışan işten çıkarıldı (pasife alındı).',
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    return NextResponse.json(
      { error: 'Çalışan işten çıkarılırken hata oluştu.' },
      { status: 500 }
    );
  }
}

