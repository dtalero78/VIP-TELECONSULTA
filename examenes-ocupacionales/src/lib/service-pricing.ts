import type { ExamId } from "./booking";
// Valores autorizados por VIP, en pesos COP. No se suman por examen.
export const servicePrices = { medical: 43000, audioPackage: 52000 };
export function serviceTotal(selected: readonly ExamId[]): number | null {
  if (!selected.includes("osteomuscular")) return null;
  return selected.some((id) => id === "audiometria" || id === "visiometria")
    ? servicePrices.audioPackage
    : servicePrices.medical;
}
export const formatCOP = (amount: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
export const paymentAccounts = [
  {
    name: "Bancolombia",
    type: "Cuenta de ahorros",
    number: "21700001442",
    icon: "🏦",
  },
  {
    name: "Davivienda",
    type: "Cuenta de ahorros",
    number: "001600128670",
    icon: "🏦",
  },
  {
    name: "Nequi",
    type: "Número de celular",
    number: "3134010901",
    icon: "📲",
  },
  {
    name: "Bre-B",
    type: "Llaves",
    number: "0089430019 / @3134010901",
    icon: "🔑",
  },
] as const;
