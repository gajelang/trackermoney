export type SourceColorKey = "blue" | "navy" | "cyan" | "indigo" | "slate"

export const defaultSourceColor = "#3b82f6"

export const sourceColorHex: Record<SourceColorKey, string> = {
  blue: "#3b82f6",
  navy: "#1e3a8a",
  cyan: "#06b6d4",
  indigo: "#6366f1",
  slate: "#64748b",
}

export const sourceGradientClasses: Record<SourceColorKey, string> = {
  blue: "from-sky-500/25 via-card to-card border-sky-500/30",
  navy: "from-blue-700/30 via-card to-card border-blue-600/30",
  cyan: "from-cyan-500/25 via-card to-card border-cyan-400/30",
  indigo: "from-indigo-500/25 via-card to-card border-indigo-400/30",
  slate: "from-slate-500/25 via-card to-card border-slate-400/30",
}

export function normalizeSourceColor(value?: string) {
  if (!value) return defaultSourceColor
  const key = value as SourceColorKey
  return sourceColorHex[key] || value
}
