// Igrejas Novo Caminho — usado nos formulários de registo (aniversário e visitante)
// e nos painéis de administração.

export const CHURCHES = [
  { key: "ourem", label: "Novo Caminho Ourém" },
  { key: "sintra", label: "Novo Caminho Sintra" },
] as const;

export type ChurchKey = (typeof CHURCHES)[number]["key"];

export function churchLabel(key: string | null | undefined): string {
  if (!key) return "—";
  return CHURCHES.find((c) => c.key === key)?.label ?? key;
}
