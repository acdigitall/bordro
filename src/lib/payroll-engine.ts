// Türkiye İş ve Vergi Mevzuatına Uygun Bordro Hesaplama Motoru

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

// 2026 Varsayılan Mevzuat Parametreleri (Dinamik Ayarlardan Override Edilebilir)
export const DEFAULT_MIN_GROSS_WAGE = 20002.50; // Asgari Ücret Brüt
export const DEFAULT_SGK_CEILING = 150018.75;  // Asgari Ücretin 7.5 katı
export const DEFAULT_STAMP_TAX_RATE = 0.00759; // Binde 7.59

export const DEFAULT_TAX_BRACKETS: TaxBracket[] = [
  { limit: 110000, rate: 0.15 },
  { limit: 230000, rate: 0.20 },
  { limit: 870000, rate: 0.27 },
  { limit: 3000000, rate: 0.35 },
  { limit: Infinity, rate: 0.40 },
];

/**
 * Kümülatif Matrah Dilim Sistemi ile Gelir Vergisi Hesaplar
 */
export function calculateBracketIncomeTax(
  currentMatrah: number,
  prevCumulativeMatrah: number,
  brackets: TaxBracket[] = DEFAULT_TAX_BRACKETS
): number {
  let tax = 0;
  let remainingMatrah = currentMatrah;
  let runningMatrah = prevCumulativeMatrah;

  for (let i = 0; i < brackets.length; i++) {
    const prevLimit = i === 0 ? 0 : brackets[i - 1].limit;
    const currentLimit = brackets[i].limit;
    const rate = brackets[i].rate;

    if (runningMatrah < currentLimit && remainingMatrah > 0) {
      const taxableInThisBracket = Math.min(
        remainingMatrah,
        currentLimit - Math.max(runningMatrah, prevLimit)
      );

      if (taxableInThisBracket > 0) {
        tax += taxableInThisBracket * rate;
        remainingMatrah -= taxableInThisBracket;
        runningMatrah += taxableInThisBracket;
      }
    }
  }

  return tax;
}

/**
 * Türkiye Bordro Ana Hesaplama Fonksiyonu
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

  // Saatlik ücret ve fazla mesai tutarı
  const hourlyRate = baseSalary / 225; // Türk İş Kanununa göre aylık çalışma saati 225
  const overtimeAmount = overtimeHours * hourlyRate * overtimeMultiplier;

  // Brüt Toplam Kazanç
  const totalGrossEarnings = baseSalary + totalIncome + overtimeAmount + commissionAmount;

  // SGK Tavan Kontrolü
  const sgkEmployeeMatrah = Math.min(totalGrossEarnings, DEFAULT_SGK_CEILING);
  const sgkEmployee = sgkEmployeeMatrah * 0.14;
  const unemploymentEmployee = sgkEmployeeMatrah * 0.01;
  const totalSgkEmployee = sgkEmployee + unemploymentEmployee;

  // SGK İşveren Hesabı (%15.5 teşvikli + %2 işsizlik)
  const sgkEmployer = sgkEmployeeMatrah * 0.155;
  const unemploymentEmployer = sgkEmployeeMatrah * 0.02;

  // Gelir Vergisi Matrahı
  const incomeTaxMatrah = Math.max(0, totalGrossEarnings - totalSgkEmployee);
  
  // Engellik İndirimi
  let disabilityDeduction = 0;
  if (input.taxExemptionType === 'DISABLED_1') disabilityDeduction = 6900;
  else if (input.taxExemptionType === 'DISABLED_2') disabilityDeduction = 4000;
  else if (input.taxExemptionType === 'DISABLED_3') disabilityDeduction = 1700;

  const netIncomeTaxMatrah = Math.max(0, incomeTaxMatrah - disabilityDeduction);

  // Kümülatif Gelir Vergisi
  const rawIncomeTax = calculateBracketIncomeTax(netIncomeTaxMatrah, prevCumMatrah);

  // Asgari Ücret Gelir Vergisi İstisnası Hesaplama
  const minWageSgk = DEFAULT_MIN_GROSS_WAGE * 0.15; // %14 + %1
  const minWageGvMatrah = DEFAULT_MIN_GROSS_WAGE - minWageSgk;
  const minWageExemptionGV = Math.min(rawIncomeTax, minWageGvMatrah * 0.15); // İlk dilim %15

  const netIncomeTax = Math.max(0, rawIncomeTax - minWageExemptionGV);

  // Damga Vergisi Hesabı
  const rawStampTax = totalGrossEarnings * DEFAULT_STAMP_TAX_RATE;
  const minWageExemptionDV = DEFAULT_MIN_GROSS_WAGE * DEFAULT_STAMP_TAX_RATE;
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
