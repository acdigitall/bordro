import { PrismaClient, Role, EmploymentType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with secure hashed passwords...');

  // 1. Create Tax Settings for 2026
  await prisma.taxSetting.create({
    data: {
      year: 2026,
      minimumGrossWage: 20002.5,
      sgkCeiling: 150018.75,
      sgkEmployeeRate: 0.14,
      unemploymentEmployeeRate: 0.01,
      sgkEmployerRate: 0.155,
      unemploymentEmployerRate: 0.02,
      stampTaxRate: 0.00759,
      bracketsJson: JSON.stringify([
        { limit: 110000, rate: 0.15 },
        { limit: 230000, rate: 0.2 },
        { limit: 870000, rate: 0.27 },
        { limit: 3000000, rate: 0.35 },
        { limit: Infinity, rate: 0.4 },
      ]),
    },
  });

  // 2. Create Demo Company
  const company = await prisma.company.create({
    data: {
      name: 'Teknoloji A.Ş.',
      taxOffice: 'Büyük Mükellefler',
      taxNo: '1234567890',
      address: 'Maslak, İstanbul',
      status: 'ACTIVE',
    },
  });

  // Hash initial passwords using bcrypt
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const hashedSuperPassword = await bcrypt.hash('12345678', 10);

  // 3. Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      companyId: company.id,
      name: 'Ahmet Yılmaz',
      email: 'admin@teknoloji.com',
      passwordHash: hashedAdminPassword,
      role: Role.TENANT_ADMIN,
    },
  });

  // 4. Create Super Admin User
  const superUser = await prisma.user.create({
    data: {
      name: 'Çağatay Dalaman',
      email: 'cagataydalaman@outlook.com',
      passwordHash: hashedSuperPassword,
      role: Role.SUPER_ADMIN,
    },
  });

  // 5. Create Department
  const deptDev = await prisma.department.create({
    data: {
      companyId: company.id,
      name: 'Yazılım Geliştirme',
    },
  });

  // 6. Create Sample Employee
  const employee = await prisma.employee.create({
    data: {
      companyId: company.id,
      employeeCode: 'EMP-001',
      tcNo: '12345678901',
      firstName: 'Mehmet',
      lastName: 'Kaya',
      title: 'Kıdemli Yazılım Geliştirici',
      departmentId: deptDev.id,
      employmentType: EmploymentType.FULL_TIME,
      hireDate: new Date('2023-01-15'),
      baseSalary: 65000,
      cumulativeMatrah: 120000,
    },
  });

  console.log('Seed data created successfully!');
  console.log(`Company ID: ${company.id}`);
  console.log(`Admin User: ${adminUser.email}`);
  console.log(`Super Admin User: ${superUser.email}`);
  console.log(`Sample Employee: ${employee.firstName} ${employee.lastName}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
