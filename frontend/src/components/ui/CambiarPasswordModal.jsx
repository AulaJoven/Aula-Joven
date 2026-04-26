// src/components/ui/CambiarPasswordModal.jsx
import { useState } from "react";
import api from "../../services/api";
import { Modal } from "./Modal";
import { Spinner } from "./Spinner";

const PASOS = { PASSWORD_ACTUAL: 1, CODIGO: 2, NUEVA_PASSWORD: 3, EXITO: 4 };

const EyeIcon = ({ open }) => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    {open ? (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    ) : (
      <>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
        />
      </>
    )}
  </svg>
);

const CheckIcon = () => (
  <svg
    className="w-12 h-12 text-emerald-500"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const STEP_LABELS = {
  1: "Verificar identidad",
  2: "Ingresar codigo",
  3: "Nueva contraseña",
};

export const CambiarPasswordModal = ({ isOpen, onClose }) => {
  const [paso, setPaso] = useState(PASOS.PASSWORD_ACTUAL);
  const [passwordActual, setPasswordActual] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setPaso(PASOS.PASSWORD_ACTUAL);
    setPasswordActual("");
    setCodigo("");
    setNuevaPassword("");
    setConfirmar("");
    setError("");
    setLoading(false);
    setShowPass(false);
    setShowNew(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // Paso 1 → enviar código
  const handleSolicitarCodigo = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/cambiar-password/solicitar", { passwordActual });
      setPaso(PASOS.CODIGO);
    } catch (err) {
      setError(err.response?.data?.error || "Contraseña incorrecta");
    } finally {
      setLoading(false);
    }
  };

  // Paso 2 → verificar código
  const handleVerificarCodigo = async (e) => {
    e.preventDefault();
    setError("");
    if (codigo.length !== 6) {
      setError("Ingresa el codigo de 6 digitos");
      return;
    }
    setPaso(PASOS.NUEVA_PASSWORD);
  };

  const handleReenviar = async () => {
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/cambiar-password/solicitar", { passwordActual });
    } catch (err) {
      setError(err.response?.data?.error || "Error al reenviar codigo");
    } finally {
      setLoading(false);
    }
  };

  // Paso 3 → cambiar contraseña
  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    setError("");
    if (nuevaPassword !== confirmar) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (nuevaPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/cambiar-password/confirmar", {
        codigo,
        nuevaPassword,
      });
      setPaso(PASOS.EXITO);
    } catch (err) {
      setError(err.response?.data?.error || "Error al cambiar contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={paso < PASOS.EXITO ? "Cambiar contraseña" : ""}
    >
      <div className="px-6 py-5">
        {/* Indicador de pasos */}
        {paso < PASOS.EXITO && (
          <div className="flex items-center gap-1 mb-6">
            {[1, 2, 3].map((n, i) => (
              <div key={n} className="flex items-center gap-1 flex-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all
                  ${paso > n ? "bg-emerald-500 text-white" : paso === n ? "bg-[#3D52A0] text-white" : "bg-slate-100 text-slate-400"}`}
                >
                  {paso > n ? "✓" : n}
                </div>
                <span
                  className={`text-xs truncate hidden sm:block ${paso === n ? "text-slate-700 font-medium" : "text-slate-400"}`}
                >
                  {STEP_LABELS[n]}
                </span>
                {i < 2 && (
                  <div
                    className={`h-px flex-1 mx-1 ${paso > n ? "bg-emerald-300" : "bg-slate-200"}`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Paso 1: Contraseña actual ── */}
        {paso === PASOS.PASSWORD_ACTUAL && (
          <form onSubmit={handleSolicitarCodigo} className="space-y-4">
            <p className="text-sm text-slate-500">
              Ingresa tu contraseña actual para verificar tu identidad. Te
              enviaremos un codigo de seguridad a tu correo.
            </p>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">
                contraseña actual *
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={passwordActual}
                  onChange={(e) => setPasswordActual(e.target.value)}
                  required
                  placeholder="Tu contraseña actual"
                  className="w-full px-3 py-2 pr-10 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D52A0]/20 focus:border-[#3D52A0]"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <EyeIcon open={showPass} />
                </button>
              </div>
            </div>
            {error && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !passwordActual}
                className="px-4 py-2 text-sm text-white bg-[#3D52A0] hover:bg-[#2D3F8A] rounded-lg disabled:opacity-60 flex items-center gap-2"
              >
                {loading && <Spinner />} Enviar codigo
              </button>
            </div>
          </form>
        )}

        {/* ── Paso 2: Código ── */}
        {paso === PASOS.CODIGO && (
          <form onSubmit={handleVerificarCodigo} className="space-y-4">
            <p className="text-sm text-slate-500">
              Ingresa el codigo de 6 digitos que enviamos a tu correo. Expira en
              10 minutos.
            </p>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">
                Codigo de verificacion *
              </label>
              <input
                type="text"
                maxLength={6}
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
                required
                placeholder="000000"
                className="w-full px-3 py-3 text-center text-2xl font-bold tracking-[0.5em] border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D52A0]/20 focus:border-[#3D52A0] font-mono"
              />
              <p className="text-xs text-slate-400 text-center mt-1">
                ¿No recibiste el codigo?{" "}
                <button
                  type="button"
                  onClick={handleReenviar}
                  disabled={loading}
                  className="text-[#3D52A0] hover:underline disabled:opacity-50"
                >
                  Reenviar
                </button>
              </p>
            </div>
            {error && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <div className="flex justify-between pt-1">
              <button
                type="button"
                onClick={() => {
                  setPaso(PASOS.PASSWORD_ACTUAL);
                  setError("");
                }}
                className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Atras
              </button>
              <button
                type="submit"
                disabled={loading || codigo.length !== 6}
                className="px-4 py-2 text-sm text-white bg-[#3D52A0] hover:bg-[#2D3F8A] rounded-lg disabled:opacity-60 flex items-center gap-2"
              >
                {loading && <Spinner />} Continuar
              </button>
            </div>
          </form>
        )}

        {/* ── Paso 3: Nueva contraseña ── */}
        {paso === PASOS.NUEVA_PASSWORD && (
          <form onSubmit={handleCambiarPassword} className="space-y-4">
            <p className="text-sm text-slate-500">
              Elige una contraseña segura de al menos 8 caracteres.
            </p>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">
                Nueva contraseña *
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={nuevaPassword}
                  onChange={(e) => setNuevaPassword(e.target.value)}
                  required
                  placeholder="Minimo 8 caracteres"
                  className="w-full px-3 py-2 pr-10 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D52A0]/20 focus:border-[#3D52A0]"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <EyeIcon open={showNew} />
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">
                Confirmar contraseña *
              </label>
              <input
                type="password"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                required
                placeholder="Repite la contraseña"
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D52A0]/20 focus:border-[#3D52A0]
                  ${confirmar && confirmar !== nuevaPassword ? "border-red-300" : "border-slate-200"}`}
              />
              {confirmar && confirmar !== nuevaPassword && (
                <p className="text-xs text-red-500 mt-1">
                  Las contraseñas no coinciden
                </p>
              )}
            </div>
            {error && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <div className="flex justify-between pt-1">
              <button
                type="button"
                onClick={() => {
                  setPaso(PASOS.CODIGO);
                  setError("");
                }}
                className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Atras
              </button>
              <button
                type="submit"
                disabled={
                  loading || !nuevaPassword || nuevaPassword !== confirmar
                }
                className="px-4 py-2 text-sm text-white bg-[#3D52A0] hover:bg-[#2D3F8A] rounded-lg disabled:opacity-60 flex items-center gap-2"
              >
                {loading && <Spinner />} Cambiar contraseña
              </button>
            </div>
          </form>
        )}

        {/* ── Paso 4: Éxito ── */}
        {paso === PASOS.EXITO && (
          <div className="text-center py-4">
            <div className="flex justify-center mb-4">
              <CheckIcon />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              contraseña actualizada
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Tu contraseña ha sido cambiada exitosamente.
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-2 text-sm text-white bg-[#3D52A0] hover:bg-[#2D3F8A] rounded-lg"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
