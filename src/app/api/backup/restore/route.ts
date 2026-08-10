import { NextResponse } from 'next/server';
import { getSessionUser, hasRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
  }

  // Only TENANT_ADMIN or SUPER_ADMIN can restore backups
  if (!hasRole(sessionUser, ['TENANT_ADMIN', 'SUPER_ADMIN'])) {
    return NextResponse.json({ error: 'Yedek geri yükleme yetkiniz bulunmamaktadır.' }, { status: 403 });
  }

  try {
    const companyId = sessionUser.companyId;

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

    // Secure Restore Departments (Cross-Tenant Protected)
    if (Array.isArray(backupData.departments)) {
      for (const dept of backupData.departments) {
        if (!dept.name) continue;

        // Check if department ID belongs to another company
        const existingDept = await prisma.department.findUnique({
          where: { id: dept.id },
        });

        if (existingDept && existingDept.companyId !== companyId) {
          // Cross-tenant attempt or ID collision: create new department for current company
          await prisma.department.create({
            data: {
              companyId,
              name: dept.name,
            },
          });
        } else if (existingDept) {
          // Update department owned by current company
          await prisma.department.update({
            where: { id: dept.id },
            data: { name: dept.name },
          });
        } else {
          // Create department with explicit companyId
          await prisma.department.create({
            data: {
              id: dept.id,
              companyId,
              name: dept.name,
            },
          });
        }
      }
    }

    // Secure Restore Employees (Cross-Tenant Protected)
    if (Array.isArray(backupData.employees)) {
      for (const emp of backupData.employees) {
        if (!emp.tcNo || !emp.firstName || !emp.lastName) continue;

        const existingEmp = await prisma.employee.findUnique({
          where: { id: emp.id },
        });

        const empData = {
          companyId,
          employeeCode: emp.employeeCode || `SICIL-RESTORE`,
          tcNo: String(emp.tcNo).trim(),
          firstName: String(emp.firstName).trim(),
          lastName: String(emp.lastName).trim(),
          gender: emp.gender || null,
          title: emp.title || null,
          hireDate: emp.hireDate ? new Date(emp.hireDate) : new Date(),
          baseSalary: parseFloat(emp.baseSalary) || 20002.5,
          iban: emp.iban || null,
          taxExemptionType: emp.taxExemptionType || 'STANDARD',
          cumulativeMatrah: parseFloat(emp.cumulativeMatrah) || 0,
        };

        if (existingEmp && existingEmp.companyId !== companyId) {
          // ID belongs to another tenant! Protect other tenant data by creating a new record for current company
          await prisma.employee.create({
            data: empData,
          });
        } else if (existingEmp) {
          // Update employee owned by current company
          await prisma.employee.update({
            where: { id: emp.id },
            data: {
              firstName: empData.firstName,
              lastName: empData.lastName,
              title: empData.title,
              baseSalary: empData.baseSalary,
              iban: empData.iban,
              taxExemptionType: empData.taxExemptionType,
              cumulativeMatrah: empData.cumulativeMatrah,
            },
          });
        } else {
          // Create employee for current company
          await prisma.employee.create({
            data: {
              id: emp.id,
              ...empData,
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Şirket yedeği veritabanına güvenli şekilde geri yüklendi.',
    });
  } catch (error) {
    console.error('Backup restore error:', error);
    return NextResponse.json(
      { error: 'Yedek geri yüklenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
