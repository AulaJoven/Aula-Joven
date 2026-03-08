import SibApiV3Sdk from 'sib-api-v3-sdk';

const defaultClient = SibApiV3Sdk.ApiClient.instance;
defaultClient.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;
const client = new SibApiV3Sdk.TransactionalEmailsApi();

const emailTemplate = (nombre, apellidos, email, tempPassword) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Bienvenido a Aula Joven</title>
</head>
<body style="margin:0;padding:0;background-color:#F0F2F5;font-family:'Segoe UI',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0F2F5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#3D52A0 0%,#5B73C9 100%);border-radius:16px 16px 0 0;padding:40px 48px;text-align:center;">
              <p style="margin:0 0 8px 0;font-size:13px;font-weight:600;color:rgba(255,255,255,0.7);letter-spacing:3px;text-transform:uppercase;">Fundacion Curridabat</p>
              <h1 style="margin:0;font-size:32px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Aula Joven</h1>
              <div style="width:48px;height:3px;background:rgba(255,255,255,0.4);border-radius:2px;margin:16px auto 0;"></div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:48px;">
              <h2 style="margin:0 0 8px 0;font-size:24px;font-weight:700;color:#1e293b;">Bienvenido, ${nombre}.</h2>
              <p style="margin:0 0 32px 0;font-size:16px;color:#64748b;line-height:1.6;">
                Tu cuenta en la plataforma educativa Aula Joven ha sido creada exitosamente. A continuacion encontras tus credenciales de acceso.
              </p>

              <!-- Credentials box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFF;border:1.5px solid #E0E7FF;border-radius:12px;margin-bottom:32px;">
                <tr>
                  <td style="padding:28px 32px;">
                    <p style="margin:0 0 20px 0;font-size:12px;font-weight:700;color:#3D52A0;letter-spacing:2px;text-transform:uppercase;">Credenciales de acceso</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #E0E7FF;">
                          <p style="margin:0;font-size:12px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Nombre completo</p>
                          <p style="margin:4px 0 0 0;font-size:16px;color:#1e293b;font-weight:600;">${nombre} ${apellidos}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #E0E7FF;">
                          <p style="margin:0;font-size:12px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Correo electronico</p>
                          <p style="margin:4px 0 0 0;font-size:16px;color:#1e293b;font-weight:600;">${email}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;">
                          <p style="margin:0;font-size:12px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Contraseña temporal</p>
                          <p style="margin:8px 0 0 0;display:inline-block;">
                            <span style="background:#3D52A0;color:#ffffff;font-size:20px;font-weight:800;letter-spacing:4px;padding:10px 20px;border-radius:8px;font-family:'Courier New',monospace;">
                              ${tempPassword}
                            </span>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Warning -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF7ED;border:1.5px solid #FED7AA;border-radius:10px;margin-bottom:32px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;font-size:14px;color:#92400e;line-height:1.5;">
                      <strong>Importante:</strong> Esta es una contraseña temporal. Por seguridad, te recomendamos cambiarla la primera vez que ingreses a la plataforma.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:15px;color:#64748b;line-height:1.6;">
                Si tienes alguna consulta o problema para ingresar, comunicate con el administrador de la plataforma.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F8FAFF;border:1px solid #E0E7FF;border-top:none;border-radius:0 0 16px 16px;padding:24px 48px;text-align:center;">
              <p style="margin:0 0 4px 0;font-size:13px;font-weight:600;color:#3D52A0;">Aula Joven — Fundacion Curridabat</p>
              <p style="margin:0;font-size:12px;color:#94a3b8;">Este correo fue generado automaticamente. Por favor no respondas a este mensaje.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
`;

export const sendWelcomeEmail = async (email, nombre, apellidos, tempPassword) => {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email, name: `${nombre} ${apellidos}` }];
    sendSmtpEmail.sender = { email: 'aulajovenn@gmail.com', name: 'Aula Joven - Fundacion Curridabat' };
    sendSmtpEmail.subject = `Bienvenido a Aula Joven, ${nombre}`;
    sendSmtpEmail.htmlContent = emailTemplate(nombre, apellidos, email, tempPassword);
    await client.sendTransacEmail(sendSmtpEmail);
    console.log(`Correo enviado a ${email}`);
    return { success: true };
  } catch (error) {
    console.error('Error enviando email:', error);
    return { success: false, error: error.message };
  }
};