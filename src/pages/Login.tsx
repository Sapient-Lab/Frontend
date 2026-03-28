import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import BottleAnimation from '../landing/components/BottleAnimation.jsx';
import { FiMail, FiLock, FiUser, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';

export default function Login() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const validatePassword = (pass: string) => {
    if (pass.length < 8) return 'Debe tener al menos 8 caracteres.';
    if (!/[A-Z]/.test(pass)) return 'Debe incluir al menos una mayúscula.';
    if (!/[a-z]/.test(pass)) return 'Debe incluir al menos una minúscula.';
    if (!/[0-9]/.test(pass)) return 'Debe incluir al menos un número.';
    if (!/[!@#$%^&*.,_-]/.test(pass)) return 'Debe incluir al menos un carácter especial.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (mode === 'register') {
        if (password !== confirmPassword) {
          setError('Las contraseñas no coinciden.');
          setIsLoading(false);
          return;
        }
        
        const pwdError = validatePassword(password);
        if (pwdError) {
          setError(pwdError);
          setIsLoading(false);
          return;
        }
        
        const res = await authService.register({ name, email, password });
        if (res.user?.id) localStorage.setItem('sapientlab_user_id', res.user.id.toString());
        if (res.user?.name) localStorage.setItem('sapientlab_user_name', res.user.name);
        if (res.user) {
          localStorage.setItem('user', JSON.stringify({ ...res.user, email }));
          localStorage.setItem('sapientlab_login_time', Date.now().toString());
          sessionStorage.setItem('active_session', 'true');
        }
        navigate('/onboarding');
        
      } else {
        const res = await authService.login({ email, password });
        if (res.user?.id) localStorage.setItem('sapientlab_user_id', res.user.id.toString());
        if (res.user?.name) localStorage.setItem('sapientlab_user_name', res.user.name);
        if (res.user) {
          localStorage.setItem('user', JSON.stringify({ ...res.user, email }));
          localStorage.setItem('sapientlab_login_time', Date.now().toString());
          sessionStorage.setItem('active_session', 'true');
        }
        navigate('/app'); 
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 relative overflow-hidden bg-gradient-to-br from-[#0a0f1c] via-[#0c1220] to-[#0b1020]">
      {/* Fondo con grid científico sutil */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      
      {/* Efectos de glow suaves */}
      <div className="absolute top-1/3 -left-48 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/3 -right-48 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
        
        {/* Lado Izquierdo - Botella Animada SIN recuadro */}
        <div className="hidden lg:flex flex-col items-center justify-center">
          <div className="relative w-full max-w-md">
            {/* Efecto de glow detrás de la botella - más sutil */}
            <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-cyan-500/10 to-accent/10 rounded-full blur-2xl" />
            
            {/* Botella sin contenedor con borde */}
            <div className="relative flex items-center justify-center">
              <div className="relative h-80 w-full flex items-center justify-center">
                <BottleAnimation />
              </div>
            </div>
            
            {/* Texto del proyecto - integrado naturalmente */}
            <div className="text-center mt-8 space-y-2">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-accent to-cyan-400 bg-clip-text text-transparent">
                SAPIENT LAB
              </h2>
              <p className="text-slate-400 text-sm font-mono leading-relaxed">
                Laboratorio de Investigación Asistida por IA
              </p>
              <p className="text-xs text-slate-500 font-mono">
                Inteligencia Artificial para la Ciencia Moderna
              </p>
            </div>
          </div>
        </div>

        {/* Lado Derecho - Formulario */}
        <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
          <div className="bg-[#0f1624]/80 backdrop-blur-xl border border-accent/20 rounded-2xl p-8 shadow-2xl">
            
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent-dim mb-4 shadow-lg">
                <span className="text-white font-mono text-xl font-bold">SL</span>
              </div>
              <p className="text-xs font-mono text-accent tracking-wider mb-2">SAPIENT LAB</p>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent mb-2">
                {mode === 'login' ? 'Bienvenido de vuelta' : 'Crear una cuenta'}
              </h1>
              <p className="text-slate-400 text-sm font-mono">
                {mode === 'login' 
                  ? 'Inicia sesión para continuar en tu espacio de trabajo' 
                  : 'Comienza tu viaje científico con SAPIENT LAB'}
              </p>
            </div>

            {/* Mensajes de error/éxito */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-mono">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-mono">
                {successMsg}
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-mono font-medium text-accent mb-1.5">Correo Electrónico</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#05080f] border border-accent/20 rounded-xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 font-mono text-sm text-slate-200 placeholder:text-slate-600 transition-all"
                    placeholder="Ingresa tu correo electrónico"
                  />
                </div>
              </div>

              {/* Nombre completo (solo registro) */}
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-mono font-medium text-accent mb-1.5">Nombre Completo</label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#05080f] border border-accent/20 rounded-xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 font-mono text-sm text-slate-200 placeholder:text-slate-600 transition-all"
                      placeholder="Ingresa tu nombre completo"
                    />
                  </div>
                </div>
              )}

              {/* Contraseña */}
              <div>
                <label className="block text-xs font-mono font-medium text-accent mb-1.5">Contraseña</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-2.5 bg-[#05080f] border border-accent/20 rounded-xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 font-mono text-sm text-slate-200 placeholder:text-slate-600 transition-all"
                    placeholder={mode === 'login' ? "Ingresa tu contraseña" : "Crea tu contraseña"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirmar contraseña (solo registro) */}
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-mono font-medium text-accent mb-1.5">Confirmar Contraseña</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#05080f] border border-accent/20 rounded-xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 font-mono text-sm text-slate-200 placeholder:text-slate-600 transition-all"
                      placeholder="Confirma tu contraseña"
                    />
                  </div>
                </div>
              )}

              {/* Forgot password link (solo login) */}
              {mode === 'login' && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => {/* Implementar forgot password */}}
                    className="text-xs text-accent/70 hover:text-accent font-mono transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              )}

              {/* Botón submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-accent to-accent-dim text-white font-mono font-medium hover:shadow-[0_0_20px_rgba(17,67,112,0.4)] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Cargando...
                  </>
                ) : (
                  <>
                    {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
                    <FiArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer con switch de modo */}
            <div className="mt-6 text-center text-sm">
              <span className="text-slate-500 font-mono">
                {mode === 'login' ? "¿No tienes una cuenta? " : "¿Ya tienes una cuenta? "}
              </span>
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setError('');
                  setSuccessMsg('');
                  setPassword('');
                  setConfirmPassword('');
                }}
                className="text-accent hover:text-cyan-400 font-mono font-medium transition-colors"
              >
                {mode === 'login' ? 'Crear una cuenta' : 'Iniciar Sesión'}
              </button>
            </div>

            
          </div>
        </div>
      </div>
    </div>
  );
}