interface BadgeProps {
  recomendacao: "Manter" | "Avaliar" | "Descartar";
}

const styles: Record<BadgeProps["recomendacao"], string> = {
  Manter: "bg-green-100 text-green-700 border-green-300",
  Avaliar: "bg-amber-100 text-amber-700 border-amber-300",
  Descartar: "bg-red-100 text-red-700 border-red-300",
};

export function RecomendacaoBadge({ recomendacao }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${styles[recomendacao]}`}>
      {recomendacao}
    </span>
  );
}
