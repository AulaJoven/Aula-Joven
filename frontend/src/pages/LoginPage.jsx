import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import bgLogin from "../assets/bg-login.webp";
import logoFundacion from "../assets/logo-fundacion.webp";

const getRoleHome = (rol) => {
  if (rol === "admin") return "/admin";
  if (rol === "profesor") return "/profesor";
  if (rol === "estudiante") return "/estudiante";
  return "/login";
};

const EyeIcon = ({ open }) =>
  open ? (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
      />
    </svg>
  ) : (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );

const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    document.body.style.backgroundColor = "#3D52A0";
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Ingresa tu correo y contraseña");
      return;
    }
    setError("");
    setLoading(true);
    const result = await login(email.trim(), password, rememberMe);
    if (result.success) {
      window.location.href = getRoleHome(result.rol);
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Fondo */}
      <img
        src={bgLogin}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay azul */}
      <div className="absolute inset-0 bg-[#3D52A0]/70" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm mx-4">
        <div
          className="bg-[#FFFDF0] rounded-2xl px-8 py-10 flex flex-col items-center"
          style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.3)" }}
        >
          {/* Logo */}
          <img
            src={logoFundacion}
            alt="Fundación Curridabat"
            className="w-32 h-32 object-contain mb-6"
          />

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            {/* Email */}
            <input
              type="email"
              placeholder="Ingrese su Usuario"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl text-sm bg-white border border-slate-200 placeholder:text-slate-400 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#3D52A0]/30 disabled:opacity-60"
            />

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Ingrese su Contraseña"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                disabled={loading}
                className="w-full px-4 py-3 pr-11 rounded-xl text-sm bg-white border border-slate-200 placeholder:text-slate-400 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#3D52A0]/30 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>

            {/* Recordar sesión */}
            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 accent-[#3D52A0]"
              />
              <label
                htmlFor="remember"
                className="text-xs text-slate-500 cursor-pointer"
              >
                Recordar sesión
              </label>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold bg-[#7BAFD4] hover:bg-[#5B9BC4] text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Ingresando...
                </>
              ) : (
                "Ingresar"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
