/**
 * Helper utilities for Gynecological & Obstetrical calculations
 */

export function calculateSA(ddrString?: string): { sa: number; days: number; text: string; trimester: string; dueDate: string } | null {
  if (!ddrString) return null;
  const ddr = new Date(ddrString);
  if (isNaN(ddr.getTime())) return null;

  const today = new Date();
  const diffTime = Math.max(0, today.getTime() - ddr.getTime());
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const sa = Math.floor(totalDays / 7);
  const remainingDays = totalDays % 7;

  // Expected Due Date (DPA) = DDR + 280 days
  const dpaDate = new Date(ddr.getTime() + 280 * 24 * 60 * 60 * 1000);
  const formattedDueDate = dpaDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  let trimester = "1er Trimestre";
  if (sa >= 14 && sa <= 27) {
    trimester = "2ème Trimestre";
  } else if (sa >= 28) {
    trimester = "3ème Trimestre";
  }

  const text = `${sa} SA + ${remainingDays}j (${sa} Semaines d'Aménorrhée)`;

  return {
    sa,
    days: remainingDays,
    text,
    trimester,
    dueDate: formattedDueDate
  };
}

export function formatFrenchDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export function translateAppointmentType(type: string): string {
  switch (type) {
    case 'consultation_gyn': return 'Consultation Gynécologique Générale';
    case 'echo_obstetrique': return 'Échographie Obstétrique (T1 / T2 / T3)';
    case 'echo_pelvienne': return 'Échographie Pelvienne & Gynécologique';
    case 'suivi_grossesse': return 'Suivi de Grossesse & Bilan Prénatal';
    case 'planning_familial': return 'Planning Familial & Infertilité';
    case 'post_partum': return 'Consultation Post-Partum';
    case 'urgence': return 'Consultation d\'Urgence Gynéco-Obstétrique';
    default: return type;
  }
}

export function getAppointmentBadgeColor(status: string): string {
  switch (status) {
    case 'confirmed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'cancelled': return 'bg-rose-100 text-rose-800 border-rose-200';
    case 'rescheduled': return 'bg-amber-100 text-amber-800 border-amber-200';
    default: return 'bg-slate-100 text-slate-800 border-slate-200';
  }
}
