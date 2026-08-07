// Türkiye İş Kanunu (4857 Sayılı Kanun) Kıdem & İhbar Tazminatı Hesaplama Motoru

export interface SeveranceInput {
  hireDate: string | Date;      // İşe Giriş Tarihi
  leaveDate: string | Date;     // İşten Ayrılış Tarihi
  baseSalary: number;           // Aylık Son Brüt Ücret (TRY)
  regularBenefits?: number;     // Düzenli Yemek/Yol/İkramiye vb. Aylık Brüt
  unusedLeaveDays?: number;     // Kullanılmayan Yıllık İzin Günü
  reason?: string;              // Ayrılma Nedeni (İşveren Feshi, Emeklilik, Askerlik vb.)
}

export interface SeveranceResult {
  tenureYears: number;
  tenureMonths: number;
  tenureDays: number;
  totalTenureDays: number;

  grossMonthlyBasis: number;    // Giydirilmiş Brüt Maaş
  cappedMonthlyBasis: number;   // Tavan Uygulanmış Giydirilmiş Brüt

  // Kıdem Tazminatı
  grossSeverance: number;
  severanceStampTax: number;
  netSeverance: number;

  // İhbar Tazminatı
  noticeWeeks: number;
  noticeDays: number;
  grossNotice: number;
  noticeIncomeTax: number;
  noticeStampTax: number;
  netNotice: number;

  // Kullanılmayan İzin
  grossUnusedLeave: number;
  unusedLeaveSgk: number;
  unusedLeaveIncomeTax: number;
  unusedLeaveStampTax: number;
  netUnusedLeave: number;

  // Toplam
  totalGrossPay: number;
  totalDeductions: number;
  totalNetPay: number;
}

// 2026 Mevzuatı Parametreleri
export const DEFAULT_SEVERANCE_CEILING = 46345.15; // 2026 Hazine & Maliye Bakanlığı Kıdem Tavanı
export const STAMP_TAX_RATE = 0.00759; // Binde 7.59

/**
 * Kıdem ve İhbar Tazminatı Hesaplama Fonksiyonu
 */
export function calculateSeverancePay(input: SeveranceInput): SeveranceResult {
  const hire = new Date(input.hireDate);
  const leave = new Date(input.leaveDate);

  const totalTimeDiff = Math.max(0, leave.getTime() - hire.getTime());
  const totalTenureDays = Math.floor(totalTimeDiff / (1000 * 60 * 60 * 24));

  const tenureYears = Math.floor(totalTenureDays / 365);
  const remainingDaysAfterYears = totalTenureDays % 365;
  const tenureMonths = Math.floor(remainingDaysAfterYears / 30);
  const tenureDays = remainingDaysAfterYears % 30;

  const baseSalary = Math.max(0, input.baseSalary || 0);
  const regularBenefits = Math.max(0, input.regularBenefits || 0);
  const grossMonthlyBasis = baseSalary + regularBenefits;

  // Kıdem Tavanı Kontrolü
  const cappedMonthlyBasis = Math.min(grossMonthlyBasis, DEFAULT_SEVERANCE_CEILING);

  // Kıdem Tazminatı Brüt Hesabı (Oransal Gün Hesabı)
  const grossSeverance = (cappedMonthlyBasis * totalTenureDays) / 365;
  const severanceStampTax = grossSeverance * STAMP_TAX_RATE;
  const netSeverance = Math.max(0, grossSeverance - severanceStampTax);

  // İhbar Süresi Hesabı (4857 Sayılı Kanun Madde 17)
  let noticeWeeks = 2;
  if (totalTenureDays >= 180 && totalTenureDays < 540) {
    noticeWeeks = 4;
  } else if (totalTenureDays >= 540 && totalTenureDays < 1095) {
    noticeWeeks = 6;
  } else if (totalTenureDays >= 1095) {
    noticeWeeks = 8;
  }

  const noticeDays = noticeWeeks * 7;
  const dailyGross = baseSalary / 30;
  const grossNotice = dailyGross * noticeDays;
  const noticeIncomeTax = grossNotice * 0.15; // %15 İlk Dilim Gelir Vergisi
  const noticeStampTax = grossNotice * STAMP_TAX_RATE;
  const netNotice = Math.max(0, grossNotice - noticeIncomeTax - noticeStampTax);

  // Kullanılmayan İzin Ücreti Hesabı
  const unusedDays = Math.max(0, input.unusedLeaveDays || 0);
  const grossUnusedLeave = dailyGross * unusedDays;
  const unusedLeaveSgk = grossUnusedLeave * 0.15; // %14 + %1
  const unusedLeaveGvMatrah = Math.max(0, grossUnusedLeave - unusedLeaveSgk);
  const unusedLeaveIncomeTax = unusedLeaveGvMatrah * 0.15;
  const unusedLeaveStampTax = grossUnusedLeave * STAMP_TAX_RATE;
  const netUnusedLeave = Math.max(
    0,
    grossUnusedLeave - unusedLeaveSgk - unusedLeaveIncomeTax - unusedLeaveStampTax
  );

  const totalGrossPay = grossSeverance + grossNotice + grossUnusedLeave;
  const totalDeductions =
    severanceStampTax + noticeIncomeTax + noticeStampTax + unusedLeaveSgk + unusedLeaveIncomeTax + unusedLeaveStampTax;
  const totalNetPay = netSeverance + netNotice + netUnusedLeave;

  return {
    tenureYears,
    tenureMonths,
    tenureDays,
    totalTenureDays,
    grossMonthlyBasis,
    cappedMonthlyBasis,
    grossSeverance,
    severanceStampTax,
    netSeverance,
    noticeWeeks,
    noticeDays,
    grossNotice,
    noticeIncomeTax,
    noticeStampTax,
    netNotice,
    grossUnusedLeave,
    unusedLeaveSgk,
    unusedLeaveIncomeTax,
    unusedLeaveStampTax,
    netUnusedLeave,
    totalGrossPay,
    totalDeductions,
    totalNetPay,
  };
}
