import supabase from '../config/supabase.js';
import { hashPassword, generateTempPassword } from '../utils/passwordUtils.js';
import { sendWelcomeEmail } from '../services/emailService.js';

// ── USUARIOS ───────────────────────────────────────────────────────────────

export const getUsers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, nombre, apellidos, email, rol, grado, activo, created_at')
      .in('rol', ['profesor', 'estudiante'])
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ success: false, error: 'Error al obtener usuarios' });

    const { data: grupos } = await supabase
      .from('groups')
      .select('profesor_id, nombre, materia');

    const users = (data || []).map(u => {
      if (u.rol === 'profesor') {
        const misGrupos = (grupos || []).filter(g => g.profesor_id === u.id);
        return { ...u, materias: misGrupos.map(g => `${g.materia} — ${g.nombre}`) };
      }
      return u;
    });

    return res.status(200).json({ success: true, data: users });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

export const createUser = async (req, res) => {
  try {
    const { nombre, apellidos, email, rol, grado, cedula } = req.body;

    if (!nombre || !apellidos || !email || !rol) {
      return res.status(400).json({ success: false, error: 'Nombre, apellidos, email y rol son requeridos' });
    }

    if (!['profesor', 'estudiante'].includes(rol)) {
      return res.status(400).json({ success: false, error: 'Rol inválido' });
    }

    if (rol === 'estudiante' && !grado) {
      return res.status(400).json({ success: false, error: 'El grado es requerido para estudiantes' });
    }

    const { data: existing } = await supabase
      .from('users').select('email').eq('email', email.toLowerCase().trim());

    if (existing?.length > 0) {
      return res.status(409).json({ success: false, error: 'El email ya está registrado' });
    }

    const tempPassword   = generateTempPassword();
    const hashedPassword = await hashPassword(tempPassword);

    const userData = {
      nombre:     nombre.trim(),
      apellidos:  apellidos.trim(),
      email:      email.toLowerCase().trim(),
      password:   hashedPassword,
      rol,
      activo:     true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (rol === 'estudiante') userData.grado = Number(grado);
    if (cedula)               userData.cedula = String(cedula).trim();

    const { data: newUser, error } = await supabase
      .from('users').insert([userData]).select().single();

    if (error) return res.status(500).json({ success: false, error: 'Error al crear usuario' });

    const emailResult = await sendWelcomeEmail(newUser.email, newUser.nombre, newUser.apellidos, tempPassword);

    return res.status(201).json({
      success: true,
      message: emailResult.success ? 'Usuario creado y correo enviado' : 'Usuario creado, correo no enviado',
      data: {
        user: { id: newUser.id, nombre: newUser.nombre, apellidos: newUser.apellidos, email: newUser.email, rol: newUser.rol, grado: newUser.grado || null },
        emailStatus: emailResult.success ? 'sent' : 'failed',
      },
    });
  } catch (e) {
    console.error('ERROR createUser:', e);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellidos, grado, cedula } = req.body;

    if (!nombre || !apellidos) {
      return res.status(400).json({ success: false, error: 'Nombre y apellidos son requeridos' });
    }

    const updateData = { nombre: nombre.trim(), apellidos: apellidos.trim(), updated_at: new Date().toISOString() };
    if (grado) updateData.grado = Number(grado);
    if (cedula) updateData.cedula = String(cedula).trim();

    const { data, error } = await supabase
      .from('users').update(updateData).eq('id', id).select().single();

    if (error) return res.status(500).json({ success: false, error: 'Error al actualizar usuario' });

    return res.status(200).json({ success: true, message: 'Usuario actualizado', data: { user: data } });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.userId) {
      return res.status(400).json({ success: false, error: 'No puedes eliminarte a ti mismo' });
    }

    const { error } = await supabase.from('users').delete().eq('id', id);

    if (error) return res.status(500).json({ success: false, error: 'Error al eliminar usuario' });

    return res.status(200).json({ success: true, message: 'Usuario eliminado' });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

// ── GRUPOS ─────────────────────────────────────────────────────────────────

export const getGrupos = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('groups')
      .select(`
        id, nombre, materia, grado, codigo, created_at,
        users ( id, nombre, apellidos )
      `)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ success: false, error: 'Error al obtener grupos' });

    const grupos = (data || []).map(g => ({
      id:          g.id,
      nombre:      g.nombre,
      materia:     g.materia,
      grado:       g.grado,
      codigo:      g.codigo,
      profesor:    g.users ? `${g.users.nombre} ${g.users.apellidos}` : 'Sin asignar',
      profesor_id: g.users?.id || null,
    }));

    return res.status(200).json({ success: true, data: grupos });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

export const createGrupo = async (req, res) => {
  try {
    const { nombre, materia, grado, codigo, profesor_id } = req.body;

    if (!nombre || !materia || !grado || !codigo || !profesor_id) {
      return res.status(400).json({ success: false, error: 'Todos los campos son requeridos' });
    }

    const { data: existing } = await supabase
      .from('groups').select('codigo').eq('codigo', codigo.toUpperCase().trim());

    if (existing?.length > 0) {
      return res.status(409).json({ success: false, error: 'El código ya existe' });
    }

    const { data, error } = await supabase
      .from('groups')
      .insert([{
        nombre:      nombre.trim(),
        materia:     materia.trim(),
        grado:       Number(grado),
        codigo:      codigo.toUpperCase().trim(),
        profesor_id,
        created_at:  new Date().toISOString(),
      }])
      .select().single();

    if (error) return res.status(500).json({ success: false, error: 'Error al crear grupo' });

    return res.status(201).json({ success: true, message: 'Grupo creado', data });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

export const updateGrupo = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, materia, grado, codigo, profesor_id } = req.body;

    if (!nombre || !materia || !grado || !codigo || !profesor_id) {
      return res.status(400).json({ success: false, error: 'Todos los campos son requeridos' });
    }

    const { data, error } = await supabase
      .from('groups')
      .update({ nombre: nombre.trim(), materia: materia.trim(), grado: Number(grado), codigo: codigo.toUpperCase().trim(), profesor_id })
      .eq('id', id).select().single();

    if (error) return res.status(500).json({ success: false, error: 'Error al actualizar grupo' });

    return res.status(200).json({ success: true, message: 'Grupo actualizado', data });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

export const deleteGrupo = async (req, res) => {
  try {
    const { id } = req.params;

    await supabase.from('group_students').delete().eq('group_id', id);

    const { error } = await supabase.from('groups').delete().eq('id', id);

    if (error) return res.status(500).json({ success: false, error: 'Error al eliminar grupo' });

    return res.status(200).json({ success: true, message: 'Grupo eliminado' });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

// ── INSCRIPCIONES ──────────────────────────────────────────────────────────

export const getEstudiantesGrupo = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('group_students')
      .select('student_id')
      .eq('group_id', id);

    if (error) return res.status(500).json({ success: false, error: 'Error al obtener estudiantes' });

    if (!data || data.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const ids = data.map(r => r.student_id);

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, nombre, apellidos, email, grado')
      .in('id', ids);

    if (usersError) return res.status(500).json({ success: false, error: 'Error al obtener usuarios' });

    return res.status(200).json({ success: true, data: users || [] });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

export const inscribirEstudiante = async (req, res) => {
  try {
    const { id } = req.params;
    const { estudiante_id } = req.body;

    if (!estudiante_id) {
      return res.status(400).json({ success: false, error: 'estudiante_id es requerido' });
    }

    const { data: existing } = await supabase
      .from('group_students')
      .select('id')
      .eq('group_id', id)
      .eq('student_id', estudiante_id);

    if (existing?.length > 0) {
      return res.status(409).json({ success: false, error: 'El estudiante ya está inscrito en este grupo' });
    }

    const { error } = await supabase
      .from('group_students')
      .insert([{ group_id: id, student_id: estudiante_id }]);

    if (error) return res.status(500).json({ success: false, error: 'Error al inscribir estudiante' });

    return res.status(201).json({ success: true, message: 'Estudiante inscrito' });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

export const desinscribirEstudiante = async (req, res) => {
  try {
    const { id, estudianteId } = req.params;

    const { error } = await supabase
      .from('group_students')
      .delete()
      .eq('group_id', id)
      .eq('student_id', estudianteId);

    if (error) return res.status(500).json({ success: false, error: 'Error al desinscribir estudiante' });

    return res.status(200).json({ success: true, message: 'Estudiante desinscrito' });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

// ── EVENTOS ────────────────────────────────────────────────────────────────

export const getEventos = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('id, titulo, descripcion, fecha, tipo, importante, created_at')
      .order('fecha', { ascending: true });

    if (error) return res.status(500).json({ success: false, error: 'Error al obtener eventos' });

    return res.status(200).json({ success: true, data: data || [] });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

export const createEvento = async (req, res) => {
  try {
    const { titulo, descripcion, fecha, tipo, importante } = req.body;

    if (!titulo || !fecha) {
      return res.status(400).json({ success: false, error: 'Título y fecha son requeridos' });
    }

    const TIPOS_VALIDOS = ['actividad', 'examen', 'tarea', 'evento'];
    const tipoFinal = TIPOS_VALIDOS.includes(tipo) ? tipo : 'actividad';

    const { data, error } = await supabase
      .from('events')
      .insert([{
        titulo:      titulo.trim(),
        descripcion: descripcion?.trim() || null,
        fecha,
        tipo:        tipoFinal,
        importante:  importante || false,
        created_at:  new Date().toISOString(),
      }])
      .select().single();

    if (error) return res.status(500).json({ success: false, error: 'Error al crear evento' });

    return res.status(201).json({ success: true, message: 'Evento creado', data });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

export const updateEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, fecha, tipo, importante } = req.body;

    if (!titulo || !fecha) {
      return res.status(400).json({ success: false, error: 'Título y fecha son requeridos' });
    }

    const TIPOS_VALIDOS = ['actividad', 'examen', 'tarea', 'evento'];
    const tipoFinal = TIPOS_VALIDOS.includes(tipo) ? tipo : 'actividad';

    const { data, error } = await supabase
      .from('events')
      .update({
        titulo:      titulo.trim(),
        descripcion: descripcion?.trim() || null,
        fecha,
        tipo:        tipoFinal,
        importante:  importante || false,
      })
      .eq('id', id)
      .select().single();

    if (error) return res.status(500).json({ success: false, error: 'Error al actualizar evento' });

    return res.status(200).json({ success: true, message: 'Evento actualizado', data });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

export const deleteEvento = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from('events').delete().eq('id', id);

    if (error) return res.status(500).json({ success: false, error: 'Error al eliminar evento' });

    return res.status(200).json({ success: true, message: 'Evento eliminado' });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

// ── SEED FERIADOS ──────────────────────────────────────────────────────────

// Calcula el Domingo de Pascua (algoritmo de Butcher)
const calcularPascua = (year) => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day   = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
};

const pad = (n) => String(n).padStart(2, '0');
const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

const getFeriadosCR = (year) => {
  const pascua = calcularPascua(year);

  return [
    // ── Fijos ─────────────────────────────────────────────────────────────
    { titulo: 'Año Nuevo',                 fecha: `${year}-01-01`, tipo: 'evento', importante: false  },
    { titulo: 'Día del Trabajo',           fecha: `${year}-05-01`, tipo: 'evento', importante: false },
    { titulo: '🇨🇷 Anexión de Nicoya',        fecha: `${year}-07-25`, tipo: 'evento', importante: false },
    { titulo: '🇨🇷 Día de la Madre',          fecha: `${year}-08-15`, tipo: 'evento', importante: false },
    { titulo: '🇨🇷 Independencia de CR',      fecha: `${year}-09-15`, tipo: 'evento', importante: false  },
    { titulo: 'Día de las Culturas',       fecha: `${year}-10-12`, tipo: 'evento', importante: false },
    { titulo: 'Navidad',                   fecha: `${year}-12-25`, tipo: 'evento', importante: false  },
    { titulo: 'Fin de Año',                fecha: `${year}-12-31`, tipo: 'evento', importante: false },

    // ── Semana Santa (móvil) ───────────────────────────────────────────────
    { titulo: 'Jueves Santo',              fecha: fmt(addDays(pascua, -3)), tipo: 'evento', importante: false  },
    { titulo: 'Viernes Santo',             fecha: fmt(addDays(pascua, -2)), tipo: 'evento', importante: false  },
    { titulo: 'Sábado de Gloria',          fecha: fmt(addDays(pascua, -1)), tipo: 'evento', importante: false },
    { titulo: 'Domingo de Pascua',         fecha: fmt(pascua),              tipo: 'evento', importante: false  },

    // ── Eventos académicos típicos ─────────────────────────────────────────
    { titulo: 'Inicio del Año Lectivo',    fecha: `${year}-02-03`, tipo: 'actividad', importante: false  },
    { titulo: 'Fin del I Trimestre',       fecha: `${year}-04-11`, tipo: 'actividad', importante: false  },
    { titulo: 'Fin del II Trimestre',      fecha: `${year}-08-01`, tipo: 'actividad', importante: false  },
    { titulo: 'Fin del Año Lectivo',       fecha: `${year}-11-14`, tipo: 'actividad', importante: false  },
    { titulo: 'Vacaciones de Medio Año',  fecha: `${year}-07-07`, tipo: 'evento', importante: false },
  ];
};

export const seedFeriados = async (req, res) => {
  try {
    const year = new Date().getFullYear();

    const { data: existing } = await supabase
      .from('events')
      .select('id')
      .is('group_id', null)
      .eq('titulo', `Año Nuevo`)
      .lte('fecha', `${year}-12-31`);

    if (existing && existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: `Ya existen ${existing.length} eventos globales para ${year}. Elimínalos primero si deseas regenerarlos.`,
      });
    }

    const feriados = getFeriadosCR(year).map(f => ({
      ...f,
      group_id:    null,
      descripcion: null,
      created_at:  new Date().toISOString(),
      updated_at:  new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from('events')
      .insert(feriados)
      .select();

      console.log('seed error:', error);

    if (error) return res.status(500).json({ success: false, error: 'Error al insertar feriados' });

    return res.status(201).json({
      success: true,
      message: `${data.length} eventos creados para ${year}`,
      data,
    });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

export const deleteFeriadosAnio = async (req, res) => {
  try {
    const year = new Date().getFullYear();

    const { error } = await supabase
      .from('events')
      .delete()
      .is('group_id', null)
      .gte('fecha', `${year}-01-01`)
      .lte('fecha', `${year}-12-31`);

    if (error) return res.status(500).json({ success: false, error: 'Error al eliminar eventos' });

    return res.status(200).json({ success: true, message: `Eventos globales de ${year} eliminados` });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

// ── Agregar en adminController.js ─────────────────────────────────────────
// POST /admin/users/bulk
// Body: { estudiantes: [{ nombre, apellidos, cedula, grado, email }, ...] }

export const createUsersBulk = async (req, res) => {
  try {
    const { estudiantes } = req.body;

    if (!estudiantes || !Array.isArray(estudiantes) || estudiantes.length === 0) {
      return res.status(400).json({ success: false, error: 'Se requiere un arreglo de estudiantes' });
    }

    // ── Validar campos requeridos ────────────────────────────────────────
    const invalidos = [];
    const validos   = [];

    for (const [i, e] of estudiantes.entries()) {
      const fila = i + 2;
      if (!e.nombre || !e.apellidos || !e.cedula || !e.grado || !e.email) {
        invalidos.push({ fila, cedula: e.cedula || '—', razon: 'Faltan campos requeridos' });
      } else if (!/\S+@\S+\.\S+/.test(e.email)) {
        invalidos.push({ fila, cedula: e.cedula, razon: 'Email inválido' });
      } else {
        validos.push(e);
      }
    }

    if (validos.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Ningún registro tiene los campos requeridos válidos',
        data: { invalidos },
      });
    }

    // ── Verificar duplicados — cédula como número ────────────────────────
    const cedulas = validos.map(e => Number(e.cedula));
    const emails  = validos.map(e => e.email.toLowerCase().trim());

    const { data: existentesEmail }  = await supabase
      .from('users').select('email, cedula').in('email', emails);

    const { data: existentesCedula } = await supabase
      .from('users').select('email, cedula').in('cedula', cedulas);

    const emailsExistentes  = new Set((existentesEmail  || []).map(u => u.email.toLowerCase()));
    const cedulasExistentes = new Set((existentesCedula || []).map(u => Number(u.cedula)));

    const saltados = [];
    const aNuevos  = [];

    for (const e of validos) {
      const emailNorm  = e.email.toLowerCase().trim();
      const cedulaNorm = Number(e.cedula);

      if (emailsExistentes.has(emailNorm) || cedulasExistentes.has(cedulaNorm)) {
        saltados.push({ nombre: `${e.nombre} ${e.apellidos}`, cedula: cedulaNorm, razon: 'Ya existe en el sistema' });
      } else {
        aNuevos.push({ ...e, email: emailNorm, cedula: cedulaNorm });
      }
    }

    if (aNuevos.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Todos los registros ya existen en el sistema',
        data: { creados: 0, saltados: saltados.length, saltadosDetalle: saltados, invalidos },
      });
    }

    // ── Crear usuarios nuevos ────────────────────────────────────────────
    const creados         = [];
    const erroresCreacion = [];

    for (const e of aNuevos) {
      try {
        const tempPassword   = generateTempPassword();
        const hashedPassword = await hashPassword(tempPassword);

        const { data: newUser, error } = await supabase
          .from('users')
          .insert([{
            nombre:     e.nombre.trim(),
            apellidos:  e.apellidos.trim(),
            email:      e.email,
            cedula:     e.cedula,       // ya es Number
            password:   hashedPassword,
            rol:        'estudiante',
            grado:      Number(e.grado),
            activo:     true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }])
          .select().single();

        if (error) throw new Error(error.message);

        sendWelcomeEmail(newUser.email, newUser.nombre, newUser.apellidos, tempPassword)
          .catch(err => console.error(`Email fallido para ${newUser.email}:`, err));

          await new Promise(resolve => setTimeout(resolve, 500));

        creados.push({ nombre: `${newUser.nombre} ${newUser.apellidos}`, cedula: e.cedula, email: newUser.email });
      } catch (err) {
        erroresCreacion.push({ nombre: `${e.nombre} ${e.apellidos}`, cedula: e.cedula, razon: err.message });
      }
    }

    return res.status(201).json({
      success: true,
      message: `${creados.length} estudiante(s) creados correctamente`,
      data: {
        creados:         creados.length,
        saltados:        saltados.length,
        invalidosCount:  invalidos.length + erroresCreacion.length,
        creadosDetalle:  creados,
        saltadosDetalle: saltados,
        invalidos:       [...invalidos, ...erroresCreacion],
      },
    });
  } catch (e) {
    console.error('ERROR createUsersBulk:', e);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

// ── Agregar en adminController.js ─────────────────────────────────────────

// GET /admin/grupos/:id/estudiantes/:estudianteId/asistencia
export const getAsistencia = async (req, res) => {
  try {
    const { id, estudianteId } = req.params;

    const { data, error } = await supabase
      .from('attendance')
      .select('id, fecha, descripcion, presente, created_at')
      .eq('group_id',   id)
      .eq('student_id', estudianteId)
      .order('fecha', { ascending: false });

    if (error) return res.status(500).json({ success: false, error: 'Error al obtener asistencia' });

    const total    = data?.length || 0;
    const presentes = data?.filter(r => r.presente).length  || 0;
    const ausentes  = data?.filter(r => !r.presente).length || 0;

    return res.status(200).json({
      success: true,
      data: {
        registros: data || [],
        resumen: { total, presentes, ausentes },
      },
    });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

// POST /admin/grupos/:id/estudiantes/:estudianteId/asistencia
export const registrarAsistencia = async (req, res) => {
  try {
    const { id, estudianteId } = req.params;
    const { fecha, descripcion, presente } = req.body;

    if (!fecha) {
      return res.status(400).json({ success: false, error: 'La fecha es requerida' });
    }

    // Verificar que el estudiante pertenece al grupo
    const { data: inscripcion } = await supabase
      .from('group_students')
      .select('id')
      .eq('group_id',   id)
      .eq('student_id', estudianteId)
      .single();

    if (!inscripcion) {
      return res.status(404).json({ success: false, error: 'El estudiante no está inscrito en este grupo' });
    }

    // Upsert — si ya existe ese día, actualizar
    const { data, error } = await supabase
      .from('attendance')
      .upsert([{
        group_id:    id,
        student_id:  estudianteId,
        fecha,
        descripcion: descripcion?.trim() || null,
        presente:    presente ?? false,
        updated_at:  new Date().toISOString(),
      }], { onConflict: 'group_id,student_id,fecha' })
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, error: 'Error al registrar asistencia' });

    return res.status(201).json({ success: true, message: 'Asistencia registrada', data });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

// DELETE /admin/grupos/:id/estudiantes/:estudianteId/asistencia/:registroId
export const eliminarAsistencia = async (req, res) => {
  try {
    const { registroId } = req.params;

    const { error } = await supabase
      .from('attendance')
      .delete()
      .eq('id', registroId);

    if (error) return res.status(500).json({ success: false, error: 'Error al eliminar registro' });

    return res.status(200).json({ success: true, message: 'Registro eliminado' });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};