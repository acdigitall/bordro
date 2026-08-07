import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const cookieStore = cookies();
  const session = cookieStore.get('auth_session');

  if (!session?.value) {
    return NextResponse.json({ success: false, data: [] }, { status: 401 });
  }

  try {
    const sessionUser = JSON.parse(session.value);
    const companyId = sessionUser?.companyId;

    if (!companyId) {
      return NextResponse.json({ success: false, data: [] });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('type') || 'incomes';

    if (category === 'incomes') {
      const incomes = await prisma.income.findMany({
        where: { companyId },
        include: { employee: true },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({
        success: true,
        data: incomes.map((inc) => ({
          id: inc.id,
          employeeId: inc.employeeId,
          name: `${inc.employee.firstName} ${inc.employee.lastName}`,
          type: inc.type,
          amount: inc.amount,
          isTaxable: inc.isTaxable,
        })),
      });
    }

    if (category === 'overtime') {
      const overtimes = await prisma.overtime.findMany({
        where: { companyId },
        include: { employee: true },
      });
      const map: { [empId: string]: number } = {};
      overtimes.forEach((o) => {
        map[o.employeeId] = o.hours;
      });
      return NextResponse.json({ success: true, data: map });
    }

    if (category === 'commissions') {
      const commissions = await prisma.commission.findMany({
        where: { companyId },
        include: { employee: true },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({
        success: true,
        data: commissions.map((c) => {
          let salesVal = 0;
          let rateVal = 3;
          try {
            if (c.type && c.type.startsWith('{')) {
              const parsed = JSON.parse(c.type);
              salesVal = parsed.sales || 0;
              rateVal = parsed.rate || 3;
            }
          } catch {}

          return {
            id: c.id,
            employeeId: c.employeeId,
            name: `${c.employee.firstName} ${c.employee.lastName}`,
            type: 'Satış Primi',
            sales: salesVal,
            commissionRate: rateVal,
            amount: c.amount,
            totalAmount: c.amount,
          };
        }),
      });
    }

    if (category === 'deductions') {
      const deductions = await prisma.deduction.findMany({
        where: { companyId },
        include: { employee: true },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({
        success: true,
        data: deductions.map((d) => ({
          id: d.id,
          employeeId: d.employeeId,
          name: `${d.employee.firstName} ${d.employee.lastName}`,
          type: d.type,
          amount: d.amount,
        })),
      });
    }

    if (category === 'loans') {
      const loans = await prisma.loan.findMany({
        where: { companyId },
        include: { employee: true },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({
        success: true,
        data: loans.map((l) => ({
          id: l.id,
          employeeId: l.employeeId,
          name: `${l.employee.firstName} ${l.employee.lastName}`,
          totalAmount: l.totalAmount,
          monthlyAmount: l.monthlyAmount,
          remainingMonths: l.remainingMonths,
        })),
      });
    }

    return NextResponse.json({ success: true, data: [] });
  } catch (error) {
    console.error('Fetch monthly data error:', error);
    return NextResponse.json({ success: false, data: [] });
  }
}

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

    const body = await request.json();
    const { category, employeeId, type, amount, hours, sales, rate, totalAmount, monthlyAmount } = body;

    if (category === 'incomes') {
      if (!employeeId || !amount) {
        return NextResponse.json({ error: 'Çalışan ve tutar zorunludur.' }, { status: 400 });
      }
      const inc = await prisma.income.create({
        data: {
          companyId,
          employeeId,
          periodMonth: 8,
          periodYear: 2026,
          type: type || 'İkramiye',
          amount: parseFloat(amount),
          isTaxable: true,
          isSgk: true,
        },
        include: { employee: true },
      });
      return NextResponse.json({
        success: true,
        item: {
          id: inc.id,
          employeeId: inc.employeeId,
          name: `${inc.employee.firstName} ${inc.employee.lastName}`,
          type: inc.type,
          amount: inc.amount,
          isTaxable: inc.isTaxable,
        },
      });
    }

    if (category === 'overtime') {
      if (!employeeId) {
        return NextResponse.json({ error: 'Çalışan zorunludur.' }, { status: 400 });
      }
      const hr = parseFloat(hours) || 0;
      await prisma.overtime.deleteMany({
        where: { companyId, employeeId, periodMonth: 8, periodYear: 2026 },
      });
      if (hr > 0) {
        await prisma.overtime.create({
          data: {
            companyId,
            employeeId,
            periodMonth: 8,
            periodYear: 2026,
            hours: hr,
            multiplier: 1.5,
            amount: 0,
          },
        });
      }
      return NextResponse.json({ success: true });
    }

    if (category === 'commissions') {
      if (!employeeId || !amount) {
        return NextResponse.json({ error: 'Çalışan ve tutar zorunludur.' }, { status: 400 });
      }
      const sls = parseFloat(sales) || 0;
      const rt = parseFloat(rate) || 3;
      const calcAmt = sls > 0 ? (sls * rt) / 100 : parseFloat(amount);

      const comm = await prisma.commission.create({
        data: {
          companyId,
          employeeId,
          periodMonth: 8,
          periodYear: 2026,
          type: JSON.stringify({ sales: sls, rate: rt }),
          amount: calcAmt,
          isTaxable: true,
          isSgk: true,
        },
        include: { employee: true },
      });
      return NextResponse.json({
        success: true,
        item: {
          id: comm.id,
          employeeId: comm.employeeId,
          name: `${comm.employee.firstName} ${comm.employee.lastName}`,
          type: 'Satış Primi',
          sales: sls,
          commissionRate: rt,
          amount: comm.amount,
          totalAmount: comm.amount,
        },
      });
    }

    if (category === 'deductions') {
      if (!employeeId || !amount) {
        return NextResponse.json({ error: 'Çalışan ve tutar zorunludur.' }, { status: 400 });
      }
      const ded = await prisma.deduction.create({
        data: {
          companyId,
          employeeId,
          periodMonth: 8,
          periodYear: 2026,
          type: type || 'İcra Kesintisi',
          amount: parseFloat(amount),
        },
        include: { employee: true },
      });
      return NextResponse.json({
        success: true,
        item: {
          id: ded.id,
          employeeId: ded.employeeId,
          name: `${ded.employee.firstName} ${ded.employee.lastName}`,
          type: ded.type,
          amount: ded.amount,
        },
      });
    }

    if (category === 'loans') {
      if (!employeeId || !totalAmount || !monthlyAmount) {
        return NextResponse.json({ error: 'Çalışan, toplam tutar ve taksit zorunludur.' }, { status: 400 });
      }
      const tot = parseFloat(totalAmount);
      const mth = parseFloat(monthlyAmount);
      const rem = Math.ceil(tot / mth);
      const ln = await prisma.loan.create({
        data: {
          companyId,
          employeeId,
          totalAmount: tot,
          monthlyAmount: mth,
          remainingMonths: rem,
          status: 'ACTIVE',
        },
        include: { employee: true },
      });
      return NextResponse.json({
        success: true,
        item: {
          id: ln.id,
          employeeId: ln.employeeId,
          name: `${ln.employee.firstName} ${ln.employee.lastName}`,
          totalAmount: ln.totalAmount,
          monthlyAmount: ln.monthlyAmount,
          remainingMonths: ln.remainingMonths,
        },
      });
    }

    return NextResponse.json({ error: 'Geçersiz kategori.' }, { status: 400 });
  } catch (error) {
    console.error('Create monthly data error:', error);
    return NextResponse.json({ error: 'Kayıt oluşturulurken bir hata oluştu.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const id = searchParams.get('id');

    if (!id || !category) {
      return NextResponse.json({ error: 'ID ve kategori gereklidir.' }, { status: 400 });
    }

    if (category === 'incomes') {
      await prisma.income.deleteMany({ where: { id, companyId } });
    } else if (category === 'commissions') {
      await prisma.commission.deleteMany({ where: { id, companyId } });
    } else if (category === 'deductions') {
      await prisma.deduction.deleteMany({ where: { id, companyId } });
    } else if (category === 'loans') {
      await prisma.loan.deleteMany({ where: { id, companyId } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete monthly data error:', error);
    return NextResponse.json({ error: 'Silme işlemi başarısız.' }, { status: 500 });
  }
}
