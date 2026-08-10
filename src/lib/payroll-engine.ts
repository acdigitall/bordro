// Türkiye İş ve Vergi Mevzuatına Uygun Bordro Hesaplama Motoru (2026 Mevzuatı)

export interface TaxBracket {
  limit: number; // Üst sınır
  rate: number;  // Vergi oranı (örn: 0.15)
}

export interface PayrollCalculationInput {
  baseSalary: number;            // Aylık Brüt Ücret
  totalIncomes?: number;         // Ek Gelirler (Huzur hakkı, ikramiye vb.)
  overtimeHours?: number;        // Fazla mesai saati
  overtimeMultiplier?: number;   // Mesai çarpanı (varsayılan: 1.5)
  commissions?: number;          // Prim ve komisyonlar
  deductions?: number;           // Kesintiler (İcra, özel sigorta vb.)
  loanInstallment?: number;      // Avans/Borç taksiti
  previousCumulativeMatrah?: number; // Önceki aylardan devreden kümülatif GV matrahı
  taxExemptionType?: string;     // STANDARD, DISABLED_1 (₺6.900), DISABLED_2 (₺4.000), DISABLED_3 (₺1.700)
  applyMinWageExemption?: boolean; // Asgari ücret vergi istisnası uygulansın mı? (Varsayılan: true)
}

export interface PayrollCalculationResult {
  grossSalary: number;
  totalIncome: number;
  overtimeAmount: number;
  commissionAmount: number;
  totalGrossEarnings: number;
  
  // SGK İşçi
  sgkEmployeeMatrah: number;
  sgkEmployee: number;          // %14
  unemploymentEmployee: number; // %1
  totalSgkEmployee: number;

  // SGK İşveren
  sgkEmployer: number;          // %15.5
  unemploymentEmployer: number; // %2
  totalEmployerCost: number;

  // Gelir Vergisi
  incomeTaxMatrah: number;
  previousCumulativeMatrah: number;
  newCumulativeMatrah: number;
  rawIncomeTax: number;
  minWageExemptionGV: number;
  netIncomeTax: number;

  // Damga Vergisi
  rawStampTax: number;
  minWageExemptionDV: number;
  netStampTax: number;

  // Net Hesap
  totalDeductionsInput: number;
  loanInstallmentInput: number;
  netSalary: number;
}

// 2026 Varsayılan Mevzuat Parametreleri
export const DEFAULT_MIN_GROSS_WAGE = 20002.50; // Asgari Ücret Brüt (2026)
export const DEFAULT_SGK_CEILING = 150018.75;  // Asgari Ücretin 7.5 katı
export const DEFAULT_STAMP_TAX_RATE = 0.00759; // Binde 7.59

// 2026 Asgari Ücret Vergi İstisnası Sabitleri
export const DEFAULT_MIN_WAGE_GV_EXEMPTION = 4211.33; // 2026 Aylık Gelir Vergisi İstisna Tutarı (₺)
export const DEFAULT_MIN_WAGE_DV_EXEMPTION = 250.70;  // 2026 Aylık Damga Vergisi İstisna Tutarı (₺)

// 2026 Gelir Vergisi Dilimleri (Ücret Gelirleri)
export const DEFAULT_TAX_BRACKETS: TaxBracket[] = [
  { limit: 190000, rate: 0.15 },
  { limit: 400000, rate: 0.20 },
  { limit: 1500000, rate: 0.27 },
  { limit: 5300000, rate: 0.35 },
  { limit: Infinity, rate: 0.40 },
];

/**
 * Herhangi bir kümülatif matrahın vergi dilimlerindeki TOPLAM tutarını hesaplar.
 */
export function calculateCumulativeTax(
  cumMatrah: number,
  brackets: TaxBracket[] = DEFAULT_TAX_BRACKETS
): number {
  if (cumMatrah <= 0) return 0;
  let tax = 0;
  for (let i = 0; i < brackets.length; i++) {
    const prevLimit = i === 0 ? 0 : brackets[i - 1].limit;
    const currentLimit = brackets[i].limit;
    const rate = brackets[i].rate;

    if (cumMatrah > prevLimit) {
      const taxableInBracket = Math.min(cumMatrah, currentLimit) - prevLimit;
      if (taxableInBracket > 0) {
        tax += taxableInBracket * rate;
      }
    }
  }
  return tax;
}

/**
 * Kümülatif Matrah Fark Yöntemi ile O Ayın İstisnasız Gelir Vergisini Hesaplar
 * (Adım 3-5: yeni_kümülatif_vergi - önceki_kümülatif_vergi)
 */
export function calculateBracketIncomeTax(
  currentMatrah: number,
  prevCumulativeMatrah: number,
  brackets: TaxBracket[] = DEFAULT_TAX_BRACKETS
): number {
  if (currentMatrah <= 0) return 0;
  const prevCum = Math.max(0, prevCumulativeMatrah);
  const newCum = prevCum + currentMatrah;
  const newCumTax = calculateCumulativeTax(newCum, brackets);
  const prevCumTax = calculateCumulativeTax(prevCum, brackets);
  return Math.max(0, newCumTax - prevCumTax);
}

/**
 * Türkiye Bordro Ana Hesaplama Fonksiyonu (2026 Mevzuatı)
 */
export function calculatePayroll(input: PayrollCalculationInput): PayrollCalculationResult {
  const baseSalary = Math.max(0, input.baseSalary || 0);
  const totalIncome = Math.max(0, input.totalIncomes || 0);
  const overtimeHours = Math.max(0, input.overtimeHours || 0);
  const overtimeMultiplier = input.overtimeMultiplier || 1.5;
  const commissionAmount = Math.max(0, input.commissions || 0);
  const deductionsInput = Math.max(0, input.deductions || 0);
  const loanInstallmentInput = Math.max(0, input.loanInstallment || 0);
  const prevCumMatrah = Math.max(0, input.previousCumulativeMatrah || 0);
  const applyMinWageExemption = input.applyMinWageExemption ?? true;

  // Saatlik ücret ve fazla mesai tutarı
  const hourlyRate = baseSalary / 225; // Türk İş Kanununa göre aylık çalışma saati 225
  const overtimeAmount = overtimeHours * hourlyRate * overtimeMultiplier;

  // Brüt Toplam Kazanç
  const totalGrossEarnings = baseSalary + totalIncome + overtimeAmount + commissionAmount;

  // SGK İşçi Payları (Adım 1: %14 SGK + %1 İşsizlik)
  const sgkEmployeeMatrah = Math.min(totalGrossEarnings, DEFAULT_SGK_CEILING);
  const sgkEmployee = sgkEmployeeMatrah * 0.14;
  const unemploymentEmployee = sgkEmployeeMatrah * 0.01;
  const totalSgkEmployee = sgkEmployee + unemploymentEmployee;

  // SGK İşveren Payları (%15.5 5 puan teşvikli + %2 işsizlik)
  const sgkEmployer = sgkEmployeeMatrah * 0.155;
  const unemploymentEmployer = sgkEmployeeMatrah * 0.02;

  // Gelir Vergisi Matrahı
  const incomeTaxMatrah = Math.max(0, totalGrossEarnings - totalSgkEmployee);
  
  // Engellilik İndirimi
  let disabilityDeduction = 0;
  if (input.taxExemptionType === 'DISABLED_1') disabilityDeduction = 6900;
  else if (input.taxExemptionType === 'DISABLED_2') disabilityDeduction = 4000;
  else if (input.taxExemptionType === 'DISABLED_3') disabilityDeduction = 1700;

  const netIncomeTaxMatrah = Math.max(0, incomeTaxMatrah - disabilityDeduction);

  // Kümülatif Gelir Vergisi (Adım 3 - 5: Fark Yöntemi)
  const rawIncomeTax = calculateBracketIncomeTax(netIncomeTaxMatrah, prevCumMatrah, DEFAULT_TAX_BRACKETS);

  // Asgari Ücret Gelir Vergisi İstisnası (Adım 6: MAX(0, bu_ayın_istisnasız_vergisi - 4.211,33))
  const minWageExemptionGV = applyMinWageExemption
    ? Math.min(rawIncomeTax, DEFAULT_MIN_WAGE_GV_EXEMPTION)
    : 0;
  const netIncomeTax = Math.max(0, rawIncomeTax - minWageExemptionGV);

  // Damga Vergisi Hesabı (Adım 7: MAX(0, brüt * %0.759 - 250.70))
  const rawStampTax = totalGrossEarnings * DEFAULT_STAMP_TAX_RATE;
  const minWageExemptionDV = applyMinWageExemption
    ? Math.min(rawStampTax, DEFAULT_MIN_WAGE_DV_EXEMPTION)
    : 0;
  const netStampTax = Math.max(0, rawStampTax - minWageExemptionDV);

  // Net Maaş
  const netSalary = Math.max(
    0,
    totalGrossEarnings -
      totalSgkEmployee -
      netIncomeTax -
      netStampTax -
      deductionsInput -
      loanInstallmentInput
  );

  const totalEmployerCost = totalGrossEarnings + sgkEmployer + unemploymentEmployer;

  return {
    grossSalary: baseSalary,
    totalIncome,
    overtimeAmount,
    commissionAmount,
    totalGrossEarnings,
    sgkEmployeeMatrah,
    sgkEmployee,
    unemploymentEmployee,
    totalSgkEmployee,
    sgkEmployer,
    unemploymentEmployer,
    totalEmployerCost,
    incomeTaxMatrah: netIncomeTaxMatrah,
    previousCumulativeMatrah: prevCumMatrah,
    newCumulativeMatrah: prevCumMatrah + netIncomeTaxMatrah,
    rawIncomeTax,
    minWageExemptionGV,
    netIncomeTax,
    rawStampTax,
    minWageExemptionDV,
    netStampTax,
    totalDeductionsInput: deductionsInput,
    loanInstallmentInput,
    netSalary,
  };
}

/**
 * Sayı Biçimlendirme Yardımcısı (₺ 1.234,56 TL)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}
