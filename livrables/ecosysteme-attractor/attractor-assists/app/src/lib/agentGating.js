const PLAN_RANK = {
  gratuit: 0, decouverte: 0, decouverte_eu: 0,
  growth: 1, growth_eu: 1,
  team: 2,
  personnalise: 3,
}

// Retourne 'actif' | 'demo' | 'verrouille'
export function resolveAgentStatus(agentId, planCode) {
  const rank = PLAN_RANK[planCode] ?? 0
  if (agentId === 'coach' || agentId === 'awa' || agentId === 'hawa') return 'actif'
  if (agentId === 'carelle') {
    if (rank >= 1) return 'actif'
    return 'demo'                // Gratuit : démo uniquement
  }
  // miriam, serge, roland, kofi
  if (rank >= 2) return 'actif'
  return 'verrouille'
}

export function isAgentLocked(agentId, planCode) {
  const s = resolveAgentStatus(agentId, planCode)
  return s === 'verrouille'
}

export function isAgentDemo(agentId, planCode) {
  return resolveAgentStatus(agentId, planCode) === 'demo'
}
