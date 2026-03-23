import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import BottleAnimation from '../landing/components/BottleAnimation.jsx';
import '../landing/landing.css';

export default function Login() {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      if (mode === 'forgot_password') {
        if (!email) {
          setError('Por favor, ingresa tu correo electrónico.');
          setIsLoading(false);
          return;
        }
        
        const res = await authService.forgotPassword(email);
        setSuccessMsg(res.message || 'Solicitud enviada correctamente.');
        
      } else if (mode === 'register') {
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
        console.log('Registro exitoso. Token fake guardado en fondo.');
        navigate('/onboarding');
        
      } else {
        // mode === 'login'
        const res = await authService.login({ email, password });
        if (res.user?.id) localStorage.setItem('sapientlab_user_id', res.user.id.toString());
        if (res.user?.name) localStorage.setItem('sapientlab_user_name', res.user.name);
        if (res.user) {
          localStorage.setItem('user', JSON.stringify({ ...res.user, email }));
          localStorage.setItem('sapientlab_login_time', Date.now().toString());
          sessionStorage.setItem('active_session', 'true');
        }
        console.log('Login exitoso. Token fake guardado en fondo.');
        navigate('/app'); 
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = (newMode: 'login' | 'register' | 'forgot_password') => {
    setMode(newMode);
    setError('');
    setSuccessMsg('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-lab-bg relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-24 -left-20 w-96 h-96 rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute -bottom-24 -right-12 w-96 h-96 rounded-full bg-[#2f6da6]/20 blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-6xl grid lg:grid-cols-[1.2fr_0.85fr] gap-6 items-stretch">
          <section className="hidden lg:flex relative rounded-3xl border border-cyan-300/35 overflow-hidden bg-gradient-to-br from-[#0d1f32] via-[#123252] to-[#0c253f] shadow-[0_20px_50px_rgba(7,28,48,0.45)]">
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: 'linear-gradient(rgba(56,189,248,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.14) 1px, transparent 1px)',
              backgroundSize: '44px 44px',
            }} />

            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-cyan-400/10" />

            <div className="relative z-10 flex flex-col justify-between p-10">
              <div>
                <p className="inline-flex items-center gap-2 text-xs tracking-[0.2em] font-mono px-3 py-1 rounded-full border border-cyan-200/40 bg-cyan-300/10 text-cyan-100">
                  SAPIENT LAB AI
                </p>

                <h2 className="mt-6 text-4xl leading-tight font-bold text-white">
                  Laboratorio inteligente,
                  <span className="block text-cyan-300"> acceso en un clic.</span>
                </h2>

                <p className="mt-4 max-w-xl text-slate-200/90">
                  Fusionamos la experiencia visual de la landing con tu flujo de autenticación.
                  Inicia sesión y salta directo a tu workspace experimental.
                </p>

                <div className="mt-8 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm p-3">
                    <p className="font-bold text-cyan-200">93%</p>
                    <p className="text-xs text-slate-200">Menos tiempo</p>
                  </div>
                  <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm p-3">
                    <p className="font-bold text-cyan-200">99.8%</p>
                    <p className="text-xs text-slate-200">Precisión IA</p>
                  </div>
                  <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm p-3">
                    <p className="font-bold text-cyan-200">24/7</p>
                    <p className="text-xs text-slate-200">Asistencia</p>
                  </div>
                </div>
              </div>

              <div className="relative h-72 mt-6 overflow-hidden rounded-2xl border border-cyan-300/30 bg-gradient-to-b from-[#081827]/95 to-[#0e2a44]/90">
                <div
                  className="absolute inset-0 opacity-50"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(34,211,238,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.16) 1px, transparent 1px)',
                    backgroundSize: '34px 34px',
                  }}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.16),transparent_58%)]" />
                <div className="absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 scale-[0.34] origin-center">
                  <BottleAnimation />
                </div>
              </div>
            </div>
          </section>

          <section className="w-full bg-surface p-8 rounded-2xl shadow-lg border border-lab-border">
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-mono font-bold text-accent">Sapient Lab</h1>
              <p className="text-sm text-muted mt-2">
                {mode === 'login' && 'Inicia sesión para continuar'}
                {mode === 'register' && 'Crea tu cuenta de laboratorio'}
                {mode === 'forgot_password' && 'Recuperar contraseña'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded border border-green-200">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-lab-border rounded focus:outline-none focus:border-accent font-sans"
                    placeholder="Ej. Ada Lovelace"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-lab-border rounded focus:outline-none focus:border-accent font-sans"
                  placeholder="tu@email.com"
                />
              </div>

              {mode !== 'forgot_password' && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => toggleMode('forgot_password')}
                        className="text-xs text-accent hover:underline focus:outline-none"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    )}
                  </div>
                  <div className="relative group">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-lab-border rounded focus:outline-none focus:border-accent font-sans"
                      placeholder="••••••••"
                    />
                    {mode === 'register' && (
                      <div className="absolute z-10 hidden group-hover:block w-[280px] p-3 mt-2 bg-gray-800 text-white text-xs rounded shadow-lg left-0 top-full">
                        <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-800 rotate-45"></div>
                        <p className="font-semibold mb-1">La contraseña debe incluir:</p>
                        <ul className="list-disc pl-4 space-y-1">
                          <li className={password.length >= 8 ? 'text-green-400' : 'text-gray-300'}>Al menos 8 caracteres</li>
                          <li className={/[A-Z]/.test(password) ? 'text-green-400' : 'text-gray-300'}>Al menos una mayúscula</li>
                          <li className={/[a-z]/.test(password) ? 'text-green-400' : 'text-gray-300'}>Al menos una minúscula</li>
                          <li className={/[0-9]/.test(password) ? 'text-green-400' : 'text-gray-300'}>Al menos un número</li>
                          <li className={/[!@#$%^&*.,_-]/.test(password) ? 'text-green-400' : 'text-gray-300'}>Un carácter especial (!@#$%^&*.,_-)</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-lab-border rounded focus:outline-none focus:border-accent font-sans"
                    placeholder="••••••••"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full text-white py-2 px-4 rounded transition-colors font-medium font-mono mt-2 ${isLoading ? 'bg-muted cursor-not-allowed' : 'bg-accent hover:bg-accent-dim'}`}
              >
                {isLoading ? 'CARGANDO...' : (
                  <>
                    {mode === 'login' && 'ENTRAR'}
                    {mode === 'register' && 'REGISTRARSE'}
                    {mode === 'forgot_password' && 'ENVIAR ENLACE'}
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted">
                {mode === 'login' ? '¿No tienes cuenta? ' :
                  mode === 'register' ? '¿Ya tienes cuenta? ' : '¿Recordaste tu contraseña? '}
              </span>
              <button
                type="button"
                onClick={() => toggleMode(mode === 'login' ? 'register' : 'login')}
                className="text-accent font-medium hover:underline cursor-pointer"
              >
                {mode === 'login' ? 'Regístrate aquí' : 'Inicia sesión'}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}