import { useEffect, useRef, useState } from 'react'
import emailjs from '@emailjs/browser'
import './App.css'

const LOGO = '/logo.png'
const WA_LINK = 'https://wa.me/5548991921089'

const serviceCategories = [
  {
    category: 'Suporte & Manutenção',
    items: [
      { icon: '🔧', name: 'Manutenção de Computadores', desc: 'Diagnóstico, reparo e upgrade de desktops e notebooks — mais performance e vida útil.' },
      { icon: '🔌', name: 'Manutenção de Redes', desc: 'Instalação, configuração e suporte de redes cabeadas e Wi-Fi para empresas e residências.' },
      { icon: '🖥️', name: 'Suporte Técnico Remoto', desc: 'Atendimento ágil via TeamViewer ou AnyDesk — resolução de problemas sem sair de casa.' },
      { icon: '💿', name: 'Formatação e Reinstalação', desc: 'Reinstalação de sistema operacional, drivers e configuração completa do equipamento.' },
      { icon: '💾', name: 'Recuperação de Dados', desc: 'Recuperação de arquivos em HDs danificados, pen drives e cartões de memória.' },
      { icon: '🧹', name: 'Limpeza de Equipamentos', desc: 'Higienização interna e externa de computadores e notebooks para evitar superaquecimento.' },
    ]
  },
  {
    category: 'Infraestrutura',
    items: [
      { icon: '📹', name: 'Câmeras de Segurança (CFTV)', desc: 'Instalação e configuração de sistemas de monitoramento para empresas e residências.' },
      { icon: '🗄️', name: 'Servidores e NAS', desc: 'Configuração de servidores locais e dispositivos NAS para armazenamento e compartilhamento de dados.' },
      { icon: '☁️', name: 'Backup em Nuvem e Local', desc: 'Soluções de backup automático para proteger os dados da sua empresa contra perdas.' },
      { icon: '⚡', name: 'No-breaks e Proteção Elétrica', desc: 'Instalação de no-breaks e filtros de linha para proteger seus equipamentos contra quedas de energia.' },
    ]
  },
  {
    category: 'Software & Sistemas',
    items: [
      { icon: '🌐', name: 'Desenvolvimento Web', desc: 'Sites institucionais, plataformas e sistemas web modernos, rápidos e responsivos.' },
      { icon: '📦', name: 'Sistemas de Gestão (ERP)', desc: 'Desenvolvimento de sistemas personalizados de controle de estoque, vendas e gestão empresarial.' },
      { icon: '⚙️', name: 'Automação de Processos', desc: 'Automatize tarefas repetitivas e aumente a produtividade da sua equipe com soluções sob medida.' },
      { icon: '🔗', name: 'Integração entre Sistemas', desc: 'Conectamos diferentes plataformas via APIs para que seus sistemas se comuniquem de forma eficiente.' },
      { icon: '🚀', name: 'Landing Pages e Hotsites', desc: 'Páginas de alta conversão para campanhas, produtos e eventos, com design moderno e responsivo.' },
    ]
  },
  {
    category: 'Segurança',
    items: [
      { icon: '🛡️', name: 'Antivírus Corporativo', desc: 'Instalação e gerenciamento de soluções de antivírus para proteger toda a rede da empresa.' },
      { icon: '🔒', name: 'Firewall e VPN', desc: 'Configuração de firewall e redes privadas virtuais para acesso seguro de qualquer lugar.' },
      { icon: '🔍', name: 'Auditoria de Segurança', desc: 'Análise completa da infraestrutura de rede para identificar e corrigir vulnerabilidades.' },
      { icon: '💡', name: 'Consultoria em TI', desc: 'Estratégia e planejamento tecnológico para as melhores decisões digitais do seu negócio.' },
    ]
  },
]

const features = [
  { title: 'Atendimento Ágil', desc: 'Respondemos rápido e resolvemos problemas com eficiência, presencialmente ou de forma remota.', icon: '⚡' },
  { title: 'Equipe Especializada', desc: 'Profissionais experientes em hardware, redes, software e segurança da informação.', icon: '🏗️' },
  { title: 'Suporte Contínuo', desc: 'Acompanhamento pós-entrega, manutenções preventivas e suporte garantido.', icon: '🛡️' },
]

const steps = [
  { num: '01', title: 'Contato', desc: 'Você nos chama pelo WhatsApp, telefone ou formulário do site.' },
  { num: '02', title: 'Diagnóstico', desc: 'Avaliamos o problema ou necessidade com agilidade e precisão.' },
  { num: '03', title: 'Orçamento', desc: 'Enviamos uma proposta clara, sem surpresas nem letras miúdas.' },
  { num: '04', title: 'Solução', desc: 'Executamos o serviço com qualidade e entregamos no prazo combinado.' },
]

const faqs = [
  { q: 'Fazem atendimento a domicílio?', a: 'Sim! Atendemos em residências e empresas na região. Entre em contato para verificar disponibilidade na sua cidade.' },
  { q: 'Qual o prazo médio para manutenção?', a: 'Depende do serviço. Formatações e limpezas costumam ser entregues no mesmo dia. Reparos mais complexos em até 3 dias úteis.' },
  { q: 'Os serviços têm garantia?', a: 'Sim. Todos os nossos serviços têm garantia. O prazo varia conforme o tipo de serviço realizado.' },
  { q: 'Atendem empresas e pessoas físicas?', a: 'Atendemos ambos! Temos planos de suporte para empresas e atendimento pontual para clientes residenciais.' },
  { q: 'Fazem suporte remoto?', a: 'Sim, via TeamViewer ou AnyDesk. Muitos problemas são resolvidos em minutos sem você sair de casa.' },
  { q: 'Como funciona o orçamento?', a: 'O diagnóstico inicial é gratuito. Após avaliar o problema, enviamos um orçamento detalhado para sua aprovação.' },
]

const cities = ['Garopaba', 'Imbituba', 'Laguna', 'Paulo Lopes', 'Palhoça', 'Florianópolis', 'São José', 'Tubarão']

const partners = [
  { name: 'Microsoft', icon: '🪟' },
  { name: 'Intel', icon: '🔷' },
  { name: 'Dell', icon: '💻' },
  { name: 'HP', icon: '🖨️' },
  { name: 'ASUS', icon: '⚡' },
  { name: 'Lenovo', icon: '🔵' },
]

function useReveal(threshold = 0.12) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.unobserve(el) }
    }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

function ServiceCard({ icon, name, desc, delay = 0 }) {
  const [ref, visible] = useReveal()
  return (
    <div ref={ref} className={`service-card reveal${visible ? ' visible' : ''}`} style={{ transitionDelay: `${delay}s` }}>
      <div className="service-icon-wrap">{icon}</div>
      <div className="service-name">{name}</div>
      <p className="service-desc">{desc}</p>
    </div>
  )
}

function ServiceCategory({ category, items, baseDelay = 0 }) {
  const [ref, visible] = useReveal(0.05)
  return (
    <div ref={ref} className={`service-category reveal${visible ? ' visible' : ''}`}>
      <div className="service-category-title">{category}</div>
      <div className="services-grid">
        {items.map((s, i) => <ServiceCard key={s.name} {...s} delay={baseDelay + i * 0.08} />)}
      </div>
    </div>
  )
}

function BarChart() {
  const data = [
    { label: 'Web', value: 85, color: '#1A6FAD' },
    { label: 'Suporte', value: 92, color: '#174A6E' },
    { label: 'Infra', value: 68, color: '#2A8FC4' },
    { label: 'Segurança', value: 75, color: '#0D2D45' },
  ]
  const [ref, visible] = useReveal(0.1)
  return (
    <div ref={ref} className={`chart-wrap reveal${visible ? ' visible' : ''}`}>
      <div className="chart-title">Projetos por área</div>
      <div className="chart-bars">
        {data.map((d, i) => (
          <div key={d.label} className="chart-bar-group">
            <div className="chart-bar-track">
              <div className="chart-bar-fill" style={{ height: visible ? `${d.value}%` : '0%', background: d.color, transitionDelay: `${i * 0.12}s` }} />
            </div>
            <div className="chart-bar-val">{d.value}%</div>
            <div className="chart-bar-label">{d.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`faq-item${open ? ' open' : ''}`} onClick={() => setOpen(o => !o)}>
      <div className="faq-question">
        <span>{q}</span>
        <div className={`faq-arrow${open ? ' open' : ''}`}>↓</div>
      </div>
      <div className="faq-answer" style={{ maxHeight: open ? '200px' : '0' }}>
        <p>{a}</p>
      </div>
    </div>
  )
}

export default function App() {
  const [hRef, hVis] = useReveal()
  const [wRef, wVis] = useReveal()
  const [iRef, iVis] = useReveal()
  const [fRef, fVis] = useReveal()
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const formRef = useRef(null)

  const closeMenu = () => setMenuOpen(false)

  // Active nav on scroll
  useEffect(() => {
    const sections = ['servicos', 'processo', 'sobre', 'cobertura', 'faq', 'contato']
    const handler = () => {
      const current = sections.find(id => {
        const el = document.getElementById(id)
        if (!el) return false
        const rect = el.getBoundingClientRect()
        return rect.top <= 100 && rect.bottom >= 100
      })
      if (current) setActiveSection(current)
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleSend = async (e) => {
    e.preventDefault()
    setSending(true)
    setError(false)
    try {
      await emailjs.sendForm(
        'YOUR_SERVICE_ID',
        'YOUR_TEMPLATE_ID',
        formRef.current,
        'YOUR_PUBLIC_KEY'
      )
      setSent(true)
      formRef.current.reset()
    } catch {
      setError(true)
    } finally {
      setSending(false)
      setTimeout(() => { setSent(false); setError(false) }, 4000)
    }
  }

  return (
    <>
      {/* NAV */}
      <nav className="navbar">
        <img src={LOGO} alt="TecchTI" className="logo-img" />
        <ul>
          {['servicos','processo','sobre','contato'].map(id => (
            <li key={id}>
              <a href={`#${id}`} className={activeSection === id ? 'nav-active' : ''}>
                {{ servicos: 'Serviços', processo: 'Como funciona', sobre: 'Por que nós', contato: 'Contato' }[id]}
              </a>
            </li>
          ))}
          <li><a href="#contato" className="btn-nav">Fale Conosco</a></li>
        </ul>
        <button className={`hamburger${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </nav>

      {/* MOBILE DRAWER */}
      <div className={`nav-drawer${menuOpen ? ' open' : ''}`}>
        <a href="#servicos" onClick={closeMenu}>Serviços</a>
        <a href="#processo" onClick={closeMenu}>Como funciona</a>
        <a href="#sobre" onClick={closeMenu}>Por que nós</a>
        <a href="#contato" onClick={closeMenu}>Contato</a>
        <a href="#contato" className="btn-nav-mobile" onClick={closeMenu}>Fale Conosco</a>
      </div>

      {/* HERO */}
      <section className="hero">
        <div className="hero-blob hero-blob-1" />
        <div className="hero-blob hero-blob-2" />
        <div className="hero-content">
          <span className="badge">✦ Soluções de Informática em SC</span>
          <h1>Tecnologia que <span className="hero-em">transforma</span><br />o seu negócio</h1>
          <p className="hero-sub">Desenvolvemos sistemas web e desktop, cuidamos da sua infraestrutura e mantemos seus equipamentos funcionando — tudo sob medida para o seu negócio.</p>
          <div className="hero-ctas">
            <a href="#contato" className="btn-primary">Solicitar orçamento</a>
            <a href="#servicos" className="btn-ghost">Conhecer serviços ↓</a>
          </div>
        </div>
        <div className="hero-cards">
          <div className="hero-stat-card">
            <div className="hsc-num">20+</div>
            <div className="hsc-label">Projetos entregues</div>
          </div>
          <div className="hero-stat-card hero-stat-card--accent">
            <div className="hsc-num">98%</div>
            <div className="hsc-label">Clientes satisfeitos</div>
          </div>
          <div className="hero-stat-card">
            <div className="hsc-num">4 anos</div>
            <div className="hsc-label">De experiência</div>
          </div>
        </div>
      </section>

      {/* PARCEIROS */}
      <section className="section-partners">
        <div className="container">
          <p className="partners-label">Trabalhamos com as principais marcas do mercado</p>
          <div className="partners-grid">
            {partners.map(p => (
              <div key={p.name} className="partner-item">
                <span className="partner-icon">{p.icon}</span>
                <span className="partner-name">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section id="servicos" className="section-services">
        <div className="container">
          <div ref={hRef} className={`section-header reveal${hVis ? ' visible' : ''}`}>
            <div>
              <span className="section-label">O que fazemos</span>
              <h2 className="section-title">Soluções completas<br />em tecnologia</h2>
            </div>
            <p className="section-sub">Do planejamento à entrega, cuidamos de cada etapa com atenção técnica e foco no seu resultado.</p>
          </div>
          <div className="services-categories">
            {serviceCategories.map((cat, i) => (
              <ServiceCategory key={cat.category} {...cat} baseDelay={i * 0.05} />
            ))}
          </div>
        </div>
      </section>

      {/* PROCESSO */}
      <section id="processo" className="section-process">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-label">Como funciona</span>
              <h2 className="section-title">Do contato à<br />solução em 4 passos</h2>
            </div>
            <p className="section-sub">Processo simples, transparente e sem complicação para você.</p>
          </div>
          <div className="process-grid">
            {steps.map((s, i) => {
              const [ref, vis] = useReveal()
              return (
                <div key={s.num} ref={ref} className={`process-card reveal${vis ? ' visible' : ''}`} style={{ transitionDelay: `${i * 0.12}s` }}>
                  <div className="process-num">{s.num}</div>
                  <div className="process-title">{s.title}</div>
                  <p className="process-desc">{s.desc}</p>
                  {i < steps.length - 1 && <div className="process-arrow">→</div>}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* POR QUE NÓS */}
      <section id="sobre" className="section-why">
        <div className="container">
          <div ref={wRef} className={`why-grid reveal${wVis ? ' visible' : ''}`}>
            <div className="why-left">
              <span className="section-label">Por que nos escolher</span>
              <h2 className="section-title">Compromisso com resultado em cada projeto</h2>
              <p className="section-sub">Trabalhamos com transparência, prazos cumpridos e código de qualidade. Cada projeto recebe atenção total da nossa equipe.</p>
              <div className="features-list">
                {features.map((f, i) => (
                  <div key={f.title} className={`feature-item reveal${wVis ? ' visible' : ''}`} style={{ transitionDelay: `${0.1 + i * 0.12}s` }}>
                    <div className="feature-icon">{f.icon}</div>
                    <div>
                      <div className="feature-title">{f.title}</div>
                      <div className="feature-desc">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <BarChart />
          </div>
        </div>
      </section>

      {/* COBERTURA */}
      <section id="cobertura" className="section-coverage">
        <div className="container">
          <div className="coverage-inner">
            <div>
              <span className="section-label">Área de Atendimento</span>
              <h2 className="section-title">Atendemos toda a<br />região de SC</h2>
              <p className="section-sub">Presencialmente nas cidades da região ou remotamente para qualquer lugar do Brasil.</p>
              <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: 'inline-block', marginTop: '2rem' }}>
                Verificar minha cidade
              </a>
            </div>
            <div className="cities-grid">
              {cities.map(c => (
                <div key={c} className="city-chip">
                  <span className="city-pin">📍</span>{c}
                </div>
              ))}
              <div className="city-chip city-chip--more">+ outras cidades</div>
            </div>
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="section-testimonials">
        <div className="container">
          <div className="testimonials-header">
            <span className="section-label">Depoimentos</span>
            <h2 className="section-title">O que nossos clientes dizem</h2>
          </div>
          <div className="testimonials-grid">
            {[
              { initials: 'MR', name: 'Marcos Rodrigues', role: 'Cliente desde 2022', text: '"Serviço rápido e eficiente! Meu notebook voltou a funcionar perfeitamente. Recomendo muito a TecchTI para qualquer problema de informática."' },
              { initials: 'AP', name: 'Ana Paula Silva', role: 'Empresária', text: '"Instalaram as câmeras de segurança na minha empresa com muita profissionalidade. Ficou tudo certinho e o suporte pós-instalação é excelente."' },
              { initials: 'JL', name: 'João Lima', role: 'Lojista', text: '"Desenvolveram o site da minha loja com um design moderno e responsivo. Atendimento atencioso do início ao fim. Super recomendo!"' },
            ].map((t, i) => {
              const [ref, vis] = useReveal()
              return (
                <div key={t.name} ref={ref} className={`testimonial-card reveal${vis ? ' visible' : ''}`} style={{ transitionDelay: `${i * 0.12}s` }}>
                  <div className="testimonial-stars">★★★★★</div>
                  <p className="testimonial-text">{t.text}</p>
                  <div className="testimonial-author">
                    <div className="testimonial-avatar">{t.initials}</div>
                    <div>
                      <div className="testimonial-name">{t.name}</div>
                      <div className="testimonial-role">{t.role}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section-faq">
        <div className="container">
          <div className="faq-inner">
            <div>
              <span className="section-label">Dúvidas frequentes</span>
              <h2 className="section-title">Perguntas<br />frequentes</h2>
              <p className="section-sub">Não encontrou o que procura? Fale direto pelo WhatsApp.</p>
              <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: 'inline-block', marginTop: '2rem' }}>
                Falar no WhatsApp
              </a>
            </div>
            <div className="faq-list">
              {faqs.map(f => <FaqItem key={f.q} {...f} />)}
            </div>
          </div>
        </div>
      </section>

      {/* CONTATO */}
      <section id="contato" className="section-contact">
        <div className="container">
          <div ref={iRef} className={`section-header reveal${iVis ? ' visible' : ''}`} style={{ marginBottom: '3rem' }}>
            <div>
              <span className="section-label">Fale Conosco</span>
              <h2 className="section-title">Vamos construir<br />algo juntos</h2>
            </div>
            <p className="section-sub">Tem um projeto em mente? Nossa equipe retorna em até 24 horas com uma proposta personalizada.</p>
          </div>
          <div className="contact-grid">
            <div className="contact-details">
              <div className="contact-detail"><div className="contact-icon">✉️</div><div><div className="cd-label">E-mail</div><a href="mailto:TecchTI@gmail.com" className="contact-link">TecchTI@gmail.com</a></div></div>
              <div className="contact-detail"><div className="contact-icon">📞</div><div><div className="cd-label">WhatsApp</div><a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="contact-link">(48) 99192-1089</a></div></div>
              <div className="contact-detail"><div className="contact-icon">📍</div><div><div className="cd-label">Localização</div><span>Santa Catarina, Brasil</span></div></div>
              <div className="contact-detail"><div className="contact-icon">🕐</div><div><div className="cd-label">Atendimento</div><span>Seg–Sex: 8h às 18h | Sáb: 8h às 12h</span></div></div>
              <div className="contact-detail"><div className="contact-icon">🏢</div><div><div className="cd-label">CNPJ</div><span>66.165.195/0001-38</span></div></div>
            </div>
            <div ref={fRef} className={`form-card reveal${fVis ? ' visible' : ''}`}>
              <form ref={formRef} onSubmit={handleSend}>
                <div className="form-row">
                  <div className="form-group"><label>Nome</label><input type="text" name="from_name" placeholder="Seu nome" required /></div>
                  <div className="form-group"><label>Empresa</label><input type="text" name="company" placeholder="Nome da empresa" /></div>
                </div>
                <div className="form-group"><label>E-mail</label><input type="email" name="reply_to" placeholder="seu@email.com" required /></div>
                <div className="form-group">
                  <label>Tipo de serviço</label>
                  <select name="service" defaultValue="">
                    <option value="" disabled>Selecione...</option>
                    <option>Desenvolvimento Web</option>
                    <option>Sistema Desktop</option>
                    <option>Manutenção de Computadores/Notebooks</option>
                    <option>Manutenção de Redes</option>
                    <option>Suporte Técnico Remoto</option>
                    <option>Formatação e Reinstalação</option>
                    <option>Recuperação de Dados</option>
                    <option>Câmeras de Segurança (CFTV)</option>
                    <option>Servidores e NAS</option>
                    <option>Backup em Nuvem e Local</option>
                    <option>Sistema de Gestão (ERP)</option>
                    <option>Automação de Processos</option>
                    <option>Landing Page / Hotsite</option>
                    <option>Antivírus Corporativo</option>
                    <option>Firewall e VPN</option>
                    <option>Auditoria de Segurança</option>
                    <option>Consultoria em TI</option>
                    <option>Outro</option>
                  </select>
                </div>
                <div className="form-group"><label>Mensagem</label><textarea name="message" rows={4} placeholder="Descreva seu projeto ou necessidade..." required /></div>
                <button type="submit" className="btn-submit" disabled={sending} style={sent ? { background: '#0F6E56' } : error ? { background: '#DC2626' } : {}}>
                  {sending ? 'Enviando...' : sent ? 'Mensagem enviada! ✓' : error ? 'Erro ao enviar. Tente novamente.' : 'Enviar mensagem →'}
                </button>
                <p className="form-note">Ao enviar, você concorda com nossa <a href="#privacidade" className="form-note-link">Política de Privacidade</a>.</p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* PRIVACIDADE / LGPD */}
      <section id="privacidade" className="section-privacy">
        <div className="container">
          <div className="privacy-box">
            <div className="privacy-icon">🔐</div>
            <div>
              <div className="privacy-title">Política de Privacidade & LGPD</div>
              <p className="privacy-text">A TecchTI coleta apenas os dados necessários para responder ao seu contato (nome, e-mail e mensagem). Suas informações não são compartilhadas com terceiros e podem ser removidas a qualquer momento mediante solicitação pelo e-mail <a href="mailto:TecchTI@gmail.com">TecchTI@gmail.com</a>. Em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018).</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <div className="footer-brand">
            <img src={LOGO} alt="TecchTI" className="footer-logo" />
            <p className="footer-tagline">Soluções de Informática</p>
          </div>
          <div className="footer-links">
            <a href="#servicos">Serviços</a>
            <a href="#processo">Como funciona</a>
            <a href="#sobre">Sobre</a>
            <a href="#faq">FAQ</a>
            <a href="#contato">Contato</a>
          </div>
          <div className="footer-contact">
            <span>(48) 99192-1089</span>
            <span>TecchTI@gmail.com</span>
          </div>
        </div>
        <div className="footer-bottom">&copy; {new Date().getFullYear()} TecchTI Soluções de Informática · CNPJ 66.165.195/0001-38 · Todos os direitos reservados</div>
      </footer>

      {/* WHATSAPP FLUTUANTE */}
      <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="whatsapp-float" aria-label="Fale pelo WhatsApp">
        <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </>
  )
}
