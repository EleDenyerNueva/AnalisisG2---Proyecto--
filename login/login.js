// login.js - demo de login con validación, retraso simulado y bloqueo tras intentos
const form = document.getElementById('login-form');
const usuario = document.getElementById('usuario');
const clave = document.getElementById('clave');
const feedback = document.getElementById('form-feedback');
const submitBtn = document.getElementById('submitBtn');
const togglePass = document.getElementById('togglePass');
const remember = document.getElementById('remember');

// Estado de intentos y bloqueo
const MAX_INTENTOS = 3;
const BLOQUEO_MS = 30_000; // 30 segundos
let intentos = Number(localStorage.getItem('login:intentos') || 0);
let bloqueadoHasta = Number(localStorage.getItem('login:bloqueadoHasta') || 0);

function now(){ return Date.now(); }
function msToSec(ms){ return Math.ceil(ms/1000); }

function setFeedback(msg,type=''){ feedback.textContent = msg; feedback.className = `feedback ${type}`; }
function setDisabled(dis){ submitBtn.disabled = dis; usuario.disabled = dis; clave.disabled = dis; togglePass.disabled = dis; }

function validar(){
  let ok = true;
  const u = usuario.value.trim();
  const p = clave.value;

  const uErr = document.getElementById('usuario-error');
  const pErr = document.getElementById('clave-error');
  uErr.textContent = ''; pErr.textContent = '';

  if(!u || u.length < 3){ uErr.textContent = 'Mínimo 3 caracteres.'; ok = false; }
  if(!p || p.length < 4){ pErr.textContent = 'Mínimo 4 caracteres.'; ok = false; }
  return ok;
}

// Mock API de autenticación
function mockLogin(u,p){
  return new Promise((resolve,reject)=>{
    setTimeout(()=>{
      const valid = (u==='admin' && p==='1234') || (u==='seguridad' && p==='secure123');
      if(valid){ resolve({ token: btoa(`${u}:${Date.now()}`), user: { username: u } }); }
      else{ reject(new Error('Credenciales inválidas')); }
    }, 900);
  });
}

function checkBloqueo(){
  const diff = bloqueadoHasta - now();
  if(diff > 0){
    setDisabled(true);
    let restante = msToSec(diff);
    setFeedback(`Demasiados intentos. Intenta de nuevo en ${restante}s…`,'error');
    const interval = setInterval(()=>{
      const d = bloqueadoHasta - now();
      if(d <= 0){ clearInterval(interval); setDisabled(false); setFeedback(''); }
      else{ setFeedback(`Demasiados intentos. Intenta de nuevo en ${msToSec(d)}s…`,'error'); }
    }, 1000);
    return true;
  }
  return false;
}

togglePass.addEventListener('click', ()=>{
  const isPwd = clave.type === 'password';
  clave.type = isPwd ? 'text' : 'password';
  togglePass.setAttribute('aria-pressed', String(isPwd));
});

form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  if(checkBloqueo()) return;
  if(!validar()) return;

  setDisabled(true);
  const oldLabel = submitBtn.textContent;
  submitBtn.textContent = 'Autenticando…';

  try{
    const res = await mockLogin(usuario.value.trim(), clave.value);
    // Reset intentos al éxito
    intentos = 0; localStorage.setItem('login:intentos','0');
    setFeedback('Ingreso exitoso. Redirigiendo…','success');

    // Token de demo
    const session = { token: res.token, user: res.user, remember: !!remember.checked };
    const storage = remember.checked ? localStorage : sessionStorage;
    storage.setItem('auth:session', JSON.stringify(session));

    setTimeout(()=>{ window.location.href = './dashboard.html'; }, 650);
  }catch(err){
    intentos += 1; localStorage.setItem('login:intentos', String(intentos));
    setFeedback('Usuario o contraseña incorrectos.','error');
    form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake');
    if(intentos >= MAX_INTENTOS){
      bloqueadoHasta = now() + BLOQUEO_MS;
      localStorage.setItem('login:bloqueadoHasta', String(bloqueadoHasta));
      checkBloqueo();
    }else{
      setDisabled(false);
    }
  }finally{
    submitBtn.textContent = oldLabel;
  }
});

// Chequear bloqueo al cargar
checkBloqueo();
