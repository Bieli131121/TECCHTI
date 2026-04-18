import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [empresa, setEmpresa] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) loadEmpresa(session.user.id)
      else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) loadEmpresa(session.user.id)
      else { setEmpresa(null); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function loadEmpresa(userId) {
    const { data } = await supabase
      .from('usuarios')
      .select('empresa_id, empresas(*)')
      .eq('id', userId)
      .single()
    setEmpresa(data?.empresas ?? null)
    setLoading(false)
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  async function signUp(email, password, nomeEmpresa, nomeUsuario) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error }
    const userId = data.user.id

    // Criar empresa
    const { data: emp, error: empErr } = await supabase
      .from('empresas')
      .insert({ nome: nomeEmpresa, plano: 'basico' })
      .select().single()
    if (empErr) return { error: empErr }

    // Criar usuário vinculado
    await supabase.from('usuarios').insert({
      id: userId,
      empresa_id: emp.id,
      nome: nomeUsuario,
      email,
      role: 'admin',
    })
    return { data }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, empresa, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
