import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();

  const validatePassword = (pass: string) => {
    if (pass.length < 8) return 'Debe tener al menos 8 caracteres.';
    if (!/[A-Z]/.test(pass)) return 'Debe incluir al menos una mayúscula.';
    if (!/[a-z]/.test(pass)) return 'Debe incluir al menos una minúscula.';
    if (!/[0-9]/.test(pass)) return 'Debe incluir al menos un número.';
    if (!/[!@#$%^&*.,_-]/.test(pass)) return 'Debe incluir al menos un carácter especial.';
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (mode === 'forgot_password') {
      if (!email) {
        setError('Por favor, ingresa tu correo electrónico.');
        return;
      }
      // Simular envío de correo
      setSuccessMsg('Se ha enviado un enlace de recuperación a tu correo electrónico.');
      return; // No redirigimos, para que el usuario pueda ver el mensaje
    }

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        return;
      }
      
      const pwdError = validatePassword(password);
      if (pwdError) {
        setError(pwdError);
        return;
      }
      
      // TODO: Implementar registro real en backend
      console.log('Creando usuario:', { name, email });
      navigate('/onboarding');
    } else {
      // TODO: Implementar inicio de sesión real en backend
      console.log('Iniciando sesión con:', email);
      navigate('/onboarding');
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
    <div className="min-h-screen flex items-center justify-center bg-lab-bg p-4">
      <div className="w-full max-w-sm bg-surface p-8 rounded-lg shadow-sm border border-lab-border">
        
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-mono font-bold text-accent">SapientLab</h1>
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
                      <li className={password.length >= 8 ? "text-green-400" : "text-gray-300"}>Al menos 8 caracteres</li>
                      <li className={/[A-Z]/.test(password) ? "text-green-400" : "text-gray-300"}>Al menos una mayúscula</li>
                      <li className={/[a-z]/.test(password) ? "text-green-400" : "text-gray-300"}>Al menos una minúscula</li>
                      <li className={/[0-9]/.test(password) ? "text-green-400" : "text-gray-300"}>Al menos un número</li>
                      <li className={/[!@#$%^&*.,_-]/.test(password) ? "text-green-400" : "text-gray-300"}>Un carácter especial (!@#$%^&*.,_-)</li>
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
            className="w-full bg-accent text-white py-2 px-4 rounded hover:bg-accent-dim transition-colors font-medium font-mono mt-2"
          >
            {mode === 'login' && 'ENTRAR'}
            {mode === 'register' && 'REGISTRARSE'}
            {mode === 'forgot_password' && 'ENVIAR ENLACE'}
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

      </div>
    </div>
  );
}