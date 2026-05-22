import { MapPin, Clock, Phone, Mail, MessageCircle, CheckCircle } from 'lucide-react'

const WA_LINK = 'https://wa.me/5548920047334'
const LOGO = '/Logoazul.png'

export default function Contato() {
  return (
    <div style={{ minHeight: '100vh', background: '#f4f6fa', fontFamily: "'Segoe UI', sans-serif", color: '#1a2d4f' }}>

      {/* NAV */}
      <nav style={{ background: '#1a2d4f', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', height: 68 }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <img src={LOGO} alt="TecchTI" style={{ height: 120, width: 120, objectFit: 'contain' }} />
        </a>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
          style={{ background: '#25D366', color: '#fff', fontWeight: 700, fontSize: 13, padding: '10px 22px', borderRadius: 8, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <MessageCircle size={16} /> Falar no WhatsApp
        </a>
      </nav>

      {/* HERO */}
      <div style={{ background: 'linear-gradient(135deg, #1a2d4f 0%, #243d6a 60%, #1e3359 100%)', padding: '72px 48px 64px', position: 'relative', overflow: 'hidden' }}>
        <p style={{ color: '#7fa8d4', fontSize: 12, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ display: 'inline-block', width: 24, height: 1, background: '#7fa8d4' }} />
          Suporte técnico especializado
        </p>
        <h1 style={{ fontSize: 48, fontWeight: 800, color: '#fff', lineHeight: 1.08, letterSpacing: '-1.5px', marginBottom: 16, margin: '0 0 16px' }}>
          Problemas de TI?<br />
          <span style={{ color: '#7fa8d4' }}>A gente resolve.</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 16, maxWidth: 480, lineHeight: 1.7, margin: '0 0 36px' }}>
          Atendimento 24h para empresas e residências em Garopaba, Paulo Lopes e Imbituba — SC.
        </p>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#25D366', color: '#fff', fontWeight: 700, fontSize: 15, padding: '16px 32px', borderRadius: 12, textDecoration: 'none' }}>
          <MessageCircle size={20} /> Solicitar atendimento agora
        </a>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 14 }}>
          ✓ Sem compromisso &nbsp;·&nbsp; ✓ Orçamento gratuito &nbsp;·&nbsp; ✓ Resposta em minutos
        </p>
      </div>

      {/* DIFERENCIAIS */}
      <div style={{ padding: '48px 48px 0' }}>
        <p style={{ color: '#7fa8d4', fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          por que a TecchTI
          <span style={{ flex: 1, height: 1, background: '#d1dae8' }} />
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
          {[
            { icon: <Clock size={20} />, title: 'Atendimento 24h', desc: 'Disponível todos os dias, incluindo fins de semana e feriados.' },
            { icon: <CheckCircle size={20} />, title: 'Orçamento gratuito', desc: 'Diagnóstico sem custo. Você aprova antes de qualquer serviço.' },
            { icon: <Phone size={20} />, title: 'Suporte remoto e presencial', desc: 'Resolvemos na hora pelo TeamViewer ou vamos até você.' },
          ].map((item) => (
            <div key={item.title} style={{ background: '#fff', borderRadius: 14, padding: '24px 20px', border: '1px solid #e0e8f4' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#edf2fb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: '#1a2d4f' }}>
                {item.icon}
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#1a2d4f', marginBottom: 6 }}>{item.title}</p>
              <p style={{ fontSize: 13, color: '#9badc4', lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SERVIÇOS */}
      <div style={{ padding: '32px 48px 0' }}>
        <p style={{ color: '#7fa8d4', fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          serviços
          <span style={{ flex: 1, height: 1, background: '#d1dae8' }} />
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
          {[
            '🔧 Manutenção de computadores',
            '🌐 Desenvolvimento web',
            '📹 Câmeras de segurança',
            '🔌 Redes e Wi-Fi',
            '💾 Recuperação de dados',
            '🖥️ Suporte remoto',
            '🛡️ Antivírus e segurança',
            '☁️ Backup em nuvem',
          ].map((s) => (
            <div key={s} style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e0e8f4', fontSize: 13, fontWeight: 600, color: '#1a2d4f' }}>
              {s}
            </div>
          ))}
        </div>
      </div>

      {/* CIDADES */}
      <div style={{ padding: '32px 48px 0' }}>
        <p style={{ color: '#7fa8d4', fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          cidades atendidas
          <span style={{ flex: 1, height: 1, background: '#d1dae8' }} />
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
          {['Garopaba', 'Paulo Lopes', 'Imbituba'].map((cidade) => (
            <div key={cidade} style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', border: '1px solid #e0e8f4', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: '#edf2fb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a2d4f', flexShrink: 0 }}>
                <MapPin size={18} />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#1a2d4f', margin: 0 }}>{cidade}</p>
                <p style={{ fontSize: 12, color: '#9badc4', margin: 0 }}>Santa Catarina · SC</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA FINAL */}
      <div style={{ padding: '40px 48px 56px' }}>
        <div style={{ background: '#1a2d4f', borderRadius: 20, padding: '52px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40 }}>
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.8px', marginBottom: 10, lineHeight: 1.2 }}>
              Fale agora com um<br />especialista TecchTI
            </h2>
            <p style={{ color: '#7fa8d4', fontSize: 14, lineHeight: 1.65, maxWidth: 360, margin: 0 }}>
              Atendimento imediato pelo WhatsApp. Diagnóstico gratuito e orçamento sem compromisso.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12, flexShrink: 0 }}>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#25D366', color: '#fff', fontWeight: 700, fontSize: 15, padding: '16px 32px', borderRadius: 12, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              <MessageCircle size={20} /> Falar no WhatsApp
            </a>
            <a href="mailto:tecchti@gmail.com"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#7fa8d4', fontSize: 13, fontWeight: 600, padding: '12px 24px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              <Mail size={16} /> tecchti@gmail.com
            </a>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#25D366', display: 'inline-block' }} />
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>disponível agora · 24h / 7 dias</span>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background: '#1a2d4f', padding: '20px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 11, color: '#4a6080', margin: 0 }}>© {new Date().getFullYear()} TecchTI — Soluções de Informática · CNPJ 66.165.195/0001-38</p>
        <p style={{ fontSize: 11, color: '#4a6080', margin: 0 }}>Garopaba · Paulo Lopes · Imbituba — SC</p>
      </footer>

    </div>
  )
}
