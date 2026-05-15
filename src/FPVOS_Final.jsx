import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

function useFonts() {
  useEffect(() => {
    if (!document.querySelector('#fpv-fonts')) {
      const l = document.createElement('link');
      l.id = 'fpv-fonts'; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;800;900&family=Rajdhani:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap';
      document.head.appendChild(l);
    }
    if (!document.querySelector('#fpv-base')) {
      const s = document.createElement('style');
      s.id = 'fpv-base';
      s.textContent = `
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,212,255,0.18); border-radius: 2px; }
      `;
      document.head.appendChild(s);
    }
  }, []);
}

/* ── DATA ─────────────────────────────────────────────────────── */
const SITES = [
  { id:1,  name:"GetFPV",            desc:"One of the largest FPV retailers — motors, ESCs, frames, and complete ready-to-fly quads. Trusted globally by thousands of pilots.",       cat:"Shops",      tags:["Motors","Frames","Electronics"], emoji:"🛒", color:"#FF6B35", url:"https://www.getfpv.com",                        featured:true,  trending:true  },
  { id:2,  name:"Rotorbuilds",       desc:"Community-driven platform where pilots share full build configs, parts lists, and tuning notes. The ultimate build inspiration hub.",      cat:"Communities",tags:["Builds","Community","Configs"],   emoji:"🔧", color:"#00D4FF", url:"https://rotorbuilds.com",                       featured:false, trending:true  },
  { id:3,  name:"Betaflight",        desc:"Industry-standard open-source flight controller firmware. Endlessly tunable, used by champions and backyard fliers alike.",               cat:"Tools",      tags:["Firmware","Open Source","FC"],    emoji:"⚙️", color:"#7B2FFF", url:"https://betaflight.com",                        featured:true,  trending:false },
  { id:4,  name:"Velocidrone",       desc:"The premier FPV racing simulator used by world champions for real training. Ultra-realistic physics, multiplayer, and massive track library.", cat:"Simulators", tags:["Racing","Training","Multiplayer"], emoji:"🎮", color:"#00FF88", url:"https://www.velocidrone.com",                   featured:false, trending:false },
  { id:5,  name:"Joshua Bardwell",   desc:"The definitive FPV YouTube channel — deep-dive tutorials, honest reviews, and technical knowledge from the most trusted voice in FPV.",   cat:"Media",      tags:["YouTube","Tutorials","Reviews"],  emoji:"📺", color:"#FF0044", url:"https://www.youtube.com/c/JoshuaBardwell",     featured:true,  trending:true  },
  { id:6,  name:"Oscar Liang",       desc:"The most comprehensive FPV knowledge base on the internet. Detailed guides on every aspect of building, tuning, and flying drones.",       cat:"Media",      tags:["Guides","Blog","Technical"],      emoji:"📝", color:"#FFB800", url:"https://oscarliang.com",                        featured:false, trending:false },
  { id:7,  name:"Rotor Riot",        desc:"Media network and premium shop blending cinematic FPV content with top-tier hardware. Where community hype meets serious hardware.",       cat:"Media",      tags:["Cinematic","Shop","Community"],   emoji:"🎬", color:"#FF3366", url:"https://rotorriot.com",                         featured:false, trending:true  },
  { id:8,  name:"Drone Racing League",desc:"Professional FPV racing at the highest level — elite pilots, engineered courses, and a global audience of millions.",                    cat:"Communities",tags:["Racing","Pro","League"],          emoji:"🏆", color:"#FF6B00", url:"https://thedroneracingleague.com",              featured:false, trending:false },
  { id:9,  name:"Liftoff Simulator", desc:"Immersive FPV sim with realistic physics, multiplayer racing, and a vast track library. Available on Steam.",                              cat:"Simulators", tags:["Simulator","Steam","Racing"],     emoji:"🕹️", color:"#00C8FF", url:"https://liftoff-game.com",                      featured:false, trending:false },
  { id:10, name:"RCGroups FPV",      desc:"The oldest and largest FPV community forum — decades of accumulated knowledge, builds, arguments, and passion.",                          cat:"Communities",tags:["Forum","Community","History"],   emoji:"💬", color:"#8B5CF6", url:"https://www.rcgroups.com",                      featured:false, trending:false },
  { id:11, name:"Caddx FPV",         desc:"Leading FPV camera manufacturer — creators of the legendary Ratel, Nebula, and Vista digital systems trusted worldwide.",                 cat:"Shops",      tags:["Cameras","HD","Digital"],         emoji:"📷", color:"#10B981", url:"https://www.caddxfpv.com",                     featured:false, trending:false },
  { id:12, name:"UAV Coach",         desc:"Comprehensive drone pilot training covering FAA Part 107 certification and advanced FPV flying techniques.",                               cat:"Tools",      tags:["Training","FAA","Certification"],  emoji:"🎓", color:"#F59E0B", url:"https://uavcoach.com",                          featured:false, trending:false },
  { id:13, name:"Tiny Whoop",        desc:"Home of the indoor micro FPV movement. Tiny, addictive, and endlessly fun — the gateway drug to FPV for thousands of pilots.",           cat:"Rare Finds", tags:["Micro","Indoor","Whoops"],         emoji:"🐝", color:"#FCD34D", url:"https://www.tinywhoop.com",                    featured:false, trending:false },
  { id:14, name:"AirVūz",            desc:"The premier platform for sharing and discovering the world's best cinematic FPV and drone footage. A gallery of the sky.",                cat:"Cinematic",  tags:["Video","Community","Showcase"],   emoji:"🌐", color:"#06B6D4", url:"https://www.airvuz.com",                        featured:false, trending:false },
  { id:15, name:"ExpressLRS",        desc:"Open-source ultra-low latency radio link — the revolution in long-range FPV control. The future of RC links is open source.",             cat:"Long Range", tags:["Open Source","Radio","Latency"],  emoji:"📡", color:"#EC4899", url:"https://www.expresslrs.org",                   featured:false, trending:false },
  { id:16, name:"Mr Steele",         desc:"The original freestyle legend — redefining what's possible with cinematic freestyle flying. Raw skill meets artistic vision.",             cat:"Freestyle",  tags:["Freestyle","Cinematic","Legend"],  emoji:"⚡", color:"#F97316", url:"https://www.youtube.com/c/MrSteeleFPV",       featured:true,  trending:false },
  { id:17, name:"Tiny Trainer",      desc:"Community-designed micro FPV trainer platforms — the perfect entry point for new pilots wanting a real-feel learning experience.",         cat:"Rare Finds", tags:["Training","Micro","Beginner"],     emoji:"🌱", color:"#84CC16", url:"https://rotorbuilds.com",                       featured:false, trending:false },
  { id:18, name:"Pilot Institute",   desc:"FAA drone pilot certification courses and advanced FPV training programs trusted by tens of thousands of students worldwide.",             cat:"Tools",      tags:["Certification","FAA","Training"],  emoji:"✈️", color:"#3B82F6", url:"https://pilotinstitute.com",                   featured:false, trending:false },
];

const CATS = [
  { id:"Shops",      label:"SHOPS",      icon:"🛒", color:"#FF6B35", acc:"rgba(255,107,53,0.11)",  desc:"Parts & gear"    },
  { id:"Tools",      label:"TOOLS",      icon:"⚙️", color:"#7B2FFF", acc:"rgba(123,47,255,0.11)",  desc:"Software"        },
  { id:"Simulators", label:"SIMS",       icon:"🎮", color:"#00FF88", acc:"rgba(0,255,136,0.09)",   desc:"Training sims"   },
  { id:"Media",      label:"MEDIA",      icon:"📺", color:"#FF0044", acc:"rgba(255,0,68,0.09)",    desc:"Content"         },
  { id:"Communities",label:"SOCIAL",     icon:"💬", color:"#00D4FF", acc:"rgba(0,212,255,0.09)",   desc:"Forums & groups" },
  { id:"Rare Finds", label:"RARE",       icon:"💎", color:"#FFB800", acc:"rgba(255,184,0,0.09)",   desc:"Hidden gems"     },
  { id:"Cinematic",  label:"CINEMA",     icon:"🎬", color:"#EC4899", acc:"rgba(236,72,153,0.09)",  desc:"Aerial art"      },
  { id:"Freestyle",  label:"FREE",       icon:"⚡", color:"#F97316", acc:"rgba(249,115,22,0.09)",  desc:"Trick flying"    },
  { id:"Long Range", label:"L.RANGE",    icon:"📡", color:"#84CC16", acc:"rgba(132,204,22,0.09)",  desc:"Distance"        },
];

const BOOT = [
  "INITIALIZING FPV OS v2.4.0...",
  "Loading neural flight matrix...",
  "Calibrating gyroscope arrays...",
  "Connecting to FPV network nodes...",
  "Scanning frequency bands [2.4 GHz / 5.8 GHz]...",
  `Mounting site database [${SITES.length} nodes found]...`,
  "Initializing discovery protocols...",
  "Rendering glassmorphic interface layers...",
  "SYSTEM READY.",
];

/* ── STYLE TOKENS ─────────────────────────────────────────────── */
const T = {
  bg:'#030812', cyan:'#00D4FF',
  glass:'rgba(8,20,50,0.68)', gb:'rgba(0,212,255,0.085)',
  text:'#C2D8EE', bright:'#E6F2FF', mid:'#3A587A', muted:'#182E46',
  orb:"'Orbitron',monospace", raj:"'Rajdhani',sans-serif", mono:"'Share Tech Mono',monospace",
};

/* ── AUDIO HOOK (architecture ready) ─────────────────────────── */
function useAudio() {
  const refs = useRef({});
  useEffect(() => {
    ['hover','click','menu-open','roulette-spin','roulette-tick','roulette-land','boot','navigate'].forEach(n => {
      // refs.current[n] = new Audio(`/audio/${n}.mp3`);
      // refs.current[n].preload = 'auto';
    });
  }, []);
  const play = useCallback((name) => {
    // refs.current[name]?.play().catch(()=>{});
  }, []);
  return { play };
}

/* ── ANIMATED BACKGROUND ─────────────────────────────────────── */
function AnimBG() {
  return (
    <div style={{position:'fixed',inset:0,zIndex:0,overflow:'hidden',pointerEvents:'none'}}>
      {/* Grid */}
      <div style={{position:'absolute',inset:0,backgroundImage:`linear-gradient(rgba(0,212,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.02) 1px,transparent 1px)`,backgroundSize:'68px 68px'}}/>
      {/* Deep glow base */}
      <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse 85% 50% at 50% 105%,rgba(3,14,50,0.95) 0%,transparent 65%)'}}/>
      {/* Floating orbs */}
      {[
        {w:600,h:600,x:'6%', y:'10%',c:'rgba(0,44,120,0.1)', d:22},
        {w:480,h:420,x:'60%',y:'3%', c:'rgba(36,0,88,0.08)', d:27},
        {w:400,h:400,x:'40%',y:'50%',c:'rgba(0,66,120,0.07)',d:18},
        {w:700,h:280,x:'10%',y:'60%',c:'rgba(0,32,68,0.09)', d:34},
      ].map((o,i)=>(
        <motion.div key={i}
          style={{position:'absolute',left:o.x,top:o.y,width:o.w,height:o.h,
            background:`radial-gradient(circle,${o.c} 0%,transparent 70%)`,
            borderRadius:'50%',filter:'blur(55px)'}}
          animate={{x:[0,24,-16,0],y:[0,-21,13,0],scale:[1,1.07,0.97,1]}}
          transition={{duration:o.d,repeat:Infinity,ease:'easeInOut'}}/>
      ))}
      {/* Scanlines */}
      <div style={{position:'absolute',inset:0,background:'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.02) 2px,rgba(0,0,0,0.02) 4px)'}}/>
    </div>
  );
}

/* ── BOOT SCREEN ─────────────────────────────────────────────── */
function BootScreen({onComplete}) {
  const [pct,setPct]   = useState(0);
  const [lines,setLines] = useState([]);
  const [phase,setPhase] = useState('logo');

  useEffect(()=>{ const t=setTimeout(()=>setPhase('boot'),1300); return()=>clearTimeout(t); },[]);
  useEffect(()=>{
    if(phase!=='boot') return;
    let i=0;
    const run=()=>{
      if(i<BOOT.length){
        const k=i++;
        setLines(p=>[...p,BOOT[k]]);
        setPct(Math.round(((k+1)/BOOT.length)*100));
        setTimeout(run,185+Math.random()*65);
      } else { setTimeout(()=>{ setPhase('done'); setTimeout(onComplete,480); },380); }
    };
    setTimeout(run,60);
  },[phase,onComplete]);

  return (
    <motion.div exit={{opacity:0,scale:1.035}} transition={{duration:0.72,ease:[0.4,0,0.2,1]}}
      style={{position:'fixed',inset:0,zIndex:100,background:'#01040a',
              display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
      {/* Corner brackets */}
      {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h],i)=>(
        <div key={i} style={{position:'absolute',[v]:20,[h]:20,width:18,height:18,
          borderTop:v==='top'?'1px solid rgba(0,212,255,0.22)':'none',
          borderBottom:v==='bottom'?'1px solid rgba(0,212,255,0.22)':'none',
          borderLeft:h==='left'?'1px solid rgba(0,212,255,0.22)':'none',
          borderRight:h==='right'?'1px solid rgba(0,212,255,0.22)':'none'}}/>
      ))}
      {/* Logo */}
      <motion.div initial={{opacity:0,scale:0.7}} animate={{opacity:1,scale:1}}
        transition={{duration:1.1,ease:[0,0,0.2,1]}}
        style={{textAlign:'center',marginBottom:54}}>
        <motion.div animate={{opacity:[0.25,0.6,0.25]}} transition={{duration:2.5,repeat:Infinity}}
          style={{fontFamily:T.mono,fontSize:11,letterSpacing:10,color:T.cyan,marginBottom:9,opacity:0.4}}>
          ◈ SYSTEM ◈
        </motion.div>
        <div style={{fontFamily:T.orb,fontSize:clamp(36,8,52),fontWeight:900,letterSpacing:5,color:'#fff',
          textShadow:`0 0 30px rgba(0,212,255,0.5),0 0 60px rgba(0,212,255,0.25)`}}>
          FPV<span style={{color:T.cyan}}>OS</span>
        </div>
        <div style={{fontFamily:T.mono,fontSize:9,letterSpacing:8,color:T.mid,marginTop:8}}>ECOSYSTEM EXPLORER</div>
      </motion.div>
      {/* Boot log */}
      <AnimatePresence>
        {phase==='boot'&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{width:'min(450px,88vw)'}}>
            <div style={{fontFamily:T.mono,fontSize:9.5,color:T.mid,marginBottom:16,
                         height:124,overflow:'hidden',display:'flex',flexDirection:'column',justifyContent:'flex-end',gap:4.5}}>
              {lines.map((l,i)=>(
                <motion.div key={i} initial={{opacity:0,x:-6}} animate={{opacity:i===lines.length-1?0.9:0.36,x:0}}
                  style={{display:'flex',gap:7}}>
                  <span style={{color:T.cyan,opacity:0.4}}>›</span><span>{l}</span>
                </motion.div>
              ))}
            </div>
            <div style={{height:2,background:'rgba(0,212,255,0.07)',borderRadius:2,overflow:'hidden'}}>
              <motion.div animate={{width:`${pct}%`}} transition={{duration:0.15}}
                style={{height:'100%',background:`linear-gradient(90deg,rgba(0,120,180,0.8),${T.cyan})`,borderRadius:2}}/>
            </div>
            <div style={{fontFamily:T.mono,fontSize:8.5,color:T.cyan,marginTop:6,textAlign:'right',letterSpacing:2}}>{pct}%</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function clamp(min,mid,max){ return `clamp(${min}px,${mid}vw,${max}px)`; }

/* ── NAVBAR ───────────────────────────────────────────────────── */
function NavBar({screen,nav}) {
  const [time,setTime]=useState(new Date());
  useEffect(()=>{ const t=setInterval(()=>setTime(new Date()),1000); return()=>clearInterval(t); },[]);
  const p2=n=>String(n).padStart(2,'0');
  const items=[{id:'home',l:'HOME'},{id:'discover',l:'DISCOVER'},{id:'categories',l:'EXPLORE'}];
  return (
    <motion.div initial={{y:-50,opacity:0}} animate={{y:0,opacity:1}} transition={{duration:0.5,delay:0.1,ease:[0,0,0.2,1]}}
      style={{position:'fixed',top:0,left:0,right:0,zIndex:50,height:48,
              background:'rgba(2,5,14,0.92)',borderBottom:'1px solid rgba(0,212,255,0.07)',
              backdropFilter:'blur(22px)',display:'flex',alignItems:'center',padding:'0 18px'}}>
      <div style={{fontFamily:T.orb,fontSize:14,fontWeight:800,letterSpacing:3,color:'#fff',marginRight:30,flexShrink:0}}>
        FPV<span style={{color:T.cyan}}>OS</span>
      </div>
      <div style={{display:'flex',gap:3,flex:1}}>
        {items.map(n=>(
          <motion.button key={n.id} onClick={()=>nav(n.id)} whileHover={{scale:1.03}} whileTap={{scale:0.96}}
            style={{background:screen===n.id?'rgba(0,212,255,0.08)':'transparent',
                    border:screen===n.id?'1px solid rgba(0,212,255,0.16)':'1px solid transparent',
                    color:screen===n.id?T.cyan:T.mid,padding:'3px 13px',borderRadius:4,cursor:'pointer',
                    fontFamily:T.orb,fontSize:9.5,letterSpacing:2,fontWeight:600,transition:'all 0.18s'}}>
            {n.l}
          </motion.button>
        ))}
      </div>
      <div style={{display:'flex',alignItems:'center',gap:16,fontFamily:T.mono,color:T.mid,fontSize:9.5,flexShrink:0}}>
        <span style={{color:'rgba(0,212,255,0.25)'}}>◈</span>
        <span>{p2(time.getHours())}:{p2(time.getMinutes())}:{p2(time.getSeconds())}</span>
        <motion.span animate={{opacity:[0.35,0.95,0.35]}} transition={{duration:2,repeat:Infinity}}
          style={{color:'#00FF88',letterSpacing:0.5}}>● LIVE</motion.span>
      </div>
    </motion.div>
  );
}

/* ── SITE CARD ────────────────────────────────────────────────── */
function SiteCard({site,onClick}) {
  const [hov,setHov]=useState(false);
  return (
    <motion.div onClick={()=>onClick(site)} onHoverStart={()=>setHov(true)} onHoverEnd={()=>setHov(false)}
      whileHover={{scale:1.026,y:-3}} whileTap={{scale:0.97}}
      style={{background:T.glass,border:`1px solid ${hov?site.color+'32':T.gb}`,borderRadius:11,
              padding:16,cursor:'pointer',position:'relative',overflow:'hidden',
              backdropFilter:'blur(18px)',transition:'border-color 0.24s,box-shadow 0.24s',
              boxShadow:hov?`0 8px 32px ${site.color}16,0 0 0 1px ${site.color}22`:'0 3px 16px rgba(0,0,0,0.28)'}}>
      <div style={{position:'absolute',inset:0,
        background:`radial-gradient(circle at top right,${site.color}0A 0%,transparent 56%)`,
        opacity:hov?1:0.5,transition:'opacity 0.26s'}}/>
      <div style={{position:'absolute',top:0,left:0,right:0,height:2,
        background:`linear-gradient(90deg,${site.color}80,transparent)`,borderRadius:'11px 11px 0 0'}}/>
      <div style={{position:'relative',zIndex:1}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:9}}>
          <div style={{fontSize:20}}>{site.emoji}</div>
          <div style={{fontFamily:T.mono,fontSize:7.5,color:site.color,
            background:`${site.color}14`,border:`1px solid ${site.color}22`,
            padding:'2px 6px',borderRadius:20,letterSpacing:0.7}}>{site.cat.toUpperCase()}</div>
        </div>
        <div style={{fontFamily:T.orb,fontSize:13,fontWeight:700,color:T.bright,marginBottom:6,letterSpacing:0.3}}>{site.name}</div>
        <div style={{display:'flex',flexWrap:'wrap',gap:3}}>
          {site.tags.slice(0,2).map(t=>(
            <span key={t} style={{fontFamily:T.mono,fontSize:7.5,color:T.mid,
              background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.042)',
              padding:'1.5px 5px',borderRadius:3,letterSpacing:0.3}}>{t}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ── SITE MODAL ───────────────────────────────────────────────── */
function Modal({site,onClose}) {
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose}
      style={{position:'fixed',inset:0,zIndex:90,background:'rgba(1,2,8,0.86)',
              backdropFilter:'blur(16px)',display:'flex',alignItems:'center',justifyContent:'center',padding:18}}>
      <motion.div initial={{scale:0.85,y:32,opacity:0}} animate={{scale:1,y:0,opacity:1}}
        exit={{scale:0.85,y:32,opacity:0}} transition={{duration:0.34,ease:[0,0,0.2,1]}}
        onClick={e=>e.stopPropagation()}
        style={{width:'min(520px,96vw)',background:'rgba(4,10,32,0.97)',
                border:`1px solid ${site.color}28`,borderRadius:13,padding:28,
                position:'relative',overflow:'hidden',
                boxShadow:`0 32px 68px rgba(0,0,0,0.55),0 0 44px ${site.color}0C`}}>
        <div style={{position:'absolute',inset:0,
          background:`radial-gradient(circle at top right,${site.color}0C 0%,transparent 48%)`,pointerEvents:'none'}}/>
        <div style={{position:'absolute',top:0,left:0,right:0,height:3,
          background:`linear-gradient(90deg,${site.color},${site.color}40,transparent)`}}/>
        <div style={{position:'relative',zIndex:1}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{fontSize:40}}>{site.emoji}</div>
              <div>
                <div style={{fontFamily:T.orb,fontSize:20,fontWeight:800,color:'#fff',letterSpacing:1}}>{site.name}</div>
                <div style={{fontFamily:T.mono,fontSize:8.5,color:site.color,letterSpacing:2.5,marginTop:2}}>{site.cat.toUpperCase()}</div>
              </div>
            </div>
            <button onClick={onClose}
              style={{background:'rgba(255,255,255,0.035)',border:'1px solid rgba(255,255,255,0.07)',
                      color:T.mid,width:28,height:28,borderRadius:6,cursor:'pointer',
                      fontSize:12,display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
          </div>
          <p style={{fontFamily:T.raj,fontSize:13,color:T.text,lineHeight:1.72,
                     marginBottom:20,paddingBottom:20,borderBottom:'1px solid rgba(255,255,255,0.035)'}}>{site.desc}</p>
          <div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:18}}>
            {site.tags.map(t=>(
              <span key={t} style={{fontFamily:T.mono,fontSize:8.5,color:site.color,
                background:`${site.color}10`,border:`1px solid ${site.color}26`,
                padding:'3px 9px',borderRadius:20,letterSpacing:0.8}}>{t}</span>
            ))}
          </div>
          <div style={{fontFamily:T.mono,fontSize:8,color:T.mid,marginBottom:16,opacity:0.45}}>{site.url}</div>
          <motion.a href={site.url} target="_blank" rel="noopener noreferrer"
            whileHover={{scale:1.022}} whileTap={{scale:0.97}}
            style={{display:'block',width:'100%',padding:'12px 0',borderRadius:7,
                    background:`linear-gradient(135deg,${site.color}1C,${site.color}0E)`,
                    border:`1px solid ${site.color}3C`,color:site.color,textAlign:'center',
                    fontFamily:T.orb,fontSize:11,fontWeight:700,letterSpacing:3,
                    textDecoration:'none',boxShadow:`0 0 24px ${site.color}14`}}>
            ◈ LAUNCH SITE ◈
          </motion.a>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── HOME ─────────────────────────────────────────────────────── */
function HomeScreen({nav,onSelect}) {
  const featured = useMemo(()=>SITES.filter(s=>s.featured),[]);
  const trending  = useMemo(()=>SITES.filter(s=>s.trending),[]);
  const recent    = useMemo(()=>SITES.slice(-6),[]);
  const [fi,setFi]=useState(0);
  const feat=featured[fi%featured.length];
  useEffect(()=>{ const t=setInterval(()=>setFi(i=>i+1),5200); return()=>clearInterval(t); },[]);

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.36}}
      style={{height:'100%',overflowY:'auto',padding:'52px 0 0'}}>
      <div style={{maxWidth:1060,margin:'0 auto',padding:'18px 18px 0'}}>

        {/* ── Hero grid ── */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:13,marginBottom:16,alignItems:'start'}}>

          {/* Featured card */}
          <AnimatePresence mode="wait">
            <motion.div key={feat.id}
              initial={{opacity:0,x:-14}} animate={{opacity:1,x:0}} exit={{opacity:0,x:14}} transition={{duration:0.42}}
              onClick={()=>onSelect(feat)} whileHover={{scale:1.007}}
              style={{background:'rgba(6,16,44,0.9)',border:`1px solid ${feat.color}24`,borderRadius:13,
                      padding:'26px 26px 22px',cursor:'pointer',position:'relative',overflow:'hidden',
                      boxShadow:`0 14px 44px ${feat.color}0E,0 0 0 1px ${feat.color}14`}}>
              <div style={{position:'absolute',inset:0,background:`radial-gradient(circle at bottom right,${feat.color}0E 0%,transparent 50%)`}}/>
              <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${feat.color},transparent)`}}/>
              <div style={{position:'relative',zIndex:1}}>
                <div style={{fontFamily:T.mono,fontSize:7.5,color:T.cyan,letterSpacing:3.5,marginBottom:12,opacity:0.5}}>◈ FEATURED</div>
                <div style={{fontSize:42,marginBottom:10}}>{feat.emoji}</div>
                <div style={{fontFamily:T.orb,fontSize:22,fontWeight:800,color:'#fff',letterSpacing:1.2,marginBottom:9}}>{feat.name}</div>
                <p style={{fontFamily:T.raj,fontSize:12.5,color:T.mid,lineHeight:1.7,marginBottom:14}}>{feat.desc}</p>
                <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                  {feat.tags.map(t=>(
                    <span key={t} style={{fontFamily:T.mono,fontSize:7.5,color:feat.color,
                      background:`${feat.color}12`,border:`1px solid ${feat.color}1E`,
                      padding:'2px 7px',borderRadius:20,letterSpacing:0.8}}>{t}</span>
                  ))}
                </div>
                <div style={{marginTop:14,display:'flex',alignItems:'center',gap:5,color:T.cyan,opacity:0.38}}>
                  <span style={{fontFamily:T.mono,fontSize:8.5,letterSpacing:2}}>EXPLORE</span>
                  <motion.span animate={{x:[0,3,0]}} transition={{duration:1.4,repeat:Infinity}}>→</motion.span>
                </div>
              </div>
              <div style={{position:'absolute',bottom:16,right:16,display:'flex',gap:3.5}}>
                {featured.map((_,i)=>(
                  <div key={i} style={{width:i===fi%featured.length?12:3.5,height:3,borderRadius:2,
                    background:i===fi%featured.length?feat.color:'rgba(255,255,255,0.15)',transition:'all 0.3s'}}/>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Right column */}
          <div style={{display:'flex',flexDirection:'column',gap:11}}>
            {/* Discover CTA */}
            <motion.div onClick={()=>nav('discover')} whileHover={{scale:1.03,y:-2}} whileTap={{scale:0.97}}
              style={{background:'rgba(0,212,255,0.042)',border:'1px solid rgba(0,212,255,0.15)',borderRadius:9,
                      padding:'14px 15px',cursor:'pointer',display:'flex',alignItems:'center',gap:11}}>
              <motion.div animate={{rotate:360}} transition={{duration:6.5,repeat:Infinity,ease:'linear'}}
                style={{fontSize:22,flexShrink:0,color:T.cyan}}>◎</motion.div>
              <div style={{flex:1}}>
                <div style={{fontFamily:T.orb,fontSize:11,fontWeight:700,color:T.cyan,letterSpacing:2.5,marginBottom:2}}>DISCOVER</div>
                <div style={{fontFamily:T.raj,fontSize:10.5,color:T.mid}}>Random FPV roulette</div>
              </div>
              <motion.div animate={{x:[0,3,0]}} transition={{duration:1.5,repeat:Infinity}}
                style={{color:T.cyan,opacity:0.4,fontSize:14}}>→</motion.div>
            </motion.div>
            {/* Trending */}
            <div style={{background:T.glass,border:`1px solid ${T.gb}`,borderRadius:9,
                         padding:'13px 14px',backdropFilter:'blur(18px)'}}>
              <div style={{fontFamily:T.mono,fontSize:7.5,color:T.mid,letterSpacing:3,marginBottom:11}}>TRENDING</div>
              <div style={{display:'flex',flexDirection:'column',gap:5}}>
                {trending.map((s,i)=>(
                  <motion.div key={s.id} onClick={()=>onSelect(s)} whileHover={{x:3}}
                    style={{display:'flex',alignItems:'center',gap:9,padding:'6px 7px',borderRadius:6,
                            cursor:'pointer',background:'rgba(255,255,255,0.015)',
                            border:'1px solid rgba(255,255,255,0.022)'}}>
                    <span style={{fontFamily:T.mono,fontSize:8.5,color:T.muted,width:13}}>0{i+1}</span>
                    <span style={{fontSize:15}}>{s.emoji}</span>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:T.raj,fontSize:11.5,fontWeight:600,color:T.bright}}>{s.name}</div>
                      <div style={{fontFamily:T.mono,fontSize:7.5,color:T.mid,letterSpacing:0.7}}>{s.cat}</div>
                    </div>
                    <div style={{width:5,height:5,borderRadius:'50%',background:s.color,boxShadow:`0 0 6px ${s.color}`}}/>
                  </motion.div>
                ))}
              </div>
            </div>
            {/* Stats bar */}
            <div style={{background:T.glass,border:`1px solid ${T.gb}`,borderRadius:9,
                         padding:'12px 14px',backdropFilter:'blur(18px)',display:'flex',justifyContent:'space-between'}}>
              {[{v:SITES.length,l:'SITES'},{v:CATS.length,l:'CATS'},{v:SITES.filter(s=>s.featured).length,l:'FEATURED'}].map(x=>(
                <div key={x.l} style={{textAlign:'center'}}>
                  <div style={{fontFamily:T.orb,fontSize:18,fontWeight:800,color:T.cyan}}>{x.v}</div>
                  <div style={{fontFamily:T.mono,fontSize:7.5,color:T.mid,letterSpacing:1.5}}>{x.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Category strip ── */}
        <div style={{marginBottom:16}}>
          <div style={{fontFamily:T.mono,fontSize:7.5,color:T.muted,letterSpacing:3,marginBottom:9}}>EXPLORE BY CATEGORY</div>
          <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:2}}>
            {CATS.map(c=>(
              <motion.button key={c.id} onClick={()=>nav('categories',c.id)}
                whileHover={{scale:1.07,y:-2}} whileTap={{scale:0.96}}
                style={{flexShrink:0,background:c.acc,border:`1px solid ${c.color}1E`,
                        borderRadius:7,padding:'6px 12px',cursor:'pointer',
                        display:'flex',alignItems:'center',gap:5}}>
                <span style={{fontSize:12}}>{c.icon}</span>
                <span style={{fontFamily:T.orb,fontSize:7.5,fontWeight:700,color:c.color,letterSpacing:1.4}}>{c.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── Recently added ── */}
        <div>
          <div style={{fontFamily:T.mono,fontSize:7.5,color:T.muted,letterSpacing:3,marginBottom:11}}>RECENTLY ADDED</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(185px,1fr))',gap:9}}>
            {recent.map((s,i)=>(
              <motion.div key={s.id} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}>
                <SiteCard site={s} onClick={onSelect}/>
              </motion.div>
            ))}
          </div>
        </div>
        <div style={{height:30}}/>
      </div>
    </motion.div>
  );
}

/* ── DISCOVER ─────────────────────────────────────────────────── */
function DiscoverScreen({onSelect}) {
  const [phase,setPhase]=useState('idle');
  const [ci,setCi]=useState(0);
  const [result,setResult]=useState(null);
  const tRef=useRef(null);
  const {play}=useAudio();

  const spin=useCallback(()=>{
    if(phase!=='idle') return;
    play('roulette-spin');
    setPhase('spinning'); setResult(null);
    let speed=35, ticks=0, total=42;
    const fi=Math.floor(Math.random()*SITES.length);
    const tick=()=>{
      setCi(i=>(i+1)%SITES.length); ticks++;
      if(ticks>=total*0.6) speed=Math.min(speed*1.28,680);
      if(ticks>=total){
        clearTimeout(tRef.current); setCi(fi);
        setTimeout(()=>{ setResult(SITES[fi]); setPhase('result'); play('roulette-land'); },300);
      } else tRef.current=setTimeout(tick,speed);
    };
    tRef.current=setTimeout(tick,speed);
  },[phase,play]);

  useEffect(()=>()=>clearTimeout(tRef.current),[]);
  const reset=()=>{ setPhase('idle'); setResult(null); };
  const cur=SITES[ci];

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      style={{height:'100%',display:'flex',flexDirection:'column',alignItems:'center',
              justifyContent:'center',padding:'52px 18px 18px',position:'relative',overflow:'hidden'}}>

      {/* Ambient rings */}
      {[1,2,3].map(i=>(
        <motion.div key={i}
          animate={{rotate:i%2?360:-360,scale:[1,1.012,1]}}
          transition={{duration:16+i*7,repeat:Infinity,ease:'linear'}}
          style={{position:'absolute',width:i*250,height:i*250,
                  border:`1px solid rgba(0,212,255,${0.038/i})`,
                  borderRadius:'50%',top:'50%',left:'50%',transform:'translate(-50%,-50%)'}}/>
      ))}

      <AnimatePresence mode="wait">

        {/* IDLE */}
        {phase==='idle'&&(
          <motion.div key="idle" initial={{opacity:0,scale:0.85}} animate={{opacity:1,scale:1}}
            exit={{opacity:0,scale:1.08}} style={{textAlign:'center'}}>
            <div style={{fontFamily:T.mono,fontSize:8.5,color:T.mid,letterSpacing:4,marginBottom:16}}>◈ RANDOM DISCOVERY ENGINE ◈</div>
            <div style={{fontFamily:T.orb,fontSize:clamp(24,5.5,50),fontWeight:900,color:'#fff',
                         letterSpacing:4,marginBottom:6,textShadow:`0 0 26px rgba(0,212,255,0.17)`}}>DISCOVER</div>
            <div style={{fontFamily:T.raj,fontSize:13.5,color:T.mid,marginBottom:44}}>
              Spin the roulette — land on a random FPV universe
            </div>
            <motion.button onClick={spin} whileHover={{scale:1.07}} whileTap={{scale:0.92}}
              style={{width:150,height:150,borderRadius:'50%',
                      background:'radial-gradient(circle,rgba(0,212,255,0.11) 0%,rgba(0,65,125,0.07) 55%,transparent 100%)',
                      border:'2px solid rgba(0,212,255,0.3)',cursor:'pointer',position:'relative',
                      boxShadow:'0 0 44px rgba(0,212,255,0.12),0 0 88px rgba(0,212,255,0.04)',
                      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:4}}>
              <motion.div animate={{rotate:360}} transition={{duration:4.8,repeat:Infinity,ease:'linear'}}
                style={{position:'absolute',inset:5,borderRadius:'50%',
                        border:'1px solid rgba(0,212,255,0.08)',borderTop:'1px solid rgba(0,212,255,0.4)'}}/>
              <div style={{fontSize:32}}>◎</div>
              <div style={{fontFamily:T.orb,fontSize:9.5,fontWeight:700,color:T.cyan,letterSpacing:2}}>SPIN</div>
            </motion.button>
            <div style={{fontFamily:T.raj,fontSize:11.5,color:T.muted,marginTop:20}}>
              {SITES.length} FPV destinations loaded
            </div>
          </motion.div>
        )}

        {/* SPINNING */}
        {phase==='spinning'&&(
          <motion.div key="spinning" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{textAlign:'center',width:'100%',maxWidth:420}}>
            <div style={{fontFamily:T.mono,fontSize:8.5,color:T.cyan,letterSpacing:4,marginBottom:20,opacity:0.58}}>
              SCANNING NETWORK...
            </div>
            <div style={{position:'relative',overflow:'hidden',height:162,borderRadius:11,
                         border:'1px solid rgba(0,212,255,0.1)',background:'rgba(2,6,16,0.94)',
                         backdropFilter:'blur(18px)',marginBottom:20}}>
              <div style={{position:'absolute',top:0,left:0,right:0,height:52,
                background:'linear-gradient(to bottom,rgba(2,6,16,0.98),transparent)',zIndex:2}}/>
              <div style={{position:'absolute',bottom:0,left:0,right:0,height:52,
                background:'linear-gradient(to top,rgba(2,6,16,0.98),transparent)',zIndex:2}}/>
              <div style={{position:'absolute',top:'50%',left:0,right:0,height:2,zIndex:3,transform:'translateY(-50%)',
                background:`linear-gradient(90deg,transparent,${cur.color}48,transparent)`}}/>
              <motion.div key={ci} initial={{y:-30,opacity:0}} animate={{y:0,opacity:1}}
                style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',
                        alignItems:'center',justifyContent:'center',gap:6}}>
                <div style={{fontSize:42}}>{cur.emoji}</div>
                <div style={{fontFamily:T.orb,fontSize:17,fontWeight:800,color:'#fff',letterSpacing:1.2}}>{cur.name}</div>
                <div style={{fontFamily:T.mono,fontSize:8.5,color:cur.color,letterSpacing:2}}>{cur.cat}</div>
              </motion.div>
            </div>
            {/* EQ bars */}
            <div style={{display:'flex',justifyContent:'center',gap:2.5}}>
              {Array.from({length:14}).map((_,i)=>(
                <motion.div key={i} style={{width:3,background:T.cyan,borderRadius:2}}
                  animate={{height:[5,18,5]}}
                  transition={{duration:0.26,repeat:Infinity,delay:i*0.038,ease:'easeInOut'}}/>
              ))}
            </div>
          </motion.div>
        )}

        {/* RESULT */}
        {phase==='result'&&result&&(
          <motion.div key="result" initial={{opacity:0,y:22}} animate={{opacity:1,y:0}}
            transition={{duration:0.52,ease:[0,0,0.2,1]}} style={{textAlign:'center',width:'100%',maxWidth:480}}>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.13}}>
              <div style={{fontFamily:T.mono,fontSize:8.5,color:'#00FF88',letterSpacing:4,marginBottom:16}}>
                ◈ DESTINATION ACQUIRED ◈
              </div>
            </motion.div>
            <motion.div initial={{scale:0.8}} animate={{scale:1}} transition={{delay:0.07,duration:0.45,ease:[0,0,0.2,1]}}
              style={{background:'rgba(4,10,34,0.97)',border:`1px solid ${result.color}32`,borderRadius:13,
                      padding:26,position:'relative',overflow:'hidden',
                      boxShadow:`0 26px 65px ${result.color}14,0 0 0 1px ${result.color}14`,marginBottom:14}}>
              <div style={{position:'absolute',inset:0,background:`radial-gradient(circle at center,${result.color}0C 0%,transparent 60%)`}}/>
              <div style={{position:'absolute',top:0,left:0,right:0,height:3,
                background:`linear-gradient(90deg,transparent,${result.color},transparent)`}}/>
              <div style={{position:'relative',zIndex:1}}>
                <motion.div initial={{scale:0}} animate={{scale:1}}
                  transition={{delay:0.16,type:'spring',stiffness:215}}
                  style={{fontSize:52,marginBottom:12}}>{result.emoji}</motion.div>
                <div style={{fontFamily:T.orb,fontSize:24,fontWeight:900,color:'#fff',
                             letterSpacing:2.2,marginBottom:6}}>{result.name}</div>
                <div style={{fontFamily:T.mono,fontSize:8.5,color:result.color,
                             letterSpacing:3,marginBottom:13}}>{result.cat.toUpperCase()}</div>
                <p style={{fontFamily:T.raj,fontSize:12.5,color:T.text,lineHeight:1.72,marginBottom:16}}>{result.desc}</p>
                <div style={{display:'flex',flexWrap:'wrap',gap:5,justifyContent:'center',marginBottom:20}}>
                  {result.tags.map(t=>(
                    <span key={t} style={{fontFamily:T.mono,fontSize:8,color:result.color,
                      background:`${result.color}10`,border:`1px solid ${result.color}24`,
                      padding:'2.5px 8px',borderRadius:20,letterSpacing:0.8}}>{t}</span>
                  ))}
                </div>
                <div style={{display:'flex',gap:9}}>
                  <motion.a href={result.url} target="_blank" rel="noopener noreferrer"
                    whileHover={{scale:1.025}} whileTap={{scale:0.97}}
                    style={{flex:1,padding:'11px 0',
                            background:`linear-gradient(135deg,${result.color}1E,${result.color}0E)`,
                            border:`1px solid ${result.color}38`,borderRadius:7,color:result.color,
                            textAlign:'center',fontFamily:T.orb,fontSize:10,fontWeight:700,
                            letterSpacing:3,textDecoration:'none',boxShadow:`0 0 22px ${result.color}12`}}>
                    ◈ LAUNCH ◈
                  </motion.a>
                  <motion.button onClick={()=>onSelect(result)} whileHover={{scale:1.025}} whileTap={{scale:0.97}}
                    style={{padding:'11px 16px',background:'rgba(255,255,255,0.022)',
                            border:'1px solid rgba(255,255,255,0.06)',borderRadius:7,color:T.mid,
                            cursor:'pointer',fontFamily:T.orb,fontSize:9.5,letterSpacing:2}}>
                    INFO
                  </motion.button>
                </div>
              </div>
            </motion.div>
            <motion.button initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.42}}
              onClick={reset} whileHover={{scale:1.04}} whileTap={{scale:0.96}}
              style={{background:'transparent',border:'1px solid rgba(0,212,255,0.15)',borderRadius:7,
                      color:T.mid,padding:'8px 26px',cursor:'pointer',fontFamily:T.orb,fontSize:8.5,letterSpacing:3}}>
              SPIN AGAIN
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── CATEGORIES ───────────────────────────────────────────────── */
function CategoriesScreen({onSelect,initCat}) {
  const [active,setActive]=useState(initCat||null);
  const filtered=active?SITES.filter(s=>s.cat===active):[];
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      style={{height:'100%',overflowY:'auto',padding:'52px 0 0'}}>
      <div style={{maxWidth:1060,margin:'0 auto',padding:'18px 18px 0'}}>
        <div style={{marginBottom:24}}>
          <div style={{fontFamily:T.mono,fontSize:7.5,color:T.mid,letterSpacing:4,marginBottom:6}}>◈ SYSTEM EXPLORER</div>
          <div style={{fontFamily:T.orb,fontSize:clamp(20,4,32),fontWeight:900,color:'#fff',letterSpacing:3}}>CATEGORIES</div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(155px,1fr))',gap:9,marginBottom:26}}>
          {CATS.map(c=>{
            const count=SITES.filter(s=>s.cat===c.id).length;
            const on=active===c.id;
            return (
              <motion.button key={c.id} onClick={()=>setActive(on?null:c.id)}
                whileHover={{scale:1.04,y:-2}} whileTap={{scale:0.97}}
                style={{background:on?c.acc:T.glass,border:`1px solid ${on?c.color+'40':T.gb}`,
                        borderRadius:9,padding:'16px 13px',cursor:'pointer',textAlign:'left',
                        backdropFilter:'blur(18px)',boxShadow:on?`0 5px 22px ${c.color}12`:'none',
                        transition:'all 0.24s',position:'relative',overflow:'hidden'}}>
                {on&&<div style={{position:'absolute',top:0,left:0,right:0,height:2,background:c.color}}/>}
                <div style={{fontSize:22,marginBottom:7}}>{c.icon}</div>
                <div style={{fontFamily:T.orb,fontSize:10,fontWeight:700,color:on?c.color:T.text,
                             letterSpacing:1.4,marginBottom:3}}>{c.label}</div>
                <div style={{fontFamily:T.raj,fontSize:9.5,color:T.mid,marginBottom:6}}>{c.desc}</div>
                <div style={{fontFamily:T.mono,fontSize:7.5,color:on?c.color:T.muted,letterSpacing:0.7}}>{count} SITES</div>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {active&&(
            <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}}
              exit={{opacity:0,y:14}} transition={{duration:0.3}}>
              <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:12}}>
                <div style={{fontFamily:T.mono,fontSize:7.5,color:T.mid,letterSpacing:3}}>
                  {filtered.length} SITES IN {active.toUpperCase()}
                </div>
                <div style={{flex:1,height:1,background:T.gb}}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(248px,1fr))',gap:9}}>
                {filtered.map((s,i)=>(
                  <motion.div key={s.id} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.055}}>
                    <SiteCard site={s} onClick={onSelect}/>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!active&&(
          <div style={{fontFamily:T.raj,textAlign:'center',color:T.muted,fontSize:12.5,marginTop:14}}>
            Select a category above to explore its sites
          </div>
        )}
        <div style={{height:32}}/>
      </div>
    </motion.div>
  );
}

/* ── ROOT ─────────────────────────────────────────────────────── */
export default function FPVConsoleOS() {
  useFonts();
  const [screen,setScreen]=useState('boot');
  const [site,setSite]=useState(null);
  const [cat,setCat]=useState(null);
  const nav=useCallback((to,c)=>{ setCat(c||null); setScreen(to); },[]);

  return (
    <div style={{width:'100vw',height:'100vh',overflow:'hidden',position:'relative',background:T.bg,color:T.text}}>
      <AnimBG/>

      <AnimatePresence>
        {screen==='boot'&&<BootScreen key="boot" onComplete={()=>setScreen('home')}/>}
      </AnimatePresence>

      {screen!=='boot'&&(
        <>
          <NavBar screen={screen} nav={nav}/>
          <div style={{position:'relative',zIndex:10,height:'100%'}}>
            <AnimatePresence mode="wait">
              {screen==='home'&&(
                <motion.div key="home" style={{height:'100%'}}>
                  <HomeScreen nav={nav} onSelect={setSite}/>
                </motion.div>
              )}
              {screen==='discover'&&(
                <motion.div key="discover" style={{height:'100%'}}>
                  <DiscoverScreen onSelect={setSite}/>
                </motion.div>
              )}
              {screen==='categories'&&(
                <motion.div key="categories" style={{height:'100%'}}>
                  <CategoriesScreen onSelect={setSite} initCat={cat}/>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}

      <AnimatePresence>
        {site&&<Modal key="modal" site={site} onClose={()=>setSite(null)}/>}
      </AnimatePresence>
    </div>
  );
}
