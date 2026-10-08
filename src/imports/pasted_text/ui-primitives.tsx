import { useState, createContext, useContext, useRef, useEffect } from "react";

type Screen = "register" | "login" | "reset" | "newpass" | "home" | "lobby" | "profile";

// ─── Shared tokens ────────────────────────────────────────────────────────────
const C = {
  bg: "#080C14",
  card: "rgba(15,23,42,0.85)",
  border: "rgba(0,240,255,0.28)",
  cyan: "#00F0FF",
  purple: "#B026FF",
  green: "#00FF66",
  red: "#FF3B5C",
  muted: "#94A3B8",
  main: "#F1F5F9",
  input: "#1E293B",
};

const glowCyan = "0 0 20px rgba(0,240,255,0.5)";
const glowPurple = "0 0 20px rgba(176,38,255,0.5)";
const glowRed = "0 0 20px rgba(255,59,92,0.55)";

// ─── Reusable primitives ─────────────────────────────────────────────────────
function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="font-orbitron text-2xl font-black tracking-wider bg-transparent border-none cursor-pointer p-0"
    >
      <span style={{ color: C.cyan, textShadow: "0 0 10px rgba(0,240,255,0.5)" }}>GAME</span>
      <span style={{ color: C.purple, textShadow: "0 0 10px rgba(176,38,255,0.5)" }}>SQUAD</span>
    </button>
  );
}

function AuthHeader({ backLabel, onBack }: { backLabel?: string; onBack?: () => void }) {
  return (
    <header
      className="flex items-center justify-between px-10 h-[70px]"
      style={{ background: "rgba(8,12,20,0.96)", borderBottom: `1px solid ${C.border}`, backdropFilter: "blur(14px)", position: "sticky", top: 0, zIndex: 100 }}
    >
      <Logo />
      {backLabel && onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-transparent border-none cursor-pointer text-sm font-semibold transition-colors"
          style={{ color: C.muted }}
          onMouseEnter={(e) => (e.currentTarget.style.color = C.cyan)}
          onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
        >
          <i className="fa-solid fa-arrow-left text-xs" /> {backLabel}
        </button>
      )}
    </header>
  );
}

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex items-center justify-center px-5 py-14" style={{ minHeight: "calc(100vh - 70px)" }}>
      {children}
    </div>
  );
}

function CardWrap({ maxWidth = 520, children }: { maxWidth?: number; children: React.ReactNode }) {
  return (
    <div
      className="w-full rounded-2xl overflow-hidden"
      style={{ maxWidth, background: C.card, border: `1px solid ${C.border}`, backdropFilter: "blur(18px)", boxShadow: "0 0 60px rgba(0,240,255,0.05), 0 0 120px rgba(176,38,255,0.04)" }}
    >
      {children}
    </div>
  );
}

function CardHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="px-8 py-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,240,255,0.025)" }}>
      <div className="font-orbitron text-xl font-black" style={{ color: C.cyan, borderLeft: `4px solid ${C.purple}`, paddingLeft: "14px" }}>
        {title}
      </div>
      {sub && <p className="text-sm mt-1 pl-[18px]" style={{ color: C.muted }}>{sub}</p>}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs font-bold uppercase tracking-widest block mb-1.5" style={{ color: C.muted }}>
      {children}
    </label>
  );
}

function Field({
  icon, iconColor, type = "text", placeholder, value, onChange, readOnly, error, right,
}: {
  icon: string; iconColor?: string; type?: string; placeholder?: string;
  value: string; onChange?: (v: string) => void; readOnly?: boolean; error?: string; right?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? "rgba(255,59,92,0.7)" : focused ? "rgba(0,240,255,0.5)" : "rgba(51,65,85,0.8)";
  return (
    <div>
      <div className="flex items-center rounded-lg overflow-hidden transition-all" style={{ background: C.input, border: `1px solid ${borderColor}` }}>
        <span className="pl-3.5 pr-2 text-xs shrink-0" style={{ color: iconColor ?? C.cyan }}>
          <i className={`fa-solid ${icon}`} />
        </span>
        <input
          type={type} value={value} readOnly={readOnly} placeholder={placeholder}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className="flex-1 py-[11px] pr-3 text-sm bg-transparent outline-none"
          style={{ color: readOnly ? C.muted : C.main, cursor: readOnly ? "default" : "text" }}
        />
        {right}
      </div>
      {error && <p className="text-xs mt-1" style={{ color: "#f87171" }}>{error}</p>}
    </div>
  );
}

function Sel({ icon, value, onChange, options }: { icon?: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="relative">
      {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs z-10 pointer-events-none" style={{ color: C.cyan }}><i className={`fa-solid ${icon}`} /></span>}
      <select
        value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg py-[11px] pr-9 text-sm outline-none appearance-none transition-all"
        style={{ background: C.input, border: "1px solid rgba(51,65,85,0.8)", color: C.main, paddingLeft: icon ? "34px" : "14px" }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(0,240,255,0.5)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(51,65,85,0.8)")}
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: C.muted }} />
    </div>
  );
}
function BtnCyan({ children, onClick, type = "button", full = true }: { children: React.ReactNode; onClick?: () => void; type?: "button" | "submit"; full?: boolean }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${full ? "w-full" : ""} font-orbitron font-black text-sm rounded-xl py-3.5 cursor-pointer border-none transition-all duration-200`}
      style={{
        background: "linear-gradient(135deg,rgba(0,240,255,0.3),rgba(0,240,255,0.6))",
        border: `2px solid ${C.cyan}`,
        color: "#fff",
        boxShadow: "0 0 18px rgba(0,240,255,0.3)",
        letterSpacing: "0.05em",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = glowCyan; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 0 18px rgba(0,240,255,0.3)"; }}
    >
      {children}
    </button>
  );
}

function BtnPurple({ children, onClick, full = true }: { children: React.ReactNode; onClick?: () => void; full?: boolean }) {
  return (
    <button onClick={onClick}
      className={`${full ? "w-full" : ""} font-orbitron font-black text-sm rounded-xl py-3.5 cursor-pointer border-none transition-all duration-200`}
      style={{ background: "linear-gradient(135deg,rgba(176,38,255,0.25),rgba(176,38,255,0.55))", border: `2px solid ${C.purple}`, color: "#fff", boxShadow: "0 0 14px rgba(176,38,255,0.28)", letterSpacing: "0.05em" }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = glowPurple; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 0 14px rgba(176,38,255,0.28)"; }}
    >
      {children}
    </button>
  );
}

function BtnGhost({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick}
      className="w-full font-rajdhani font-bold text-sm rounded-xl py-3.5 cursor-pointer transition-all duration-200"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: C.muted }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = C.main; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = C.muted; }}
    >
      {children}
    </button>
  );
}

function TextLink({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="bg-transparent border-none cursor-pointer font-bold text-sm transition-all"
      style={{ color: C.cyan }}
      onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
      onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
    >
      {children}
    </button>
  );
}

function MicToggle({ value, onChange, label = "Con Micrófono" }: { value: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button onClick={() => onChange(!value)}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2 cursor-pointer border-none transition-all duration-200 shrink-0"
      style={{ background: value ? "rgba(0,240,255,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${value ? C.cyan : "rgba(51,65,85,0.8)"}` }}
    >
      <i className={`fa-solid ${value ? "fa-microphone" : "fa-microphone-slash"} text-xs`} style={{ color: value ? C.cyan : C.muted }} />
      <span className="text-xs font-bold whitespace-nowrap" style={{ color: value ? C.cyan : C.muted }}>{label}</span>
      <div className="relative rounded-full transition-all duration-200" style={{ width: "30px", height: "16px", background: value ? C.cyan : "#334155", flexShrink: 0 }}>
        <div className="absolute top-[3px] rounded-full transition-all duration-200" style={{ width: "10px", height: "10px", background: value ? "#080c14" : "#64748b", left: value ? "17px" : "3px" }} />
      </div>
    </button>
  );
}

function PageTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-orbitron text-lg mb-6 flex items-center gap-4" style={{ color: C.cyan, borderLeft: `4px solid ${C.purple}`, paddingLeft: "12px" }}>
      {children}
    </div>
  );
}

function PanelBox({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl p-5 ${className}`} style={{ background: C.card, border: `1px solid ${C.border}`, backdropFilter: "blur(12px)" }}>
      {children}
    </div>
  );
}

function PanelLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-bold uppercase tracking-widest mb-3 pb-3" style={{ color: C.muted, borderBottom: "1px solid rgba(255,255,255,0.06)", letterSpacing: "0.1em" }}>
      {children}
    </div>
  );
}
// ─── Screen 1: Register (Sin formularios, 100% seguro) ───────────────────────
function RegisterScreen({ nav }: { nav: (s: Screen) => void }) {
  const [form, setForm] = useState({ gamertag: "", email: "", password: "", platform: "PC" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleRegister = () => {
    const err: Record<string, string> = {};

    if (!form.gamertag.trim()) err.gamertag = "El gamertag es obligatorio";
    if (!form.email.includes("@") || !form.email.includes(".")) err.email = "Correo electrónico inválido";
    if (form.password.length < 6) err.password = "Mínimo 6 caracteres";

    if (Object.keys(err).length > 0) {
      setErrors(err);
      return; // Frena acá si hay errores
    }

    const newUser = {
      gamertag: form.gamertag.trim(),
      email: form.email.toLowerCase().trim(),
      password: form.password,
    };
    localStorage.setItem("gs_user", JSON.stringify(newUser));

    alert("¡Cuenta creada con éxito! Ahora podés iniciar sesión.");
    nav("login");
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg }} className="flex flex-col">
      <AuthHeader />
      <AuthShell>
        <CardWrap maxWidth={820}>
          <CardHead title="CREAR CUENTA" sub="Únete a la comunidad GAMESQUAD y encontrá tu equipo ideal" />
          
          <div className="grid gap-x-8 gap-y-5 p-8" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <Label>Gamertag <span style={{ color: C.cyan }}>*</span></Label>
              <Field icon="fa-user" placeholder="Tu apodo en el juego" value={form.gamertag} onChange={set("gamertag")} error={errors.gamertag} />
            </div>
            <div>
              <Label>Correo Electrónico <span style={{ color: C.cyan }}>*</span></Label>
              <Field icon="fa-envelope" type="email" placeholder="tu@correo.com" value={form.email} onChange={set("email")} error={errors.email} />
            </div>
            <div>
              <Label>Contraseña <span style={{ color: C.cyan }}>*</span></Label>
              <Field icon="fa-lock" type="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={set("password")} error={errors.password} />
            </div>
            <div>
              <Label>Plataforma</Label>
              <Sel icon="fa-display" value={form.platform} onChange={set("platform")} options={["PC", "PS4"]} />
            </div>
            <div>
              <Label>Juego</Label>
              <Field icon="fa-gamepad" value="Rocket League" readOnly onChange={() => {}} />
            </div>
            <div className="flex items-end">
              <div className="w-full flex items-center gap-3 rounded-lg px-4 py-[11px]" style={{ background: "rgba(0,240,255,0.04)", border: "1px solid rgba(0,240,255,0.18)" }}>
                <i className="fa-solid fa-shield-halved text-xs" style={{ color: C.cyan }} />
                <span className="text-xs" style={{ color: C.muted }}>Al registrarte aceptás nuestros <span style={{ color: C.cyan }}>Términos de Servicio</span></span>
              </div>
            </div>
            <div style={{ gridColumn: "1 / -1" }} className="flex flex-col gap-4 pt-1">
              <BtnCyan type="button" onClick={handleRegister}>
                <i className="fa-solid fa-user-plus mr-2" />CREAR MI CUENTA
              </BtnCyan>
              <p className="text-center text-sm" style={{ color: C.muted }}>
                ¿Ya tenés cuenta?{" "}<TextLink onClick={() => nav("login")}>Iniciar Sesión</TextLink>
              </p>
            </div>
          </div>

        </CardWrap>
      </AuthShell>
    </div>
  );
}
function LoginScreen({ nav }: { nav: (s: Screen) => void }) {
  const [id, setId] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState("");

  // Truco para forzar el foco y destrabar el teclado al montar la pantalla
  useEffect(() => {
    const timer = setTimeout(() => {
      const firstInput = document.querySelector('input') as HTMLInputElement;
      if (firstInput) {
        firstInput.focus();
        firstInput.click();
      }
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = () => {
    // 1. Validar que no estén vacíos
    if (!id.trim() || !pass.trim()) {
      setErr("Por favor completá todos los campos.");
      return;
    }

    // 2. Buscar usuario en el localStorage
    const storedUserRaw = localStorage.getItem("gs_user");
    if (!storedUserRaw) {
      setErr("No hay ninguna cuenta registrada. Registrate primero.");
      return;
    }

    const storedUser = JSON.parse(storedUserRaw);
    const inputClean = id.toLowerCase().trim();

    // 3. Validar que coincida con el email o el gamertag Y la contraseña
    const matchUser = inputClean === storedUser.email || inputClean === storedUser.gamertag.toLowerCase();
    const matchPass = pass === storedUser.password;

    if (matchUser && matchPass) {
      setErr("");
      nav("home"); // Único camino a la home si todo es correcto
    } else {
      setErr("Correo/Gamertag o contraseña incorrectos.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg }} className="flex flex-col">
      <AuthHeader />
      <AuthShell>
        <CardWrap maxWidth={500}>
          <CardHead title="INICIAR SESIÓN" sub="Bienvenido de vuelta, gamer" />
          
          <div className="flex flex-col gap-5 p-8">
            <div>
              <Label>Correo o Gamertag</Label>
              <Field icon="fa-user" placeholder="correo@ejemplo.com o tu gamertag" value={id} onChange={setId} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label>Contraseña</Label>
                <button type="button" onClick={() => nav("reset")}
                  className="text-xs bg-transparent border-none cursor-pointer transition-all"
                  style={{ color: C.muted }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <Field icon="fa-lock" type={showPass ? "text" : "password"} placeholder="Tu contraseña" value={pass} onChange={setPass}
                right={
                  <button type="button" onClick={() => setShowPass((v) => !v)} className="pr-3 bg-transparent border-none cursor-pointer text-xs" style={{ color: C.muted }}>
                    <i className={`fa-solid ${showPass ? "fa-eye-slash" : "fa-eye"}`} />
                  </button>
                }
              />
            </div>

            {err && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500 text-red-400 text-xs font-bold">
                {err}
              </div>
            )}

            {/* Botón nativo blindado para evitar fallos de componentes externos */}
            <button
              type="button"
              onClick={handleLogin}
              className="w-full py-3 rounded-lg font-bold flex items-center justify-center cursor-pointer transition-all shadow-lg"
              style={{ background: C.cyan, color: "#000", border: "none" }}
            >
              <i className="fa-solid fa-right-to-bracket mr-2" />INGRESAR
            </button>

            <p className="text-center text-sm" style={{ color: C.muted }}>
              ¿No tenés una cuenta?{" "}<TextLink onClick={() => nav("register")}>Registrate acá</TextLink>
            </p>
          </div>
        </CardWrap>
      </AuthShell>
    </div>
  );
}
// ─── Screen 3: Reset Password ─────────────────────────────────────────────────
function ResetScreen({ nav }: { nav: (s: Screen) => void }) {
  const [email, setEmail] = useState("");

  return (
    <div style={{ minHeight: "100vh", background: C.bg }} className="flex flex-col">
      <AuthHeader />
      <AuthShell>
        <CardWrap maxWidth={480}>
          <CardHead title="RESTABLECER CONTRASEÑA" sub="Ingresá tu correo y te enviamos el enlace de recuperación" />
          <div className="flex flex-col gap-5 p-8">
            <div>
              <Label>Correo Electrónico registrado</Label>
              <Field icon="fa-envelope" type="email" placeholder="tu@correo.com" value={email} onChange={setEmail} />
            </div>
            <BtnCyan onClick={() => nav("newpass")}>
              <i className="fa-solid fa-paper-plane mr-2" />ENVIAR ENLACE
            </BtnCyan>
            <p className="text-center text-sm" style={{ color: C.muted }}>
              <TextLink onClick={() => nav("login")}>Volver al Login</TextLink>
            </p>
          </div>
        </CardWrap>
      </AuthShell>
    </div>
  );
}

// ─── Screen 4: New Password ───────────────────────────────────────────────────
function NewPassScreen({ nav }: { nav: (s: Screen) => void }) {
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");

  const handleResetPass = () => {
    if (!pass.trim() || !confirm.trim()) {
      setErr("Por favor completá todos los campos.");
      return;
    }
    if (pass.length < 6) {
      setErr("Mínimo 6 caracteres");
      return;
    }
    if (pass !== confirm) {
      setErr("Las contraseñas no coinciden");
      return;
    }

    // Actualizamos la contraseña en el localStorage si existe el usuario
    const storedUserRaw = localStorage.getItem("gs_user");
    if (storedUserRaw) {
      const storedUser = JSON.parse(storedUserRaw);
      storedUser.password = pass;
      localStorage.setItem("gs_user", JSON.stringify(storedUser));
    }

    alert("¡Contraseña actualizada con éxito!");
    nav("login");
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg }} className="flex flex-col">
      <AuthHeader />
      <AuthShell>
        <CardWrap maxWidth={480}>
          <CardHead title="NUEVA CONTRASEÑA" sub="Elegí una contraseña segura para tu cuenta" />
          
          <div className="flex flex-col gap-5 p-8">
            <div>
              <Label>Nueva Contraseña</Label>
              <Field icon="fa-lock" type="password" placeholder="Mínimo 6 caracteres" value={pass} onChange={setPass} />
            </div>
            <div>
              <Label>Confirmar Nueva Contraseña</Label>
              <Field icon="fa-lock-open" type="password" placeholder="Repetí la contraseña" value={confirm} onChange={setConfirm} />
            </div>

            {err && <p className="text-xs" style={{ color: "#f87171" }}>{err}</p>}

            <BtnCyan type="button" onClick={handleResetPass}>
              <i className="fa-solid fa-floppy-disk mr-2" />GUARDAR Y CONTINUAR
            </BtnCyan>

            <p className="text-center text-sm" style={{ color: C.muted }}>
              <TextLink onClick={() => nav("login")}>Volver al Login</TextLink>
            </p>
          </div>
        </CardWrap>
      </AuthShell>
    </div>
  );
}

// ─── Squad data ───────────────────────────────────────────────────────────────
type Member = { name: string; avatar: string; mic: boolean };
type Squad = { id: number; filled: number; total: number; mode: "2v2" | "3v3" | "4v4"; rank: string; rankColor: string; platform: "PC" | "PS4"; full: boolean; mic: boolean; members: Member[] };

const SQUADS: Squad[] = [
  { id: 104, filled: 2, total: 3, mode: "3v3", rank: "Platino", rankColor: "#94a3b8", platform: "PC", full: false, mic: true, members: [{ name: "usaA983", avatar: "https://i.pravatar.cc/100?img=11", mic: true }, { name: "madenih19", avatar: "https://i.pravatar.cc/100?img=33", mic: true }] },
  { id: 105, filled: 1, total: 2, mode: "2v2", rank: "Diamante", rankColor: "#38bdf8", platform: "PS4", full: false, mic: true, members: [{ name: "StarBlaze", avatar: "https://i.pravatar.cc/100?img=47", mic: true }] },
  { id: 106, filled: 3, total: 3, mode: "3v3", rank: "Champion", rankColor: "#f59e0b", platform: "PC", full: true, mic: false, members: [{ name: "Gamer_Pro99", avatar: "https://i.pravatar.cc/100?img=68", mic: false }, { name: "NxBolt", avatar: "https://i.pravatar.cc/100?img=52", mic: true }, { name: "VelocityX", avatar: "https://i.pravatar.cc/100?img=15", mic: false }] },
  { id: 107, filled: 2, total: 4, mode: "4v4", rank: "Diamante", rankColor: "#38bdf8", platform: "PC", full: false, mic: true, members: [{ name: "SkyRocket", avatar: "https://i.pravatar.cc/100?img=60", mic: true }, { name: "AceDriver", avatar: "https://i.pravatar.cc/100?img=25", mic: false }] },
  { id: 108, filled: 1, total: 3, mode: "3v3", rank: "Platino", rankColor: "#94a3b8", platform: "PS4", full: false, mic: false, members: [{ name: "DriftKing", avatar: "https://i.pravatar.cc/100?img=8", mic: false }] },
  { id: 109, filled: 4, total: 4, mode: "4v4", rank: "Champion", rankColor: "#f59e0b", platform: "PC", full: true, mic: true, members: [{ name: "ZephyrRL", avatar: "https://i.pravatar.cc/100?img=41", mic: true }, { name: "NovaBurst", avatar: "https://i.pravatar.cc/100?img=57", mic: true }, { name: "PulseWave", avatar: "https://i.pravatar.cc/100?img=29", mic: true }, { name: "IronFlux", avatar: "https://i.pravatar.cc/100?img=6", mic: false }] },
];

function SlotPips({ filled, total }: { filled: number; total: number }) {
  return (
    <div className="flex gap-1.5 items-center">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="rounded-full" style={{ width: "7px", height: "7px", background: i < filled ? C.cyan : "rgba(255,255,255,0.1)", boxShadow: i < filled ? "0 0 5px rgba(0,240,255,0.65)" : "none" }} />
      ))}
      <span className="text-xs font-bold ml-1" style={{ color: C.muted }}>{filled}/{total}</span>
    </div>
  );
}

function SquadCard({ squad, onJoin }: { squad: Squad; onJoin: () => void }) {
  const empty = squad.total - squad.filled;
  return (
    <div
      className="rounded-2xl flex flex-col overflow-hidden transition-all duration-300"
      style={{ background: C.card, border: `1px solid ${squad.full ? "rgba(71,85,105,0.4)" : C.border}`, backdropFilter: "blur(10px)" }}
      onMouseEnter={(e) => { if (!squad.full) e.currentTarget.style.boxShadow = "0 0 22px rgba(0,240,255,0.13)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
    >
      <div className="flex justify-between items-center px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2.5">
          <span className="font-orbitron text-sm font-black" style={{ color: C.main }}>SQUAD #{squad.id}</span>
          {squad.mic && <i className="fa-solid fa-microphone text-xs" style={{ color: C.cyan }} />}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: squad.full ? "rgba(71,85,105,0.25)" : `${squad.rankColor}22`, color: squad.full ? "#64748b" : squad.rankColor, border: `1px solid ${squad.full ? "#475569" : squad.rankColor + "44"}` }}>{squad.rank}</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: "rgba(176,38,255,0.15)", color: C.purple, border: "1px solid rgba(176,38,255,0.3)" }}>{squad.platform}</span>
        </div>
      </div>
      <div className="px-5 pt-3 pb-2 flex items-center justify-between">
        <span className="text-xs font-semibold" style={{ color: C.muted }}>
          <i className="fa-solid fa-gamepad mr-1.5" style={{ color: squad.rankColor, opacity: 0.7 }} />{squad.mode} Rankeado
        </span>
        <SlotPips filled={squad.filled} total={squad.total} />
      </div>
      <div className="px-5 pb-3 flex flex-col gap-2 flex-1">
        {squad.members.map((m) => (
          <div key={m.name} className="flex items-center gap-2.5">
            <div className="relative shrink-0">
              <img src={m.avatar} alt={m.name} className="w-7 h-7 rounded-full" style={{ border: "1.5px solid rgba(0,240,255,0.4)" }} />
              <span className="absolute -bottom-0.5 -right-0.5 rounded-full" style={{ width: "8px", height: "8px", background: C.green, border: "1.5px solid #080c14", boxShadow: "0 0 4px rgba(0,255,102,0.7)" }} />
            </div>
            <span className="text-xs font-semibold flex-1 truncate" style={{ color: C.main }}>{m.name}</span>
            <span className="text-xs font-bold" style={{ color: C.green }}>EN LÍNEA</span>
            <i className={`fa-solid ${m.mic ? "fa-microphone" : "fa-microphone-slash"} text-xs`} style={{ color: m.mic ? C.cyan : "#475569" }} />
          </div>
        ))}
        {Array.from({ length: empty }).map((_, i) => (
          <div key={`e${i}`} className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ border: "1.5px dashed #334155", background: "rgba(255,255,255,0.02)" }}>
              <i className="fa-solid fa-user-plus" style={{ color: "#334155", fontSize: "9px" }} />
            </div>
            <span className="text-xs italic" style={{ color: "#334155" }}>Lugar disponible</span>
          </div>
        ))}
      </div>
      <div className="px-4 pb-4 pt-2">
        {squad.full ? (
          <div className="w-full rounded-lg py-2.5 text-center font-orbitron font-black text-xs" style={{ background: "rgba(71,85,105,0.15)", border: "2px solid #475569", color: "#475569" }}>SALA LLENA</div>
        ) : (
          <button
            onClick={onJoin}
            className="w-full rounded-lg py-2.5 font-orbitron font-black text-xs text-white cursor-pointer transition-all duration-200"
            style={{ background: "linear-gradient(135deg,rgba(0,240,255,0.2),rgba(0,240,255,0.5))", border: `2px solid ${C.cyan}`, boxShadow: "0 0 10px rgba(0,240,255,0.28)", letterSpacing: "0.05em" }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = glowCyan; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 0 10px rgba(0,240,255,0.28)"; }}
          >
            <i className="fa-solid fa-right-to-bracket mr-1.5" />UNIRME · {squad.mode} {squad.rank}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Crear Squad Modal ────────────────────────────────────────────────────────
function CreateSquadModal({ onClose, onCreate }: { onClose: () => void; onCreate: () => void }) {
  const [name, setName] = useState("");
  const [mode, setMode] = useState("3v3");
  const [rank, setRank] = useState("Platino");
  const [platform, setPlatform] = useState("PC");
  const [mic, setMic] = useState(false);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 px-4"
      style={{ background: "rgba(8,12,20,0.88)", backdropFilter: "blur(8px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full rounded-2xl overflow-hidden" style={{ maxWidth: "540px", background: C.card, border: `1px solid ${C.border}`, backdropFilter: "blur(22px)", boxShadow: "0 0 60px rgba(0,240,255,0.1), 0 0 100px rgba(176,38,255,0.08)" }}>
        <div className="flex items-center justify-between px-7 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(176,38,255,0.04)" }}>
          <div>
            <div className="font-orbitron text-lg font-black" style={{ color: C.purple, borderLeft: `4px solid ${C.cyan}`, paddingLeft: "12px" }}>CREAR NUEVO SQUAD</div>
            <p className="text-xs mt-0.5 pl-[16px]" style={{ color: C.muted }}>Configurá tu sala y publicala</p>
          </div>
          <button onClick={onClose} className="bg-transparent border-none cursor-pointer text-lg" style={{ color: C.muted }} onMouseEnter={(e) => (e.currentTarget.style.color = C.main)} onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="flex flex-col gap-5 p-7">
          <div>
            <Label>Nombre de Sala</Label>
            <Field icon="fa-tag" placeholder="Ej: Pro Squad #1" value={name} onChange={setName} />
          </div>
          <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <Label>Modo de Juego</Label>
              <Sel icon="fa-gamepad" value={mode} onChange={setMode} options={["2v2", "3v3", "4v4"]} />
            </div>
            <div>
              <Label>Rango Requerido</Label>
              <Sel icon="fa-star" value={rank} onChange={setRank} options={["Platino", "Diamante", "Champion"]} />
            </div>
            <div>
              <Label>Plataforma</Label>
              <Sel icon="fa-display" value={platform} onChange={setPlatform} options={["PC", "PS4"]} />
            </div>
            <div className="flex flex-col justify-end">
              <MicToggle value={mic} onChange={setMic} label="Exigir Micrófono" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <BtnGhost onClick={onClose}>Cancelar</BtnGhost>
            <BtnPurple onClick={() => { if (name.trim()) onCreate(); }}>
              <i className="fa-solid fa-rocket mr-2" />PUBLICAR SQUAD
            </BtnPurple>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Inicio (Squad Search) ───────────────────────────────────────────────
function InicioTab({ nav }: { nav: (s: Screen) => void }) {
  const [search, setSearch] = useState("");
  const [rank, setRank] = useState("Todos");
  const [platform, setPlatform] = useState("Todos");
  const [micOnly, setMicOnly] = useState(false);
  const [modal, setModal] = useState(false);

  const filtered = SQUADS.filter((s) => {
    const q = search.toLowerCase();
    const matchQ = !q || `squad #${s.id}`.includes(q) || s.members.some((m) => m.name.toLowerCase().includes(q));
    const matchR = rank === "Todos" || s.rank === rank;
    const matchP = platform === "Todos" || s.platform === platform;
    const matchM = !micOnly || s.mic;
    return matchQ && matchR && matchP && matchM;
  });

  const fSel: React.CSSProperties = {
    background: C.input, border: "1px solid rgba(51,65,85,0.8)", color: C.main,
    borderRadius: "8px", padding: "8px 32px 8px 10px", fontSize: "13px",
    outline: "none", appearance: "none", cursor: "pointer",
  };

  return (
    <div className="max-w-[1380px] mx-auto mt-8 px-6 pb-20">
      <PageTitle>
        BÚSQUEDA DE SQUAD
        <span className="font-rajdhani text-base font-bold" style={{ color: C.muted }}>
          {filtered.length} sala{filtered.length !== 1 ? "s" : ""} activa{filtered.length !== 1 ? "s" : ""}
        </span>
      </PageTitle>

      <div className="flex flex-wrap gap-3 items-center rounded-xl px-5 py-3 mb-8" style={{ background: C.card, border: `1px solid ${C.border}`, backdropFilter: "blur(10px)" }}>
        <div className="relative flex-1 min-w-[180px]">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: C.muted }} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar jugadores..."
            className="w-full rounded-lg pl-8 pr-4 py-2 text-sm outline-none"
            style={{ background: C.input, border: "1px solid rgba(51,65,85,0.8)", color: C.main, fontSize: "13px" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(0,240,255,0.5)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(51,65,85,0.8)")}
          />
        </div>
        <div style={{ width: "1px", height: "26px", background: "rgba(255,255,255,0.08)" }} />
        <div className="font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-2 shrink-0" style={{ background: "rgba(0,240,255,0.1)", border: `1px solid ${C.cyan}`, color: C.cyan }}>
          <i className="fa-solid fa-gamepad" /> Rocket League
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: C.muted }}>Rango</span>
          <div className="relative">
            <select value={rank} onChange={(e) => setRank(e.target.value)} style={fSel}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(0,240,255,0.5)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(51,65,85,0.8)")}
            >
              <option value="Todos">Todos</option>
              <option value="Platino">Platino</option>
              <option value="Diamante">Diamante</option>
              <option value="Champion">Champion</option>
            </select>
            <i className="fa-solid fa-chevron-down absolute right-2.5 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: C.muted }} />
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: C.muted }}>Plataforma</span>
          <div className="relative">
            <select value={platform} onChange={(e) => setPlatform(e.target.value)} style={fSel}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(0,240,255,0.5)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(51,65,85,0.8)")}
            >
              <option value="Todos">Todas</option>
              <option value="PC">PC</option>
              <option value="PS4">PS4</option>
            </select>
            <i className="fa-solid fa-chevron-down absolute right-2.5 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: C.muted }} />
          </div>
        </div>
        <MicToggle value={micOnly} onChange={setMicOnly} />
        <div style={{ width: "1px", height: "26px", background: "rgba(255,255,255,0.08)" }} />
        <button
          onClick={() => setModal(true)}
          className="font-orbitron font-black text-xs px-5 py-2 rounded-lg cursor-pointer border-none transition-all shrink-0"
          style={{ background: "linear-gradient(135deg,rgba(176,38,255,0.22),rgba(176,38,255,0.5))", border: `1.5px solid ${C.purple}`, color: "#fff", boxShadow: "0 0 10px rgba(176,38,255,0.2)", letterSpacing: "0.04em" }}
          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = glowPurple)}
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 0 10px rgba(176,38,255,0.2)")}
        >
          <i className="fa-solid fa-plus mr-1.5" />CREAR SQUAD
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 gap-5">
          <i className="fa-solid fa-satellite-dish text-4xl" style={{ color: C.muted }} />
          <p className="font-orbitron text-base" style={{ color: C.muted }}>Sin resultados para esos filtros</p>
          <button onClick={() => { setSearch(""); setRank("Todos"); setPlatform("Todos"); setMicOnly(false); }} className="text-sm bg-transparent border-none cursor-pointer" style={{ color: C.cyan }}>Limpiar filtros</button>
        </div>
      ) : (
        <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
          {filtered.map((s) => <SquadCard key={s.id} squad={s} onJoin={() => nav("lobby")} />)}
        </div>
      )}

      {modal && <CreateSquadModal onClose={() => setModal(false)} onCreate={() => { setModal(false); nav("lobby"); }} />}
    </div>
  );
}

// ─── Tab: Partidas ────────────────────────────────────────────────────────────
const TORNEOS = [
  { id: 1, nombre: "Copa Semanal 2v2", modo: "2v2 Rankeado", fecha: "Sáb 07 Sep", hora: "20:00 ARG", cupos: 12, maxCupos: 16, premio: "500 GS Coins", color: C.cyan },
  { id: 2, nombre: "Torneo Flash 3v3", modo: "3v3 Clasificatorio", fecha: "Dom 08 Sep", hora: "18:30 ARG", cupos: 6, maxCupos: 8, premio: "1,200 GS Coins", color: C.purple },
  { id: 3, nombre: "Liga Mensual PC", modo: "3v3 Elite", fecha: "Vie 13 Sep", hora: "21:00 ARG", cupos: 20, maxCupos: 32, premio: "Trofeo Digital", color: "#f59e0b" },
];

const DESAFIOS = [
  { id: 1, creador: "ZephyrRL", avatar: "https://i.pravatar.cc/100?img=41", plataforma: "PC" as "PC"|"PS4", modo: "2v2", rango: "Diamante", mic: true, descripcion: "Buscamos dúo para serie de 5 partidas. Comunicación activa.", hace: "5 min" },
  { id: 2, creador: "StarBlaze", avatar: "https://i.pravatar.cc/100?img=47", plataforma: "PS4" as "PC"|"PS4", modo: "3v3", rango: "Platino", mic: false, descripcion: "Exhibición amistosa, sin ranking. Cualquier nivel bienvenido.", hace: "12 min" },
  { id: 3, creador: "IronFlux", avatar: "https://i.pravatar.cc/100?img=6", plataforma: "PC" as "PC"|"PS4", modo: "4v4", rango: "Champion", mic: true, descripcion: "Clan war practice. Necesitamos 2 jugadores Champion+.", hace: "28 min" },
  { id: 4, creador: "DriftKing", avatar: "https://i.pravatar.cc/100?img=8", plataforma: "PS4" as "PC"|"PS4", modo: "2v2", rango: "Platino", mic: false, descripcion: "Partida de exhibición casual, horario flexible esta noche.", hace: "41 min" },
];

function PartidasTab() {
  const [inscripto, setInscripto] = useState<number[]>([]);
  const [unido, setUnido] = useState<number[]>([]);

  return (
    <div className="max-w-[1380px] mx-auto mt-8 px-6 pb-20">
      <PageTitle><i className="fa-solid fa-trophy mr-2" />PRÓXIMOS TORNEOS</PageTitle>
      <div className="grid gap-5 mb-12" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        {TORNEOS.map((t) => {
          const pct = Math.round((t.cupos / t.maxCupos) * 100);
          const isIn = inscripto.includes(t.id);
          return (
            <div key={t.id} className="rounded-2xl overflow-hidden flex flex-col transition-all duration-300"
              style={{ background: C.card, border: `1px solid ${t.color}44`, backdropFilter: "blur(10px)" }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 0 22px ${t.color}22`; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
            >
              <div className="px-5 py-4 flex items-start justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: `${t.color}08` }}>
                <div>
                  <div className="font-orbitron text-base font-black" style={{ color: t.color }}>{t.nombre}</div>
                  <div className="text-xs mt-1 font-semibold" style={{ color: C.muted }}>{t.modo}</div>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded" style={{ background: `${t.color}18`, color: t.color, border: `1px solid ${t.color}44` }}>
                  <i className="fa-solid fa-gift mr-1" />{t.premio}
                </span>
              </div>
              <div className="px-5 py-4 flex flex-col gap-3 flex-1">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-xs" style={{ color: C.muted }}>
                    <i className="fa-solid fa-calendar-days" style={{ color: t.color }} />{t.fecha}
                  </div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: C.muted }}>
                    <i className="fa-solid fa-clock" style={{ color: t.color }} />{t.hora}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5" style={{ color: C.muted }}>
                    <span>Cupos disponibles</span>
                    <span style={{ color: t.color, fontWeight: 700 }}>{t.cupos}/{t.maxCupos}</span>
                  </div>
                  <div className="rounded-full overflow-hidden" style={{ height: "5px", background: "rgba(255,255,255,0.07)" }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: t.color, boxShadow: `0 0 6px ${t.color}` }} />
                  </div>
                </div>
                <button
                  onClick={() => setInscripto((v) => isIn ? v.filter((x) => x !== t.id) : [...v, t.id])}
                  className="w-full mt-auto font-orbitron font-black text-xs rounded-xl py-3 cursor-pointer border-none transition-all"
                  style={{
                    background: isIn ? "rgba(0,255,102,0.1)" : `linear-gradient(135deg,${t.color}44,${t.color}88)`,
                    border: `2px solid ${isIn ? C.green : t.color}`,
                    color: isIn ? C.green : "#fff",
                    boxShadow: isIn ? "none" : `0 0 12px ${t.color}44`,
                    letterSpacing: "0.05em",
                  }}
                >
                  {isIn ? <><i className="fa-solid fa-check mr-2" />INSCRIPTO</> : <><i className="fa-solid fa-right-to-bracket mr-2" />INSCRIBIRSE</>}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <PageTitle><i className="fa-solid fa-swords mr-2" />DESAFÍOS ABIERTOS</PageTitle>
      <div className="rounded-xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.border}`, backdropFilter: "blur(10px)" }}>
        <div className="grid text-xs font-bold uppercase tracking-widest px-6 py-3" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 3fr auto", color: C.muted, borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,240,255,0.025)" }}>
          <span>Jugador</span><span>Plataforma</span><span>Modo</span><span>Rango</span><span>Descripción</span><span>Acción</span>
        </div>
        {DESAFIOS.map((d, i) => {
          const joined = unido.includes(d.id);
          return (
            <div key={d.id} className="grid items-center px-6 py-4 transition-all" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 3fr auto", borderBottom: i < DESAFIOS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,240,255,0.025)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <PlayerChip name={d.creador} avatar={d.avatar} rango={d.rango} plataforma={d.plataforma} mic={d.mic}>
                <div className="flex items-center gap-3">
                  <img src={d.avatar} alt={d.creador} className="w-8 h-8 rounded-full" style={{ border: `1.5px solid ${C.border}` }} />
                  <div>
                    <div className="font-bold text-sm" style={{ color: C.main }}>{d.creador}</div>
                    <div className="text-xs" style={{ color: C.muted }}>{d.hace}</div>
                  </div>
                </div>
              </PlayerChip>
              <span className="text-xs font-bold px-2 py-1 rounded w-fit" style={{ background: "rgba(176,38,255,0.12)", color: C.purple, border: "1px solid rgba(176,38,255,0.3)" }}>{d.plataforma}</span>
              <span className="font-orbitron text-xs font-black" style={{ color: C.cyan }}>{d.modo}</span>
              <span className="text-xs font-semibold" style={{ color: C.muted }}>{d.rango}</span>
              <span className="text-xs pr-4" style={{ color: C.muted }}>{d.descripcion}</span>
              <button
                onClick={() => setUnido((v) => joined ? v.filter((x) => x !== d.id) : [...v, d.id])}
                className="font-orbitron font-black text-xs px-4 py-2 rounded-lg cursor-pointer border-none transition-all whitespace-nowrap"
                style={{
                  background: joined ? "rgba(0,255,102,0.1)" : "linear-gradient(135deg,rgba(0,240,255,0.2),rgba(0,240,255,0.5))",
                  border: `1.5px solid ${joined ? C.green : C.cyan}`,
                  color: joined ? C.green : "#fff",
                  boxShadow: joined ? "none" : "0 0 8px rgba(0,240,255,0.25)",
                }}
              >
                {joined ? <><i className="fa-solid fa-check mr-1.5" />UNIDO</> : <><i className="fa-solid fa-plus mr-1.5" />UNIRSE</>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tab: Equipos ─────────────────────────────────────────────────────────────
const CLAN_ROSTER = [
  { name: "usaA983", avatar: "https://i.pravatar.cc/100?img=11", rol: "Capitán", rango: "Champion", plataforma: "PC", estado: "EN LÍNEA" },
  { name: "madenih19", avatar: "https://i.pravatar.cc/100?img=33", rol: "Titular", rango: "Diamante II", plataforma: "PC", estado: "EN LÍNEA" },
  { name: "NxBolt", avatar: "https://i.pravatar.cc/100?img=52", rol: "Titular", rango: "Diamante I", plataforma: "PS4", estado: "EN LÍNEA" },
  { name: "StarBlaze", avatar: "https://i.pravatar.cc/100?img=47", rol: "Titular", rango: "Platino III", plataforma: "PS4", estado: "AUSENTE" },
  { name: "AceDriver", avatar: "https://i.pravatar.cc/100?img=25", rol: "Suplente", rango: "Platino I", plataforma: "PC", estado: "DESCONECTADO" },
  { name: "DriftKing", avatar: "https://i.pravatar.cc/100?img=8", rol: "Suplente", rango: "Oro III", plataforma: "PS4", estado: "DESCONECTADO" },
];

const ROL_COLOR: Record<string, string> = { "Capitán": C.purple, "Titular": C.cyan, "Suplente": "#94a3b8" };
const ESTADO_COLOR: Record<string, string> = { "EN LÍNEA": C.green, "AUSENTE": "#f59e0b", "DESCONECTADO": "#475569" };

function EquiposTab() {
  return (
    <div className="max-w-[1380px] mx-auto mt-8 px-6 pb-20">
      <PageTitle><i className="fa-solid fa-shield-halved mr-2" />MI EQUIPO</PageTitle>

      {/* Clan card */}
      <div className="rounded-2xl overflow-hidden mb-10" style={{ background: C.card, border: `1px solid ${C.border}`, backdropFilter: "blur(14px)", boxShadow: "0 0 60px rgba(176,38,255,0.06)" }}>
        <div className="flex items-center gap-8 px-8 py-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(176,38,255,0.03)" }}>
          {/* Clan badge */}
          <div className="shrink-0 rounded-2xl flex items-center justify-center" style={{ width: "80px", height: "80px", background: "linear-gradient(135deg,rgba(176,38,255,0.25),rgba(0,240,255,0.15))", border: `2px solid ${C.purple}`, boxShadow: glowPurple }}>
            <i className="fa-solid fa-shield-halved text-3xl" style={{ color: C.purple }} />
          </div>
          <div className="flex-1">
            <div className="font-orbitron text-2xl font-black" style={{ color: C.main }}>NEON APEX CREW</div>
            <div className="text-sm mt-1 flex items-center gap-3" style={{ color: C.muted }}>
              <span><i className="fa-solid fa-users mr-1.5" />{CLAN_ROSTER.length} integrantes</span>
              <span style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
              <span><i className="fa-solid fa-gamepad mr-1.5" />Rocket League</span>
              <span style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
              <span><i className="fa-solid fa-calendar-days mr-1.5" />Fundado Ago 2025</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="font-orbitron text-xs font-black px-3 py-1.5 rounded-lg" style={{ background: "rgba(56,189,248,0.12)", color: "#38bdf8", border: "1px solid rgba(56,189,248,0.3)" }}>
              <i className="fa-solid fa-star mr-1.5" />RANGO PROM: DIAMANTE
            </span>
            <span className="text-xs font-semibold" style={{ color: C.muted }}>
              <i className="fa-solid fa-trophy mr-1.5" style={{ color: "#f59e0b" }} />23 torneos disputados · 14 victorias
            </span>
          </div>
        </div>

        {/* Roster */}
        <div className="p-6">
          <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: C.muted, letterSpacing: "0.1em" }}>ROSTER OFICIAL</div>
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(2,1fr)" }}>
            {CLAN_ROSTER.map((m) => (
              <div key={m.name} className="flex items-center gap-4 rounded-xl px-5 py-4 transition-all"
                style={{ background: C.input, border: `1px solid rgba(255,255,255,0.05)` }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${ROL_COLOR[m.rol]}44`; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; }}
              >
                <PlayerChip name={m.name} avatar={m.avatar} rango={m.rango} plataforma={m.plataforma as "PC"|"PS4"} mic={true}>
                  <div className="relative shrink-0 cursor-pointer">
                    <img src={m.avatar} alt={m.name} className="w-11 h-11 rounded-full" style={{ border: `2px solid ${ROL_COLOR[m.rol]}` }} />
                    <span className="absolute -bottom-0.5 -right-0.5 rounded-full" style={{ width: "10px", height: "10px", background: ESTADO_COLOR[m.estado], border: "1.5px solid #1e293b", boxShadow: m.estado === "EN LÍNEA" ? "0 0 5px rgba(0,255,102,0.7)" : "none" }} />
                  </div>
                </PlayerChip>
                <PlayerChip name={m.name} avatar={m.avatar} rango={m.rango} plataforma={m.plataforma as "PC"|"PS4"} mic={true}>
                  <div className="flex-1 min-w-0 cursor-pointer">
                    <div className="font-bold text-sm truncate" style={{ color: C.main }}>{m.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: C.muted }}>{m.rango}</div>
                  </div>
                </PlayerChip>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: `${ROL_COLOR[m.rol]}18`, color: ROL_COLOR[m.rol], border: `1px solid ${ROL_COLOR[m.rol]}44` }}>{m.rol}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: "rgba(176,38,255,0.1)", color: C.purple, border: "1px solid rgba(176,38,255,0.25)" }}>{m.plataforma}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Comunidad ───────────────────────────────────────────────────────────
type PostCategory = "Todos" | "Búsqueda de equipo" | "Clips" | "General";

const INITIAL_POSTS = [
  { id: 1, user: "ZephyrRL", avatar: "https://i.pravatar.cc/100?img=41", plataforma: "PC" as "PC"|"PS4", rango: "Champion", mic: true, categoria: "Búsqueda de equipo", texto: "Busco equipo Diamante+ para ranked 3v3. Disponible noches y fines de semana. Micrófono activo siempre.", hace: "3 min", likes: 12 },
  { id: 2, user: "NovaBurst", avatar: "https://i.pravatar.cc/100?img=57", plataforma: "PS4" as "PC"|"PS4", rango: "Diamante II", mic: true, categoria: "Clips", texto: "¡Acabo de hacer el mejor doble toque de mi vida en Ranked! Alguien más jugando desde PS4 esta noche?", hace: "11 min", likes: 34 },
  { id: 3, user: "usaA983", avatar: "https://i.pravatar.cc/100?img=11", plataforma: "PC" as "PC"|"PS4", rango: "Platino III", mic: true, categoria: "General", texto: "La Season 14 está brutal. Nuevo mapa Starbase ARC es un caos total. ¿Qué les parece?", hace: "29 min", likes: 8 },
  { id: 4, user: "PulseWave", avatar: "https://i.pravatar.cc/100?img=29", plataforma: "PC" as "PC"|"PS4", rango: "Champion", mic: false, categoria: "Búsqueda de equipo", texto: "Clan buscando 2 titulares PC, rango mínimo Platino III. DM para más info.", hace: "47 min", likes: 5 },
  { id: 5, user: "StarBlaze", avatar: "https://i.pravatar.cc/100?img=47", plataforma: "PS4" as "PC"|"PS4", rango: "Diamante I", mic: false, categoria: "General", texto: "Alguien más nota lag en PS4 después del último parche? Hay hilo en el foro oficial pero sin respuesta.", hace: "1h", likes: 19 },
];

const NOTICIAS = [
  { titulo: "Season 14: Nuevo Mapa", desc: "Starbase ARC llega este 10 de Sep con física renovada.", icono: "fa-rocket", color: C.cyan },
  { titulo: "Parche 2.4.1", desc: "Correcciones de lag en servidores PS4 y mejora de hitbox.", icono: "fa-wrench", color: "#f59e0b" },
  { titulo: "Torneo World Cup", desc: "Clasificatorias abiertas 15 Sep. Inscribite en Partidas.", icono: "fa-trophy", color: C.purple },
];

const ACTIVOS: { name: string; avatar: string; plataforma: "PC" | "PS4"; rango: string }[] = [
  { name: "IronFlux", avatar: "https://i.pravatar.cc/100?img=6", plataforma: "PC", rango: "Champion" },
  { name: "AceDriver", avatar: "https://i.pravatar.cc/100?img=25", plataforma: "PC", rango: "Diamante" },
  { name: "DriftKing", avatar: "https://i.pravatar.cc/100?img=8", plataforma: "PS4", rango: "Platino" },
  { name: "NxBolt", avatar: "https://i.pravatar.cc/100?img=52", plataforma: "PS4", rango: "Diamante" },
  { name: "VelocityX", avatar: "https://i.pravatar.cc/100?img=15", plataforma: "PC", rango: "Champion" },
];

function ComunidadTab() {
  const [cat, setCat] = useState<PostCategory>("Todos");
  const [texto, setTexto] = useState("");
  const [postCat, setPostCat] = useState<PostCategory>("General");
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [liked, setLiked] = useState<number[]>([]);

  const cats: PostCategory[] = ["Todos", "Búsqueda de equipo", "Clips", "General"];
  const filtered = cat === "Todos" ? posts : posts.filter((p) => p.categoria === cat);

  const publish = () => {
    if (!texto.trim()) return;
    setPosts((prev) => [{
      id: Date.now(), user: "madenih19", avatar: "https://i.pravatar.cc/100?img=33",
      plataforma: "PC" as "PC"|"PS4", rango: "Diamante II", mic: true,
      categoria: postCat, texto: texto.trim(), hace: "ahora", likes: 0,
    }, ...prev]);
    setTexto("");
  };

  const CAT_COLOR: Record<string, string> = { "Búsqueda de equipo": C.cyan, "Clips": C.purple, "General": "#f59e0b" };

  return (
    <div className="max-w-[1380px] mx-auto mt-8 px-6 pb-20">
      <div className="grid gap-8" style={{ gridTemplateColumns: "1fr 320px" }}>
        {/* Feed central */}
        <div className="flex flex-col gap-6">
          {/* Composer */}
          <PanelBox>
            <div className="flex items-start gap-3 mb-4">
              <img src="https://i.pravatar.cc/100?img=33" alt="yo" className="w-10 h-10 rounded-full shrink-0" style={{ border: `2px solid ${C.cyan}` }} />
              <textarea
                value={texto} onChange={(e) => setTexto(e.target.value)}
                placeholder="Escribí una publicación..."
                rows={3}
                className="flex-1 rounded-xl px-4 py-3 text-sm resize-none outline-none transition-all"
                style={{ background: C.input, border: "1px solid rgba(51,65,85,0.8)", color: C.main }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(0,240,255,0.5)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(51,65,85,0.8)")}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: C.muted }}>Categoría</span>
                {(["Búsqueda de equipo", "Clips", "General"] as PostCategory[]).map((c) => (
                  <button key={c} onClick={() => setPostCat(c)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer border-none transition-all"
                    style={{ background: postCat === c ? `${CAT_COLOR[c]}22` : "rgba(255,255,255,0.03)", border: `1px solid ${postCat === c ? CAT_COLOR[c] : "rgba(255,255,255,0.08)"}`, color: postCat === c ? CAT_COLOR[c] : C.muted }}
                  >{c}</button>
                ))}
              </div>
              <BtnCyan onClick={publish} full={false}>
                <i className="fa-solid fa-paper-plane mr-2" />PUBLICAR
              </BtnCyan>
            </div>
          </PanelBox>

          {/* Category filter */}
          <div className="flex gap-2">
            {cats.map((c) => (
              <button key={c} onClick={() => setCat(c)}
                className="font-bold text-xs px-4 py-2 rounded-lg cursor-pointer border-none transition-all"
                style={{ background: cat === c ? "rgba(0,240,255,0.1)" : "rgba(255,255,255,0.03)", border: `1px solid ${cat === c ? C.cyan : "rgba(255,255,255,0.08)"}`, color: cat === c ? C.cyan : C.muted }}
              >{c}</button>
            ))}
          </div>

          {/* Posts */}
          <div className="flex flex-col gap-4">
            {filtered.map((p) => {
              const isLiked = liked.includes(p.id);
              return (
                <PanelBox key={p.id}>
                  <div className="flex items-start gap-3">
                    <PlayerChip name={p.user} avatar={p.avatar} rango={p.rango} plataforma={p.plataforma} mic={p.mic}>
                      <img src={p.avatar} alt={p.user} className="w-9 h-9 rounded-full shrink-0" style={{ border: `1.5px solid ${C.border}` }} />
                    </PlayerChip>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <PlayerChip name={p.user} avatar={p.avatar} rango={p.rango} plataforma={p.plataforma} mic={p.mic}>
                          <span className="font-bold text-sm" style={{ color: C.main }}>{p.user}</span>
                        </PlayerChip>
                        <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: "rgba(176,38,255,0.1)", color: C.purple, border: "1px solid rgba(176,38,255,0.25)" }}>{p.plataforma}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: `${CAT_COLOR[p.categoria]}14`, color: CAT_COLOR[p.categoria], border: `1px solid ${CAT_COLOR[p.categoria]}44` }}>{p.categoria}</span>
                        <span className="text-xs ml-auto" style={{ color: C.muted }}>{p.hace}</span>
                      </div>
                      <p className="text-sm leading-relaxed mb-3" style={{ color: C.main }}>{p.texto}</p>
                      <div className="flex items-center gap-4">
                        <button onClick={() => setLiked((v) => isLiked ? v.filter((x) => x !== p.id) : [...v, p.id])}
                          className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer text-xs font-bold transition-all"
                          style={{ color: isLiked ? C.cyan : C.muted }}
                        >
                          <i className={`fa-${isLiked ? "solid" : "regular"} fa-heart`} />
                          {p.likes + (isLiked ? 1 : 0)}
                        </button>
                        <button className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer text-xs font-bold" style={{ color: C.muted }}>
                          <i className="fa-regular fa-comment" />Responder
                        </button>
                      </div>
                    </div>
                  </div>
                </PanelBox>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          {/* Noticias */}
          <PanelBox>
            <PanelLabel><i className="fa-solid fa-newspaper mr-2" />NOTICIAS RL</PanelLabel>
            <div className="flex flex-col gap-3">
              {NOTICIAS.map((n, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl p-3 transition-all cursor-pointer"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${n.color}44`; e.currentTarget.style.background = `${n.color}08`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                >
                  <div className="rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ width: "32px", height: "32px", background: `${n.color}18`, border: `1px solid ${n.color}44` }}>
                    <i className={`fa-solid ${n.icono} text-xs`} style={{ color: n.color }} />
                  </div>
                  <div>
                    <div className="font-bold text-sm" style={{ color: C.main }}>{n.titulo}</div>
                    <div className="text-xs mt-0.5" style={{ color: C.muted }}>{n.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </PanelBox>

          {/* Jugadores activos */}
          <PanelBox>
            <PanelLabel><i className="fa-solid fa-circle mr-1.5" style={{ color: C.green, fontSize: "7px" }} />JUGADORES ACTIVOS</PanelLabel>
            <div className="flex flex-col gap-2.5">
              {ACTIVOS.map((a) => (
                <PlayerChip key={a.name} name={a.name} avatar={a.avatar} rango={a.rango} plataforma={a.plataforma} mic={true}>
                  <div className="flex items-center gap-3 w-full">
                    <div className="relative shrink-0">
                      <img src={a.avatar} alt={a.name} className="w-8 h-8 rounded-full" style={{ border: `1.5px solid ${C.border}` }} />
                      <span className="absolute -bottom-0.5 -right-0.5 rounded-full" style={{ width: "8px", height: "8px", background: C.green, border: "1.5px solid #0f172a", boxShadow: "0 0 4px rgba(0,255,102,0.7)" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs truncate" style={{ color: C.main }}>{a.name}</div>
                      <div className="text-xs" style={{ color: C.muted }}>{a.rango}</div>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded shrink-0" style={{ background: "rgba(176,38,255,0.1)", color: C.purple, border: "1px solid rgba(176,38,255,0.25)" }}>{a.plataforma}</span>
                  </div>
                </PlayerChip>
              ))}
            </div>
          </PanelBox>
        </div>
      </div>
    </div>
  );
}

// ─── Notifications Dropdown ───────────────────────────────────────────────────
const NOTIFS = [
  { id: 1, icon: "fa-trophy", color: "#f59e0b", text: "Te uniste con éxito al Torneo 2v2" },
  { id: 2, icon: "fa-user-plus", color: "#00F0FF", text: "CyberRockets te envió una invitación de Squad" },
  { id: 3, icon: "fa-rocket", color: "#B026FF", text: "Nueva actualización de Rocket League disponible" },
];

function NotificationsDropdown({ onMarkRead }: { onMarkRead: () => void }) {
  return (
    <div className="absolute right-0 top-full mt-3 rounded-2xl overflow-hidden z-[150]"
      style={{ width: "320px", background: "rgba(8,12,20,0.98)", border: `1px solid ${C.border}`, backdropFilter: "blur(24px)", boxShadow: "0 8px 40px rgba(0,0,0,0.75), 0 0 30px rgba(0,240,255,0.08)" }}
    >
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,240,255,0.025)" }}>
        <span className="font-orbitron text-xs font-black tracking-widest" style={{ color: C.cyan }}>
          <i className="fa-solid fa-bell mr-2" />NOTIFICACIONES
        </span>
        <button onClick={onMarkRead}
          className="font-rajdhani font-bold text-xs px-3 py-1 rounded-lg cursor-pointer border-none transition-all"
          style={{ background: "rgba(0,240,255,0.08)", border: "1px solid rgba(0,240,255,0.3)", color: C.cyan }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,240,255,0.18)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,240,255,0.08)"; }}
        >
          Marcar como leídas
        </button>
      </div>
      <div className="flex flex-col">
        {NOTIFS.map((n, i) => (
          <div key={n.id} className="flex items-start gap-3 px-5 py-4 transition-all cursor-pointer"
            style={{ borderBottom: i < NOTIFS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <div className="rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ width: "32px", height: "32px", background: `${n.color}18`, border: `1px solid ${n.color}44` }}>
              <i className={`fa-solid ${n.icon} text-xs`} style={{ color: n.color }} />
            </div>
            <span className="text-xs leading-relaxed" style={{ color: C.main }}>{n.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Messages Dropdown & Chat Modal ──────────────────────────────────────────
const DM_CHATS = [
  { id: 1, user: "Gonzalo_RL", avatar: "https://i.pravatar.cc/100?img=19", preview: "¿A qué hora jugamos hoy?", time: "2 min", unread: true },
  { id: 2, user: "SQUAD #104", avatar: "https://i.pravatar.cc/100?img=11", preview: "Sala lista", time: "14 min", unread: false },
];

function ChatModal({ chat, onClose }: { chat: typeof DM_CHATS[0]; onClose: () => void }) {
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([
    { from: "them", text: chat.preview },
  ]);

  const send = () => {
    if (!msg.trim()) return;
    setMessages((v) => [...v, { from: "me", text: msg.trim() }]);
    setMsg("");
  };

  return (
    <div className="fixed inset-0 flex items-end justify-end z-[200] pb-6 pr-6"
      style={{ background: "rgba(8,12,20,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="flex flex-col rounded-2xl overflow-hidden"
        style={{ width: "340px", height: "420px", background: "rgba(8,12,20,0.98)", border: `1px solid ${C.border}`, backdropFilter: "blur(24px)", boxShadow: "0 0 50px rgba(0,240,255,0.12), 0 20px 60px rgba(0,0,0,0.8)" }}
      >
        <div className="flex items-center gap-3 px-4 py-3 shrink-0" style={{ background: "rgba(0,240,255,0.025)", borderBottom: `1px solid ${C.border}` }}>
          <img src={chat.avatar} alt={chat.user} className="w-8 h-8 rounded-full shrink-0" style={{ border: `1.5px solid ${C.cyan}` }} />
          <span className="font-orbitron font-black text-sm flex-1" style={{ color: C.cyan }}>{chat.user}</span>
          <button onClick={onClose} className="bg-transparent border-none cursor-pointer text-lg" style={{ color: C.muted }}
            onMouseEnter={(e) => (e.currentTarget.style.color = C.main)} onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2" style={{ scrollbarWidth: "thin", scrollbarColor: `${C.border} transparent` }}>
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
              <span className="text-xs px-3 py-2 rounded-xl max-w-[75%] leading-relaxed"
                style={{
                  background: m.from === "me" ? "linear-gradient(135deg,rgba(0,240,255,0.25),rgba(0,240,255,0.5))" : "rgba(255,255,255,0.06)",
                  border: m.from === "me" ? `1px solid ${C.cyan}44` : "1px solid rgba(255,255,255,0.08)",
                  color: C.main,
                }}
              >{m.text}</span>
            </div>
          ))}
        </div>

        <div className="px-3 py-3 shrink-0 flex gap-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <input
            value={msg} onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") send(); }}
            placeholder="Escribí un mensaje..."
            className="flex-1 rounded-xl px-3 py-2 text-xs outline-none"
            style={{ background: C.input, border: "1px solid rgba(51,65,85,0.8)", color: C.main }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(0,240,255,0.5)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(51,65,85,0.8)")}
          />
          <button onClick={send}
            className="rounded-xl px-3 cursor-pointer border-none transition-all"
            style={{ background: "linear-gradient(135deg,rgba(0,240,255,0.25),rgba(0,240,255,0.6))", border: `1.5px solid ${C.cyan}`, color: "#fff", boxShadow: "0 0 10px rgba(0,240,255,0.25)" }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = glowCyan; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 0 10px rgba(0,240,255,0.25)"; }}
          >
            <i className="fa-solid fa-paper-plane text-xs" />
          </button>
        </div>
      </div>
    </div>
  );
}

function MessagesDropdown({ onChatOpen }: { onChatOpen: (chat: typeof DM_CHATS[0]) => void }) {
  return (
    <div className="absolute right-0 top-full mt-3 rounded-2xl overflow-hidden z-[150]"
      style={{ width: "300px", background: "rgba(8,12,20,0.98)", border: `1px solid ${C.border}`, backdropFilter: "blur(24px)", boxShadow: "0 8px 40px rgba(0,0,0,0.75), 0 0 30px rgba(176,38,255,0.08)" }}
    >
      <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(176,38,255,0.025)" }}>
        <span className="font-orbitron text-xs font-black tracking-widest" style={{ color: C.purple }}>
          <i className="fa-solid fa-envelope mr-2" />MENSAJES DIRECTOS
        </span>
      </div>
      <div className="flex flex-col">
        {DM_CHATS.map((c, i) => (
          <button key={c.id} onClick={() => onChatOpen(c)}
            className="flex items-center gap-3 px-5 py-4 text-left cursor-pointer border-none w-full transition-all"
            style={{ background: "transparent", borderBottom: i < DM_CHATS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(176,38,255,0.05)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <img src={c.avatar} alt={c.user} className="w-9 h-9 rounded-full shrink-0" style={{ border: `1.5px solid ${c.unread ? C.cyan : "rgba(255,255,255,0.15)"}` }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-bold text-sm" style={{ color: c.unread ? C.main : C.muted }}>{c.user}</span>
                <span className="text-xs" style={{ color: C.muted }}>{c.time}</span>
              </div>
              <span className="text-xs truncate block" style={{ color: c.unread ? C.cyan : C.muted }}>{c.preview}</span>
            </div>
            {c.unread && <div className="rounded-full shrink-0" style={{ width: "7px", height: "7px", background: C.cyan, boxShadow: `0 0 5px ${C.cyan}` }} />}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Screen 5: Home (shell con tabs) ─────────────────────────────────────────
type HomeTab = "Inicio" | "Partidas" | "Equipos" | "Comunidad";

function HomeScreen({ nav }: { nav: (s: Screen) => void }) {
  const [tab, setTab] = useState<HomeTab>("Inicio");
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifRead, setNotifRead] = useState(false);
  const [mailOpen, setMailOpen] = useState(false);
  const [activeChat, setActiveChat] = useState<typeof DM_CHATS[0] | null>(null);
  const bellRef = useRef<HTMLDivElement>(null);
  const mailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (mailRef.current && !mailRef.current.contains(e.target as Node)) setMailOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <header
        className="flex items-center justify-between px-10 h-[70px]"
        style={{ background: "rgba(8,12,20,0.96)", borderBottom: `1px solid ${C.border}`, backdropFilter: "blur(14px)", position: "sticky", top: 0, zIndex: 100 }}
      >
        <Logo />
        <nav>
          <ul className="flex list-none gap-8">
            {(["Inicio", "Partidas", "Equipos", "Comunidad"] as HomeTab[]).map((item) => {
              const active = tab === item;
              return (
                <li key={item}>
                  <button
                    onClick={() => setTab(item)}
                    className="bg-transparent border-none cursor-pointer font-rajdhani text-lg font-bold uppercase transition-all"
                    style={{ color: active ? C.cyan : C.muted, textShadow: active ? "0 0 8px rgba(0,240,255,0.4)" : "none", borderBottom: active ? `2px solid ${C.cyan}` : "2px solid transparent", paddingBottom: "2px" }}
                  >
                    {item}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="flex items-center gap-4">
          {/* Bell */}
          <div ref={bellRef} className="relative">
            <button
              onClick={() => { setNotifOpen((v) => !v); setMailOpen(false); }}
              className="bg-transparent border-none cursor-pointer relative"
              style={{ color: notifOpen ? C.cyan : C.muted }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.cyan)}
              onMouseLeave={(e) => { if (!notifOpen) e.currentTarget.style.color = C.muted; }}
            >
              <i className="fa-solid fa-bell text-base" />
              {!notifRead && (
                <span className="absolute -top-1 -right-1 rounded-full w-4 h-4 flex items-center justify-center font-bold" style={{ background: C.cyan, color: "#080c14", fontSize: "9px", boxShadow: `0 0 6px ${C.cyan}` }}>3</span>
              )}
            </button>
            {notifOpen && (
              <NotificationsDropdown onMarkRead={() => { setNotifRead(true); }} />
            )}
          </div>

          {/* Mail */}
          <div ref={mailRef} className="relative">
            <button
              onClick={() => { setMailOpen((v) => !v); setNotifOpen(false); }}
              className="bg-transparent border-none cursor-pointer"
              style={{ color: mailOpen ? C.cyan : C.muted }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.cyan)}
              onMouseLeave={(e) => { if (!mailOpen) e.currentTarget.style.color = C.muted; }}
            >
              <i className="fa-solid fa-envelope text-base" />
            </button>
            {mailOpen && (
              <MessagesDropdown onChatOpen={(chat) => { setActiveChat(chat); setMailOpen(false); }} />
            )}
          </div>

          <FriendsIconBtn />
          <button
            onClick={() => nav("profile")}
            className="rounded-full cursor-pointer border-none p-0 transition-all"
            style={{ border: `2px solid ${C.cyan}`, boxShadow: "0 0 8px rgba(0,240,255,0.35)" }}
            title="Ver perfil"
          >
            <img src="https://i.pravatar.cc/100?img=33" alt="Perfil" className="w-9 h-9 rounded-full block" />
          </button>
        </div>
      </header>

      {tab === "Inicio" && <InicioTab nav={nav} />}
      {tab === "Partidas" && <PartidasTab />}
      {tab === "Equipos" && <EquiposTab />}
      {tab === "Comunidad" && <ComunidadTab />}

      {activeChat && <ChatModal chat={activeChat} onClose={() => setActiveChat(null)} />}
    </>
  );
}

// ─── Screen 6: Lobby ─────────────────────────────────────────────────────────
const LOBBY_PLAYERS = [
  { id: 1, name: "usaA983", avatar: "https://i.pravatar.cc/100?img=11", tag: "Líder", tagColor: C.purple, status: "LISTO", rank: "Platino", mic: true, rowClass: "leader" },
  { id: 2, name: "madenih19", avatar: "https://i.pravatar.cc/100?img=33", tag: "Vos", tagColor: C.cyan, status: "LISTO", rank: "Diamante", mic: true, rowClass: "user" },
  { id: 3, name: "Gamer_Pro99", avatar: "https://i.pravatar.cc/100?img=68", tag: null, tagColor: "", status: "ESPERANDO", rank: "Platino", mic: false, rowClass: "" },
];

function NativeVoiceChannel() {
  const [muted, setMuted] = useState(false);
  const [deafened, setDeafened] = useState(false);

  const speakers = [
    { name: "usaA983", avatar: "https://i.pravatar.cc/100?img=11", speaking: true, mic: true },
    { name: "madenih19", avatar: "https://i.pravatar.cc/100?img=33", speaking: false, mic: true },
    { name: "Gamer_Pro99", avatar: "https://i.pravatar.cc/100?img=68", speaking: false, mic: false },
  ];

  return (
    <PanelBox>
      <PanelLabel>Canal de Voz — Sala Squad #104</PanelLabel>
      <div className="flex flex-col gap-2 mb-4">
        {speakers.map((s) => (
          <div key={s.name} className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all" style={{ background: s.speaking ? "rgba(0,240,255,0.07)" : "rgba(255,255,255,0.02)", border: `1px solid ${s.speaking ? "rgba(0,240,255,0.35)" : "rgba(255,255,255,0.05)"}` }}>
            <div className="relative shrink-0">
              <img src={s.avatar} alt={s.name} className="w-8 h-8 rounded-full" style={{ border: `2px solid ${s.speaking ? C.cyan : "#334155"}`, boxShadow: s.speaking ? "0 0 8px rgba(0,240,255,0.5)" : "none" }} />
              {s.speaking && (
                <span className="absolute -bottom-0.5 -right-0.5 rounded-full flex items-center justify-center" style={{ width: "10px", height: "10px", background: C.cyan, border: "1.5px solid #080c14" }}>
                  <i className="fa-solid fa-microphone" style={{ fontSize: "5px", color: "#080c14" }} />
                </span>
              )}
            </div>
            <span className="text-xs font-semibold flex-1 truncate" style={{ color: s.speaking ? C.cyan : C.main }}>{s.name}</span>
            <i className={`fa-solid ${s.mic ? "fa-microphone" : "fa-microphone-slash"} text-xs`} style={{ color: s.mic ? (s.speaking ? C.cyan : C.muted) : "#475569" }} />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setMuted((v) => !v)}
          className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 font-bold text-xs cursor-pointer border-none transition-all"
          style={{ background: muted ? "rgba(255,59,92,0.12)" : "rgba(0,240,255,0.08)", border: `1px solid ${muted ? C.red : "rgba(0,240,255,0.3)"}`, color: muted ? C.red : C.cyan }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.8"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          <i className={`fa-solid ${muted ? "fa-microphone-slash" : "fa-microphone"} text-xs`} />
          {muted ? "SILENCIADO" : "MIC ACTIVO"}
        </button>
        <button
          onClick={() => setDeafened((v) => !v)}
          className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 font-bold text-xs cursor-pointer border-none transition-all"
          style={{ background: deafened ? "rgba(255,59,92,0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${deafened ? C.red : "rgba(255,255,255,0.1)"}`, color: deafened ? C.red : C.muted }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.8"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          <i className={`fa-solid ${deafened ? "fa-volume-xmark" : "fa-headphones"} text-xs`} />
          {deafened ? "SORDO" : "ESCUCHANDO"}
        </button>
      </div>
    </PanelBox>
  );
}

function LobbyScreen({ nav }: { nav: (s: Screen) => void }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText("#RL-8829-X").catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div style={{ minHeight: "100vh", background: C.bg }} className="flex flex-col">
      <header className="flex items-center gap-5 px-10 h-[70px]" style={{ background: "rgba(8,12,20,0.96)", borderBottom: `1px solid ${C.border}`, backdropFilter: "blur(14px)", position: "sticky", top: 0, zIndex: 100 }}>
        <button
          onClick={() => nav("home")}
          className="flex items-center gap-2 bg-transparent border-none cursor-pointer text-sm font-semibold font-rajdhani uppercase transition-colors"
          style={{ color: C.muted }}
          onMouseEnter={(e) => (e.currentTarget.style.color = C.cyan)}
          onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
        >
          <i className="fa-solid fa-arrow-left text-xs" /> Volver a la Home
        </button>
        <div style={{ width: "1px", height: "26px", background: "rgba(255,255,255,0.1)" }} />
        <Logo onClick={() => nav("home")} />
        <div className="ml-auto font-orbitron text-xs font-black tracking-widest px-5 py-2 rounded-lg" style={{ background: "rgba(0,255,102,0.1)", border: `1px solid ${C.green}`, color: C.green, boxShadow: "0 0 14px rgba(0,255,102,0.15)" }}>
          <i className="fa-solid fa-circle-check mr-2" />SALA COMPLETA · LISTOS PARA JUGAR
        </div>
        <FriendsIconBtn />
      </header>

      <div className="max-w-[1380px] mx-auto mt-8 px-6 pb-20 w-full">
        <PageTitle>LOBBY INTERNO — SQUAD #104</PageTitle>
        <div className="grid gap-8" style={{ gridTemplateColumns: "2fr 1fr" }}>
          <PanelBox>
            <PanelLabel>Integrantes del Squad (3/3)</PanelLabel>
            <div className="flex flex-col gap-3">
              {LOBBY_PLAYERS.map((p) => {
                const border = p.rowClass === "leader" ? C.purple : p.rowClass === "user" ? C.cyan : "transparent";
                const shadow = p.rowClass === "leader" ? "0 0 12px rgba(176,38,255,0.2)" : p.rowClass === "user" ? "0 0 12px rgba(0,240,255,0.2)" : "none";
                return (
                  <div key={p.id} className="rounded-xl p-4 flex items-center justify-between" style={{ background: C.input, border: `1px solid ${border}`, boxShadow: shadow }}>
                    <div className="flex items-center gap-4">
                      <PlayerChip name={p.name} avatar={p.avatar} rango={p.rank} plataforma="PC" mic={p.mic}>
                        <img src={p.avatar} alt={p.name} className="w-11 h-11 rounded-full" style={{ border: `2px solid ${border === "transparent" ? "#334155" : border}` }} />
                      </PlayerChip>
                      <div>
                        <div className="font-bold text-sm flex items-center gap-2">
                          {p.name}
                          {p.tag && <span className="text-xs font-semibold" style={{ color: p.tagColor }}>({p.tag} {p.rowClass === "leader" && <i className="fa-solid fa-crown" />})</span>}
                        </div>
                        <div className="text-xs font-semibold mt-0.5" style={{ color: p.status === "LISTO" ? C.green : "#f59e0b" }}>● {p.status} | Rango: {p.rank}</div>
                      </div>
                    </div>
                    <i className={`fa-solid ${p.mic ? "fa-microphone" : "fa-microphone-slash"}`} style={{ color: p.mic ? C.cyan : C.muted }} />
                  </div>
                );
              })}
            </div>
          </PanelBox>

          <div className="flex flex-col gap-5">
            <NativeVoiceChannel />
            <PanelBox>
              <PanelLabel>Código de Sala en el Juego</PanelLabel>
              <div className="rounded-lg p-4 flex justify-between items-center font-mono text-lg font-bold mb-4" style={{ background: "#0f172a", border: `1px dashed ${C.cyan}`, color: C.cyan }}>
                <span>#RL-8829-X</span>
                <button onClick={copy} className="bg-transparent border-none cursor-pointer transition-all" style={{ color: copied ? C.green : C.cyan }}>
                  <i className={`fa-solid ${copied ? "fa-check" : "fa-copy"}`} />
                </button>
              </div>
              <button
                className="w-full rounded-xl py-4 font-orbitron font-black text-base cursor-pointer border-none transition-all"
                style={{ background: C.cyan, color: "#080c14", boxShadow: "0 0 25px rgba(0,240,255,0.55)" }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = glowCyan)}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 0 25px rgba(0,240,255,0.55)")}
              >
                <i className="fa-solid fa-rocket mr-2" />¡ENTRAR A JUGAR AHORA!
              </button>
            </PanelBox>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 7: Profile ────────────────────────────────────────────────────────
const STATS = [
  { label: "Partidas Jugadas", value: "142", icon: "fa-gamepad", color: C.cyan },
  { label: "Victorias", value: "97", icon: "fa-trophy", color: C.green },
  { label: "Tasa de Victorias", value: "68%", icon: "fa-chart-line", color: "#a78bfa" },
  { label: "Racha Actual", value: "5W", icon: "fa-fire", color: "#f59e0b" },
  { label: "Squads Formados", value: "23", icon: "fa-users", color: C.purple },
  { label: "Horas Jugadas", value: "340h", icon: "fa-clock", color: "#38bdf8" },
];

function ProfileScreen({ nav }: { nav: (s: Screen) => void }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg }} className="flex flex-col">
      <header className="flex items-center gap-5 px-10 h-[70px]" style={{ background: "rgba(8,12,20,0.96)", borderBottom: `1px solid ${C.border}`, backdropFilter: "blur(14px)", position: "sticky", top: 0, zIndex: 100 }}>
        <button
          onClick={() => nav("home")}
          className="flex items-center gap-2 bg-transparent border-none cursor-pointer text-sm font-semibold font-rajdhani uppercase transition-colors"
          style={{ color: C.muted }}
          onMouseEnter={(e) => (e.currentTarget.style.color = C.cyan)}
          onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
        >
          <i className="fa-solid fa-arrow-left text-xs" /> Volver a la Home
        </button>
        <div style={{ width: "1px", height: "26px", background: "rgba(255,255,255,0.1)" }} />
        <Logo onClick={() => nav("home")} />
        <div className="ml-auto"><FriendsIconBtn /></div>
      </header>

      <div className="max-w-[1380px] mx-auto mt-8 px-6 pb-20 w-full">
        <PageTitle>PERFIL DE JUGADOR</PageTitle>
        <div className="grid gap-8" style={{ gridTemplateColumns: "1fr 2fr" }}>
          {/* Identity */}
          <PanelBox>
            <div className="flex flex-col items-center gap-5 py-4">
              <div className="relative">
                <img src="https://i.pravatar.cc/100?img=33" alt="madenih19" className="w-24 h-24 rounded-full" style={{ border: `3px solid ${C.cyan}`, boxShadow: glowCyan }} />
                <span className="absolute bottom-1 right-1 rounded-full" style={{ width: "14px", height: "14px", background: C.green, border: "2.5px solid #080c14", boxShadow: "0 0 6px rgba(0,255,102,0.7)" }} />
              </div>
              <div className="text-center">
                <div className="font-orbitron text-xl font-black" style={{ color: C.main }}>madenih19</div>
                <div className="text-sm mt-1" style={{ color: C.muted }}>Jugador desde Sept 2024</div>
              </div>
              <div className="flex gap-3">
                <span className="text-sm font-bold px-3 py-1.5 rounded-lg" style={{ background: "rgba(56,189,248,0.15)", color: "#38bdf8", border: "1px solid rgba(56,189,248,0.35)" }}>
                  <i className="fa-solid fa-star mr-1.5" />Diamante II
                </span>
                <span className="text-sm font-bold px-3 py-1.5 rounded-lg" style={{ background: "rgba(176,38,255,0.15)", color: C.purple, border: "1px solid rgba(176,38,255,0.3)" }}>
                  <i className="fa-solid fa-display mr-1.5" />PC
                </span>
              </div>
              <div className="w-full flex items-center gap-3 rounded-lg px-4 py-3" style={{ background: "rgba(0,240,255,0.05)", border: "1px solid rgba(0,240,255,0.2)" }}>
                <i className="fa-solid fa-gamepad text-sm" style={{ color: C.cyan }} />
                <span className="font-bold text-sm" style={{ color: C.cyan }}>Rocket League</span>
                <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded" style={{ background: "rgba(0,240,255,0.15)", color: C.cyan, border: "1px solid rgba(0,240,255,0.3)" }}>PRINCIPAL</span>
              </div>
              <div className="w-full h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
              <button
                onClick={() => nav("login")}
                className="w-full font-orbitron font-black text-sm rounded-xl py-3.5 cursor-pointer border-none transition-all duration-200"
                style={{ background: "rgba(255,59,92,0.12)", border: `2px solid ${C.red}`, color: C.red, boxShadow: "0 0 14px rgba(255,59,92,0.2)", letterSpacing: "0.05em" }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = glowRed; e.currentTarget.style.background = "rgba(255,59,92,0.2)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 0 14px rgba(255,59,92,0.2)"; e.currentTarget.style.background = "rgba(255,59,92,0.12)"; }}
              >
                <i className="fa-solid fa-right-from-bracket mr-2" />CERRAR SESIÓN
              </button>
            </div>
          </PanelBox>

          {/* Stats */}
          <div className="flex flex-col gap-6">
            <PanelBox>
              <PanelLabel>Estadísticas de Juego</PanelLabel>
              <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
                {STATS.map((stat) => (
                  <div key={stat.label} className="rounded-xl p-5 flex flex-col gap-2 transition-all duration-200" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${stat.color}44`; e.currentTarget.style.boxShadow = `0 0 16px ${stat.color}18`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <i className={`fa-solid ${stat.icon} text-lg`} style={{ color: stat.color }} />
                    <div className="font-orbitron text-2xl font-black" style={{ color: stat.color }}>{stat.value}</div>
                    <div className="text-xs font-semibold" style={{ color: C.muted }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </PanelBox>
            <PanelBox>
              <PanelLabel>Últimas Partidas</PanelLabel>
              <div className="flex flex-col gap-3">
                {[
                  { squad: "#104", mode: "3v3 Rankeado", result: "VICTORIA", date: "Hoy, 21:42", color: C.green },
                  { squad: "#98", mode: "2v2 Casual", result: "DERROTA", date: "Ayer, 18:10", color: C.red },
                  { squad: "#91", mode: "3v3 Rankeado", result: "VICTORIA", date: "02/09/2026", color: C.green },
                  { squad: "#87", mode: "4v4 Tourney", result: "VICTORIA", date: "01/09/2026", color: C.green },
                ].map((r, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-lg px-4 py-3" style={{ background: C.input }}>
                    <span className="font-orbitron text-xs font-black" style={{ color: C.muted }}>SQUAD {r.squad}</span>
                    <span className="text-xs" style={{ color: C.muted }}>{r.mode}</span>
                    <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded" style={{ background: `${r.color}18`, color: r.color, border: `1px solid ${r.color}44` }}>{r.result}</span>
                    <span className="text-xs" style={{ color: C.muted }}>{r.date}</span>
                  </div>
                ))}
              </div>
            </PanelBox>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Friends & Player Card System ─────────────────────────────────────────────
type FriendStatus = "EN LÍNEA" | "EN PARTIDA" | "DESCONECTADO";
interface Friend { id: number; name: string; avatar: string; plataforma: "PC" | "PS4"; status: FriendStatus; rango: string }
interface FriendReq { id: number; name: string; avatar: string; plataforma: "PC" | "PS4"; rango: string; winrate: string }
interface PlayerInfo { name: string; avatar: string; rango: string; plataforma: "PC" | "PS4"; mic: boolean }
interface CardState { player: PlayerInfo; x: number; y: number }

interface FCtx {
  friends: Friend[]; requests: FriendReq[]; sentNames: string[];
  drawerOpen: boolean; drawerTab: "amigos" | "solicitudes";
  openDrawer: (tab?: "amigos" | "solicitudes") => void; closeDrawer: () => void;
  setDrawerTab: (t: "amigos" | "solicitudes") => void;
  accept: (id: number) => void; reject: (id: number) => void;
  addSent: (name: string) => void; isSent: (name: string) => boolean;
  card: CardState | null; showCard: (p: PlayerInfo, x: number, y: number) => void; hideCard: () => void;
}

const FriendsCtx = createContext<FCtx>(null!);
const useFriends = () => useContext(FriendsCtx);

const INIT_FRIENDS: Friend[] = [
  { id: 1, name: "ZephyrRL", avatar: "https://i.pravatar.cc/100?img=41", plataforma: "PC", status: "EN LÍNEA", rango: "Champion" },
  { id: 2, name: "NovaBurst", avatar: "https://i.pravatar.cc/100?img=57", plataforma: "PS4", status: "EN PARTIDA", rango: "Diamante II" },
  { id: 3, name: "PulseWave", avatar: "https://i.pravatar.cc/100?img=29", plataforma: "PC", status: "EN LÍNEA", rango: "Champion" },
  { id: 4, name: "SkyRocket", avatar: "https://i.pravatar.cc/100?img=60", plataforma: "PC", status: "DESCONECTADO", rango: "Diamante I" },
];
const INIT_REQUESTS: FriendReq[] = [
  { id: 10, name: "NxBolt", avatar: "https://i.pravatar.cc/100?img=52", plataforma: "PS4", rango: "Diamante I", winrate: "62%" },
  { id: 11, name: "VelocityX", avatar: "https://i.pravatar.cc/100?img=15", plataforma: "PC", rango: "Platino III", winrate: "54%" },
];

const STATUS_COLOR: Record<FriendStatus, string> = { "EN LÍNEA": C.green, "EN PARTIDA": "#f59e0b", "DESCONECTADO": "#475569" };

function FriendsProvider({ children }: { children: React.ReactNode }) {
  const [friends, setFriends] = useState<Friend[]>(INIT_FRIENDS);
  const [requests, setRequests] = useState<FriendReq[]>(INIT_REQUESTS);
  const [sentNames, setSentNames] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<"amigos" | "solicitudes">("amigos");
  const [card, setCard] = useState<CardState | null>(null);

  const accept = (id: number) => {
    const req = requests.find((r) => r.id === id);
    if (!req) return;
    setFriends((f) => [...f, { id: req.id, name: req.name, avatar: req.avatar, plataforma: req.plataforma, status: "EN LÍNEA" as FriendStatus, rango: req.rango }]);
    setRequests((r) => r.filter((x) => x.id !== id));
  };
  const reject = (id: number) => setRequests((r) => r.filter((x) => x.id !== id));
  const addSent = (name: string) => setSentNames((v) => [...v, name]);
  const isSent = (name: string) => sentNames.includes(name);
  const openDrawer = (tab: "amigos" | "solicitudes" = "amigos") => { setDrawerTab(tab); setDrawerOpen(true); };
  const closeDrawer = () => setDrawerOpen(false);
  const showCard = (p: PlayerInfo, x: number, y: number) => setCard({ player: p, x, y });
  const hideCard = () => setCard(null);

  return (
    <FriendsCtx.Provider value={{ friends, requests, sentNames, drawerOpen, drawerTab, openDrawer, closeDrawer, setDrawerTab, accept, reject, addSent, isSent, card, showCard, hideCard }}>
      {children}
    </FriendsCtx.Provider>
  );
}

// ─── Friends Drawer ───────────────────────────────────────────────────────────
function FriendsDrawer() {
  const { friends, requests, drawerOpen, drawerTab, setDrawerTab, closeDrawer, accept, reject, addSent, isSent } = useFriends();
  const [search, setSearch] = useState("");

  if (!drawerOpen) return null;

  const handleAdd = () => {
    if (search.trim()) { addSent(search.trim()); setSearch(""); }
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={closeDrawer} style={{ background: "rgba(0,0,0,0.4)" }} />
      <div className="fixed top-0 right-0 h-full z-50 flex flex-col" style={{ width: "360px", background: "rgba(8,12,20,0.98)", borderLeft: `1px solid ${C.border}`, backdropFilter: "blur(24px)", boxShadow: "-4px 0 50px rgba(0,0,0,0.7)" }}>
        <div className="flex items-center justify-between px-5 h-[70px] shrink-0" style={{ borderBottom: `1px solid ${C.border}` }}>
          <div className="font-orbitron text-sm font-black" style={{ color: C.cyan }}>
            <i className="fa-solid fa-users mr-2" />AMIGOS
          </div>
          <button onClick={closeDrawer} className="bg-transparent border-none cursor-pointer text-lg" style={{ color: C.muted }}
            onMouseEnter={(e) => (e.currentTarget.style.color = C.main)} onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="px-4 py-3 flex gap-2 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="relative flex-1">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: C.muted }} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por Gamertag..."
              className="w-full rounded-lg pl-8 pr-3 py-2.5 text-xs outline-none"
              style={{ background: C.input, border: "1px solid rgba(51,65,85,0.8)", color: C.main }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(0,240,255,0.5)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(51,65,85,0.8)")}
              onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
            />
          </div>
          <button onClick={handleAdd}
            className="font-orbitron font-black text-xs px-4 rounded-lg cursor-pointer border-none transition-all shrink-0"
            style={{ background: isSent(search.trim()) ? "rgba(176,38,255,0.15)" : "linear-gradient(135deg,rgba(0,240,255,0.25),rgba(0,240,255,0.55))", border: `1.5px solid ${isSent(search.trim()) ? C.purple : C.cyan}`, color: isSent(search.trim()) ? C.purple : "#fff", letterSpacing: "0.04em" }}
          >
            {isSent(search.trim()) && search.trim() ? "ENVIADA" : "AGREGAR"}
          </button>
        </div>

        <div className="flex shrink-0" style={{ borderBottom: `1px solid ${C.border}` }}>
          {(["amigos", "solicitudes"] as const).map((t) => (
            <button key={t} onClick={() => setDrawerTab(t)}
              className="flex-1 py-3 font-orbitron font-black text-xs cursor-pointer border-none uppercase relative transition-all"
              style={{ background: "transparent", color: drawerTab === t ? C.cyan : C.muted }}
            >
              {t === "amigos" ? `MIS AMIGOS (${friends.length})` : (
                <span className="flex items-center justify-center gap-1.5">
                  SOLICITUDES
                  {requests.length > 0 && <span className="rounded-full px-1.5 py-0.5" style={{ background: C.cyan, color: "#080c14", fontSize: "9px" }}>{requests.length}</span>}
                </span>
              )}
              {drawerTab === t && <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: C.cyan }} />}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3" style={{ scrollbarWidth: "thin", scrollbarColor: `${C.border} transparent` }}>
          {drawerTab === "amigos" && (
            <div className="flex flex-col gap-2">
              {friends.length === 0 && <p className="text-xs text-center py-10" style={{ color: C.muted }}>No tenés amigos agregados aún.</p>}
              {friends.map((f) => (
                <PlayerChip key={f.id} name={f.name} avatar={f.avatar} rango={f.rango} plataforma={f.plataforma} mic={true}>
                  <div className="flex items-center gap-3 rounded-xl px-3 py-3 transition-all w-full"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", cursor: "pointer" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(0,240,255,0.2)"; e.currentTarget.style.background = "rgba(0,240,255,0.03)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                  >
                    <div className="relative shrink-0">
                      <img src={f.avatar} alt={f.name} className="w-9 h-9 rounded-full" style={{ border: `2px solid ${STATUS_COLOR[f.status]}` }} />
                      <span className="absolute -bottom-0.5 -right-0.5 rounded-full" style={{ width: "9px", height: "9px", background: STATUS_COLOR[f.status], border: "1.5px solid #080c14", boxShadow: f.status === "EN LÍNEA" ? "0 0 4px rgba(0,255,102,0.7)" : "none" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm truncate" style={{ color: C.main }}>{f.name}</div>
                      <div className="text-xs font-semibold" style={{ color: STATUS_COLOR[f.status] }}>{f.status}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: "rgba(176,38,255,0.1)", color: C.purple, border: "1px solid rgba(176,38,255,0.25)" }}>{f.plataforma}</span>
                      <span className="text-xs" style={{ color: C.muted }}>{f.rango}</span>
                    </div>
                  </div>
                </PlayerChip>
              ))}
            </div>
          )}
          {drawerTab === "solicitudes" && (
            <div className="flex flex-col gap-3">
              {requests.length === 0 && <p className="text-xs text-center py-10" style={{ color: C.muted }}>Sin solicitudes pendientes.</p>}
              {requests.map((r) => (
                <div key={r.id} className="rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}` }}>
                  <div className="flex items-center gap-3 px-4 py-4">
                    <img src={r.avatar} alt={r.name} className="w-10 h-10 rounded-full shrink-0" style={{ border: `2px solid ${C.cyan}`, boxShadow: "0 0 8px rgba(0,240,255,0.3)" }} />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm" style={{ color: C.main }}>{r.name}</div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs font-semibold" style={{ color: C.muted }}>{r.rango}</span>
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(176,38,255,0.1)", color: C.purple, border: "1px solid rgba(176,38,255,0.3)" }}>{r.plataforma}</span>
                        <span className="text-xs font-bold" style={{ color: "#a78bfa" }}>WR {r.winrate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 px-4 pb-4">
                    <button onClick={() => accept(r.id)}
                      className="flex-1 font-orbitron font-black text-xs rounded-lg py-2.5 cursor-pointer border-none transition-all"
                      style={{ background: "linear-gradient(135deg,rgba(0,240,255,0.25),rgba(0,240,255,0.55))", border: `1.5px solid ${C.cyan}`, color: "#fff", boxShadow: "0 0 8px rgba(0,240,255,0.2)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = glowCyan; }}
                      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 0 8px rgba(0,240,255,0.2)"; }}
                    ><i className="fa-solid fa-check mr-1.5" />ACEPTAR</button>
                    <button onClick={() => reject(r.id)}
                      className="flex-1 font-orbitron font-black text-xs rounded-lg py-2.5 cursor-pointer border-none transition-all"
                      style={{ background: "rgba(255,59,92,0.08)", border: `1.5px solid rgba(255,59,92,0.5)`, color: C.red }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,59,92,0.15)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,59,92,0.08)"; }}
                    ><i className="fa-solid fa-xmark mr-1.5" />RECHAZAR</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Player Card Modal ────────────────────────────────────────────────────────
function playerMockStats(name: string) {
  const h = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return { winrate: `${45 + (h % 35)}%`, hours: `${80 + (h % 420)}h` };
}

function PlayerHoverCard() {
  const { card, hideCard, addSent, isSent } = useFriends();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") hideCard(); };
    if (card) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [card, hideCard]);

  if (!card) return null;
  const { player } = card;
  const sent = isSent(player.name);
  const stats = playerMockStats(player.name);

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center px-4"
      style={{ background: "rgba(8,12,20,0.72)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) hideCard(); }}
    >
      <div className="rounded-2xl overflow-hidden w-full" style={{ maxWidth: "360px", background: "rgba(8,12,20,0.98)", border: `1px solid ${C.border}`, backdropFilter: "blur(28px)", boxShadow: "0 0 60px rgba(0,240,255,0.12), 0 0 120px rgba(176,38,255,0.06), 0 24px 80px rgba(0,0,0,0.85)" }}>

        {/* Header with avatar */}
        <div className="relative px-6 pt-6 pb-5 flex flex-col items-center gap-3" style={{ background: "linear-gradient(180deg,rgba(0,240,255,0.04) 0%,transparent 100%)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            onClick={hideCard}
            className="absolute top-4 right-4 bg-transparent border-none cursor-pointer text-lg leading-none transition-colors"
            style={{ color: C.muted }}
            onMouseEnter={(e) => (e.currentTarget.style.color = C.main)}
            onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
          >
            <i className="fa-solid fa-xmark" />
          </button>

          <div className="relative">
            <img
              src={player.avatar} alt={player.name}
              className="w-20 h-20 rounded-full"
              style={{ border: `3px solid ${C.cyan}`, boxShadow: `0 0 20px rgba(0,240,255,0.4), 0 0 40px rgba(0,240,255,0.15)` }}
            />
            <span className="absolute -bottom-0.5 -right-0.5 rounded-full" style={{ width: "14px", height: "14px", background: C.green, border: "2px solid #080c14", boxShadow: "0 0 6px rgba(0,255,102,0.7)" }} />
          </div>

          <div className="text-center">
            <div className="font-orbitron font-black text-xl" style={{ color: C.main }}>{player.name}</div>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <i className="fa-solid fa-star text-xs" style={{ color: "#f59e0b" }} />
              <span className="text-sm font-bold" style={{ color: C.muted }}>{player.rango}</span>
            </div>
          </div>
        </div>

        {/* Badges row */}
        <div className="flex items-center justify-center gap-3 px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg"
            style={{ background: "rgba(176,38,255,0.12)", color: C.purple, border: "1px solid rgba(176,38,255,0.35)" }}>
            <i className="fa-solid fa-display" />{player.plataforma}
          </span>
          <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg"
            style={{ background: player.mic ? "rgba(0,240,255,0.08)" : "rgba(255,255,255,0.04)", color: player.mic ? C.cyan : C.muted, border: `1px solid ${player.mic ? "rgba(0,240,255,0.3)" : "rgba(255,255,255,0.1)"}` }}>
            <i className={`fa-solid ${player.mic ? "fa-microphone" : "fa-microphone-slash"}`} />
            Mic {player.mic ? "Activo" : "Inactivo"}
          </span>
        </div>

        {/* Quick stats */}
        <div className="grid px-6 py-4 gap-3" style={{ gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex flex-col items-center gap-1 rounded-xl py-3" style={{ background: "rgba(0,240,255,0.04)", border: "1px solid rgba(0,240,255,0.12)" }}>
            <i className="fa-solid fa-chart-line text-sm" style={{ color: C.cyan }} />
            <div className="font-orbitron font-black text-lg" style={{ color: C.cyan }}>{stats.winrate}</div>
            <div className="text-xs font-semibold" style={{ color: C.muted }}>Winrate</div>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-xl py-3" style={{ background: "rgba(176,38,255,0.04)", border: "1px solid rgba(176,38,255,0.12)" }}>
            <i className="fa-solid fa-clock text-sm" style={{ color: C.purple }} />
            <div className="font-orbitron font-black text-lg" style={{ color: C.purple }}>{stats.hours}</div>
            <div className="text-xs font-semibold" style={{ color: C.muted }}>Jugadas</div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-5 flex flex-col gap-3">
          <button
            onClick={() => { if (!sent) addSent(player.name); }}
            disabled={sent}
            className="w-full font-orbitron font-black text-sm rounded-xl py-3.5 border-none transition-all duration-200"
            style={{
              background: sent ? "rgba(176,38,255,0.12)" : "linear-gradient(135deg,rgba(0,240,255,0.28),rgba(0,240,255,0.62))",
              border: `2px solid ${sent ? C.purple : C.cyan}`,
              color: sent ? C.purple : "#fff",
              boxShadow: sent ? "none" : "0 0 18px rgba(0,240,255,0.3)",
              cursor: sent ? "default" : "pointer",
              letterSpacing: "0.06em",
            }}
            onMouseEnter={(e) => { if (!sent) e.currentTarget.style.boxShadow = glowCyan; }}
            onMouseLeave={(e) => { if (!sent) e.currentTarget.style.boxShadow = "0 0 18px rgba(0,240,255,0.3)"; }}
          >
            {sent
              ? <><i className="fa-solid fa-check mr-2" />SOLICITUD ENVIADA</>
              : <><i className="fa-solid fa-user-plus mr-2" />+ AGREGAR AMIGO</>}
          </button>
          <button
            onClick={hideCard}
            className="w-full font-rajdhani font-bold text-sm rounded-xl py-3 border-none cursor-pointer transition-all"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: C.muted }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = C.main; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = C.muted; }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PlayerChip: wraps any player reference with click-to-card ────────────────
function PlayerChip({ name, avatar, rango, plataforma, mic, children }: { name: string; avatar: string; rango: string; plataforma: "PC" | "PS4"; mic: boolean; children: React.ReactNode }) {
  const { showCard } = useFriends();
  return (
    <span className="cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        showCard({ name, avatar, rango, plataforma, mic }, rect.right + 12, rect.top - 10);
      }}
    >
      {children}
    </span>
  );
}

// ─── FriendsIconBtn: reusable friends icon for any header ─────────────────────
function FriendsIconBtn() {
  const { openDrawer, requests } = useFriends();
  return (
    <button
      onClick={() => openDrawer(requests.length > 0 ? "solicitudes" : "amigos")}
      className="bg-transparent border-none cursor-pointer relative"
      style={{ color: C.muted }}
      onMouseEnter={(e) => (e.currentTarget.style.color = C.cyan)}
      onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
      title="Amigos"
    >
      <i className="fa-solid fa-users text-base" />
      {requests.length > 0 && (
        <span className="absolute -top-1 -right-1 rounded-full" style={{ width: "9px", height: "9px", background: C.cyan, border: "1.5px solid #080c14", boxShadow: `0 0 6px ${C.cyan}` }} />
      )}
    </button>
  );
}
export default function App() {
  const [screen, setScreen] = useState<Screen>("register");
  
  const nav = (s: Screen) => {
    // BLINDAJE NUCLEAR USANDO WINDOW EXPLICITAMENTE
    let userSession = null;
    try {
      userSession = window.localStorage.getItem("gs_user");
    } catch (e) {
      console.error("Error accediendo al storage", e);
    }

    // Si intenta entrar a pantallas protegidas sin sesión, se rechaza de inmediato
    if ((s === "home" || s === "lobby" || s === "profile") && !userSession) {
      alert("¡Acceso denegado! Tenés que iniciar sesión con una cuenta válida.");
      setScreen("login");
      return;
    }
    setScreen(s);
  };

  return (
    <FriendsProvider>
      <div style={{ minHeight: "100%", background: C.bg }}>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
        
        {screen === "register" && <RegisterScreen nav={nav} />}
        {screen === "login" && <LoginScreen nav={nav} />}
        {screen === "reset" && <ResetScreen nav={nav} />}
        {screen === "newpass" && <NewPassScreen nav={nav} />}
        {screen === "home" && <HomeScreen nav={nav} />}
        {screen === "lobby" && <LobbyScreen nav={nav} />}
        {screen === "profile" && <ProfileScreen nav={nav} />}
        
        <FriendsDrawer />
        <PlayerHoverCard />
      </div>
    </FriendsProvider>
  );
}