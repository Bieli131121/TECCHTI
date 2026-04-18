import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useEmpresa } from '../hooks/useEmpresa'
import { useAuth } from '../context/AuthContext'

const NFE_API_URL = import.meta.env.VITE_NFE_API_URL || 'https://homologacao.focusnfe.com.br/v2'
const NFE_TOKEN   = import.meta.env.VITE_NFE_TOKEN   || ''
const MUNICIPIO   = import.meta.env.VITE_NFE_MUNICIPIO || '4205704'
const ALIQUOTA    = import.meta.env.VITE_NFE_ALIQUOTA_ISS || '3.0'
const ITEM_LISTA  = import.meta.env.VITE_NFE_ITEM_LISTA_SERVICO || '1.01'

const EMPTY = {
  tomador_nome:       '',
  tomador_cpf_cnpj:   '',
  tomador_email:      '',
  tomador_logradouro: '',
  tomador_numero:     '',
  tomador_bairro:     '',
  tomador_cep:        '',
  discriminacao:      '',
  valor_servicos:     '',
  iss_retido:         false,
  natureza_operacao:  '1',
}

export default function NotaFiscal() {
  const { user }    = useAuth()
  const empresaId   = useEmpresa()
  const [notas, setNotas]   = useState([])
  const [modal, setModal]   = useState(false)
  const [form,  setForm]    = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]       = useState(null)
  const [empresa, setEmpresa] = useState(null)

  useEffect(() => {
    if (!empresaId) return
    load()
    supabase.from('empresas').select('*').eq('id', empresaId).single().then(({ data }) => setEmpresa(data))
  }, [empresaId])

  async function load() {
    const { data } = await supabase
      .from('notas_fiscais')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('created_at', { ascending: false })
    setNotas(data || [])
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  // Gera referência única para o RPS
  function gerarRps() {
    return String(Date.now()).slice(-8)
  }

  async function emitir() {
    setLoading(true); setMsg(null)
    try {
      const rps = gerarRps()

      // Payload completo para NFS-e em Garopaba/SC via Focus NFe
      const payload = {
        data_emissao:              new Date().toISOString().split('T')[0] + 'T' + new Date().toTimeString().slice(0,8) + '-0300',
        natureza_operacao:         parseInt(form.natureza_operacao),
        optante_simples_nacional:  true,
        prestador: {
          cnpj:                  empresa?.cnpj || '00000000000000',
          inscricao_municipal:   empresa?.inscricao_municipal || '000000',
          codigo_municipio:      parseInt(MUNICIPIO),
        },
        tomador: {
          cpf:          form.tomador_cpf_cnpj.length <= 14 ? form.tomador_cpf_cnpj.replace(/\D/g,'') : undefined,
          cnpj:         form.tomador_cpf_cnpj.length > 14  ? form.tomador_cpf_cnpj.replace(/\D/g,'') : undefined,
          razao_social: form.tomador_nome,
          email:        form.tomador_email,
          endereco: {
            logradouro:       form.tomador_logradouro,
            numero:           form.tomador_numero,
            bairro:           form.tomador_bairro,
            codigo_municipio: parseInt(MUNICIPIO),
            uf:               'SC',
            cep:              form.tomador_cep.replace(/\D/g,''),
          },
        },
        servico: {
          discriminacao:       form.discriminacao,
          valor_servicos:      parseFloat(form.valor_servicos),
          aliquota:            parseFloat(ALIQUOTA),
          item_lista_servico:  ITEM_LISTA,
          iss_retido:          form.iss_retido,
          codigo_municipio:    parseInt(MUNICIPIO),
        },
      }

      // Remove campos undefined do tomador
      if (!payload.tomador.cpf)  delete payload.tomador.cpf
      if (!payload.tomador.cnpj) delete payload.tomador.cnpj

      // Salva no banco com status emitindo
      const { data: nota } = await supabase.from('notas_fiscais').insert({
        empresa_id:       empresaId,
        cliente_nome:     form.tomador_nome,
        cliente_cpf_cnpj: form.tomador_cpf_cnpj,
        cliente_email:    form.tomador_email,
        descricao:        form.discriminacao,
        valor:            parseFloat(form.valor_servicos),
        status:           'emitindo',
        rps_numero:       rps,
      }).select().single()

      // Chama Focus NFe
      const res = await fetch(`${NFE_API_URL}/nfse?ref=${rps}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(NFE_TOKEN + ':'),
        },
        body: JSON.stringify(payload),
      })

      const json = await res.json()

      if (res.ok || res.status === 201 || res.status === 202) {
        await supabase.from('notas_fiscais').update({
          status:   json.status || 'processando',
          chave:    json.numero || json.chave_nfe || rps,
          xml_url:  json.caminho_xml_nota_fiscal || null,
          pdf_url:  json.caminho_danfe || null,
        }).eq('id', nota.id)

        setMsg({ type: 'success', text: `NFS-e enviada com sucesso! Status: ${json.status || 'processando'}. Ref: ${rps}` })
        setModal(false)
      } else {
        const erros = json.erros?.map(e => e.mensagem).join(', ') || json.mensagem || 'Erro desconhecido'
        await supabase.from('notas_fiscais').update({ status: 'erro' }).eq('id', nota.id)
        setMsg({ type: 'error', text: `Erro ao emitir: ${erros}` })
      }

      load()
    } catch (e) {
      setMsg({ type: 'error', text: 'Erro de conexão: ' + e.message })
    }
    setLoading(false)
  }

  const fmt = v => 'R$ ' + Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })

  const NATUREZA = [
    { value: '1', label: '1 — Tributação no município' },
    { value: '2', label: '2 — Tributação fora do município' },
    { value: '3', label: '3 — Isenção' },
    { value: '4', label: '4 — Imune' },
    { value: '5', label: '5 — Exigibilidade suspensa por decisão judicial' },
    { value: '6', label: '6 — Exigibilidade suspensa por procedimento administrativo' },
  ]

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e8e8f0', letterSpacing: '-0.03em' }}>Nota Fiscal de Serviço</h1>
          <p style={{ color: '#6666a0', fontSize: '0.85rem', marginTop: 2 }}>NFS-e — Garopaba/SC via Focus NFe</p>
        </div>
        <button className="btn-primary" onClick={() => { setForm(EMPTY); setMsg(null); setModal(true) }}>+ Emitir NFS-e</button>
      </div>

      {msg && (
        <div style={{ marginBottom: '1rem', padding: '0.875rem', borderRadius: 10, background: msg.type === 'success' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)', border: `1px solid ${msg.type === 'success' ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`, color: msg.type === 'success' ? '#4ade80' : '#f87171', fontSize: '0.85rem' }}>
          {msg.text}
        </div>
      )}

      {/* Info ambiente */}
      <div style={{ marginBottom: '1.5rem', padding: '0.875rem 1.25rem', borderRadius: 10, background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: '1rem' }}>⚠️</span>
        <div>
          <span style={{ fontSize: '0.8rem', color: '#facc15', fontWeight: 600 }}>Ambiente de Homologação (testes) — </span>
          <span style={{ fontSize: '0.8rem', color: '#9898b8' }}>
            Município: Garopaba/SC (4205704) · Alíquota ISS: {ALIQUOTA}% · Para produção, troque a URL no .env para <code style={{ background: '#1a1a26', padding: '1px 4px', borderRadius: 4 }}>https://api.focusnfe.com.br/v2</code>
          </span>
        </div>
      </div>

      {/* Configuração da empresa */}
      {empresa && (!empresa.cnpj || !empresa.inscricao_municipal) && (
        <div style={{ marginBottom: '1.5rem', padding: '0.875rem 1.25rem', borderRadius: 10, background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)' }}>
          <p style={{ fontSize: '0.8rem', color: '#f87171', fontWeight: 600 }}>⚙️ Complete os dados da empresa para emitir NFS-e</p>
          <p style={{ fontSize: '0.75rem', color: '#9898b8', marginTop: 4 }}>
            Adicione o CNPJ e Inscrição Municipal da sua empresa na tabela <code style={{ background: '#1a1a26', padding: '1px 4px', borderRadius: 4 }}>empresas</code> no Supabase.
          </p>
        </div>
      )}

      {/* Tabela de notas */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1a1a2e' }}>
              {['Data', 'Tomador', 'Discriminação', 'Valor', 'Número/Ref', 'Status'].map(h => (
                <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.7rem', color: '#6666a0', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {notas.map(n => (
              <tr key={n.id} style={{ borderBottom: '1px solid #0d0d16' }}
                onMouseEnter={e => e.currentTarget.style.background = '#0d0d16'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '0.875rem 1.25rem', color: '#6666a0', fontSize: '0.8rem', fontFamily: 'JetBrains Mono, monospace' }}>
                  {new Date(n.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td style={{ padding: '0.875rem 1.25rem', fontWeight: 600, color: '#e8e8f0', fontSize: '0.85rem' }}>{n.cliente_nome}</td>
                <td style={{ padding: '0.875rem 1.25rem', color: '#9898b8', fontSize: '0.8rem', maxWidth: 200 }}>{n.descricao?.slice(0, 50)}{n.descricao?.length > 50 ? '...' : ''}</td>
                <td style={{ padding: '0.875rem 1.25rem', fontWeight: 700, color: '#4ade80', fontSize: '0.85rem' }}>{fmt(n.valor)}</td>
                <td style={{ padding: '0.875rem 1.25rem', color: '#6666a0', fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace' }}>
                  {n.chave || n.rps_numero || '—'}
                </td>
                <td style={{ padding: '0.875rem 1.25rem' }}>
                  <span className={`badge ${n.status === 'autorizada' || n.status === 'processando' ? 'badge-green' : n.status === 'emitindo' ? 'badge-yellow' : 'badge-red'}`}>
                    {n.status}
                  </span>
                </td>
              </tr>
            ))}
            {notas.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#4a4a6a' }}>Nenhuma NFS-e emitida</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal emissão */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ background: '#111118', border: '1px solid #22223a', borderRadius: 18, padding: '2rem', width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontWeight: 800, color: '#e8e8f0', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Emitir NFS-e — Garopaba/SC</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>

              {/* Tomador */}
              <div style={{ gridColumn: '1/-1' }}>
                <div style={{ fontSize: '0.7rem', color: '#4d55f5', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid #1a1a2e' }}>
                  Dados do Tomador
                </div>
              </div>

              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ fontSize: '0.7rem', color: '#6666a0', fontWeight: 600, display: 'block', marginBottom: 5 }}>NOME / RAZÃO SOCIAL</label>
                <input className="input" value={form.tomador_nome} onChange={set('tomador_nome')} placeholder="Nome completo ou razão social" />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#6666a0', fontWeight: 600, display: 'block', marginBottom: 5 }}>CPF / CNPJ</label>
                <input className="input" value={form.tomador_cpf_cnpj} onChange={set('tomador_cpf_cnpj')} placeholder="000.000.000-00" />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#6666a0', fontWeight: 600, display: 'block', marginBottom: 5 }}>E-MAIL</label>
                <input className="input" type="email" value={form.tomador_email} onChange={set('tomador_email')} />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#6666a0', fontWeight: 600, display: 'block', marginBottom: 5 }}>LOGRADOURO</label>
                <input className="input" value={form.tomador_logradouro} onChange={set('tomador_logradouro')} placeholder="Rua, Av..." />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#6666a0', fontWeight: 600, display: 'block', marginBottom: 5 }}>NÚMERO</label>
                <input className="input" value={form.tomador_numero} onChange={set('tomador_numero')} />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#6666a0', fontWeight: 600, display: 'block', marginBottom: 5 }}>BAIRRO</label>
                <input className="input" value={form.tomador_bairro} onChange={set('tomador_bairro')} />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#6666a0', fontWeight: 600, display: 'block', marginBottom: 5 }}>CEP</label>
                <input className="input" value={form.tomador_cep} onChange={set('tomador_cep')} placeholder="88495-000" />
              </div>

              {/* Serviço */}
              <div style={{ gridColumn: '1/-1', marginTop: 8 }}>
                <div style={{ fontSize: '0.7rem', color: '#4d55f5', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid #1a1a2e' }}>
                  Dados do Serviço
                </div>
              </div>

              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ fontSize: '0.7rem', color: '#6666a0', fontWeight: 600, display: 'block', marginBottom: 5 }}>DISCRIMINAÇÃO DO SERVIÇO</label>
                <textarea className="input" rows={3} value={form.discriminacao} onChange={set('discriminacao')} placeholder="Descreva o serviço prestado..." style={{ resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#6666a0', fontWeight: 600, display: 'block', marginBottom: 5 }}>VALOR (R$)</label>
                <input className="input" type="number" step="0.01" value={form.valor_servicos} onChange={set('valor_servicos')} placeholder="0,00" />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#6666a0', fontWeight: 600, display: 'block', marginBottom: 5 }}>NATUREZA DA OPERAÇÃO</label>
                <select className="input" value={form.natureza_operacao} onChange={set('natureza_operacao')}>
                  {NATUREZA.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" id="iss" checked={form.iss_retido} onChange={set('iss_retido')} style={{ width: 16, height: 16, accentColor: '#4d55f5' }} />
                <label htmlFor="iss" style={{ fontSize: '0.85rem', color: '#9898b8', cursor: 'pointer' }}>ISS Retido pelo tomador</label>
              </div>

              {/* Info calculada */}
              {form.valor_servicos && (
                <div style={{ gridColumn: '1/-1', background: '#0a0a0f', borderRadius: 10, padding: '0.875rem', display: 'flex', gap: '1.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#6666a0', marginBottom: 2 }}>Valor do Serviço</div>
                    <div style={{ fontWeight: 700, color: '#e8e8f0' }}>R$ {Number(form.valor_servicos).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#6666a0', marginBottom: 2 }}>ISS ({ALIQUOTA}%)</div>
                    <div style={{ fontWeight: 700, color: '#facc15' }}>R$ {(Number(form.valor_servicos) * parseFloat(ALIQUOTA) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#6666a0', marginBottom: 2 }}>Líquido</div>
                    <div style={{ fontWeight: 700, color: '#4ade80' }}>R$ {(Number(form.valor_servicos) * (1 - parseFloat(ALIQUOTA) / 100)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: '1.5rem' }}>
              <button className="btn-ghost" onClick={() => setModal(false)} style={{ flex: 1 }}>Cancelar</button>
              <button className="btn-primary" onClick={emitir} disabled={loading || !form.tomador_nome || !form.valor_servicos} style={{ flex: 1 }}>
                {loading ? 'Emitindo...' : '🧾 Emitir NFS-e'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
