import supabase from '../config/supabase.js';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { comparePassword } from '../utils/passwordUtils.js';
import { generateToken } from '../utils/tokenUtils.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── LOGIN ──────────────────────────────────────────────────────────────────

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email y contraseña son requeridos' });
    }

    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim());

    if (error) return res.status(500).json({ success: false, error: 'Error al buscar usuario' });

    if (!users || users.length === 0) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
    }

    const user = users[0];

    if (!user.activo) {
      return res.status(403).json({ success: false, error: 'Usuario desactivado. Contacta al administrador.' });
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        user: {
          id:        user.id,
          nombre:    user.nombre,
          apellidos: user.apellidos,
          email:     user.email,
          rol:       user.rol,
          grado:     user.grado || null,
          activo:    user.activo,
        }
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

// ── SOLICITAR CÓDIGO DE VERIFICACIÓN ──────────────────────────────────────

export const solicitarCodigo = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, nombre, apellidos, email')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    // Eliminar códigos anteriores del usuario
    await supabase
      .from('password_reset_codes')
      .delete()
      .eq('user_id', userId);

    // Generar código de 6 dígitos
    const code      = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    const { error: insertError } = await supabase
      .from('password_reset_codes')
      .insert([{
        user_id:    userId,
        code,
        expires_at: expiresAt.toISOString(),
      }]);

    if (insertError) {
      return res.status(500).json({ success: false, error: 'Error al generar código' });
    }

    // Enviar correo
    await transporter.sendMail({
      from:    `"Aula Joven - Fundacion Curridabat" <${process.env.EMAIL_USER}>`,
      to:      user.email,
      subject: 'Codigo de verificacion — Aula Joven',
      html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background-color:#F0F2F5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0F2F5;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#3D52A0 0%,#5B73C9 100%);border-radius:16px 16px 0 0;padding:40px 48px;text-align:center;">
            <p style="margin:0 0 8px 0;font-size:13px;font-weight:600;color:rgba(255,255,255,0.7);letter-spacing:3px;text-transform:uppercase;">Fundacion Curridabat</p>
            <h1 style="margin:0;font-size:32px;font-weight:800;color:#ffffff;">Aula Joven</h1>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;padding:48px;">
            <h2 style="margin:0 0 8px 0;font-size:24px;font-weight:700;color:#1e293b;">Verificacion de identidad</h2>
            <p style="margin:0 0 32px 0;font-size:16px;color:#64748b;line-height:1.6;">
              Hola ${user.nombre}, recibimos una solicitud para cambiar la contraseña de tu cuenta. Usa el siguiente codigo para continuar.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFF;border:1.5px solid #E0E7FF;border-radius:12px;margin-bottom:32px;">
              <tr>
                <td style="padding:32px;text-align:center;">
                  <p style="margin:0 0 12px 0;font-size:12px;font-weight:700;color:#3D52A0;letter-spacing:2px;text-transform:uppercase;">Codigo de verificacion</p>
                  <span style="background:#3D52A0;color:#ffffff;font-size:36px;font-weight:800;letter-spacing:12px;padding:16px 32px;border-radius:12px;font-family:'Courier New',monospace;">${code}</span>
                  <p style="margin:16px 0 0 0;font-size:13px;color:#94a3b8;">Este codigo expira en 10 minutos.</p>
                </td>
              </tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF7ED;border:1.5px solid #FED7AA;border-radius:10px;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0;font-size:14px;color:#92400e;line-height:1.5;">
                    <strong>Importante:</strong> Si no solicitaste este cambio, ignora este correo. Tu contraseña actual no sera modificada.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#F8FAFF;border:1px solid #E0E7FF;border-top:none;border-radius:0 0 16px 16px;padding:24px 48px;text-align:center;">
            <p style="margin:0 0 4px 0;font-size:13px;font-weight:600;color:#3D52A0;">Aula Joven — Fundacion Curridabat</p>
            <p style="margin:0;font-size:12px;color:#94a3b8;">Este correo fue generado automaticamente. Por favor no respondas a este mensaje.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });

    return res.status(200).json({ success: true, message: 'Codigo enviado al correo' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

// ── CAMBIAR CONTRASEÑA ─────────────────────────────────────────────────────

export const cambiarPassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { codigo, nuevaPassword } = req.body;

    if (!codigo || !nuevaPassword) {
      return res.status(400).json({ success: false, error: 'Codigo y nueva contraseña son requeridos' });
    }

    if (nuevaPassword.length < 8) {
      return res.status(400).json({ success: false, error: 'La contraseña debe tener al menos 8 caracteres' });
    }

    // Buscar código
    const { data: resetCode, error } = await supabase
      .from('password_reset_codes')
      .select('id, code, expires_at')
      .eq('user_id', userId)
      .eq('code', codigo)
      .single();

    if (error || !resetCode) {
      return res.status(400).json({ success: false, error: 'Codigo invalido' });
    }

    // Verificar expiración
    if (new Date() > new Date(resetCode.expires_at)) {
      await supabase.from('password_reset_codes').delete().eq('id', resetCode.id);
      return res.status(400).json({ success: false, error: 'El codigo ha expirado. Solicita uno nuevo' });
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(nuevaPassword, 12);

    // Actualizar contraseña
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedPassword, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (updateError) {
      return res.status(500).json({ success: false, error: 'Error al actualizar contraseña' });
    }

    // Eliminar código — ya se usó
    await supabase.from('password_reset_codes').delete().eq('id', resetCode.id);

    return res.status(200).json({ success: true, message: 'Contraseña actualizada correctamente' });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};