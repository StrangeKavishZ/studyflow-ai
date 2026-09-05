'use client';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Brain, BrainCircuit, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Flame, GraduationCap, LineChart, ListChecks, LogIn, Menu, Moon, Play, RotateCcw, Sparkles, Sun, Target, TimerReset, Trophy, X, Zap, Users, UsersRound, Send, Plus, Search, Shield, Globe2, Upload, FileText, Sparkle, UserRound, Save, Award, TrendingUp, NotebookPen, MessageSquare, Settings2, PenLine, Image as ImageIcon, SmilePlus, Reply, Bell, Share2, Keyboard, Copy, Eye } from 'lucide-react';
import { supabaseBrowser } from '../lib/supabase';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar } from 'recharts';

const demoTasks = [
  {id:'1',title:'Revise electrostatics — capacitance',subject:'Physics',due:'Today · 8:00 PM',minutes:45,status:'todo',priority:1},
  {id:'2',title:'Practice integration: 20 problems',subject:'Maths',due:'Tomorrow',minutes:60,status:'todo',priority:2},
  {id:'3',title:'Read organic chemistry notes',subject:'Chemistry',due:'Tomorrow',minutes:35,status:'todo',priority:2},
  {id:'4',title:'English — revise poem themes',subject:'English',due:'Fri',minutes:30,status:'done',priority:3}
];
const emptyWeek = [{d:'Mon',h:0},{d:'Tue',h:0},{d:'Wed',h:0},{d:'Thu',h:0},{d:'Fri',h:0},{d:'Sat',h:0},{d:'Sun',h:0}];

type Task={id:string;title:string;subject?:string;due?:string;minutes?:number;status?:string;priority?:number};

function Avatar({
  profile,
  name,
  size,
  className
}: {
  profile?: any;
  name?: string;
  size?: 'small' | 'big';
  className?: string;
}) {
  const color = profile?.avatar_color || '#3D7A5C';
  const displayName = profile?.name || name || 'Student';
  const initial = displayName.charAt(0).toUpperCase();

  let cls = 'avatar';

  if (size === 'small') {
    cls += ' small';
  }

  if (size === 'big') {
    cls += ' profile-big';
  }

  if (className) {
    cls += ' ' + className;
  }

  return (
    <div
      className={cls}
      style={{
        backgroundColor: color + '26',
        color: color,
        border: '1px solid ' + color + '55'
      }}
    >
      {initial}
    </div>
  );
}

const COLOR_CHOICES = ['#3D7A5C','#C9A66B','#5B7FA6','#A65B8C','#7A5B3D','#5C7A3D','#B85450','#7B7F8A'];

function DeleteButton({onDelete,label='Delete'}:{onDelete:()=>void;label?:string}){
  return <button className="delete-action" type="button" onClick={()=>{if(window.confirm(`${label} this item? This cannot be undone.`))onDelete()}} aria-label={label}><X size={14}/><span>{label}</span></button>;
}

const NAV_ITEMS = [['home',LineChart,'Home'],['planner',CalendarDays,'Calendar'],['tasks',ListChecks,'Tasks'],['topics',Brain,'Topics'],['learning',BrainCircuit,'Learning Engine'],['exams',Target,'Exams'],['analytics',Trophy,'Analytics'],['ai',Sparkles,'AI Companion'],['brain',BrainCircuit,'Study Brain'],['reports',LineChart,'Reports'],['writing',PenLine,'Writing'],['community',Users,'Community'],['groups',UsersRound,'My Groups'],['settings',Zap,'Settings']];

export default function Page(){
  const [mode,setMode]=useState<'landing'|'auth'|'app'>('landing');
  const [authMode,setAuthMode]=useState<'login'|'signup'>('login');
  const [resetMode,setResetMode]=useState(false);
  const [resetSent,setResetSent]=useState(false);
  const [newPassword,setNewPassword]=useState('');
  const [confirmPassword,setConfirmPassword]=useState('');
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [name,setName]=useState(''); const [authError,setAuthError]=useState('');
  const [profile,setProfile]=useState<any>(null); const [section,setSection]=useState('home'); const [dark,setDark]=useState(true); const [profileOpen,setProfileOpen]=useState(false); const [navOpen,setNavOpen]=useState(false); const [profileDraft,setProfileDraft]=useState({name:'',username:'',avatar_emoji:'',avatar_color:'#3D7A5C'}); const [studySessions,setStudySessions]=useState<any[]>([]); const [exams,setExams]=useState<any[]>([]); const [marks,setMarks]=useState<any[]>([]); const [subjects,setSubjects]=useState<any[]>([]); const [leaderboard,setLeaderboard]=useState<any[]>([]); const [templates,setTemplates]=useState<any[]>([]);
  const [tasks,setTasks]=useState<Task[]>(demoTasks); const [timer,setTimer]=useState(25*60); const [running,setRunning]=useState(false); const [focusMinutes,setFocusMinutes]=useState(25); const [manual,setManual]=useState({subject:'Maths',topic:'',minutes:60});
  const [ai,setAi]=useState(''); const [aiAnswer,setAiAnswer]=useState(''); const [toast,setToast]=useState(''); const [showOnboard,setShowOnboard]=useState(false); const [notifications,setNotifications]=useState<any[]>([]); const [notificationOpen,setNotificationOpen]=useState(false); const [searchOpen,setSearchOpen]=useState(false); const [shareOpen,setShareOpen]=useState(false); const [leaderboardOptIn,setLeaderboardOptIn]=useState(false); const [templateOpen,setTemplateOpen]=useState(false);
  const [onboard, setOnboard] = useState<{
  name: string;
  subjects: string[];
  hours: number;
  sunday: string;
  aim: number;
  outOf: number;
  school: string;
  className: string;
  board: string;
}>({
  name: '',
  subjects: [],
  hours: 3,
  sunday: '',
  aim: 90,
  outOf: 100,
  school: '',
  className: '',
  board: '',
});
 const supabase=supabaseBrowser();
  const studyDays=useMemo(()=>new Set(studySessions.map((s:any)=>new Date(s.created_at||Date.now()).toISOString().slice(0,10))),[studySessions]);
  const streak=useMemo(()=>{let count=0;const day=new Date();for(;;){const key=day.toISOString().slice(0,10);if(!studyDays.has(key))break;count++;day.setDate(day.getDate()-1)}return count},[studyDays]);
  const unreadNotifications=notifications.filter((n:any)=>!n.read).length;
  useEffect(()=>{ const t=setInterval(()=>{ if(running) setTimer(v=>v>0?v-1:0); },1000); return()=>clearInterval(t)},[running]);
  useEffect(()=>{const hour=new Date().getHours();setDark(hour<7||hour>=19)},[]);
  useEffect(()=>{const onKey=(event:KeyboardEvent)=>{if(['INPUT','TEXTAREA'].includes((event.target as HTMLElement).tagName))return;if(event.key==='n'){setSection('tasks');setTemplateOpen(true)}if(event.key==='/'){event.preventDefault();setSearchOpen(true)}if(event.key==='Escape'){setSearchOpen(false);setNotificationOpen(false)}};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[]);
  useEffect(()=>{if(!profile?.id)return;const channel=supabase.channel('studyflow-notifications').on('postgres_changes',{event:'INSERT',schema:'public',table:'notifications',filter:`user_id=eq.${profile.id}`},payload=>setNotifications(n=>[payload.new,...n])).subscribe();return()=>{supabase.removeChannel(channel)}},[profile?.id]);
  useEffect(()=>{
  const isReset = new URLSearchParams(window.location.search).get('reset') === 'true';

  if(isReset){
    setResetMode(true);
    if(isReset){

      setResetMode(true);
      setResetSent(false);
      return;
    }
    return;
  }

  supabase.auth.getSession().then(({data})=>{
    if(data.session){
      setMode('app');
      loadProfile(data.session.user.id);
    }
  });
},[]);
  async function loadProfile(uid:string){const [{data},{data:sessions},{data:examRows},{data:markRows},{data:subjectRows},{data:taskRows}]=await Promise.all([supabase.from('profiles').select('*').eq('id',uid).single(),supabase.from('study_sessions').select('*').eq('user_id',uid).order('created_at',{ascending:true}),supabase.from('exams').select('*').eq('user_id',uid).order('exam_at'),supabase.from('marks').select('*').eq('user_id',uid).order('exam_date',{ascending:false}),supabase.from('subjects').select('*').eq('user_id',uid).order('name'),supabase.from('tasks').select('*').eq('user_id',uid).order('created_at',{ascending:false})]); if(data){setProfile(data);setProfileDraft({name:data.name||'',username:data.username||'',avatar_emoji:data.avatar_emoji||'',avatar_color:data.avatar_color||'#3D7A5C'});setDark(data.theme!=='light');} else setShowOnboard(true); setStudySessions(sessions||[]);setExams(examRows||[]);setMarks(markRows||[]);setSubjects(subjectRows||[]); if(taskRows?.length)setTasks(taskRows as Task[]); else setTasks([]); const [{data:templateRows},{data:noticeRows}]=await Promise.all([supabase.from('task_templates').select('*').eq('user_id',uid).order('created_at',{ascending:false}),supabase.from('notifications').select('*').eq('user_id',uid).order('created_at',{ascending:false}).limit(20)]); setTemplates(templateRows||[]); setNotifications(noticeRows||[]); const {data:publicProfiles}=await supabase.from('public_profiles').select('id,name,username').eq('leaderboard_opt_in',true); if(publicProfiles?.length){const {data:allSessions}=await supabase.from('study_sessions').select('user_id,minutes,created_at').in('user_id',publicProfiles.map((p:any)=>p.id));setLeaderboard(publicProfiles.map((p:any)=>({...p,minutes:(allSessions||[]).filter((s:any)=>s.user_id===p.id).reduce((n:number,s:any)=>n+Number(s.minutes||0),0)})).sort((a:any,b:any)=>b.minutes-a.minutes).slice(0,10))}}
  const [verificationMessage,setVerificationMessage]=useState('');

async function sendPasswordReset(){
  setAuthError('');
  setVerificationMessage('');

  if(!email.trim()){
    setAuthError('Enter your email address first.');
    return;
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim(),
    {
      redirectTo: `${siteUrl}/?reset=true`
    }
  );

  if(error){
    setAuthError(error.message);
    return;
  }

  setResetSent(true);
}

async function auth(){
  setAuthError('');
  setVerificationMessage('');

  if(authMode==='login'){
    const result=await supabase.auth.signInWithPassword({
      email,
      password
    });

    if(result.error){
      if(result.error.message.toLowerCase().includes('not confirmed')){
        setAuthError(
          'Your email is not verified yet. Check your inbox or resend the verification email.'
        );
      }else{
        setAuthError(result.error.message);
      }
      return;
    }

    if(result.data.session){
      setMode('app');
      loadProfile(result.data.session.user.id);
    }

    return;
  }

  const siteUrl=
    process.env.NEXT_PUBLIC_SITE_URL||window.location.origin;

  const result=await supabase.auth.signUp({
    email,
    password,
    options:{
      data:{name},
      emailRedirectTo:siteUrl
    }
  });

  if(result.error){

    const errorMessage=result.error.message.toLowerCase();

    if(
      errorMessage.includes('already registered') ||
      errorMessage.includes('already exists') ||
      errorMessage.includes('user already registered')
    ){
      setAuthError(
        'Email already exists. Please log in instead.'
      );
    }else{
      setAuthError(result.error.message);
    }

    return;
  }

  if(result.data.session){
    setMode('app');
    setShowOnboard(true);
  }else{
    setVerificationMessage(
      'Email verification sent! Check your inbox and spam folder, then verify your email before logging in.'
    );
  }
}  

async function updatePassword(){
  setAuthError('');

  if(newPassword.length < 6){
    setAuthError('Password must be at least 6 characters.');
    return;
  }

  if(newPassword !== confirmPassword){
    setAuthError('Passwords do not match.');
    return;
  }

  const {error}=await supabase.auth.updateUser({
    password:newPassword
  });

  if(error){
    setAuthError(error.message);
    return;
  }

  setNewPassword('');
  setConfirmPassword('');
  setResetMode(false);
  setResetSent(false);
  setAuthMode('login');

  setVerificationMessage(
    'Password updated successfully. You can now log in.'
  );
}
  async function resendVerification(){setAuthError('');setVerificationMessage('');if(!email.trim()){setAuthError('Enter your email first.');return;}const {error}=await supabase.auth.resend({type:'signup',email});if(error)setAuthError(error.message);else setVerificationMessage('Verification email sent again! Check your inbox and spam folder.');}
  async function saveOnboard(){const {data:{user}}=await supabase.auth.getUser(); if(!user)return; const p={id:user.id,name:onboard.name,school_name:onboard.school,class_name:onboard.className,board:onboard.board,aim_marks:onboard.aim,aim_out_of:onboard.outOf,avg_hours:onboard.hours,sunday_hours:onboard.sunday?Number(onboard.sunday):null,theme:dark?'dark':'light'}; await supabase.from('profiles').upsert(p); const subs = onboard.subjects; await supabase.from('subjects').upsert(subs.map((s:string)=>({user_id:user.id,name:s,target_hours:0})),{onConflict:'user_id,name'}); setProfile(p);setProfileDraft({name:p.name||'',username:'',avatar_emoji:'',avatar_color:'#3D7A5C'});setShowOnboard(false);setToast('Your study system is ready ✨'); loadProfile(user.id);}
  async function addManual(){const {data:{user}}=await supabase.auth.getUser(); if(user){await supabase.from('study_sessions').insert({user_id:user.id,subject:manual.subject,topic:manual.topic,minutes:manual.minutes,source:'manual',focus_score:80});await supabase.from('topics').insert({user_id:user.id,subject:manual.subject,topic:manual.topic||'General study',mastery:20});}setToast(`Logged ${manual.minutes} min of ${manual.subject}`)}
  async function toggleTask(t:Task){const done=t.status!=='done';setTasks(x=>x.map(a=>a.id===t.id?{...a,status:done?'done':'todo'}:a)); const {data:{user}}=await supabase.auth.getUser(); if(user && !t.id.startsWith('demo')) await supabase.from('tasks').update({status:done?'done':'todo',completed_at:done?new Date().toISOString():null}).eq('id',t.id);}
  async function deleteTask(t:Task){setTasks(x=>x.filter(a=>a.id!==t.id));if(!t.id.startsWith('demo'))await supabase.from('tasks').delete().eq('id',t.id);}
  async function runAI(){if(!ai.trim())return; setAiAnswer('Thinking…'); const r=await fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:ai,context:{profile,tasks,studySessions,exams,marks}})}); const j=await r.json();setAiAnswer(j.answer||j.error||'Done');setToast(j.action?'AI proposed a change':'AI responded');}
  function autoReschedule(){const left=tasks.filter(t=>t.status!=='done');const completed=tasks.filter(t=>t.status==='done');setTasks([...left.map((t,i)=>({...t,due:i===0?'Tonight · 9:00 PM':i===1?'Tomorrow · 6:30 PM':'Tomorrow · 8:00 PM'})),...completed]);setToast(left.length?`Smart plan moved ${left.length} unfinished task${left.length>1?'s':''}.`:'Nothing needs rescheduling 🎉');}
  const mins=String(Math.floor(timer/60)).padStart(2,'0'), secs=String(timer%60).padStart(2,'0');

  if(mode==='landing') return <Landing onStart={()=>{setAuthMode('signup');setMode('auth')}} onLogin={()=>{setAuthMode('login');setMode('auth')}} />;
  if(mode==='auth') return <Auth
  mode={authMode}
  setMode={setAuthMode}
  email={email}
  setEmail={setEmail}
  password={password}
  setPassword={setPassword}
  name={name}
  setName={setName}
  error={authError}
  setAuthError={setAuthError}
  verificationMessage={verificationMessage}
  submit={auth}
  resendVerification={resendVerification}
  resetMode={resetMode}
  setResetMode={setResetMode}
  resetSent={resetSent}
  setResetSent={setResetSent}
  sendPasswordReset={sendPasswordReset}
  newPassword={newPassword}
  setNewPassword={setNewPassword}
  confirmPassword={confirmPassword}
  setConfirmPassword={setConfirmPassword}
  updatePassword={updatePassword}
/>
  return <div className={dark?'app-shell':'app-shell light'}>
    {showOnboard&&<Onboarding value={onboard} setValue={setOnboard} submit={saveOnboard} />}
    <div className="dashboard">
      <aside className="sidebar"><div className="side-brand"><div className="brand"><div className="brand-mark"><Brain size={19}/></div><span className="brand-name font-display">StudyFlow</span></div></div>
        <nav className="side-nav">{NAV_ITEMS.map(([id,Icon,label]:any)=><button key={id} className={'nav-item '+(section===id?'active':'')} onClick={()=>setSection(id)}><Icon size={17}/><span>{label}</span></button>)}</nav>
        <div className="side-bottom"><button className="btn" style={{width:'100%'}} onClick={async()=>{await supabase.auth.signOut();setMode('landing')}}><LogIn size={16}/><span> Sign out</span></button></div>
      </aside>
      {navOpen&&<div className="nav-drawer-back" onClick={()=>setNavOpen(false)}>
        <div className="nav-drawer" onClick={e=>e.stopPropagation()}>
          <div className="side-brand" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div className="brand"><div className="brand-mark"><Brain size={19}/></div><span className="brand-name font-display">StudyFlow</span></div>
            <button className="icon-btn" onClick={()=>setNavOpen(false)} aria-label="Close menu"><X size={17}/></button>
          </div>
          <nav className="side-nav">{NAV_ITEMS.map(([id,Icon,label]:any)=><button key={id} className={'nav-item '+(section===id?'active':'')} onClick={()=>{setSection(id);setNavOpen(false)}}><Icon size={17}/><span>{label}</span></button>)}</nav>
          <div className="side-bottom"><button className="btn" style={{width:'100%'}} onClick={async()=>{await supabase.auth.signOut();setMode('landing')}}><LogIn size={16}/><span> Sign out</span></button></div>
        </div>
      </div>}
      <main className="main">
        <div className="topbar"><div className="topbar-left"><button className="icon-btn hamburger-btn" onClick={()=>setNavOpen(true)} aria-label="Open menu"><Menu size={19}/></button><div><h1>{section==='home'?'Good evening, '+(profile?.name||'Student')+' 👋':section==='ai'?'AI Companion':section[0].toUpperCase()+section.slice(1)}</h1><p>{section==='home'?'Your academic command centre is ready.':'Build momentum, one focused block at a time.'}</p></div></div><div className="top-actions">
  <button
    className="icon-btn theme-toggle"
    onClick={()=>setDark(v=>!v)}
    aria-label="Toggle theme"
  >{dark?<Sun size={17}/>:<Moon size={17}/>}</button><button className="icon-btn" onClick={()=>setSearchOpen(true)} aria-label="Search" title="Search (/) "><Search size={17}/></button><button className="icon-btn" onClick={()=>{setNotificationOpen(v=>!v);setNotifications(n=>n.map(x=>({...x,read:true})))}} aria-label="Notifications"><Bell size={17}/>{unreadNotifications>0&&<span className="notification-dot">{unreadNotifications}</span>}</button><button className="icon-btn" onClick={()=>setShareOpen(true)} aria-label="Share profile" title="Share study profile"><Share2 size={17}/></button><button className="profile-trigger profile-button" title="Open profile" onClick={()=>{setProfileDraft({name:profile?.name||name||'',username:profile?.username||'',avatar_emoji:profile?.avatar_emoji||'',avatar_color:profile?.avatar_color||'#3D7A5C'});setProfileOpen(true)}}><Avatar profile={profile} name={name}/></button></div></div>
        {section==='home'&&<Home tasks={tasks} toggleTask={toggleTask} timer={timer} setTimer={setTimer} focusMinutes={focusMinutes} setFocusMinutes={setFocusMinutes} mins={mins} secs={secs} running={running} setRunning={setRunning} autoReschedule={autoReschedule} onManual={()=>setSection('topics')} setAi={setAi} runAI={runAI} ai={ai} aiAnswer={aiAnswer} studySessions={studySessions} profile={profile} streak={streak} />}
        {section==='planner'&&<Planner tasks={tasks} autoReschedule={autoReschedule}/>} 
        {section==='tasks'&&<Tasks tasks={tasks} setTasks={setTasks} toggleTask={toggleTask} deleteTask={deleteTask} templates={templates} setTemplates={setTemplates} supabase={supabase}/>} 
{section==='topics'&&<Topics manual={manual} setManual={setManual} addManual={addManual} supabase={supabase}/>}        {section==='learning'&&<LearningEngine profile={profile} supabase={supabase}/>} 
        {section==='exams'&&<Exams profile={profile} exams={exams} marks={marks} setExams={setExams} setMarks={setMarks} studySessions={studySessions} supabase={supabase}/>} 
        {section==='analytics'&&<Analytics studySessions={studySessions} subjects={subjects}/>} 
        {section==='ai'&&<AI ai={ai} setAi={setAi} runAI={runAI} answer={aiAnswer} />}
        {section==='settings'&&<Settings dark={dark} setDark={setDark} profile={profile} reopen={()=>setShowOnboard(true)} onExport={()=>setSection('reports')}/>}
        {section==='reports'&&<Reports profile={profile} supabase={supabase} />}
        {section==='brain'&&<StudyBrain profile={profile} supabase={supabase} />}
        {section==='writing'&&<Writing/>}
        {section==='community'&&<><Community profile={profile} supabase={supabase} /><Leaderboard leaderboard={leaderboard} optIn={profile?.leaderboard_opt_in||false} profile={profile} supabase={supabase} onChange={(v:boolean)=>{setProfile((p:any)=>({...p,leaderboard_opt_in:v}));loadProfile(profile.id)}} /></>}
        {section==='groups'&&<StudyGroups profile={profile} supabase={supabase} />} 
      </main>
    </div>


    {profileOpen&&<ProfileModal profile={profile} draft={profileDraft} setDraft={setProfileDraft} supabase={supabase} onClose={()=>setProfileOpen(false)} onSaved={(p:any)=>{setProfile(p);setProfileOpen(false);setToast('Profile updated')}} onExport={()=>setSection('reports')}/>} {searchOpen&&<div className="modal-backdrop" onClick={()=>setSearchOpen(false)}><div className="quick-panel" onClick={e=>e.stopPropagation()}><div className="panel-heading"><div><span className="eyebrow">Quick search</span><h2>Find your flow</h2></div><button className="icon-btn" onClick={()=>setSearchOpen(false)} aria-label="Close search"><X size={17}/></button></div><input autoFocus className="input" placeholder="Search sections, tasks, and study tools" onChange={e=>{const q=e.target.value.toLowerCase();if(q&&NAV_ITEMS.some((x:any)=>String(x[2]).toLowerCase().includes(q))){const match=NAV_ITEMS.find((x:any)=>String(x[2]).toLowerCase().includes(q));setSection(match?.[0]||'home')}}}/><p className="muted"><Keyboard size={14}/> Press <kbd>/</kbd> anytime to open search. Press <kbd>Esc</kbd> to close.</p></div></div>}{notificationOpen&&<div className="notification-popover"><div className="panel-heading"><strong>Notifications</strong><Bell size={16}/></div>{notifications.length?<div>{notifications.map((n:any)=><div className="notification-row" key={n.id}>{n.message}</div>)}</div>:<p className="muted">You are all caught up.</p>}</div>}{shareOpen&&<div className="modal-backdrop" onClick={()=>setShareOpen(false)}><div className="quick-panel share-card" onClick={e=>e.stopPropagation()}><div className="panel-heading"><div><span className="eyebrow">Study resume</span><h2>{profile?.name||'Student'}</h2></div><button className="icon-btn" onClick={()=>setShareOpen(false)} aria-label="Close share card"><X size={17}/></button></div><div className="share-stat"><Flame size={18}/><strong>{streak} day streak</strong></div><p className="muted">A read-only snapshot of my StudyFlow progress.</p><button className="btn primary" onClick={()=>{navigator.clipboard?.writeText(window.location.href);setToast('Share link copied');setShareOpen(false)}}><Copy size={15}/> Copy share link</button></div></div>}{toast&&<div className="toast" onClick={()=>setToast('')}>{toast}</div>}
  </div>
}

function Leaderboard({leaderboard,optIn,profile,supabase,onChange}:any){return <div className="card" style={{marginTop:14}}><div className="section-title"><div><span className="eyebrow">Community</span><h2>Weekly study leaderboard</h2></div><label className="toggle-row"><input type="checkbox" checked={optIn} onChange={async(e)=>{await supabase.from('profiles').update({leaderboard_opt_in:e.target.checked}).eq('id',profile.id);onChange(e.target.checked)}}/><span>Show me</span></label></div>{optIn?(leaderboard.length?<div className="task-list">{leaderboard.map((p:any,i:number)=><div className="task" key={p.id}><span className="pill">{i+1}</span><div className="task-main"><strong>{p.name||p.username||'Student'}</strong><span>{p.minutes} minutes studied this week</span></div><Trophy size={16}/></div>)}</div>:<p className="muted">No opt-in study data yet. Be the first to show up.</p>):<p className="muted">Opt in to compare weekly study minutes with other community members.</p>}</div>}

function Landing({onStart,onLogin}:{onStart:()=>void;onLogin:()=>void}){
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const revealRefs = useRef<(HTMLElement|null)[]>([]);

  useEffect(()=>{
    const canvas = canvasRef.current; if(!canvas) return;
    const ctx = canvas.getContext('2d'); if(!ctx) return;
    let raf = 0; let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio||1, 2);
    const dots: {x:number,y:number,vx:number,vy:number,r:number}[] = [];
    function resize(){
      w = canvas!.clientWidth; h = canvas!.clientHeight;
      canvas!.width = w*dpr; canvas!.height = h*dpr;
      ctx!.setTransform(dpr,0,0,dpr,0,0);
      dots.length = 0;
      const count = Math.round((w*h)/26000);
      for(let i=0;i<count;i++){
        dots.push({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.12,vy:(Math.random()-.5)*.12,r:Math.random()*1.4+.6});
      }
    }
    function tick(){
      ctx!.clearRect(0,0,w,h);
      const gridSize = 64;
      ctx!.strokeStyle = 'rgba(61,122,92,0.07)';
      ctx!.lineWidth = 1;
      for(let x=0;x<w;x+=gridSize){ ctx!.beginPath(); ctx!.moveTo(x,0); ctx!.lineTo(x,h); ctx!.stroke(); }
      for(let y=0;y<h;y+=gridSize){ ctx!.beginPath(); ctx!.moveTo(0,y); ctx!.lineTo(w,y); ctx!.stroke(); }
      for(const d of dots){
        d.x += d.vx; d.y += d.vy;
        if(d.x<0) d.x=w; if(d.x>w) d.x=0; if(d.y<0) d.y=h; if(d.y>h) d.y=0;
        ctx!.beginPath(); ctx!.arc(d.x,d.y,d.r,0,Math.PI*2);
        ctx!.fillStyle = 'rgba(201,166,107,0.8)';
        ctx!.fill();
      }
      for(let i=0;i<dots.length;i++){
        for(let j=i+1;j<dots.length;j++){
          const a=dots[i], b=dots[j];
          const dx=a.x-b.x, dy=a.y-b.y, dist=Math.sqrt(dx*dx+dy*dy);
          if(dist<110){
            ctx!.strokeStyle = `rgba(201,166,107,${0.35*(1-dist/110)})`;
            ctx!.beginPath(); ctx!.moveTo(a.x,a.y); ctx!.lineTo(b.x,b.y); ctx!.stroke();
          }
        }
      }
      raf = requestAnimationFrame(tick);
    }
    resize(); tick();
    window.addEventListener('resize', resize);
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  },[]);

  useEffect(()=>{
    const els = revealRefs.current.filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('in'); });
    },{threshold:0.15});
    els.forEach(el=>io.observe(el));
    return ()=>io.disconnect();
  },[]);

  const setRef = (i:number) => (el:HTMLElement|null) => { revealRefs.current[i]=el; };

  return <div className="landing">
    <video
      className="hero-video"
      src="/hero-loop.mp4"
      poster="/hero-loop.svg"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
    />
    <canvas ref={canvasRef} className="hero-canvas" aria-hidden="true"/>
    <div className="hero-overlay"/>
    <nav className="nav">
      <div className="brand"><div className="brand-mark"><Brain size={19}/></div><span className="font-display">StudyFlow AI</span></div>
      <div className="nav-actions"><button className="btn" onClick={onLogin}>Log in</button><button className="btn primary" onClick={onStart}>Start free <ArrowRight size={15} style={{verticalAlign:'middle'}}/></button></div>
    </nav>
    <section className="hero">
      <div className="eyebrow"><Sparkles size={14}/> Your academic operating system</div>
      <h1>Plan less.<br/>Learn more.</h1>
      <p>One command centre for your tasks, study sessions, topics, exams, marks and the tiny decisions that usually eat your study time.</p>
      <div className="hero-cta">
        <button className="btn primary" onClick={onStart}>Build my study system <ArrowRight size={16} style={{verticalAlign:'middle'}}/></button>
        <button className="btn" onClick={onLogin}><Play size={15} style={{verticalAlign:'middle'}}/> See dashboard</button>
      </div>
    </section>

    <section className="reveal landing-section" ref={setRef(0)}>
      <div className="landing-section-inner">
        <span className="eyebrow">01 · Tasks and planning</span>
        <h2 className="font-display">Auto-shift moves missed work forward</h2>
        <p className="muted">Fall behind on a task and StudyFlow reschedules it into a realistic future block instead of leaving it stuck in the past.</p>
      </div>
    </section>

    <section className="reveal landing-section" ref={setRef(1)}>
      <div className="landing-section-inner">
        <span className="eyebrow">02 · Analytics</span>
        <h2 className="font-display">See your strongest hours and subjects</h2>
        <p className="muted">Every session you log builds a picture of when you focus best and which subjects need more time.</p>
      </div>
    </section>

    <section className="reveal landing-section" ref={setRef(2)}>
      <div className="landing-section-inner">
        <span className="eyebrow">03 · Study your way</span>
        <h2 className="font-display">Manual logging or a focus timer, your choice</h2>
        <p className="muted">No forced workflow. Track a session with the built-in timer, or log it yourself after the fact.</p>
      </div>
    </section>

    <section className="reveal landing-section" ref={setRef(3)}>
      <div className="landing-section-inner">
        <span className="eyebrow">04 · AI companion</span>
        <h2 className="font-display">Tell it what to change, in plain language</h2>
        <p className="muted">Ask it to plan your week, compare sessions, or move unfinished work, and it acts on your real data.</p>
        <div className="hero-cta" style={{marginTop:24}}>
          <button className="btn primary" onClick={onStart}>Get started free <ArrowRight size={16} style={{verticalAlign:'middle'}}/></button>
        </div>
      </div>
    </section>

    <footer className="site-footer">
      <span className="muted">© 2026 StudyFlow AI · Built by Kavish, in collaboration with PRISMxSTUDIO run by Lithishwar</span>
      <div className="footer-links">
        <Link href="/about">About</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <a href="mailto:skavish709@gmail.com">Contact</a>
      </div>
    </footer>
  </div>
}

function Auth(p:any){
  if(p.resetMode){
  return (
    <div className="auth-wrap">
      <div className="auth-card">

        <div className="brand">
          <div className="brand-mark">
            <Brain size={19}/>
          </div>
          <span className="font-display">StudyFlow AI</span>
        </div>

        <h1 style={{marginTop:24}}>
          Create a new password
        </h1>

        <p className="muted">
          Choose a new password for your StudyFlow account.
        </p>

        <div className="field" style={{marginTop:18}}>
          <label>New password</label>
          <input
            className="input"
            type="password"
            value={p.newPassword}
            onChange={e=>p.setNewPassword(e.target.value)}
            placeholder="At least 6 characters"
          />
        </div>

        <div className="field">
          <label>Confirm password</label>
          <input
            className="input"
            type="password"
            value={p.confirmPassword}
            onChange={e=>p.setConfirmPassword(e.target.value)}
            placeholder="Enter your password again"
          />
        </div>

        {p.error && (
          <div className="auth-error">
            {p.error}
          </div>
        )}

        <button
          className="btn primary"
          style={{width:'100%',marginTop:8}}
          onClick={p.updatePassword}
        >
          Update password
          <ArrowRight size={15}/>
        </button>

        <button
          className="btn"
          style={{width:'100%',marginTop:9}}
          onClick={()=>{
            p.setResetMode(false);
            p.setResetSent(false);
            p.setAuthError('');
          }}
        >
          ← Back to login
        </button>

      </div>
    </div>
  );
}

  return (
    <div className="auth-wrap">
      <div className="auth-card">

        <div className="brand">
          <div className="brand-mark">
            <Brain size={19}/>
          </div>
          <span className="font-display">StudyFlow AI</span>
        </div>

        <h1 style={{marginTop:24}}>
          {p.mode==='login'
            ? 'Welcome back'
            : 'Create your study system'}
        </h1>

        <p className="muted">
          {p.mode==='login'
            ? 'Pick up exactly where you left off.'
            : 'Create your account, then we’ll build your study system with you.'}
        </p>

        {p.mode==='signup' && (
          <div className="verify-hint">
            <Shield size={15}/>
            <span>
              A verification email will be sent after signup.
              Verify your email before logging in.
            </span>
          </div>
        )}

        {p.mode==='signup' && (
          <div className="field">
            <label>Name</label>
            <input
              className="input"
              value={p.name}
              onChange={e=>p.setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
        )}

        <div className="field">
          <label>Email</label>
          <input
            className="input"
            type="email"
            value={p.email}
            onChange={e=>p.setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div className="field">
          <label>Password</label>
          <input
            className="input"
            type="password"
            value={p.password}
            onChange={e=>p.setPassword(e.target.value)}
            placeholder="At least 6 characters"
          />
        </div>

        {p.mode==='login' && (
          <button
            type="button"
            className="forgot-password"
            onClick={()=>{
              p.setResetMode(true);
              p.setResetSent(false);
              p.setAuthError('');
            }}
          >
            Forgot password?
          </button>
        )}

        {p.error && (
          <div className="auth-error">
            {p.error}
          </div>
        )}

        {p.verificationMessage && (
          <div className="verify-success">
            ✓ {p.verificationMessage}
          </div>
        )}

        <button
          className="btn primary"
          style={{width:'100%',marginTop:8}}
          onClick={p.submit}
        >
          {p.mode==='login'
            ? 'Log in'
            : 'Create account'}
          <ArrowRight size={15}/>
        </button>

        {p.verificationMessage && (
          <button
            className="btn"
            style={{width:'100%',marginTop:9}}
            onClick={p.resendVerification}
          >
            Resend verification email
          </button>
        )}

        <button
          className="btn"
          style={{width:'100%',marginTop:9}}
          onClick={()=>
            p.setMode(
              p.mode==='login'
                ? 'signup'
                : 'login'
            )
          }
        >
          {p.mode==='login'
            ? 'Need an account? Sign up'
            : 'Already have an account? Log in'}
        </button>

        <button
          className="btn"
          style={{width:'100%',marginTop:9}}
          onClick={()=>location.reload()}
        >
          Back
        </button>

      </div>
    </div>
  );
}
function Onboarding({value,setValue,submit}:any){
  const subjects = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'English',
    'Computer Science',
    'Economics',
    'Accountancy',
    'Business Studies',
    'History',
    'Geography',
  ];

  const toggleSubject = (subject:string) => {
    const current = Array.isArray(value.subjects) ? value.subjects : [];

    setValue({
      ...value,
      subjects: current.includes(subject)
        ? current.filter((s:string) => s !== subject)
        : [...current, subject],
    });
  };

  return (
    <div className="modal-back">
      <div className="modal">

        <div className="modal-head">
          <div>
            <div className="eyebrow">
              <Sparkles size={13}/> Quick setup
            </div>

            <h2 className="font-display">
              Tell StudyFlow the essentials.
            </h2>

            <p className="muted">
              Choose your subjects and set your study goals. You can change everything later.
            </p>
          </div>
        </div>

        <div className="two">

          <div className="field">
            <label>1. Name</label>
            <input
              className="input"
              value={value.name}
              onChange={e=>setValue({...value,name:e.target.value})}
              placeholder="Your name"
            />
          </div>

          <div className="field">
            <label>2. Subjects</label>

            <div className="subject-picker">
              {subjects.map((subject:string) => (
                <label
                  key={subject}
                  className="subject-checkbox"
                >
                  <input
                    type="checkbox"
                    checked={
                      Array.isArray(value.subjects) &&
                      value.subjects.includes(subject)
                    }
                    onChange={() => toggleSubject(subject)}
                  />

                  <span>{subject}</span>
                </label>
              ))}
            </div>

            <p className="muted" style={{marginTop:8}}>
              Select all the subjects you currently study.
            </p>
          </div>

          <div className="field">
            <label>3. Average study hours/day</label>
            <input
              className="input"
              type="number"
              value={value.hours}
              onChange={e=>setValue({...value,hours:Number(e.target.value)})}
            />
          </div>

          <div className="field">
            <label>Sunday hours (optional)</label>
            <input
              className="input"
              type="number"
              value={value.sunday}
              onChange={e=>setValue({...value,sunday:e.target.value})}
              placeholder="Same as weekday? leave blank"
            />
          </div>

          <div className="field">
            <label>4. Aim: marks</label>
            <input
              className="input"
              type="number"
              value={value.aim}
              onChange={e=>setValue({...value,aim:Number(e.target.value)})}
            />
          </div>

          <div className="field">
            <label>Aim out of</label>
            <input
              className="input"
              type="number"
              value={value.outOf}
              onChange={e=>setValue({...value,outOf:Number(e.target.value)})}
            />
          </div>

          <div className="field">
            <label>5. School name</label>
            <input
              className="input"
              value={value.school}
              onChange={e=>setValue({...value,school:e.target.value})}
            />
          </div>

          <div className="field">
            <label>Class</label>
            <input
              className="input"
              value={value.className}
              onChange={e=>setValue({...value,className:e.target.value})}
              placeholder="e.g. 12"
            />
          </div>

          <div className="field">
            <label>Board in India</label>
            <input
              className="input"
              value={value.board}
              onChange={e=>setValue({...value,board:e.target.value})}
              placeholder="e.g. CBSE"
            />
          </div>

        </div>

        <div
          className="card"
          style={{
            marginTop:12,
            background:'rgba(139,92,246,.08)'
          }}
        >
          <strong>AI baseline</strong>

          <p
            className="muted"
            style={{marginBottom:0}}
          >
            Your dashboard will compare actual study pace against your
            target, estimate whether your current trajectory is enough,
            and flag the gap without pretending the prediction is certain.
          </p>
        </div>

        <button
          className="btn primary"
          style={{
            width:'100%',
            marginTop:15
          }}
          onClick={submit}
        >
          Launch my dashboard
          <ArrowRight
            size={16}
            style={{verticalAlign:'middle'}}
          />
        </button>

      </div>
    </div>
  );
}
function Home({tasks,toggleTask,timer,setTimer,focusMinutes,setFocusMinutes,mins,secs,running,setRunning,autoReschedule,onManual,setAi,runAI,ai,aiAnswer,studySessions,profile,streak=0}:any){
 const todayKey=new Date().toDateString();const todayMinutes=studySessions.filter((x:any)=>new Date(x.created_at||x.started_at).toDateString()===todayKey).reduce((n:number,x:any)=>n+Number(x.minutes||0),0);const done=tasks.filter((x:any)=>x.status==='done').length;const planned=tasks.length;const completion=planned?Math.round(done/planned*100):0;const week=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);return {d:d.toLocaleDateString(undefined,{weekday:'short'}),h:Number((studySessions.filter((x:any)=>new Date(x.created_at||x.started_at).toDateString()===d.toDateString()).reduce((n:number,x:any)=>n+Number(x.minutes||0),0)/60).toFixed(1))}});const aim=Number(profile?.aim_marks||0),out=Number(profile?.aim_out_of||100);const weeklyTarget=Number(profile?.avg_hours||0)*60*7;const trajectory=weeklyTarget?Math.min(100,Math.round(studySessions.reduce((n:number,x:any)=>n+Number(x.minutes||0),0)/weeklyTarget*100)):0;
 return <><div className="cards"><Metric icon={<Clock3/>} label="Today" value={`${Math.floor(todayMinutes/60)}h ${todayMinutes%60}m`} sub={todayMinutes?'Based on your real sessions':'No study logged yet'}/><Metric icon={<Flame/>} label="Streak" value={todayMinutes?'1 day':'0 days'} sub="Your first streak starts today"/><Metric icon={<Target/>} label="Aim trajectory" value={aim?`${trajectory}%`:'—'} sub={aim?`Target ${aim}/${out}`:'Set an academic aim'}/><Metric icon={<CheckCircle2/>} label="Completion" value={`${completion}%`} sub={`${done} of ${planned} tasks done`}/></div><div className="card focus-card"><div className="section-title"><div><h2>Focus mode</h2><span className="muted">Set a block and start when ready.</span></div><TimerReset size={18}/></div><div className="focus-clock font-mono">{mins}:{secs}</div><div className="focus-controls"><input className="input" type="number" min="1" max="240" value={focusMinutes} onChange={e=>{const value=Math.max(1,Math.min(240,Number(e.target.value)||1));setFocusMinutes(value);setTimer(value*60);setRunning(false)}} aria-label="Focus minutes"/><button className="btn primary" onClick={()=>setRunning(!running)}>{running?'Pause':'Start'} <Play size={14}/></button><button className="btn" onClick={()=>{setRunning(false);setTimer(focusMinutes*60)}}><RotateCcw size={14}/> Reset</button></div></div><div className="smart-strip"><div><span className="eyebrow"><TrendingUp size={13}/> Today’s signal</span><strong>{todayMinutes?`You learned for ${todayMinutes} minutes today.`:'Fresh account — analytics start at zero.'}</strong><span className="muted">StudyFlow learns your strongest hours and subjects from your real sessions.</span></div><button className="btn primary" onClick={onManual}><NotebookPen size={15}/> Log what I learned</button></div><div className="section-grid"><div className="card"><div className="section-title"><h2>Study rhythm</h2><span>Last 7 days · real data</span></div><div className="chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={week}><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity={.45}/><stop offset="100%" stopColor="#8b5cf6" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false}/><XAxis dataKey="d" stroke="#777f9d"/><YAxis stroke="#777f9d"/><Tooltip contentStyle={{background:'#15182f',border:'1px solid rgba(255,255,255,.1)',borderRadius:12}}/><Area type="monotone" dataKey="h" stroke="#a78bfa" fill="url(#g)" strokeWidth={3}/></AreaChart></ResponsiveContainer></div></div><div className="card"><div className="section-title"><h2>Today’s queue</h2><span>{tasks.filter((x:any)=>x.status!=='done').length} left</span></div><div className="task-list">{tasks.length?tasks.slice(0,4).map((t:any)=><TaskRow key={t.id} t={t} toggle={toggleTask}/>):<div className="empty">No tasks yet. Your clean slate is ready ✨</div>}</div><button className="btn" style={{width:'100%',marginTop:12}} onClick={autoReschedule}><Zap size={15}/> Auto-reschedule unfinished work</button></div></div><div className="section-grid"><div className="card"><div className="section-title"><h2>Focus now</h2><span>Timer</span></div><div style={{display:'grid',placeItems:'center',padding:'12px 0 20px'}}><div className="timer-display">{mins}:{secs}</div><div className="muted">{running?'Focused session running':'Ready when you are'}</div></div><div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap'}}><button className="btn primary" onClick={()=>setRunning((v:boolean)=>!v)}>{running?'Pause':'Start'} <Play size={15}/></button><button className="btn" onClick={()=>setRunning(false)}>Reset</button></div></div><div className="card"><div className="section-title"><h2>AI Companion</h2><Sparkles size={17}/></div><div className="ai-box"><input className="input" value={ai} onChange={e=>setAi(e.target.value)} onKeyDown={e=>e.key==='Enter'&&runAI()} placeholder="Tell me what to change, plan, compare or prioritise…"/><button className="btn primary" onClick={runAI}>Run</button></div>{aiAnswer&&<div className="ai-answer">{aiAnswer}</div>}<div style={{marginTop:12,display:'flex',gap:7,flexWrap:'wrap'}}><span className="pill">Plan my week</span><span className="pill">Compare my sessions</span><span className="pill">Move unfinished work</span></div></div></div></>}
function Metric({icon,label,value,sub}:any){return <div className="card"><div className="metric"><div><small>{label}</small><strong>{value}</strong></div><div className="icon">{icon}</div></div><div className="trend">{sub}</div></div>}
function TaskRow({t,toggle,onDelete}:any){return <div className="task"><button className={'check '+(t.status==='done'?'done':'')} onClick={()=>toggle(t)}>{t.status==='done'?<CheckCircle2 size={14}/>:''}</button><div className="task-main"><strong>{t.title}</strong><span>{t.subject} · {t.minutes} min · {t.due}</span></div><span className={t.priority===1?'pill warn':'pill'}>{t.priority===1?'High':'Plan'}</span>{onDelete&&<DeleteButton onDelete={()=>onDelete(t)}/>}</div>}

function Planner({tasks,autoReschedule}:any){
  const [view,setView]=useState<'week'|'month'|'agenda'>('week');
  const [cursor,setCursor]=useState(new Date());
  const [selected,setSelected]=useState<Date|null>(null);
  const [eventTitle,setEventTitle]=useState('');
  const [eventMinutes,setEventMinutes]=useState(45);
  const [events,setEvents]=useState<any[]>([]);
  const days=Array.from({length:7},(_,i)=>{const d=new Date(cursor);d.setDate(cursor.getDate()-cursor.getDay()+1+i);return d});
  const monthDays=Array.from({length:35},(_,i)=>{const first=new Date(cursor.getFullYear(),cursor.getMonth(),1);const start=new Date(first);start.setDate(1-first.getDay());const d=new Date(start);d.setDate(start.getDate()+i);return d});
  function shift(n:number){const d=new Date(cursor); if(view==='month') d.setMonth(d.getMonth()+n); else d.setDate(d.getDate()+n*7); setCursor(d)}
  function addEvent(){if(!selected||!eventTitle.trim())return;setEvents(x=>[...x,{date:selected.toDateString(),title:eventTitle,minutes:eventMinutes}]);setEventTitle('');setSelected(null)}
  return <div>
    <div className="card">
      <div className="section-title">
        <div><h2>Smart academic calendar</h2><p className="muted" style={{margin:'4px 0 0'}}>Tasks, exams, study blocks and personal events in one timeline.</p></div>
        <div style={{display:'flex',gap:7,alignItems:'center'}}><button className="icon-btn" onClick={()=>shift(-1)}><ChevronLeft size={16}/></button><button className="btn" onClick={()=>setCursor(new Date())}>Today</button><button className="icon-btn" onClick={()=>shift(1)}><ChevronRight size={16}/></button></div>
      </div>
      <div className="tabs"><button className={'tab '+(view==='week'?'active':'')} onClick={()=>setView('week')}>Week</button><button className={'tab '+(view==='month'?'active':'')} onClick={()=>setView('month')}>Month</button><button className={'tab '+(view==='agenda'?'active':'')} onClick={()=>setView('agenda')}>Agenda</button></div>
      {view==='week' && <div className="calendar">{days.map((d,i)=><div className="day" key={d.toISOString()}>
        <b>{d.toLocaleDateString(undefined,{weekday:'short'})} {d.getDate()}</b>
        <div className="event purple">{['Maths','Physics','Chemistry'][i%3]} · {i+1}h</div>
        <div className="event">Deep work · {i%3+1} block{i%3?'s':''}</div>
        {tasks.length>0 && <div className="event pink">{tasks[i%tasks.length].title.slice(0,24)}…</div>}
        {events.filter(e=>e.date===d.toDateString()).map((e,j)=><div className="event" key={j}>{e.title} · {e.minutes}m</div>)}
        <button className="btn" style={{marginTop:7,width:'100%',padding:'6px 7px',fontSize:11}} onClick={()=>setSelected(d)}>+ Block</button>
      </div>)}</div>}
      {view==='month' && <>
        <div className="calendar month-grid">{monthDays.map((d,i)=><div className={'day '+(d.getMonth()!==cursor.getMonth()?'muted-day':'')} key={i}><b>{d.getDate()}</b>{i%4===0&&<div className="event purple">Study block</div>}{i%7===2&&<div className="event pink">Deadline</div>}<button className="calendar-add" onClick={()=>setSelected(d)}>+</button></div>)}</div>
        <div className="month-caption"><strong>{cursor.toLocaleString(undefined,{month:'long',year:'numeric'})}</strong><span className="muted">Tap + to add a study block.</span></div>
      </>}
      {view==='agenda' && <div className="task-list">{tasks.map((t:any)=><TaskRow key={t.id} t={t} toggle={()=>{}}/>)}<div className="empty">Agenda combines your tasks, exams and scheduled blocks.</div></div>}
    </div>
    <div className="two" style={{marginTop:14}}>
      <div className="card"><div className="section-title"><h2>AI scheduling rules</h2><span>Always on</span></div>{['Protect exam deadlines','Move unfinished work automatically','Prefer historically efficient hours','Keep one buffer block/day','Avoid overloading consecutive days'].map(x=><div className="topic-row" key={x}><span>{x}</span><span className="pill ok">ON</span></div>)}<button className="btn primary" style={{marginTop:8}} onClick={autoReschedule}><Zap size={14}/> Rebalance my week</button></div>
      <div className="card"><div className="section-title"><h2>Capacity forecast</h2><span>This week</span></div><p className="muted">StudyFlow leaves breathing room instead of filling every minute.</p><div className="progress"><i style={{width:'72%'}}/></div><div className="topic-row"><span>Planned capacity</span><strong>72%</strong></div><div className="topic-row"><span>Recommended buffer</span><strong>3h 10m</strong></div></div>
    </div>
    {selected && <div className="modal-back"><div className="modal"><div className="modal-head"><div><h2 className="font-display">Add study block</h2><p className="muted">{selected.toLocaleDateString()}</p></div><button className="icon-btn" onClick={()=>setSelected(null)}><X size={16}/></button></div><div className="field"><label>What are you studying?</label><input className="input" value={eventTitle} onChange={e=>setEventTitle(e.target.value)} placeholder="Revision, problem set, reading…"/></div><div className="field"><label>Duration (minutes)</label><input className="input" type="number" value={eventMinutes} onChange={e=>setEventMinutes(Number(e.target.value))}/></div><button className="btn primary" style={{width:'100%'}} onClick={addEvent}>Add to calendar</button></div></div>}
  </div>
}
function Tasks({tasks,setTasks,toggleTask,deleteTask,templates,setTemplates,supabase}:any){
 const [title,setTitle]=useState(''); const [subject,setSubject]=useState('Maths'); const [minutes,setMinutes]=useState(30);
 function add(){if(!title.trim())return;setTasks((x:any)=>[{id:crypto.randomUUID(),title,subject,minutes,status:'todo',priority:2,due:'Today'},...x]);setTitle('')}
 async function saveTemplate(){if(!title.trim())return;const {data:{user}}=await supabase.auth.getUser();if(!user)return;const {data}=await supabase.from('task_templates').insert({user_id:user.id,title,subject,minutes}).select().single();if(data)setTemplates((x:any)=>[data,...x]);setTitle('')}
 return <div><div className="card"><div className="section-title"><h2>Capture anything</h2><span>Manual entry is always available</span></div><div className="three"><input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Task, assignment, reading…"/><input className="input" value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Subject"/><div style={{display:'flex',gap:7}}><input className="input" type="number" value={minutes} onChange={e=>setMinutes(Number(e.target.value))}/><button className="btn primary" onClick={add}>Add</button><button className="btn" onClick={saveTemplate} title="Save as reusable template"><Save size={14}/></button></div></div></div>{templates?.length>0&&<div className="card" style={{marginTop:14}}><div className="section-title"><h2>Task templates</h2><span>Reusable patterns</span></div><div className="task-list">{templates.map((t:any)=><div className="task" key={t.id}><div className="task-main"><strong>{t.title}</strong><span>{t.subject} · {t.minutes} min</span></div><button className="btn" onClick={()=>setTasks((x:any)=>[{id:crypto.randomUUID(),title:t.title,subject:t.subject,minutes:t.minutes,status:'todo',priority:2,due:'Today'},...x])}>Use</button></div>)}</div></div>}<div className="card" style={{marginTop:14}}><div className="section-title"><h2>All tasks</h2><span>{tasks.length} total</span></div><div className="task-list">{tasks.map((t:any)=><TaskRow key={t.id} t={t} toggle={toggleTask} onDelete={deleteTask}/>)}</div></div></div>
}

function Topics({manual,setManual,addManual,supabase}:any){
  const [subjects,setSubjects]=useState<any[]>([]);
  const [loadingSubjects,setLoadingSubjects]=useState(true);

  useEffect(()=>{
    let mounted=true;

    async function loadSubjects(){
      const {data:{user}}=await supabase.auth.getUser();

      if(!user){
        if(mounted)setLoadingSubjects(false);
        return;
      }

      const {data,error}=await supabase
        .from('subjects')
        .select('id,name,target_hours')
        .eq('user_id',user.id)
        .order('name');

      if(!error && mounted){
        setSubjects(data||[]);
      }

      if(mounted){
        setLoadingSubjects(false);
      }
    }

    loadSubjects();

    return ()=>{
      mounted=false;
    };
  },[supabase]);

  return (
    <div>

      <div className="two">

        <div className="card">
          <div className="section-title">
            <h2>Log a study session</h2>
            <span>Manual method</span>
          </div>

          <div className="field">
            <label>Subject</label>
            <input
              className="input"
              value={manual.subject}
              onChange={e=>setManual({
                ...manual,
                subject:e.target.value
              })}
              placeholder="e.g. Mathematics"
            />
          </div>

          <div className="field">
            <label>What did you learn?</label>
            <textarea
              className="textarea"
              value={manual.topic}
              onChange={e=>setManual({
                ...manual,
                topic:e.target.value
              })}
              placeholder="Topic, chapter, problem set, concepts…"
            />
          </div>

          <div className="field">
            <label>Minutes</label>
            <input
              className="input"
              type="number"
              value={manual.minutes}
              onChange={e=>setManual({
                ...manual,
                minutes:Number(e.target.value)
              })}
            />
          </div>

          <button
            className="btn primary"
            style={{width:'100%'}}
            onClick={addManual}
          >
            Save session <CheckCircle2 size={15}/>
          </button>
        </div>


        <div className="card">

          <div className="section-title">
            <h2>What you're learning</h2>
            <span>Topic mastery</span>
          </div>

          {loadingSubjects ? (
            <div className="muted">
              Loading your subjects...
            </div>
          ) : subjects.length === 0 ? (
            <div className="muted">
              No subjects added yet. Complete your setup to get started.
            </div>
          ) : (
            subjects.map((subject:any)=>(
              <div
                className="topic-row"
                key={subject.id}
              >
                <div>
                  <strong>{subject.name}</strong>

                  <div className="muted">
                    Starting fresh
                  </div>

                  <div className="progress">
                    <i style={{width:'0%'}}/>
                  </div>
                </div>

                <span>0%</span>
              </div>
            ))
          )}

        </div>

      </div>


      <div
        className="card"
        style={{marginTop:14}}
      >
        <div className="section-title">
          <h2>Learning notes</h2>
          <span>Daily reflection</span>
        </div>

        <textarea
          className="textarea"
          rows={5}
          placeholder="What became clearer today? What still feels shaky? What should tomorrow start with?"
        />

        <button
          className="btn"
          style={{marginTop:9}}
        >
          Save reflection
        </button>
      </div>

    </div>
  );
}

function LearningEngine({profile,supabase}:any){
  const [topics,setTopics]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  const [showAdd,setShowAdd]=useState(false);
  const [draft,setDraft]=useState({subject:'',topic:''});
  const [quiz,setQuiz]=useState<any>(null); const [answer,setAnswer]=useState(''); const [message,setMessage]=useState('');

  useEffect(()=>{
    let mounted=true;
    (async()=>{
      if(!profile?.id){setLoading(false);return}
      const {data}=await supabase.from('topics').select('*').eq('user_id',profile.id).order('mastery',{ascending:true});
      if(mounted){setTopics(data||[]);setLoading(false)}
    })();
    return ()=>{mounted=false};
  },[profile?.id]);

  function daysSince(dateStr:string|null){
    if(!dateStr) return 999;
    return Math.floor((Date.now()-new Date(dateStr).getTime())/86400000);
  }
  function dueIn(topic:any){
    const gap = Math.max(1, Math.round(topic.mastery/10));
    const since = daysSince(topic.last_studied_at);
    return Math.max(0, gap-since);
  }

  const queue = [...topics].sort((a,b)=>dueIn(a)-dueIn(b));
  const dueNow = queue.filter(t=>dueIn(t)<=0);
  const mastered = topics.filter(t=>t.mastery>=80);
  const avgMastery = topics.length ? Math.round(topics.reduce((n,t)=>n+t.mastery,0)/topics.length) : 0;

  async function addTopic(){
    if(!draft.subject.trim()||!draft.topic.trim()||!profile?.id)return;
    const {data,error}=await supabase.from('topics').insert({
      user_id:profile.id, subject:draft.subject.trim(), topic:draft.topic.trim(), mastery:0
    }).select().single();
    if(error){alert(error.message);return}
    setTopics(t=>[...t,data]);
    setDraft({subject:'',topic:''});
    setShowAdd(false);
  }

  async function deleteTopic(topic:any){setTopics(t=>t.filter(x=>x.id!==topic.id));await supabase.from('topics').delete().eq('id',topic.id).eq('user_id',profile.id)}

  async function grade(correct:boolean){
    if(!quiz)return;
    const newMastery = Math.max(0,Math.min(100, quiz.mastery + (correct?12:-4)));
    const {data,error}=await supabase.from('topics').update({
      mastery:newMastery, last_studied_at:new Date().toISOString()
    }).eq('id',quiz.id).select().single();
    if(!error && data){
      setTopics(t=>t.map(x=>x.id===data.id?data:x));
      setMessage(correct?'Mastery increased. Next review can be spaced further.':'This topic stays near the front of your revision queue.');
    }
  }

  if(loading) return <div className="card">Loading your learning map…</div>;

  return <div>
    <div className="cards">
      <Metric icon={<BrainCircuit/>} label="Learning score" value={`${avgMastery}%`} sub="Across tracked topics"/>
      <Metric icon={<RotateCcw/>} label="Due for recall" value={String(dueNow.length)} sub="Topics needing attention"/>
      <Metric icon={<Target/>} label="Mastered" value={`${mastered.length}/${topics.length}`} sub="Concepts above 80%"/>
      <Metric icon={<Flame/>} label="Tracked topics" value={String(topics.length)} sub={topics.length?'Keep building your map':'Add your first topic'}/>
    </div>
    <div className="section-grid">
      <div className="card">
        <div className="section-title"><div><h2>Concept mastery map</h2><p className="muted">Study time is only one signal. Recall performance changes mastery.</p></div>
          <button className="btn" onClick={()=>setShowAdd(v=>!v)}><Plus size={14}/> Add topic</button>
        </div>
        {showAdd&&<div className="card" style={{marginBottom:12,background:'var(--panel2)'}}>
          <div className="two"><div className="field"><label>Subject</label><input className="input" value={draft.subject} onChange={e=>setDraft({...draft,subject:e.target.value})} placeholder="Physics"/></div>
          <div className="field"><label>Topic</label><input className="input" value={draft.topic} onChange={e=>setDraft({...draft,topic:e.target.value})} placeholder="Newton's laws"/></div></div>
          <button className="btn primary" style={{width:'100%'}} onClick={addTopic}>Save topic</button>
        </div>}
        {topics.length?topics.map(t=><div className="topic-row" key={t.id}><div><strong>{t.topic}</strong><div className="muted" style={{fontSize:12}}>{t.subject} · next review {dueIn(t)<=0?'today':`in ${dueIn(t)} days`}</div><div className="progress" style={{marginTop:7}}><i style={{width:t.mastery+'%'}}/></div></div><div style={{textAlign:'right'}}><strong>{t.mastery}%</strong><br/><button className="btn" style={{marginTop:5,padding:'6px 9px'}} onClick={()=>{setQuiz(t);setAnswer('');setMessage('')}}>Recall</button><DeleteButton onDelete={()=>deleteTopic(t)}/></div></div>)
        :<div className="empty">No topics tracked yet. Add one to start building your mastery map.</div>}
      </div>
      <div className="card">
        <div className="section-title"><h2>Today's revision queue</h2><span>Active recall</span></div>
        {queue.length?queue.slice(0,4).map(t=><div className="task" key={t.id}><div className="task-main"><strong>{t.topic}</strong><span>{t.subject} · mastery {t.mastery}% · {dueIn(t)<=0?'Due now':`Due in ${dueIn(t)}d`}</span></div><button className="btn primary" onClick={()=>{setQuiz(t);setAnswer('');setMessage('')}}>Start</button></div>)
        :<div className="empty">Nothing queued yet.</div>}
      </div>
    </div>
    <div className="two" style={{marginTop:14}}>
      <div className="card">
        <div className="section-title"><h2>Personal learning model</h2><span>Adaptive</span></div>
        <div className="topic-row"><span>Average mastery</span><strong>{avgMastery}%</strong></div>
        <div className="topic-row"><span>Topics due today</span><strong>{dueNow.length}</strong></div>
        <div className="topic-row"><span>Topics mastered</span><strong>{mastered.length}</strong></div>
        <p className="muted">StudyFlow adjusts each topic's review gap based on how well you recall it — stronger recall means a longer gap before the next review.</p>
      </div>
      <div className="card">
        <div className="section-title"><h2>Learning loop</h2><span>Learn → Recall → Space</span></div>
        <div className="three"><div className="mini-stat"><strong>Learn</strong><span>Study normally.</span></div><div className="mini-stat"><strong>Recall</strong><span>Test yourself.</span></div><div className="mini-stat"><strong>Space</strong><span>Review when needed.</span></div></div>
      </div>
    </div>
    {quiz&&<div className="modal-back"><div className="modal">
      <div className="modal-head"><div><div className="eyebrow"><BrainCircuit size={13}/> Active recall</div><h2 className="font-display">{quiz.topic}</h2><p className="muted">{quiz.subject} · Try without notes.</p></div><button className="icon-btn" onClick={()=>setQuiz(null)}><X size={16}/></button></div>
      <div className="card" style={{marginTop:14,background:'var(--panel2)'}}><strong>Recall prompt</strong><p style={{lineHeight:1.6}}>Explain the key idea, formula, assumptions and one example from this topic in your own words.</p><textarea className="textarea" rows={6} value={answer} onChange={e=>setAnswer(e.target.value)} placeholder="Type what you remember…"/></div>
      <div style={{display:'flex',gap:8,marginTop:12}}><button className="btn" onClick={()=>grade(false)}>I struggled</button><button className="btn primary" onClick={()=>grade(true)}>I recalled it</button></div>
      {message&&<div className="ai-answer">{message}</div>}
    </div></div>}
  </div>
}

function Exams({profile,exams,marks,setExams,setMarks,studySessions,supabase}:any){
  const [showExamForm,setShowExamForm]=useState(false);
  const [showMarkForm,setShowMarkForm]=useState(false);
  const [examDraft,setExamDraft]=useState({title:'',subject:'',exam_at:'',max_marks:100});
  const [markDraft,setMarkDraft]=useState({subject:'',exam_name:'',score:'',out_of:100});

  const upcoming = (exams||[]).filter((e:any)=>e.status!=='done' && (!e.exam_at || new Date(e.exam_at) >= new Date(new Date().toDateString())))
    .sort((a:any,b:any)=>new Date(a.exam_at||0).getTime()-new Date(b.exam_at||0).getTime());
  const nextExam = upcoming[0];

  const currentAvg = marks?.length ? Math.round(marks.reduce((n:number,m:any)=>n+(Number(m.score)/Number(m.out_of))*100,0)/marks.length) : null;

  function readiness(exam:any){
    if(!exam?.exam_at) return 0;
    const daysLeft = Math.max(0,Math.ceil((new Date(exam.exam_at).getTime()-Date.now())/86400000));
    const subjectMinutes = (studySessions||[]).filter((s:any)=>s.subject===exam.subject)
      .reduce((n:number,s:any)=>n+Number(s.minutes||0),0);
    const targetMinutes = Math.max(300, (14-Math.min(daysLeft,14))*45);
    const prep = Math.min(100, Math.round((subjectMinutes/targetMinutes)*100));
    const urgency = daysLeft<=0 ? 0 : Math.min(100, Math.round((14/Math.max(daysLeft,1))*20));
    return Math.max(prep, Math.min(prep+urgency,100));
  }
  const nextReadiness = nextExam ? readiness(nextExam) : 0;

  async function addExam(){
    if(!examDraft.title.trim()||!profile?.id)return;
    const {data,error}=await supabase.from('exams').insert({
      user_id:profile.id, title:examDraft.title.trim(), subject:examDraft.subject.trim()||null,
      exam_at:examDraft.exam_at?new Date(examDraft.exam_at).toISOString():null,
      max_marks:Number(examDraft.max_marks)||100, status:'upcoming'
    }).select().single();
    if(error){alert(error.message);return}
    setExams((e:any[])=>[...e,data]);
    setExamDraft({title:'',subject:'',exam_at:'',max_marks:100});
    setShowExamForm(false);
  }

  async function addMark(){
    if(!markDraft.exam_name.trim()||!markDraft.score||!profile?.id)return;
    const {data,error}=await supabase.from('marks').insert({
      user_id:profile.id, subject:markDraft.subject.trim()||null, exam_name:markDraft.exam_name.trim(),
      score:Number(markDraft.score), out_of:Number(markDraft.out_of)||100
    }).select().single();
    if(error){alert(error.message);return}
    setMarks((m:any[])=>[data,...m]);
    setMarkDraft({subject:'',exam_name:'',score:'',out_of:100});
    setShowMarkForm(false);
  }

  return <div>
    <div className="cards">
      <Metric icon={<Target/>} label="Goal" value={`${profile?.aim_marks||'—'}/${profile?.aim_out_of||'—'}`} sub="Target score"/>
      <Metric icon={<Trophy/>} label="Current avg" value={currentAvg!==null?`${currentAvg}%`:'—'} sub={currentAvg!==null?`Across ${marks.length} exam${marks.length===1?'':'s'}`:'Add previous exam marks'}/>
      <Metric icon={<Clock3/>} label="Next exam" value={nextExam?nextExam.title:'—'} sub={nextExam?.exam_at?new Date(nextExam.exam_at).toLocaleDateString():'Add an exam to start planning'}/>
      <Metric icon={<Flame/>} label="Readiness" value={nextExam?`${nextReadiness}%`:'0%'} sub={nextExam?'Based on your study sessions':'Build your first exam plan'}/>
    </div>
    <div className="two" style={{marginTop:14}}>
      <div className="card">
        <div className="section-title"><h2>Exam preparation</h2><span>{upcoming.length} upcoming</span></div>
        {upcoming.length?<div className="task-list">
          {upcoming.map((e:any)=><div className="task" key={e.id}>
            <div className="task-main"><strong>{e.title}</strong><span>{e.subject||'General'} · {e.exam_at?new Date(e.exam_at).toLocaleDateString():'No date set'}</span></div>
            <span className="pill">{readiness(e)}% ready</span><DeleteButton onDelete={async()=>{await supabase.from('exams').delete().eq('id',e.id).eq('user_id',profile.id);setExams((rows:any[])=>rows.filter(x=>x.id!==e.id))}}/>
          </div>)}
        </div>:<div className="empty">No upcoming exams yet.</div>}
        {showExamForm?<div className="card" style={{marginTop:12,background:'var(--panel2)'}}>
          <div className="two"><div className="field"><label>Exam title</label><input className="input" value={examDraft.title} onChange={e=>setExamDraft({...examDraft,title:e.target.value})} placeholder="Midterm — Physics"/></div>
          <div className="field"><label>Subject</label><input className="input" value={examDraft.subject} onChange={e=>setExamDraft({...examDraft,subject:e.target.value})} placeholder="Physics"/></div></div>
          <div className="two"><div className="field"><label>Exam date</label><input className="input" type="date" value={examDraft.exam_at} onChange={e=>setExamDraft({...examDraft,exam_at:e.target.value})}/></div>
          <div className="field"><label>Max marks</label><input className="input" type="number" value={examDraft.max_marks} onChange={e=>setExamDraft({...examDraft,max_marks:Number(e.target.value)})}/></div></div>
          <button className="btn primary" style={{width:'100%'}} onClick={addExam}>Save exam</button>
        </div>:<button className="btn primary" style={{marginTop:12,width:'100%'}} onClick={()=>setShowExamForm(true)}><Plus size={15}/> Add your first exam</button>}
      </div>
      <div className="card">
        <div className="section-title"><h2>Marks history</h2><span>Previous exams</span></div>
        {marks?.length?<div className="task-list">
          {marks.map((m:any)=><div className="task" key={m.id}>
            <div className="task-main"><strong>{m.exam_name}</strong><span>{m.subject||'General'} · {m.exam_date?new Date(m.exam_date).toLocaleDateString():''}</span></div>
            <span className="pill ok">{m.score}/{m.out_of}</span><DeleteButton onDelete={async()=>{await supabase.from('marks').delete().eq('id',m.id).eq('user_id',profile.id);setMarks((rows:any[])=>rows.filter(x=>x.id!==m.id))}}/>
          </div>)}
        </div>:<div className="empty">Your marks will appear here once you record an exam score.</div>}
        {showMarkForm?<div className="card" style={{marginTop:12,background:'var(--panel2)'}}>
          <div className="field"><label>Exam name</label><input className="input" value={markDraft.exam_name} onChange={e=>setMarkDraft({...markDraft,exam_name:e.target.value})} placeholder="Unit test 2"/></div>
          <div className="field"><label>Subject</label><input className="input" value={markDraft.subject} onChange={e=>setMarkDraft({...markDraft,subject:e.target.value})} placeholder="Chemistry"/></div>
          <div className="two"><div className="field"><label>Score</label><input className="input" type="number" value={markDraft.score} onChange={e=>setMarkDraft({...markDraft,score:e.target.value})}/></div>
          <div className="field"><label>Out of</label><input className="input" type="number" value={markDraft.out_of} onChange={e=>setMarkDraft({...markDraft,out_of:Number(e.target.value)})}/></div></div>
          <button className="btn primary" style={{width:'100%'}} onClick={addMark}>Save mark</button>
        </div>:<button className="btn" style={{marginTop:12,width:'100%'}} onClick={()=>setShowMarkForm(true)}><Plus size={15}/> Add a mark</button>}
      </div>
    </div>
  </div>
}

function Analytics({studySessions=[]}:any){const total=studySessions.reduce((n:number,x:any)=>n+Number(x.minutes||0),0);const subjects:any={};studySessions.forEach((x:any)=>subjects[x.subject]=(subjects[x.subject]||0)+Number(x.minutes||0));const bars=Object.entries(subjects).map(([s,m]:any)=>({s,h:Number((m/60).toFixed(1))})).sort((a:any,b:any)=>b.h-a.h);const sessions=studySessions.filter((x:any)=>Number(x.minutes)>0);const focus=sessions.length?Math.round(sessions.reduce((n:number,x:any)=>n+Number(x.focus_score||0),0)/sessions.length):0;return <div><div className="cards"><Metric icon={<Clock3/>} label="Total study" value={`${Math.floor(total/60)}h ${total%60}m`} sub="All logged sessions"/><Metric icon={<Zap/>} label="Efficiency" value={`${focus}%`} sub={sessions.length?'Average focus score':'Awaiting data'}/><Metric icon={<Brain/>} label="Best subject" value={bars[0]?.s||'—'} sub={bars[0]?`${bars[0].h}h logged`:'Log sessions to compare'}/><Metric icon={<Award/>} label="Sessions" value={String(sessions.length)} sub="Manual + timer history"/></div><div className="section-grid"><div className="card"><div className="section-title"><h2>Hours by subject</h2><span>Real logged data</span></div><div className="chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={bars.length?bars:[{s:'No data',h:0}]}><CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false}/><XAxis dataKey="s" stroke="#777f9d"/><YAxis stroke="#777f9d"/><Tooltip contentStyle={{background:'#15182f',border:'1px solid rgba(255,255,255,.1)',borderRadius:12}}/><Bar dataKey="h" fill="#8b5cf6" radius={[8,8,0,0]}/></BarChart></ResponsiveContainer></div></div><div className="card"><div className="section-title"><h2>Efficiency insights</h2><span>Pattern engine</span></div><div className="topic-row"><span>Most efficient subject</span><strong>{bars[0]?.s||'Not enough data'}</strong></div><div className="topic-row"><span>Average focus score</span><strong>{focus}%</strong></div><div className="topic-row"><span>Longest session</span><strong>{sessions.length?`${Math.max(...sessions.map((x:any)=>Number(x.minutes||0)))} min`:'—'}</strong></div><div className="topic-row"><span>Best time of day</span><strong>{sessions.length?'Learning from history':'Log 3+ sessions'}</strong></div><div className="card insight-card"><strong>Honest analytics</strong><p className="muted">Fresh accounts show zeroes. StudyFlow only claims a pattern after you have enough real sessions.</p></div></div></div></div>}
function AI({ai,setAi,runAI,answer}:any){return <div><div className="card"><div className="section-title"><div><h2>Tell StudyFlow what to change</h2><p className="muted">Natural language in. A proposed action out. You stay in control.</p></div><Sparkles/></div><div className="ai-box"><input className="input" value={ai} onChange={e=>setAi(e.target.value)} onKeyDown={e=>e.key==='Enter'&&runAI()} placeholder="Move my chemistry revision to Saturday, keep Sunday light, and prioritise physics"/><button className="btn primary" onClick={runAI}>Run command</button></div>{answer&&<div className="ai-answer">{answer}</div>}</div><div className="three" style={{marginTop:14}}>{['Build my exam plan from these topics','Tell me if my current pace is enough for 90%','Compare my last 10 sessions and find my best time'].map(x=><button className="card" style={{textAlign:'left',color:'var(--text)'}} key={x} onClick={()=>setAi(x)}><Sparkles size={16}/><div style={{marginTop:10}}>{x}</div></button>)}</div></div>}


function StudyBrain({profile,supabase}:any){
  const [input,setInput]=useState('');
  const [items,setItems]=useState<any[]>([]);
  const [answer,setAnswer]=useState('');
  async function analyse(){
  const raw=input.trim();
  if(!raw)return;
  const topics=raw.split(/[\n,;]+/).map(x=>x.trim()).filter(Boolean).slice(0,12);
  const mapped=topics.map((topic,i)=>({topic,subject:'Study plan',difficulty:i%3===0?'Medium':'Core',time:25+(i%3)*15,mastery:0}));
  setItems(mapped);
  setAnswer(`Study Brain created ${mapped.length} learning blocks from your request. Your map is ready below.`);
  const {data:{user}}=await supabase.auth.getUser();
  if(user){await Promise.all(mapped.map((x:any)=>supabase.from('topics').upsert({user_id:user.id,subject:x.subject,topic:x.topic,mastery:0},{onConflict:'user_id,subject,topic'})));}
  }
  return <div>
    <div className="card" style={{background:'linear-gradient(135deg,rgba(124,58,237,.22),rgba(34,211,238,.08))'}}>
      <div className="section-title"><div><span className="eyebrow"><BrainCircuit size={14}/> Adaptive learning system</span><h2>Study Brain</h2><p className="muted">Turn a syllabus, chapter list or messy study goal into an adaptive learning map.</p></div><BrainCircuit size={32}/></div>
      <div className="ai-box"><input className="input" value={input} onChange={e=>setInput(e.target.value)} placeholder="Paste a syllabus, chapters, or say what I need to finish before my exam…"/><button className="btn primary" onClick={analyse}>Build map <ArrowRight size={14}/></button></div>
      {answer&&<div className="ai-answer" style={{marginTop:12}}>{answer}</div>}
      <div className="three" style={{marginTop:14}}>
        <button className="card" onClick={()=>setAnswer('Upload flow ready: your future production version can parse PDFs/notes, extract topics, estimate difficulty and create calendar blocks.') }><Upload size={17}/><div><strong>Upload syllabus / notes</strong><p className="muted">PDF, text or chapter list</p></div></button>
        <button className="card" onClick={()=>setAnswer('AI will estimate workload from your remaining topics, available hours, exam date and historical efficiency.') }><CalendarDays size={17}/><div><strong>Build exam roadmap</strong><p className="muted">Deadline-aware planning</p></div></button>
        <button className="card" onClick={()=>setAnswer('Mastery updates should combine study time, recall accuracy, quiz results and time since last revision.') }><Brain size={17}/><div><strong>Update mastery</strong><p className="muted">Learning, not just hours</p></div></button>
      </div>
    </div>
    <div className="card" style={{marginTop:14}}><div className="section-title"><h2>Knowledge map</h2><span>Adaptive priority</span></div>{items.map(x=><div className="topic-row" key={x.topic}><div><strong>{x.topic}</strong><div className="muted">{x.subject} · {x.difficulty} · {x.time} min estimated</div></div><div style={{minWidth:150}}><div style={{display:'flex',justifyContent:'space-between'}}><span className="muted">Mastery</span><strong>{x.mastery}%</strong></div><div className="progress"><span style={{width:`${x.mastery}%`}}/></div></div></div>)}</div>
  </div>
}

const REACTION_EMOJI = ['👍','❤️','🔥','😂','🎯'];

function Community({profile,supabase}:any){
  const [joined,setJoined]=useState(true),[communityId,setCommunityId]=useState<string|null>(null),[channel,setChannel]=useState('Foyer'),[message,setMessage]=useState(''),[loading,setLoading]=useState(true),[messages,setMessages]=useState<any[]>([]),[threads,setThreads]=useState<any[]>([]),[activeThread,setActiveThread]=useState<string|null>(null),[threadTitle,setThreadTitle]=useState(''),[showThread,setShowThread]=useState(false);
  const [reactions,setReactions]=useState<any[]>([]),[userProfiles,setUserProfiles]=useState<Record<string,any>>({});
  const [replyTo,setReplyTo]=useState<any>(null);
  const [pickerFor,setPickerFor]=useState<string|null>(null);
  const [pendingImage,setPendingImage]=useState<File|null>(null);
  const [pendingImagePreview,setPendingImagePreview]=useState<string|null>(null);
  const [uploading,setUploading]=useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const channels=['Foyer','Studies'];

  async function load(){
    try{
      const {data:c}=await supabase.from('communities').select('id').eq('slug','studyflow-community').single();
      if(!c)return;
      setCommunityId(c.id);
      const {data:m}=await supabase.from('community_members').select('status').eq('community_id',c.id).eq('user_id',profile?.id).maybeSingle();
      const active=m?.status==='active';
      setJoined(active);
      if(active){
        const {data:msgs}=await supabase.from('community_messages').select('id,body,channel,thread_id,created_at,user_id,reply_to_id,image_url').eq('community_id',c.id).eq('channel',channel).is('deleted_at',null).order('created_at',{ascending:true}).limit(100);
        setMessages(msgs||[]);
        const profileIds=[...new Set((msgs||[]).map((x:any)=>x.user_id).filter(Boolean))];
        if(profileIds.length){const {data:ps}=await supabase.from('public_profiles').select('id,name,username,avatar_color').in('id',profileIds);setUserProfiles(Object.fromEntries((ps||[]).map((p:any)=>[p.id,p])))}
        const {data:ts}=await supabase.from('community_threads').select('*').eq('community_id',c.id).eq('channel',channel).order('created_at',{ascending:false}).limit(30);
        setThreads(ts||[]);
        const ids=(msgs||[]).map((m:any)=>m.id);
        if(ids.length){
          const {data:rx}=await supabase.from('community_reactions').select('*').in('message_id',ids);
          setReactions(rx||[]);
        } else setReactions([]);
      }
    } finally { setLoading(false) }
  }
  useEffect(()=>{if(profile?.id)load()},[channel,profile?.id]);

  useEffect(()=>{
    if(!communityId||!joined)return;
    const ch=supabase.channel(`studyflow-${communityId}-${channel}`)
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'community_messages',filter:`community_id=eq.${communityId}`},(payload:any)=>{if(payload.new.channel===channel)setMessages(m=>m.some(x=>x.id===payload.new.id)?m:[...m,payload.new])})
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'community_threads',filter:`community_id=eq.${communityId}`},(payload:any)=>{if(payload.new.channel===channel)setThreads(t=>[payload.new,...t])})
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'community_reactions'},(payload:any)=>{setReactions(r=>r.some(x=>x.id===payload.new.id)?r:[...r,payload.new])})
      .on('postgres_changes',{event:'DELETE',schema:'public',table:'community_reactions'},(payload:any)=>{setReactions(r=>r.filter(x=>x.id!==payload.old.id))})
      .subscribe();
    return ()=>{supabase.removeChannel(ch)}
  },[communityId,joined,channel]);

  function pickImage(){ fileInputRef.current?.click() }
  function onImageChosen(e:any){
    const file = e.target.files?.[0];
    if(!file) return;
    if(!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type)){ alert('Please choose a JPG, PNG, WEBP or GIF image.'); return }
    if(file.size > 2*1024*1024){ alert('Images must be under 2MB.'); return }
    setPendingImage(file);
    setPendingImagePreview(URL.createObjectURL(file));
  }
  function clearPendingImage(){
    setPendingImage(null);
    if(pendingImagePreview) URL.revokeObjectURL(pendingImagePreview);
    setPendingImagePreview(null);
    if(fileInputRef.current) fileInputRef.current.value='';
  }

  async function send(){
    if((!message.trim()&&!pendingImage)||!communityId)return;
    const {data:{user}}=await supabase.auth.getUser();if(!user)return;
    let image_url:string|null=null;
    if(pendingImage){
      setUploading(true);
      const ext = pendingImage.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const {error:upErr}=await supabase.storage.from('community-images').upload(path,pendingImage);
      if(upErr){ alert(upErr.message); setUploading(false); return }
      const {data:pub}=supabase.storage.from('community-images').getPublicUrl(path);
      image_url = pub?.publicUrl || null;
      setUploading(false);
    }
    const {data,error}=await supabase.from('community_messages').insert({
      community_id:communityId,user_id:user.id,body:message.trim(),channel,thread_id:activeThread,
      reply_to_id:replyTo?.id||null, image_url
    }).select().single();
    if(!error&&data)setMessages(m=>m.some(x=>x.id===data.id)?m:[...m,data]);
    if(replyTo && replyTo.user_id && replyTo.user_id!==user.id){
      const senderName = profile?.name || 'A student';
      await supabase.from('notifications').insert({
        user_id:replyTo.user_id,
        message:`${senderName} replied to your message in #${channel}`
      });
    }
    setMessage(''); setReplyTo(null); clearPendingImage();
  }

  async function toggleReaction(messageId:string,emoji:string){
    const {data:{user}}=await supabase.auth.getUser();if(!user)return;
    const existing = reactions.find(r=>r.message_id===messageId&&r.user_id===user.id&&r.emoji===emoji);
    if(existing){
      await supabase.from('community_reactions').delete().eq('id',existing.id);
      setReactions(r=>r.filter(x=>x.id!==existing.id));
    } else {
      const {data,error}=await supabase.from('community_reactions').insert({message_id:messageId,user_id:user.id,emoji}).select().single();
      if(!error&&data){
        setReactions(r=>[...r,data]);
        const target = messages.find(m=>m.id===messageId);
        if(target?.user_id && target.user_id!==user.id){
          const senderName = profile?.name || 'A student';
          await supabase.from('notifications').insert({
            user_id:target.user_id,
            message:`${senderName} reacted ${emoji} to your message in #${channel}`
          });
        }
      }
    }
    setPickerFor(null);
  }

  async function createThread(){if(!threadTitle.trim()||!communityId)return;const {data:{user}}=await supabase.auth.getUser();if(!user)return;const {data,error}=await supabase.from('community_threads').insert({community_id:communityId,channel,title:threadTitle.trim(),created_by:user.id}).select().single();if(!error&&data){setThreads(t=>[data,...t]);setActiveThread(data.id);setThreadTitle('');setShowThread(false)}}
  async function leave(){if(!communityId)return;const {data:{user}}=await supabase.auth.getUser();if(!user)return;await supabase.from('community_members').update({status:'left',left_at:new Date().toISOString()}).eq('community_id',communityId).eq('user_id',user.id);setJoined(false)}
  async function rejoin(){if(!communityId)return;const {data:{user}}=await supabase.auth.getUser();if(!user)return;await supabase.from('community_members').upsert({community_id:communityId,user_id:user.id,role:'member',status:'active',left_at:null});setJoined(true);load()}

  if(loading)return <div className="card">Loading StudyFlow Community…</div>;
  if(!joined)return <div className="card community-rejoin"><div className="community-orb"><Globe2 size={20}/></div><h2>StudyFlow Community</h2><p className="muted">You left the public community. You can always come back.</p><button className="btn primary" onClick={rejoin}>Rejoin Community</button></div>;

  const visible=messages.filter(m=>activeThread?m.thread_id===activeThread:!m.thread_id);
  const messageById=(id:string)=>messages.find(m=>m.id===id);
  const reactionsFor=(id:string)=>{
    const grouped:Record<string,{emoji:string,count:number,mine:boolean}> = {};
    reactions.filter(r=>r.message_id===id).forEach(r=>{
      if(!grouped[r.emoji]) grouped[r.emoji]={emoji:r.emoji,count:0,mine:false};
      grouped[r.emoji].count++;
      if(r.user_id===profile?.id) grouped[r.emoji].mine=true;
    });
    return Object.values(grouped);
  };

  return <div>
    <div className="section-title community-title"><div><span className="eyebrow"><Users size={13}/> Shared study space</span><h2>StudyFlow Community</h2><p className="muted">Foyer for everyone. Studies for focused academic conversations.</p></div><button className="btn" onClick={leave}>Leave</button></div>
    <div className="community-layout">
      <aside className="card channels">
        <div className="channel-label">CHANNELS</div>
        {channels.map(c=><button key={c} className={channel===c?'active':''} onClick={()=>{setChannel(c);setActiveThread(null)}}>#{c}</button>)}
        <div className="channel-label thread-label">THREADS</div>
        <button className={!activeThread?'active':''} onClick={()=>setActiveThread(null)}>All messages</button>
        {threads.map(t=><button key={t.id} className={activeThread===t.id?'active':''} onClick={()=>setActiveThread(t.id)}><MessageSquare size={13}/> {t.title}</button>)}
        <button className="new-thread-btn" onClick={()=>setShowThread(true)}><Plus size={14}/> New thread</button>
        <div className="muted community-status">Live · public</div>
      </aside>
      <section className="card chat">
        <div className="chat-head"><div><strong>#{channel}{activeThread?` · ${threads.find(t=>t.id===activeThread)?.title||'Thread'}`:''}</strong><div className="muted">{activeThread?'Thread conversation':'Everyone can join this channel'}</div></div><Globe2 size={18}/></div>
        <div className="messages">
          {visible.length?visible.map((m,i)=>{
            const mine = m.user_id===profile?.id;
            const replySource = m.reply_to_id ? messageById(m.reply_to_id) : null;
            const rx = reactionsFor(m.id);
            return <div className="message" key={m.id||i}>
              <div className="avatar small">{(mine?(profile?.name||'Y'):'S').slice(0,1).toUpperCase()}</div>
              <div style={{flex:1,minWidth:0}}>
                <strong>{mine?(profile?.name||'You'):'Student'}</strong>
                <span className="muted message-time">{m.created_at?new Date(m.created_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}):''}</span>
                {replySource&&<div className="reply-quote">Replying to <strong>{replySource.user_id===profile?.id?'You':'Student'}</strong>: {replySource.body?.slice(0,80)||'image'}</div>}
                {m.body&&<div>{m.body}</div>}
                {m.image_url&&<img src={m.image_url} alt="Shared" className="message-image"/>}
                <div className="message-actions">
                  {rx.map(r=><button key={r.emoji} className={'reaction-pill '+(r.mine?'mine':'')} onClick={()=>toggleReaction(m.id,r.emoji)}>{r.emoji} {r.count}</button>)}
                  <button className="message-action-btn" onClick={()=>setPickerFor(pickerFor===m.id?null:m.id)} aria-label="Add reaction"><SmilePlus size={14}/></button>
                  <button className="message-action-btn" onClick={()=>setReplyTo(m)} aria-label="Reply"><Reply size={14}/></button>{mine&&<DeleteButton label="Delete message" onDelete={async()=>{await supabase.from('community_messages').delete().eq('id',m.id).eq('user_id',profile.id);setMessages(rows=>rows.filter(x=>x.id!==m.id))}}/>}
                </div>
                {pickerFor===m.id&&<div className="reaction-picker">{REACTION_EMOJI.map(em=><button key={em} onClick={()=>toggleReaction(m.id,em)}>{em}</button>)}</div>}
              </div>
            </div>
          }):<div className="muted empty-chat">{activeThread?'Start this thread':'Be the first to say hello'}</div>}
        </div>
        {replyTo&&<div className="reply-banner"><span>Replying to {replyTo.user_id===profile?.id?'yourself':'Student'}: {replyTo.body?.slice(0,60)||'image'}</span><button className="icon-btn" onClick={()=>setReplyTo(null)}><X size={13}/></button></div>}
        {pendingImagePreview&&<div className="reply-banner"><img src={pendingImagePreview} alt="Preview" style={{height:36,borderRadius:6}}/><span className="muted">Image ready to send</span><button className="icon-btn" onClick={clearPendingImage}><X size={13}/></button></div>}
        <div className="chat-input">
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{display:'none'}} onChange={onImageChosen}/>
          <button className="btn" onClick={pickImage} aria-label="Attach image" disabled={uploading}><ImageIcon size={15}/></button>
          <input className="input" value={message} onChange={e=>setMessage(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder={activeThread?'Reply in this thread…':'Message the community…'}/>
          <button className="btn primary" onClick={send} disabled={uploading}><Send size={15}/></button>
        </div>
      </section>
    </div>
    {showThread&&<div className="modal-back"><div className="modal"><div className="modal-head"><div><span className="eyebrow"><MessageSquare size={13}/> Community thread</span><h2 className="font-display">Start a conversation</h2></div><button className="icon-btn" onClick={()=>setShowThread(false)}><X size={16}/></button></div><div className="field"><label>Thread title</label><input className="input" value={threadTitle} onChange={e=>setThreadTitle(e.target.value)} placeholder="What do you want to discuss?"/></div><button className="btn primary" style={{width:'100%'}} onClick={createThread}>Create thread</button></div></div>}
  </div>
}
function StudyGroups({profile,supabase}:any){const [groups,setGroups]=useState<any[]>([]),[show,setShow]=useState(false),[name,setName]=useState(''),[goal,setGoal]=useState(''),[privacy,setPrivacy]=useState('public');useEffect(()=>{(async()=>{const {data}=await supabase.from('study_groups').select('*').order('created_at',{ascending:false}).limit(30);setGroups(data||[])})()},[supabase]);async function create(){if(!name.trim()||!profile?.id)return;const {data,error}=await supabase.from('study_groups').insert({owner_id:profile.id,name:name.trim(),description:goal.trim(),privacy,join_code:privacy==='private'?Math.random().toString(36).slice(2,9).toUpperCase():null}).select().single();if(error){alert(error.message);return}await supabase.from('study_group_members').insert({group_id:data.id,user_id:profile.id,role:'owner',status:'active'});setGroups(g=>[data,...g]);setName('');setGoal('');setShow(false)}return <div><div className="section-title"><div><span className="eyebrow"><UsersRound size={13}/> Collaboration</span><h2>My Study Groups</h2><p className="muted">Create focused rooms with shared goals, separate from the public community.</p></div><button className="btn primary" onClick={()=>setShow(v=>!v)}><Plus size={15}/> Create group</button></div>{show&&<div className="card create-group-card"><div className="two"><div className="field"><label>Group name</label><input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Night Study Squad"/></div><div className="field"><label>Shared goal</label><input className="input" value={goal} onChange={e=>setGoal(e.target.value)} placeholder="Finish physics revision"/></div></div><div className="field"><label>Privacy</label><select className="select" value={privacy} onChange={e=>setPrivacy(e.target.value)}><option value="public">Public</option><option value="private">Private</option></select></div><button className="btn primary" onClick={create}>Create study group</button></div>}{groups.length?<div className="group-grid">{groups.map(g=><div className="card group-card" key={g.id}><div className="section-title"><h3>{g.name}</h3>{g.privacy==='private'?<Shield size={16}/>:<Globe2 size={16}/>}</div><p className="muted">{g.privacy==='private'?'Private':'Public'} group</p><p>{g.description||'A focused StudyFlow study room.'}</p>{g.join_code&&<div className="pill">Join code: {g.join_code}</div>}<button className="btn" style={{marginTop:12}}>Open group <ArrowRight size={14}/></button></div>)}</div>:<div className="empty"><UsersRound size={24}/><p>No groups yet. Create the first one.</p></div>}</div>}

function Writing(){const [title,setTitle]=useState('Untitled study note'),[text,setText]=useState('');const words=text.trim()?text.trim().split(/\s+/).length:0;useEffect(()=>{const saved=localStorage.getItem('studyflow-writing');if(saved){const j=JSON.parse(saved);setTitle(j.title||'Untitled study note');setText(j.text||'')}},[]);useEffect(()=>{localStorage.setItem('studyflow-writing',JSON.stringify({title,text}))},[title,text]);return <div><div className="writing-hero card"><div><span className="eyebrow"><PenLine size={13}/> Writing workspace</span><h2 className="font-display">Think it through. Write it down.</h2><p className="muted">A distraction-light editor for notes, answers, reflections and revision summaries.</p></div><div className="writing-stats"><strong>{words}</strong><span>words</span></div></div><div className="writing-editor card"><input className="writing-title" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Note title"/><textarea className="writing-area" value={text} onChange={e=>setText(e.target.value)} placeholder={'Start writing…\n\nTip: explain the topic as if you were teaching it to someone else.'}/><div className="writing-footer"><span className="muted">Autosaved locally · {words} words</span><button className="btn" onClick={()=>{setTitle('');setText('')}}>New note</button></div></div></div>}

function ProfileModal({draft,setDraft,supabase,onSaved,onClose,onExport}:any){
  async function save(){
    const {data:{user}}=await supabase.auth.getUser();
    if(!user)return;
    const clean={name:draft.name.trim(),username:draft.username.trim().replace(/[^a-zA-Z0-9_]/g,''),avatar_color:draft.avatar_color,avatar_emoji:''};
    const {data,error}=await supabase.from('profiles').upsert({id:user.id,...clean}).select().single();
    if(!error&&data)onSaved(data);
  }
  const previewProfile = {
    name:draft.name,
    avatar_color:draft.avatar_color
  };

  return (
    <div className="modal-back">
      <div className="modal profile-modal">

        <div className="modal-head">
          <div>
            <span className="eyebrow">
              <UserRound size={13}/> Your profile
            </span>

            <h2 className="font-display">
              Make StudyFlow yours.
            </h2>

            <p className="muted">
              Your display name and username are used in the community.
            </p>
          </div>

          <button className="icon-btn" onClick={onClose}>
            <X size={16}/>
          </button>
        </div>

        <div className="profile-hero">
          <Avatar profile={previewProfile} size="big"/>

          <div>
            <strong>{draft.name||'Student'}</strong>
            <div className="muted">
              @{draft.username||'username'}
            </div>
          </div>
        </div>

        <div className="two">
          <div className="field">
            <label>Display name</label>

            <input
              className="input"
              value={draft.name}
              onChange={e =>
                setDraft({
                  ...draft,
                  name:e.target.value
                })
              }
            />
          </div>

          <div className="field">
            <label>Community username</label>

            <input
              className="input"
              value={draft.username}
              onChange={e =>
                setDraft({
                  ...draft,
                  username:e.target.value
                })
              }
              placeholder="studyflow_student"
            />

            <small className="muted">
              Letters, numbers and underscores.
            </small>
          </div>
        </div>

        <div className="field">
          <label>Avatar colour</label>

          <div className="color-grid">
            {COLOR_CHOICES.map(c => (
              <button
                type="button"
                key={c}
                className={
                  'color-choice ' +
                  (draft.avatar_color===c ? 'selected' : '')
                }
                style={{background:c}}
                onClick={() =>
                  setDraft({
                    ...draft,
                    avatar_color:c
                  })
                }
                aria-label={`Choose ${c}`}
              />
            ))}
          </div>
        </div>

        <div className="profile-actions">
          <button
            className="btn primary"
            onClick={save}
          >
            <Save size={15}/> Save profile
          </button>

          <button
            className="btn"
            onClick={onExport}
          >
            <FileText size={15}/> Export my data
          </button>
        </div>

      </div>
    </div>
  );
}

function Settings({dark,setDark,profile,reopen,onExport}:any){return <div><div className="two"><div className="card"><div className="section-title"><div><h2>Appearance</h2><p className="muted">Tune the workspace without losing your study data.</p></div><Settings2/></div><button className="theme-switch" onClick={()=>setDark((v:boolean)=>!v)}><span className={dark?'selected':''}><Moon size={15}/> Dark</span><span className={!dark?'selected':''}><Sun size={15}/> Light</span></button><p className="muted">Light mode uses softer surfaces, clearer contrast and less visual glare.</p></div><div className="card"><div className="section-title"><div><h2>Academic profile</h2><p className="muted">Edit the information used for planning.</p></div><UserRound/></div><div className="topic-row"><span>Name</span><strong>{profile?.name||'—'}</strong></div><div className="topic-row"><span>Username</span><strong>@{profile?.username||'—'}</strong></div><div className="topic-row"><span>School</span><strong>{profile?.school_name||'—'}</strong></div><div className="topic-row"><span>Aim</span><strong>{profile?.aim_marks||'—'}/{profile?.aim_out_of||'—'}</strong></div><button className="btn" onClick={reopen}>Edit study setup</button></div></div><div className="card automation-card"><div className="section-title"><div><h2>Smart automation</h2><p className="muted">Rules StudyFlow can use when enough history exists.</p></div><Zap/></div>{['Auto-reschedule unfinished tasks','Prioritise approaching exams','Prefer historically efficient hours','Protect a daily buffer block','Use manual study logs in analytics','Suggest spaced revision reminders'].map(x=><div className="topic-row" key={x}><span>{x}</span><span className="pill ok">Enabled</span></div>)}</div><div className="card data-card"><div><h2>Data & reports</h2><p className="muted">Keep a portable copy of everything you have logged.</p></div><button className="btn primary" onClick={onExport}>Open export center <ArrowRight size={14}/></button></div></div>}
function Reports({profile,supabase}:any){
  const [range,setRange]=useState('30');
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const [importing,setImporting]=useState(false);
  const [data,setData]=useState<any>(null);
  const stamp=()=>new Date().toISOString().replace(/[:.]/g,'-');
  async function collect(){
    setBusy(true); setMessage('Collecting your private study data…');
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){setBusy(false);setMessage('Please log in again.');return null;}
    const from=new Date(); from.setDate(from.getDate()-Number(range));
    const [p,subjects,tasks,sessions,exams,marks,topics]=await Promise.all([
      supabase.from('profiles').select('*').eq('id',user.id).single(),
      supabase.from('subjects').select('*').eq('user_id',user.id).order('name'),
      supabase.from('tasks').select('*').eq('user_id',user.id).order('created_at',{ascending:false}),
      supabase.from('study_sessions').select('*').eq('user_id',user.id).gte('created_at',from.toISOString()).order('created_at',{ascending:false}),
      supabase.from('exams').select('*').eq('user_id',user.id).order('exam_at'),
      supabase.from('marks').select('*').eq('user_id',user.id).order('exam_date',{ascending:false}),
      supabase.from('topics').select('*').eq('user_id',user.id).order('last_studied_at',{ascending:false})
    ]);
    const errors=[p,subjects,tasks,sessions,exams,marks,topics].filter(x=>x.error).map(x=>x.error.message);
    if(errors.length){setBusy(false);setMessage(errors.join(' | '));return null;}
    const payload={exportVersion:'1.1',exportedAt:new Date().toISOString(),rangeDays:Number(range),profile:p.data||profile,subjects:subjects.data||[],tasks:tasks.data||[],studySessions:sessions.data||[],exams:exams.data||[],marks:marks.data||[],topics:topics.data||[]};
    setData(payload); setBusy(false); setMessage(`Ready: ${payload.studySessions.length} study sessions, ${payload.tasks.length} tasks, ${payload.marks.length} marks.`); return payload;
  }
  function download(name:string,text:string,type:string){const blob=new Blob([text],{type});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();URL.revokeObjectURL(a.href)}
  async function exportJSON(){const d=data||await collect();if(!d)return;download(`studyflow-backup-${stamp()}.json`,JSON.stringify(d,null,2),'application/json');setMessage('JSON backup downloaded.');}
  async function exportCSV(){const d=data||await collect();if(!d)return;const rows=d.studySessions.map((x:any)=>({date:x.created_at,subject:x.subject,topic:x.topic||'',minutes:x.minutes,source:x.source||'',focus_score:x.focus_score||0,notes:x.notes||''}));const headers=['date','subject','topic','minutes','source','focus_score','notes'];const csv=[headers.join(','),...rows.map((r:any)=>headers.map(h=>`"${String(r[h]??'').replace(/"/g,'""')}"`).join(','))].join('\n');download(`studyflow-sessions-${stamp()}.csv`,csv,'text/csv;charset=utf-8');setMessage('CSV study-session report downloaded.');}
  async function printPDF(){const d=data||await collect();if(!d)return;const total=d.studySessions.reduce((n:any,x:any)=>n+Number(x.minutes||0),0);const bySubject:any={};d.studySessions.forEach((x:any)=>bySubject[x.subject]=(bySubject[x.subject]||0)+Number(x.minutes||0));const top=Object.entries(bySubject).sort((a:any,b:any)=>b[1]-a[1]);const completed=d.tasks.filter((x:any)=>x.status==='done').length;const html=`<!doctype html><html><head><title>StudyFlow Report</title><style>body{font-family:Arial,sans-serif;margin:40px;color:#171a2f}h1{font-size:32px}h2{margin-top:28px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ddd;padding:8px;text-align:left}.stat{display:inline-block;padding:14px 18px;border:1px solid #ddd;border-radius:12px;margin:0 8px 8px 0}small{color:#667085}</style></head><body><h1>StudyFlow Study Report</h1><small>Generated ${new Date().toLocaleString()} · Last ${range} days</small><div><div class="stat"><b>${Math.floor(total/60)}h ${total%60}m</b><br><small>Study time</small></div><div class="stat"><b>${completed}/${d.tasks.length}</b><br><small>Tasks completed</small></div><div class="stat"><b>${d.marks.length}</b><br><small>Marks recorded</small></div><div class="stat"><b>${d.topics.length}</b><br><small>Topics tracked</small></div></div><h2>Study time by subject</h2><table><tr><th>Subject</th><th>Minutes</th><th>Hours</th></tr>${top.map((x:any)=>`<tr><td>${x[0]}</td><td>${x[1]}</td><td>${(Number(x[1])/60).toFixed(1)}</td></tr>`).join('')}</table><h2>Recent marks</h2><table><tr><th>Exam</th><th>Subject</th><th>Score</th><th>Date</th></tr>${d.marks.slice(0,20).map((x:any)=>`<tr><td>${x.exam_name||''}</td><td>${x.subject||''}</td><td>${x.score}/${x.out_of}</td><td>${x.exam_date||''}</td></tr>`).join('')}</table><h2>Recent study sessions</h2><table><tr><th>Date</th><th>Subject</th><th>Topic</th><th>Minutes</th><th>Focus</th></tr>${d.studySessions.slice(0,30).map((x:any)=>`<tr><td>${new Date(x.created_at).toLocaleDateString()}</td><td>${x.subject}</td><td>${x.topic||''}</td><td>${x.minutes}</td><td>${x.focus_score||0}%</td></tr>`).join('')}</table><script>window.onload=()=>setTimeout(()=>window.print(),250)</script></body></html>`;const w=window.open('','_blank');if(w){w.document.write(html);w.document.close();setMessage('Report opened. Choose “Save as PDF” in the print dialog.');}}
  async function importJSON(file:File){try{setImporting(true);const raw=JSON.parse(await file.text());const {data:{user}}=await supabase.auth.getUser();if(!user)throw new Error('Not authenticated');if(!raw||raw.exportVersion===undefined)throw new Error('This does not look like a StudyFlow backup.');if(raw.profile)await supabase.from('profiles').upsert({...raw.profile,id:user.id});for(const table of ['subjects','tasks','studySessions','exams','marks','topics']){const rows=raw[table]||[];if(!rows.length)continue;const dbTable=table==='studySessions'?'study_sessions':table;const cleaned=rows.map((r:any)=>{const x={...r,user_id:user.id};delete x.user_id;return {...x,user_id:user.id}});await supabase.from(dbTable).upsert(cleaned);}setMessage('Backup imported. Refresh the page to reload the dashboard.');}catch(e){setMessage(e instanceof Error?e.message:'Import failed.')}finally{setImporting(false)}}
  return <><div className="card"><div className="section-title"><div><h2>Export & backup center</h2><p className="muted" style={{margin:'4px 0 0'}}>Your data stays in your account. Export whenever you want a portable copy.</p></div><select className="select report-range" value={range} onChange={e=>{setRange(e.target.value);setData(null)}}><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="365">Last year</option></select></div><div className="export-grid"><button className="export-card" onClick={exportJSON}><strong>JSON backup</strong><span>Complete portable backup of profile, subjects, tasks, sessions, exams, marks and topics.</span><b>Download JSON →</b></button><button className="export-card" onClick={exportCSV}><strong>CSV study report</strong><span>Study sessions formatted for Excel, Google Sheets and data analysis.</span><b>Download CSV →</b></button><button className="export-card" onClick={printPDF}><strong>Printable PDF</strong><span>Beautiful summary of study hours, subject breakdown, marks and recent sessions.</span><b>Generate PDF →</b></button></div>{message&&<div className="ai-answer">{message}</div>}{busy&&<div className="progress" style={{marginTop:12}}><i style={{width:'60%'}}/></div>}</div><div className="two" style={{marginTop:14}}><div className="card"><div className="section-title"><h2>Restore backup</h2><span>JSON only</span></div><p className="muted">Import a StudyFlow JSON backup into your current account. Existing records with the same IDs may be updated.</p><label className="btn" style={{display:'inline-flex',cursor:'pointer'}}>{importing?'Importing…':'Choose JSON backup'}<input hidden type="file" accept="application/json,.json" disabled={importing} onChange={e=>{const f=e.target.files?.[0];if(f)importJSON(f)}}/></label></div><div className="card"><div className="section-title"><h2>Privacy</h2><span>Account-owned</span></div><p className="muted">Exports are generated in your browser from data returned for your authenticated account. Database access is protected by Supabase Row Level Security.</p></div></div></>}

