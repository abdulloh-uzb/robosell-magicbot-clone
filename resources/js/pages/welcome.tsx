import { Head, Link, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { dashboard, login, register } from '@/routes';
import '../../css/heybazaar.css';

/** Defaults aligned with `test/app.jsx` (TWEAK_DEFAULTS). */
const LANDING_DEFAULTS = {
    dark: false,
    accent: '#E07A1F',
    showAIDemo: true,
    showPricing: true,
} as const;

type LandingState = {
    dark: boolean;
    accent: string;
    showAIDemo: boolean;
    showPricing: boolean;
};

type SharedAuth = { user?: unknown } | undefined;

// components.jsx — heybazaar landing page components

const COPY = {
  uz: {
    nav: { features: "Imkoniyatlar", how: "Qanday ishlaydi", pricing: "Narxlar", faq: "Savollar" },
    cta_primary: "Botni sinab ko'rish",
    cta_secondary: "Demo ko'rish",
    yc_badge: "Backed by Y Combinator",
    hero_title_a: "5 daqiqada",
    hero_title_b: "online do'kon",
    hero_title_c: "oching.",
    hero_sub: "Telegram'da do'kon oching, Click, Payme va Uzum bilan to'lov qabul qiling. Instagram va Telegram'dagi mijozlarni bitta inboxda boshqaring — AI esa savollarga o'zi javob beradi.",
    hero_meta: "Beta: 240+ kichik biznes",
    logo_strip: "Bilan ishlaymiz",
    how_eyebrow: "Qanday ishlaydi",
    how_title: "Uch qadamda do'kon. Hech qanday kod yozmasdan.",
    how_sub: "Ro'yxatdan o'tasiz, mahsulotlaringizni qo'shasiz va Telegramdagi yangi do'koningiz havolasini ulashasiz. Vassalom.",
    feat_eyebrow: "Imkoniyatlar",
    feat_title: "Bitta joyda barchasi: do'kon, mijozlar, to'lovlar.",
    feat_sub: "Kichik va o'rta biznes egalari uchun yaratilgan. Telegram-native, mahalliy to'lov tizimlariga moslashgan.",
    ai_eyebrow: "AI yordamchi",
    ai_title: "AI mijozlarga 24/7 javob beradi — sizning do'koningiz tilida.",
    ai_sub: "Mahsulotlar, narxlar, yetkazib berish, ish vaqti — barcha ma'lumotlar AI'ga avtomatik ulanadi. Siz uxlayotganingizda ham sotuv davom etadi.",
    pricing_eyebrow: "Narxlar",
    pricing_title: "Erkin boshlang. Biznes o'sgani sayin to'lang.",
    pricing_sub: "Komissiya yo'q. Faqat oddiy oylik obuna.",
    faq_eyebrow: "Savol-javob",
    faq_title: "Tez-tez beriladigan savollar.",
    cta_h_a: "Ertaga emas,",
    cta_h_b: "bugun soting.",
    cta_sub: "Bir necha daqiqada do'koningizni oching va birinchi mijozingizni bugun qabul qiling.",
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Nav
function Nav({
    lang,
    setLang,
    auth,
    canRegister,
    dark,
    onToggleDark,
    showPricing,
}: {
    lang: string;
    setLang: (code: string) => void;
    auth: SharedAuth;
    canRegister: boolean;
    dark: boolean;
    onToggleDark: () => void;
    showPricing: boolean;
}) {
  return (
    <nav className="nav">
      <div className="wrap nav-inner">
        <div className="logo">
          heybazaar
        </div>
        <div className="nav-links" style={{display:'flex'}}>
          <a href="#features">{COPY.uz.nav.features}</a>
          <a href="#how">{COPY.uz.nav.how}</a>
          {showPricing && <a href="#pricing">{COPY.uz.nav.pricing}</a>}
          <a href="#faq">{COPY.uz.nav.faq}</a>
        </div>
        
        <div className="nav-right">
          <button
            type="button"
            className="btn btn-ghost"
            style={{ padding: '6px 10px', fontSize: 13 }}
            onClick={onToggleDark}
            aria-label={dark ? "Yorug' rejim" : "Qorong'i rejim"}
            title={dark ? "Yorug' rejim" : "Qorong'i rejim"}
          >
            {dark ? '☀' : '☾'}
          </button>
          <div className="lang-toggle" role="tablist" aria-label="Language">
            <button className={lang==='uz'?'on':''} onClick={() => setLang('uz')}>UZ</button>
            <button className={lang==='en'?'on':''} onClick={() => setLang('en')}>EN</button>
          </div>
          {auth?.user ? (
             <Link href={dashboard()} className="btn btn-primary" style={{padding:'8px 14px'}}>Dashboard</Link>
          ) : (
             <>
               <Link href={login()} className="btn btn-ghost" style={{padding:'8px 14px'}}>Kirish</Link>
               {canRegister && (
                 <Link href={register()} className="btn btn-primary" style={{padding:'8px 14px'}}>
                   {COPY.uz.cta_primary} <span>→</span>
                 </Link>
               )}
             </>
          )}
        </div>

      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hero
function Hero({ auth, canRegister }: { auth: SharedAuth; canRegister: boolean }) {
  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div>
          <h1 className="display hero-title">
            {COPY.uz.hero_title_a}<br/>
            <span className="underline-accent">{COPY.uz.hero_title_b}</span><br/>
            {COPY.uz.hero_title_c}
          </h1>
          <p className="hero-sub">{COPY.uz.hero_sub}</p>
          
          <div className="hero-ctas">
            {auth?.user ? (
               <Link href={dashboard()} className="btn btn-primary">Dashboard <span>→</span></Link>
            ) : (
               <>
                 {canRegister && (
                   <Link href={register()} className="btn btn-primary">{COPY.uz.cta_primary} <span>→</span></Link>
                 )}
                 <button className="btn btn-ghost">{COPY.uz.cta_secondary}</button>
               </>
            )}
          </div>

          <div className="hero-meta">
            <div style={{display:'flex',gap:-4}}>
              {['#E89C5A','#7A8B6A','#A07050','#5A7A8B'].map((c,i)=>(
                <div key={i} style={{width:24,height:24,borderRadius:'50%',background:c,
                  border:'2px solid var(--bg)',marginLeft:i?-8:0}}/>
              ))}
            </div>
            <span className="stars">★★★★★</span>
            <span>{COPY.uz.hero_meta}</span>
          </div>
        </div>

        <div className="tg-frame">
          <TelegramMock />
          <FloatLead />
          <FloatPay />
        </div>
      </div>
    </section>
  );
}

function TelegramMock() {
  return (
    <div className="phone">
      <div className="phone-status">
        <span>9:41</span>
        <span style={{display:'flex',gap:5,alignItems:'center',fontSize:11}}>
          <span>●●●●</span>
          <span style={{display:'inline-block',width:14,height:9,border:'1.5px solid currentColor',borderRadius:2,position:'relative'}}>
            <span style={{position:'absolute',inset:1,background:'currentColor',width:'70%',borderRadius:1}}/>
          </span>
        </span>
      </div>
      <div className="tg-header">
        <span className="tg-back">‹</span>
        <div className="tg-avatar">SH</div>
        <div style={{flex:1}}>
          <div className="tg-name">Shahnoza Cosmetics</div>
          <div className="tg-presence">online</div>
        </div>
        <span style={{color:'#2AABEE',fontSize:18}}>⋮</span>
      </div>
      <div className="tg-body">
        <div className="bubble in">
          Salom! Liptintingiz qancha turadi?
          <span className="time">14:32</span>
        </div>
        <div className="bubble out">
          <div className="ai-tag">
            <span className="pulse"/>AI · Shahnoza Cosmetics
          </div>
          Liptint №07 — <b>89 000 so'm</b>. Toshkent bo'yicha bepul yetkazib beramiz 🚚
          <span className="time">14:32</span>
        </div>
        <div className="bubble out" style={{padding:6,background:'transparent',boxShadow:'none'}}>
          <div className="product-card">
            <div className="pic"/>
            <div style={{flex:1}}>
              <div className="pi">№07 Velvet Liptint</div>
              <div className="pn">Maroon Rose</div>
              <div className="price">89 000 so'm · ✓ Mavjud</div>
            </div>
          </div>
        </div>
        <div className="bubble in">
          Click orqali to'lasam bo'ladimi?
          <span className="time">14:33</span>
        </div>
        <div className="bubble out" style={{background:'#FFF6E5',color:'#15130E'}}>
          Albatta — Click, Payme yoki Uzum tanlang 💳
          <span className="time">14:33</span>
        </div>
      </div>
      <div className="tg-input">
        <span className="ic">😊</span>
        <span style={{flex:1}}>Xabar yozing…</span>
        <span className="ic">📎</span>
        <span className="ic" style={{color:'#2AABEE'}}>🎤</span>
      </div>
    </div>
  );
}

function FloatLead() {
  return (
    <div className="float-card lead">
      <div className="ic-tile" style={{background:'#E4405F'}}>IG</div>
      <div>
        <div className="lbl">Yangi lead · Instagram</div>
        <div className="v">Dilnoza · DM kelishuv</div>
      </div>
    </div>
  );
}

function FloatPay() {
  return (
    <div className="float-card pay">
      <div className="ic-tile" style={{background:'#0098FE'}}>C</div>
      <div>
        <div className="lbl">To'lov qabul qilindi</div>
        <div className="v">+ 247 000 so'm · Click</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Logo strip
function LogoStrip() {
  const items = [
    { n: 'Click',   c: '#0098FE', g: 'C' },
    { n: 'Payme',   c: '#1ABBED', g: 'P' },
    { n: 'Uzum',    c: '#7F4DFF', g: 'U' },
    { n: 'Telegram',c: '#2AABEE', g: 'T' },
    { n: 'Instagram', c: '#E4405F', g: 'IG' },
    { n: 'OpenAI',  c: '#15130E', g: '✦' },
  ];
  return (
    <section className="logo-strip">
      <div className="wrap logo-strip-inner">
        <span className="logo-strip-label">Integratsiyalar</span>
        <div className="logos">
          {items.map(it => (
            <span className="logo-pill" key={it.n}>
              <span className="sw" style={{background:it.c}}>{it.g}</span>
              {it.n}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// How it works
function HowItWorks() {
  const steps = [
    {
      n: '01',
      h: "Botda ro'yxatdan o'ting",
      p: "@heybazaar_bot ni oching va biznesingiz nomini, kategoriyasini kiriting. 2 daqiqa.",
      art: <StepArtSignup/>
    },
    {
      n: '02',
      h: "Mahsulot va to'lovni qo'shing",
      p: "Mahsulotlar ro'yxatini Excel'dan yuklang. Click, Payme, Uzum'ni bir tugmada ulang.",
      art: <StepArtCatalog/>
    },
    {
      n: '03',
      h: "Mijozlarga havolani ulashing",
      p: "Telegram va Instagram bio'ga heybazaar.app/sizning_dukon havolasini joylashtiring.",
      art: <StepArtShare/>
    },
  ];
  return (
    <section className="s" id="how">
      <div className="wrap">
        <span className="s-eyebrow">{COPY.uz.how_eyebrow}</span>
        <h2 className="display s-title">{COPY.uz.how_title}</h2>
        <p className="s-sub">{COPY.uz.how_sub}</p>
        <div className="steps">
          {steps.map(s => (
            <div className="step" key={s.n}>
              <div className="step-n">{s.n}</div>
              <div className="step-h">{s.h}</div>
              <p className="step-p">{s.p}</p>
              <div className="step-art">{s.art}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StepArtSignup() {
  return (
    <div style={{position:'absolute',inset:14,display:'flex',flexDirection:'column',gap:6,fontSize:11,fontFamily:'JetBrains Mono'}}>
      <div style={{padding:'6px 10px',background:'var(--card)',border:'1px solid var(--line)',borderRadius:6,color:'var(--ink-3)'}}>
        <span style={{color:'var(--accent)'}}>›</span> Biznes nomi
      </div>
      <div style={{padding:'6px 10px',background:'var(--card)',border:'1px solid var(--line)',borderRadius:6,color:'var(--ink)'}}>
        Shahnoza Cosmetics<span style={{borderLeft:'1px solid var(--ink)',marginLeft:2,animation:'blink 1s infinite'}}/>
      </div>
      <div style={{padding:'6px 10px',background:'var(--accent)',color:'var(--accent-ink)',borderRadius:6,textAlign:'center',fontWeight:600,marginTop:'auto'}}>
        Tasdiqlash →
      </div>
    </div>
  );
}

function StepArtCatalog() {
  const rows = [
    {n:'Liptint №07', p:'89 000', c:'#E89C5A'},
    {n:'Maska', p:'140 000', c:'#7A8B6A'},
    {n:'Sham 200ml', p:'220 000', c:'#A07050'},
  ];
  return (
    <div style={{position:'absolute',inset:14,display:'flex',flexDirection:'column',gap:5,fontSize:11}}>
      {rows.map((r,i)=>(
        <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'5px 8px',
          background:'var(--card)',border:'1px solid var(--line)',borderRadius:6}}>
          <span style={{width:14,height:14,borderRadius:3,background:r.c}}/>
          <span style={{flex:1,color:'var(--ink)',fontWeight:500}}>{r.n}</span>
          <span style={{color:'var(--ink-3)',fontFamily:'JetBrains Mono',fontSize:10}}>{r.p}</span>
        </div>
      ))}
    </div>
  );
}

function StepArtShare() {
  return (
    <div style={{position:'absolute',inset:14,display:'flex',flexDirection:'column',justifyContent:'space-between',fontSize:11}}>
      <div style={{padding:'8px 10px',background:'var(--card)',border:'1px solid var(--line)',borderRadius:6,
        fontFamily:'JetBrains Mono',color:'var(--ink-2)',display:'flex',alignItems:'center',gap:6}}>
        <span style={{color:'var(--ink-3)'}}>https://</span>heybazaar.app/<span style={{color:'var(--accent)'}}>shahnoza</span>
      </div>
      <div style={{display:'flex',gap:6}}>
        <div style={{flex:1,padding:'6px 8px',background:'#2AABEE',color:'#fff',borderRadius:6,fontSize:10,fontWeight:600,textAlign:'center'}}>
          ↗ Telegram
        </div>
        <div style={{flex:1,padding:'6px 8px',background:'#E4405F',color:'#fff',borderRadius:6,fontSize:10,fontWeight:600,textAlign:'center'}}>
          ↗ Instagram bio
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Features
function Features() {
  return (
    <section className="s" id="features">
      <div className="wrap">
        <span className="s-eyebrow">{COPY.uz.feat_eyebrow}</span>
        <h2 className="display s-title">{COPY.uz.feat_title}</h2>
        <p className="s-sub">{COPY.uz.feat_sub}</p>

        <div className="features">
          <div className="f-card">
            <span className="f-tag">Yagona inbox</span>
            <h3 className="f-h">Telegram va Instagram'dagi barcha leadlar — bitta chatda.</h3>
            <p className="f-p">Mijozlar qayerdan yozsa ham — DM, bot, kommentariya — barchasi bitta qulay interfeysga keladi. Hech bir savol e'tibordan chetda qolmaydi.</p>
            <div className="f-art">
              <InboxMock/>
            </div>
          </div>

          <div className="f-card">
            <span className="f-tag">Web App do'kon</span>
            <h3 className="f-h">Telegram ichida to'liq do'kon. Yuklab olishsiz.</h3>
            <p className="f-p">Mijozlar Telegram'dan chiqmasdan mahsulot tanlaydi va Click, Payme yoki Uzum bilan to'laydi.</p>
            <div className="f-art">
              <StoreMock/>
            </div>
          </div>
        </div>

        <div className="features" style={{marginTop:20,gridTemplateColumns:'1fr 1fr 1fr'}}>
          <SmallFeature
            tag="Mahalliy to'lovlar"
            title="Click, Payme, Uzum bir bosishda"
            body="Mahalliy to'lov tizimlari bilan tayyor integratsiya. Hisobingizga to'g'ridan-to'g'ri."
          />
          <SmallFeature
            tag="Buyurtma boshqaruvi"
            title="Holat, yetkazib berish, qabul"
            body="Har bir buyurtma uchun avtomatik holat — qabul qilindi, jo'natildi, yetkazildi."
          />
          <SmallFeature
            tag="Analitika"
            title="Sotuv, mijoz, manba"
            body="Qaysi reklama, qaysi mahsulot, qaysi kun ishlayapti — bir paneldan ko'ring."
          />
        </div>
      </div>
    </section>
  );
}

function SmallFeature({ tag, title, body }: { tag: string; title: string; body: string }) {
  return (
    <div className="f-card" style={{minHeight:'auto'}}>
      <span className="f-tag">{tag}</span>
      <h3 className="f-h" style={{fontSize:20}}>{title}</h3>
      <p className="f-p" style={{marginBottom:0}}>{body}</p>
    </div>
  );
}

function InboxMock() {
  const rows = [
    { src:'TG', c:'#2AABEE', nm:'Dilnoza A.', ms:'Sham 200ml hali bormi?', tm:'14:32', unread:true },
    { src:'IG', c:'#E4405F', nm:'aliya_uz', ms:'Yetkazib berish narxi qancha?', tm:'14:28', unread:true },
    { src:'TG', c:'#2AABEE', nm:'Botir M.', ms:'To\'lov qildim, raqam: 4847…', tm:'13:56' },
    { src:'IG', c:'#E4405F', nm:'nodira.style', ms:'Rahmat, hammasi yetib keldi 🌸', tm:'12:14' },
    { src:'TG', c:'#2AABEE', nm:'Sevara N.', ms:'Click orqali to\'lasam bo\'ladimi?', tm:'11:40' },
  ];
  return (
    <div className="inbox">
      {rows.map((r,i)=>(
        <div key={i} className={'inbox-row'+(r.unread?' unread':'')}>
          <span className="src" style={{background:r.c}}>{r.src}</span>
          <div style={{minWidth:0}}>
            <div className="nm">{r.nm}</div>
            <div className="ms">{r.ms}</div>
          </div>
          <span className="tm">{r.tm}</span>
        </div>
      ))}
    </div>
  );
}

function StoreMock() {
  return (
    <div className="store-mock">
      <div className="store-head">
        <div>
          <div className="store-title">Shahnoza Cosmetics</div>
          <div className="store-sub">28 mahsulot · ★ 4.9</div>
        </div>
        <div style={{width:28,height:28,borderRadius:8,background:'var(--accent-soft)',color:'var(--accent)',display:'grid',placeItems:'center',fontSize:14}}>♡</div>
      </div>
      <div className="store-grid">
        <div className="store-item si-1"><div className="pp">89 000</div>Liptint №07</div>
        <div className="store-item si-2"><div className="pp">140 000</div>Yashil maska</div>
        <div className="store-item si-3"><div className="pp">220 000</div>Vanilla sham</div>
        <div className="store-item si-4"><div className="pp">75 000</div>Tonik</div>
      </div>
      <div className="store-pay">
        <span style={{color:'var(--ink-3)',fontSize:10,fontFamily:'JetBrains Mono',textTransform:'uppercase',letterSpacing:'0.06em'}}>To'lash</span>
        <div className="pays">
          <span className="pay-chip" style={{background:'#0098FE'}}>CLICK</span>
          <span className="pay-chip" style={{background:'#1ABBED'}}>PAYME</span>
          <span className="pay-chip" style={{background:'#7F4DFF'}}>UZUM</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AI demo
function AIDemo() {
  return (
    <section className="s" id="ai">
      <div className="wrap">
        <span className="s-eyebrow">{COPY.uz.ai_eyebrow}</span>
        <h2 className="display s-title">{COPY.uz.ai_title}</h2>
        <p className="s-sub">{COPY.uz.ai_sub}</p>

        <div className="ai-block">
          <div className="ai-card">
            <h4>Do'kon ma'lumotlari <span className="pill">Avto</span></h4>
            <div className="kb">
              <div className="kb-item">
                <span className="k">Mahsulot</span>
                <span className="v">Velvet Liptint №07 · 89 000 so'm · 24 dona omborda</span>
              </div>
              <div className="kb-item">
                <span className="k">Yetkazib</span>
                <span className="v">Toshkent bo'yicha bepul · Viloyatga 35 000 so'm</span>
              </div>
              <div className="kb-item">
                <span className="k">Ish vaqti</span>
                <span className="v">Du–Sh: 09:00–20:00 · Yakshanba: dam</span>
              </div>
              <div className="kb-item">
                <span className="k">Qaytarish</span>
                <span className="v">7 kun ichida ochilmagan mahsulot</span>
              </div>
            </div>
          </div>
          <div className="ai-card">
            <h4>Mijoz bilan suhbat <span className="pill">Live</span></h4>
            <div className="ai-chat">
              <div className="b user">Salom, liptint qancha? Ertaga yetkazib bera olasizmi?</div>
              <div className="b bot">
                Salom! Velvet Liptint №07 — <b>89 000 so'm</b>. Toshkent bo'yicha ertangi kungacha bepul yetkazib beramiz 🚚
                <div className="src">↳ manba: Mahsulot, Yetkazib</div>
              </div>
              <div className="b user">Yakshanba ham ishlaysizmi?</div>
              <div className="b bot">
                Yakshanba dam olamiz, lekin buyurtmangizni hozir qoldiring — dushanba ertasi jo'natamiz.
                <div className="src">↳ manba: Ish vaqti</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pricing
function Pricing() {
  const tiers = [
    {
      tag: 'Boshlovchi',
      name: 'Start',
      amount: '0',
      per: '/oy',
      desc: "Birinchi do'koningiz uchun. Komissiyasiz.",
      list: ["50 buyurtmagacha/oy", "Asosiy bot va web app", "Click & Payme", "Telegram inbox"],
      cta: 'Bepul boshlash',
    },
    {
      tag: 'Eng mashhur',
      name: 'Biznes',
      amount: '249 000',
      per: ' so\'m/oy',
      desc: "O'sayotgan biznes uchun. AI yoqilgan.",
      list: ["Cheksiz buyurtma", "AI avto-javob", "Instagram + Telegram", "Uzum Nasiya", "Click & Payme", "Yetkazib berish boshqaruvi", "Analitika"],
      cta: 'Botni sinab ko\'rish',
      hl: true,
    },
    {
      tag: 'Komandalar uchun',
      name: 'Premium',
      amount: '690 000',
      per: ' so\'m/oy',
      desc: "Bir nechta xodim, bir nechta filial.",
      list: ["Hammasi Biznes'dan", "Cheksiz xodim", "Filial boshqaruvi", "Maxsus AI dispatcher", "API kirish", "Shaxsiy support"],
      cta: 'Sotuv jamoasi bilan',
    },
  ];
  return (
    <section className="s" id="pricing">
      <div className="wrap">
        <span className="s-eyebrow">{COPY.uz.pricing_eyebrow}</span>
        <h2 className="display s-title">{COPY.uz.pricing_title}</h2>
        <p className="s-sub">{COPY.uz.pricing_sub}</p>

        <div className="pricing">
          {tiers.map(t => (
            <div className={'price-card'+(t.hl?' hl':'')} key={t.name}>
              {t.hl && <span className="badge-pop">Tanlangan</span>}
              <span className="price-tag">{t.tag}</span>
              <div className="price-name">{t.name}</div>
              <div className="price-amount">
                {t.amount === '0' ? '0 so\'m' : t.amount}<span className="per">{t.per}</span>
              </div>
              <p className="price-desc">{t.desc}</p>
              <ul className="price-list">
                {t.list.map((li,i)=><li key={i}>{li}</li>)}
              </ul>
              <button className={t.hl?'btn btn-accent':'btn btn-ghost'} style={{justifyContent:'center'}}>{t.cta}</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FAQ
function FAQ() {
  const items = [
    {
      q: "Texnik bilim kerakmi?",
      a: "Yo'q. heybazaar Telegram boti orqali ishlaydi. Agar siz Telegram'dan foydalana olsangiz, do'kon ocha olasiz."
    },
    {
      q: "Komissiya olasizmi?",
      a: "Yo'q. Faqat oddiy oylik obuna. Click, Payme yoki Uzum'ning o'z komissiyasi (1–2%) qoladi, biz ustiga hech narsa qo'shmaymiz."
    },
    {
      q: "AI qanday ishlaydi?",
      a: "Siz mahsulot, narx, yetkazib berish va boshqa ma'lumotlarni botga kiritasiz. AI shu ma'lumotlardan kelib chiqib mijozlarga avtomatik javob yozadi. Murakkab savol bo'lsa, sizga signal beradi."
    },
    {
      q: "Mahsulotlarimni qanday qo'shaman?",
      a: "Excel/Google Sheets'dan import qilish, qo'lda qo'shish yoki mavjud kanaldan ko'chirish — uchta variant bor. Eng tez yo'l: Excel."
    },
    {
      q: "Boshqa platformalarda ham ishlaydimi?",
      a: "Hozir Telegram va Instagram'ni qo'llaymiz. WhatsApp Business va TikTok Shop ustida ishlayapmiz, yaqin oylarda chiqadi."
    },
    {
      q: "Ma'lumotlarim xavfsizmi?",
      a: "Ha. Mijoz ma'lumotlari va to'lovlar shifrlangan, biz hech qachon mijoz raqamlarini sotmaymiz va reklama uchun ishlatmaymiz."
    },
  ];
  const [open, setOpen] = useState(0);
  return (
    <section className="s" id="faq" style={{borderBottom:0}}>
      <div className="wrap" style={{maxWidth:840}}>
        <span className="s-eyebrow">{COPY.uz.faq_eyebrow}</span>
        <h2 className="display s-title">{COPY.uz.faq_title}</h2>
        <div className="faq">
          {items.map((it,i)=>(
            <div className="faq-row" key={i} data-open={open===i} onClick={()=>setOpen(open===i?-1:i)}>
              <div className="faq-q">
                <span>{it.q}</span>
                <span className="pl">+</span>
              </div>
              <div className="faq-a">{it.a}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CTA + Footer
function CTASection({ auth, canRegister }: { auth: SharedAuth; canRegister: boolean }) {
  return (
    <section className="cta">
      <div className="wrap">
        <h2 className="display cta-h">
          {COPY.uz.cta_h_a} <span className="accent">{COPY.uz.cta_h_b}</span>
        </h2>
        <p className="cta-sub">{COPY.uz.cta_sub}</p>
        
        <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
          {auth?.user ? (
             <Link href={dashboard()} className="btn btn-primary" style={{padding:'14px 22px',fontSize:15}}>Dashboard <span>→</span></Link>
          ) : (
             <>
               {canRegister && (
                 <Link href={register()} className="btn btn-primary" style={{padding:'14px 22px',fontSize:15}}>{COPY.uz.cta_primary} <span>→</span></Link>
               )}
               <button className="btn btn-ghost" style={{padding:'14px 22px',fontSize:15}}>{COPY.uz.cta_secondary}</button>
             </>
          )}
        </div>

        <div style={{marginTop:20,fontSize:13,color:'var(--ink-3)',fontFamily:'JetBrains Mono'}}>
          @heybazaar_bot · t.me/heybazaar_bot
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <div className="logo">
              heybazaar
            </div>
            <p className="foot-tagline">Kichik va o'rta biznes uchun Telegram-native commerce platformasi.</p>
          </div>
          <div>
            <div className="foot-h">Mahsulot</div>
            <ul className="foot-list">
              <li>Imkoniyatlar</li>
              <li>Qanday ishlaydi</li>
              <li>Narxlar</li>
              <li>Integratsiyalar</li>
            </ul>
          </div>
          <div>
            <div className="foot-h">Resurslar</div>
            <ul className="foot-list">
              <li>Boshlash uchun yo'riqnoma</li>
              <li>API hujjatlari</li>
              <li>Status</li>
              <li>Blog</li>
            </ul>
          </div>
          <div>
            <div className="foot-h">Aloqa</div>
            <ul className="foot-list">
              <li>hello@heybazaar.app</li>
              <li>t.me/heybazaar</li>
              <li>+998 71 200 00 00</li>
            </ul>
          </div>
        </div>
        <div className="foot-bot">
          <span>© 2026 heybazaar. Toshkent, O'zbekiston.</span>
          <span style={{display:'flex',gap:18}}>
            <span>Shartlar</span>
            <span>Maxfiylik</span>
          </span>
        </div>
      </div>
    </footer>
  );
}

export default function Welcome({ canRegister = true }: { canRegister?: boolean }) {
  const [lang, setLang] = useState('uz');
  const [landing, setLanding] = useState<LandingState>({
    dark: LANDING_DEFAULTS.dark,
    accent: LANDING_DEFAULTS.accent,
    showAIDemo: LANDING_DEFAULTS.showAIDemo,
    showPricing: LANDING_DEFAULTS.showPricing,
  });
  const { auth } = usePage<{ auth?: { user?: unknown } }>().props;

  useEffect(() => {
    document.documentElement.dataset.theme = landing.dark ? 'dark' : 'light';
    document.documentElement.style.setProperty('--accent', landing.accent);
  }, [landing.dark, landing.accent]);

  const toggleDark = () => {
    setLanding((prev) => ({ ...prev, dark: !prev.dark }));
  };

  return (
    <>
      <Head title="heybazaar — Telegramda biznesingiz">
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Nav
        lang={lang}
        setLang={setLang}
        auth={auth}
        canRegister={canRegister}
        dark={landing.dark}
        onToggleDark={toggleDark}
        showPricing={landing.showPricing}
      />
      <Hero auth={auth} canRegister={canRegister} />
      <LogoStrip/>
      <HowItWorks/>
      <Features/>
      {landing.showAIDemo && <AIDemo/>}
      {landing.showPricing && <Pricing/>}
      <FAQ/>
      <CTASection auth={auth} canRegister={canRegister} />
      <Footer/>
    </>
  );
}
