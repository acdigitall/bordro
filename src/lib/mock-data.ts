export interface CompanyMock {
  id: string;
  name: string;
  taxOffice: string;
  taxNo: string;
  address: string;
  logoUrl: string;
  planName: string;
  status: 'ACTIVE' | 'SUSPENDED';
  employeeCount: number;
}

export interface DepartmentMock {
  id: string;
  code?: string;
  name: string;
  employeeCount: number;
}

export interface BankMock {
  id: string;
  name: string;
  swiftCode: string;
  iban: string;
}

export interface EmployeeMock {
  id: string;
  employeeCode: string;
  tcNo: string;
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: string;
  departmentId: string;
  departmentName: string;
  title: string;
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT';
  hireDate: string;
  status: 'ACTIVE' | 'LEAVING' | 'TERMINATED';
  baseSalary: number;
  bankId: string;
  bankName: string;
  iban: string;
  taxExemptionType: string;
  cumulativeMatrah: number;
}

export interface PayrollPeriodMock {
  id: string;
  month: number;
  year: number;
  monthName: string;
  status: 'DRAFT' | 'APPROVED' | 'AUTHORIZED' | 'LOCKED';
  totalGross: number;
  totalNet: number;
  totalEmployerCost: number;
  employeeCount: number;
}

export interface AuditLogMock {
  id: string;
  userName: string;
  userRole: string;
  action: string;
  entity: string;
  createdAt: string;
}

export const INITIAL_COMPANY: CompanyMock = {
  id: 'cmp-keban-001',
  name: 'Keban Şirketler Grubu Ltd. Şti.',
  taxOffice: 'Büyük Mükellefler V.D.',
  taxNo: '5480192837',
  address: 'Maslak Mah. Büyükdere Cad. No:142 Şişli / İstanbul',
  logoUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=120&h=120&q=80',
  planName: 'Bordro Paketi',
  status: 'ACTIVE',
  employeeCount: 8,
};

export const INITIAL_DEPARTMENTS: DepartmentMock[] = [
  { id: 'dept-01', code: 'YAZ', name: 'Yazılım & Teknoloji', employeeCount: 3 },
  { id: 'dept-02', code: 'IK', name: 'İnsan Kaynakları & Bordro', employeeCount: 2 },
  { id: 'dept-03', code: 'FIN', name: 'Finans & Muhasebe', employeeCount: 2 },
  { id: 'dept-04', code: 'PAZ', name: 'Pazarlama & Satış', employeeCount: 1 },
];

export const INITIAL_BANKS: BankMock[] = [
  { id: 'bank-01', name: 'Türkiye İş Bankası', swiftCode: 'ISBTRIS', iban: 'TR42 0006 4000 0011 2233 4455 66' },
  { id: 'bank-02', name: 'Garanti BBVA', swiftCode: 'GAGBTRIS', iban: 'TR12 0006 2000 0099 8877 6655 44' },
  { id: 'bank-03', name: 'Ziraat Bankası', swiftCode: 'TCZBTR2A', iban: 'TR98 0001 0000 0055 4433 2211 00' },
];

export const INITIAL_EMPLOYEES: EmployeeMock[] = [
  {
    id: 'emp-101',
    employeeCode: 'SICIL-001',
    tcNo: '10293847561',
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    gender: 'Erkek',
    birthDate: '1988-04-12',
    departmentId: 'dept-01',
    departmentName: 'Yazılım & Teknoloji',
    title: 'Kıdemli Yazılım Mimarı',
    employmentType: 'FULL_TIME',
    hireDate: '2021-03-15',
    status: 'ACTIVE',
    baseSalary: 75000.0,
    bankId: 'bank-01',
    bankName: 'Türkiye İş Bankası',
    iban: 'TR42 0006 4000 0011 2233 4455 10',
    taxExemptionType: 'STANDARD',
    cumulativeMatrah: 340000.0,
  },
  {
    id: 'emp-102',
    employeeCode: 'SICIL-002',
    tcNo: '49382710592',
    firstName: 'Zeynep',
    lastName: 'Kaya',
    gender: 'Kadın',
    birthDate: '1992-09-24',
    departmentId: 'dept-02',
    departmentName: 'İnsan Kaynakları & Bordro',
    title: 'İnsan Kaynakları Müdürü',
    employmentType: 'FULL_TIME',
    hireDate: '2020-01-10',
    status: 'ACTIVE',
    baseSalary: 62000.0,
    bankId: 'bank-02',
    bankName: 'Garanti BBVA',
    iban: 'TR12 0006 2000 0099 8877 6655 11',
    taxExemptionType: 'STANDARD',
    cumulativeMatrah: 280000.0,
  },
  {
    id: 'emp-103',
    employeeCode: 'SICIL-003',
    tcNo: '75849302184',
    firstName: 'Mehmet',
    lastName: 'Demir',
    gender: 'Erkek',
    birthDate: '1995-11-03',
    departmentId: 'dept-01',
    departmentName: 'Yazılım & Teknoloji',
    title: 'Frontend Geliştirici',
    employmentType: 'FULL_TIME',
    hireDate: '2022-06-01',
    status: 'ACTIVE',
    baseSalary: 48000.0,
    bankId: 'bank-01',
    bankName: 'Türkiye İş Bankası',
    iban: 'TR42 0006 4000 0011 2233 4455 12',
    taxExemptionType: 'STANDARD',
    cumulativeMatrah: 215000.0,
  },
  {
    id: 'emp-104',
    employeeCode: 'SICIL-004',
    tcNo: '30492817405',
    firstName: 'Elif',
    lastName: 'Çelik',
    gender: 'Kadın',
    birthDate: '1996-02-18',
    departmentId: 'dept-03',
    departmentName: 'Finans & Muhasebe',
    title: 'Genel Muhasebe Uzmanı',
    employmentType: 'FULL_TIME',
    hireDate: '2023-01-15',
    status: 'ACTIVE',
    baseSalary: 38000.0,
    bankId: 'bank-03',
    bankName: 'Ziraat Bankası',
    iban: 'TR98 0001 0000 0055 4433 2211 13',
    taxExemptionType: 'DISABLED_3', // Engelli indirimi
    cumulativeMatrah: 165000.0,
  },
  {
    id: 'emp-105',
    employeeCode: 'SICIL-005',
    tcNo: '59201938472',
    firstName: 'Caner',
    lastName: 'Öztürk',
    gender: 'Erkek',
    birthDate: '1990-07-30',
    departmentId: 'dept-04',
    departmentName: 'Pazarlama & Satış',
    title: 'Satış Yöneticisi',
    employmentType: 'FULL_TIME',
    hireDate: '2021-09-01',
    status: 'ACTIVE',
    baseSalary: 32000.0,
    bankId: 'bank-02',
    bankName: 'Garanti BBVA',
    iban: 'TR12 0006 2000 0099 8877 6655 14',
    taxExemptionType: 'STANDARD',
    cumulativeMatrah: 140000.0,
  },
  {
    id: 'emp-106',
    employeeCode: 'SICIL-006',
    tcNo: '98402918273',
    firstName: 'Ayşe',
    lastName: 'Aydın',
    gender: 'Kadın',
    birthDate: '1999-05-14',
    departmentId: 'dept-01',
    departmentName: 'Yazılım & Teknoloji',
    title: 'Junior Test Mühendisi',
    employmentType: 'FULL_TIME',
    hireDate: '2024-02-01',
    status: 'ACTIVE',
    baseSalary: 25000.0,
    bankId: 'bank-01',
    bankName: 'Türkiye İş Bankası',
    iban: 'TR42 0006 4000 0011 2233 4455 15',
    taxExemptionType: 'STANDARD',
    cumulativeMatrah: 98000.0,
  },
  {
    id: 'emp-107',
    employeeCode: 'SICIL-007',
    tcNo: '29401827364',
    firstName: 'Burak',
    lastName: 'Şahin',
    gender: 'Erkek',
    birthDate: '1997-12-05',
    departmentId: 'dept-02',
    departmentName: 'İnsan Kaynakları & Bordro',
    title: 'Bordro Uzman Yardımcısı',
    employmentType: 'FULL_TIME',
    hireDate: '2023-11-10',
    status: 'ACTIVE',
    baseSalary: 22500.0,
    bankId: 'bank-03',
    bankName: 'Ziraat Bankası',
    iban: 'TR98 0001 0000 0055 4433 2211 16',
    taxExemptionType: 'STANDARD',
    cumulativeMatrah: 85000.0,
  },
  {
    id: 'emp-108',
    employeeCode: 'SICIL-008',
    tcNo: '84019283746',
    firstName: 'Selin',
    lastName: 'Yıldız',
    gender: 'Kadın',
    birthDate: '2001-08-20',
    departmentId: 'dept-03',
    departmentName: 'Finans & Muhasebe',
    title: 'Stajyer Asistan',
    employmentType: 'FULL_TIME',
    hireDate: '2024-06-01',
    status: 'ACTIVE',
    baseSalary: 20002.50, // Tam Asgari Ücret
    bankId: 'bank-01',
    bankName: 'Türkiye İş Bankası',
    iban: 'TR42 0006 4000 0011 2233 4455 17',
    taxExemptionType: 'STANDARD',
    cumulativeMatrah: 34000.0,
  },
];

export const INITIAL_PERIODS: PayrollPeriodMock[] = [
  {
    id: 'period-2026-08',
    month: 8,
    year: 2026,
    monthName: 'Ağustos 2026',
    status: 'DRAFT',
    totalGross: 348502.50,
    totalNet: 264120.40,
    totalEmployerCost: 409490.43,
    employeeCount: 8,
  },
  {
    id: 'period-2026-07',
    month: 7,
    year: 2026,
    monthName: 'Temmuz 2026',
    status: 'LOCKED',
    totalGross: 348502.50,
    totalNet: 265890.10,
    totalEmployerCost: 409490.43,
    employeeCount: 8,
  },
  {
    id: 'period-2026-06',
    month: 6,
    year: 2026,
    monthName: 'Haziran 2026',
    status: 'LOCKED',
    totalGross: 340000.00,
    totalNet: 261400.00,
    totalEmployerCost: 399500.00,
    employeeCount: 8,
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogMock[] = [
  {
    id: 'log-001',
    userName: 'Cenker Yaman (Tenant Admin)',
    userRole: 'TENANT_ADMIN',
    action: 'Temmuz 2026 Bordrosu Yetkilendirildi ve Kilitlendi',
    entity: 'PayrollPeriod',
    createdAt: '2026-07-31 16:45',
  },
  {
    id: 'log-002',
    userName: 'Cenker Yaman (Tenant Admin)',
    userRole: 'TENANT_ADMIN',
    action: 'Yeni Çalışan Eklendi: Selin Yıldız (SICIL-008)',
    entity: 'Employee',
    createdAt: '2026-07-28 11:20',
  },
  {
    id: 'log-003',
    userName: 'Super Admin',
    userRole: 'SUPER_ADMIN',
    action: 'Keban Ltd Şirketi Paket Yükseltildi -> Profesyonel SaaS',
    entity: 'Company',
    createdAt: '2026-07-15 09:10',
  },
];

export const INITIAL_PLANS = [
  { id: 'plan-01', code: 'STARTER', name: 'Başlangıç SaaS', monthlyPrice: 1500, maxEmployees: 10 },
  { id: 'plan-02', code: 'PRO', name: 'Profesyonel SaaS', monthlyPrice: 3500, maxEmployees: 50 },
  { id: 'plan-03', code: 'ENTERPRISE', name: 'Kurumsal SaaS', monthlyPrice: 8900, maxEmployees: 500 },
];

export const INITIAL_USERS = [
  { id: 'u-1', name: 'Cenker Yaman', email: 'cenker@kebanholding.com', role: 'TENANT_ADMIN' },
  { id: 'u-2', name: 'Zeynep Kaya', email: 'zeynep@kebanholding.com', role: 'PAYROLL_OFFICER' },
  { id: 'u-3', name: 'Mehmet Demir', email: 'mehmet@kebanholding.com', role: 'FINANCE_APPROVER' },
];

