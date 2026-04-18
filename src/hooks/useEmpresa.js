import { useAuth } from '../context/AuthContext'

export function useEmpresa() {
  const { empresa } = useAuth()
  return empresa?.id ?? null
}
