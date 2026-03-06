import supabase from '../config/supabase.js';

// ── HELPER: verificar que el grupo pertenece al profesor ───────────────────
const verificarOwnership = async (grupoId, profesorId) => {
  const { data } = await supabase
    .from('groups')
    .select('id')
    .eq('id', grupoId)
    .eq('profesor_id', profesorId)
    .single();
  return !!data;
};

// ── GRUPOS ─────────────────────────────────────────────────────────────────

export const getMisGrupos = async (req, res) => {
  try {
    const profesorId = req.user.userId;

    const { data: grupos, error } = await supabase
      .from('groups')
      .select('id, nombre, materia, grado, codigo')
      .eq('profesor_id', profesorId)
      .order('grado', { ascending: true });

    if (error) return res.status(500).json({ success: false, error: 'Error al obtener grupos' });

    if (!grupos || grupos.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const gruposConStats = await Promise.all(grupos.map(async (g) => {
      const [estudiantesRes, actividadesRes] = await Promise.all([
        supabase.from('group_students').select('id', { count: 'exact', head: true }).eq('group_id', g.id),
        supabase.from('events').select('id', { count: 'exact', head: true }).eq('group_id', g.id),
      ]);
      return {
        ...g,
        totalEstudiantes: estudiantesRes.count ?? 0,
        totalActividades: actividadesRes.count  ?? 0,
      };
    }));

    return res.status(200).json({ success: true, data: gruposConStats });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

// ── ESTUDIANTES Y NOTAS ────────────────────────────────────────────────────

export const getEstudiantesDeGrupo = async (req, res) => {
  try {
    const { id: grupoId } = req.params;
    const profesorId = req.user.userId;

    if (!await verificarOwnership(grupoId, profesorId)) {
      return res.status(403).json({ success: false, error: 'No tienes acceso a este grupo' });
    }

    // Obtener IDs de estudiantes inscritos
    const { data: inscritos, error: inscError } = await supabase
      .from('group_students')
      .select('student_id')
      .eq('group_id', grupoId);

    if (inscError) return res.status(500).json({ success: false, error: 'Error al obtener estudiantes' });
    if (!inscritos || inscritos.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const ids = inscritos.map(r => r.student_id);

    // Obtener datos de los usuarios
    const { data: usuarios, error: usersError } = await supabase
      .from('users')
      .select('id, nombre, apellidos, email, grado')
      .in('id', ids);

    if (usersError) return res.status(500).json({ success: false, error: 'Error al obtener datos de estudiantes' });

    // Obtener notas de este grupo para todos los estudiantes
    const { data: notas, error: notasError } = await supabase
      .from('grades')
      .select('id, student_id, titulo, nota, descripcion, created_at')
      .eq('group_id', grupoId)
      .order('created_at', { ascending: false });

    if (notasError) return res.status(500).json({ success: false, error: 'Error al obtener notas' });

    // Combinar: cada estudiante con sus notas
    const estudiantesConNotas = (usuarios || []).map(u => ({
      ...u,
      notas: (notas || []).filter(n => n.student_id === u.id),
    }));

    return res.status(200).json({ success: true, data: estudiantesConNotas });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

export const agregarNota = async (req, res) => {
  try {
    const { id: grupoId, studentId } = req.params;
    const profesorId = req.user.userId;
    const { titulo, nota, descripcion } = req.body;

    if (!await verificarOwnership(grupoId, profesorId)) {
      return res.status(403).json({ success: false, error: 'No tienes acceso a este grupo' });
    }

    if (!titulo || nota === undefined || nota === null) {
      return res.status(400).json({ success: false, error: 'Título y nota son requeridos' });
    }

    const valorNota = Number(nota);
    if (isNaN(valorNota) || valorNota < 0 || valorNota > 100) {
      return res.status(400).json({ success: false, error: 'La nota debe ser un número entre 0 y 100' });
    }

    const { data, error } = await supabase
      .from('grades')
      .insert([{
        student_id:  studentId,
        group_id:    grupoId,
        profesor_id: profesorId,
        titulo:      titulo.trim(),
        nota:        valorNota,
        descripcion: descripcion?.trim() || null,
        created_at:  new Date().toISOString(),
        updated_at:  new Date().toISOString(),
      }])
      .select().single();

    if (error) return res.status(500).json({ success: false, error: 'Error al agregar nota' });

    return res.status(201).json({ success: true, message: 'Nota agregada', data });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

export const editarNota = async (req, res) => {
  try {
    const { id: grupoId, notaId } = req.params;
    const profesorId = req.user.userId;
    const { titulo, nota, descripcion } = req.body;

    if (!await verificarOwnership(grupoId, profesorId)) {
      return res.status(403).json({ success: false, error: 'No tienes acceso a este grupo' });
    }

    if (!titulo || nota === undefined || nota === null) {
      return res.status(400).json({ success: false, error: 'Título y nota son requeridos' });
    }

    const valorNota = Number(nota);
    if (isNaN(valorNota) || valorNota < 0 || valorNota > 100) {
      return res.status(400).json({ success: false, error: 'La nota debe ser un número entre 0 y 100' });
    }

    const { data, error } = await supabase
      .from('grades')
      .update({
        titulo:      titulo.trim(),
        nota:        valorNota,
        descripcion: descripcion?.trim() || null,
        updated_at:  new Date().toISOString(),
      })
      .eq('id', notaId)
      .eq('group_id', grupoId)
      .select().single();

    if (error) return res.status(500).json({ success: false, error: 'Error al editar nota' });

    return res.status(200).json({ success: true, message: 'Nota actualizada', data });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

export const eliminarNota = async (req, res) => {
  try {
    const { id: grupoId, notaId } = req.params;
    const profesorId = req.user.userId;

    if (!await verificarOwnership(grupoId, profesorId)) {
      return res.status(403).json({ success: false, error: 'No tienes acceso a este grupo' });
    }

    const { error } = await supabase
      .from('grades')
      .delete()
      .eq('id', notaId)
      .eq('group_id', grupoId);

    if (error) return res.status(500).json({ success: false, error: 'Error al eliminar nota' });

    return res.status(200).json({ success: true, message: 'Nota eliminada' });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

// ── ACTIVIDADES ────────────────────────────────────────────────────────────

export const getActividades = async (req, res) => {
  try {
    const { id: grupoId } = req.params;
    const profesorId = req.user.userId;

    if (!await verificarOwnership(grupoId, profesorId)) {
      return res.status(403).json({ success: false, error: 'No tienes acceso a este grupo' });
    }

    const { data, error } = await supabase
      .from('events')
      .select('id, titulo, descripcion, fecha, hora, tipo, importante, ubicacion, creado_por, created_at')
      .eq('group_id', grupoId)
      .order('fecha', { ascending: true });

    if (error) return res.status(500).json({ success: false, error: 'Error al obtener actividades' });

    return res.status(200).json({ success: true, data: data || [] });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

export const createActividad = async (req, res) => {
  try {
    const { id: grupoId } = req.params;
    const profesorId = req.user.userId;
    const { titulo, descripcion, fecha, tipo, importante, ubicacion, hora } = req.body;

    if (!await verificarOwnership(grupoId, profesorId)) {
      return res.status(403).json({ success: false, error: 'No tienes acceso a este grupo' });
    }

    if (!titulo || !fecha) {
      return res.status(400).json({ success: false, error: 'Título y fecha son requeridos' });
    }

    const TIPOS_VALIDOS = ['actividad', 'examen', 'tarea', 'evento'];
    const tipoFinal = TIPOS_VALIDOS.includes(tipo) ? tipo : 'actividad';

    const { data, error } = await supabase
      .from('events')
      .insert([{
        group_id:    grupoId,
        titulo:      titulo.trim(),
        descripcion: descripcion?.trim() || null,
        fecha,
        hora:        hora || null,
        tipo:        tipoFinal,
        importante:  importante || false,
        ubicacion:   ubicacion?.trim() || null,
        creado_por:  profesorId,
        created_at:  new Date().toISOString(),
        updated_at:  new Date().toISOString(),
      }])
      .select().single();

    if (error) return res.status(500).json({ success: false, error: 'Error al crear actividad' });

    return res.status(201).json({ success: true, message: 'Actividad creada', data });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

export const updateActividad = async (req, res) => {
  try {
    const { id: grupoId, actividadId } = req.params;
    const profesorId = req.user.userId;
    const { titulo, descripcion, fecha, tipo, importante, ubicacion, hora } = req.body;

    if (!await verificarOwnership(grupoId, profesorId)) {
      return res.status(403).json({ success: false, error: 'No tienes acceso a este grupo' });
    }

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
        hora:        hora || null,
        tipo:        tipoFinal,
        importante:  importante || false,
        ubicacion:   ubicacion?.trim() || null,
        updated_at:  new Date().toISOString(),
      })
      .eq('id', actividadId)
      .eq('group_id', grupoId)
      .select().single();

    if (error) return res.status(500).json({ success: false, error: 'Error al actualizar actividad' });

    return res.status(200).json({ success: true, message: 'Actividad actualizada', data });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

export const deleteActividad = async (req, res) => {
  try {
    const { id: grupoId, actividadId } = req.params;
    const profesorId = req.user.userId;

    if (!await verificarOwnership(grupoId, profesorId)) {
      return res.status(403).json({ success: false, error: 'No tienes acceso a este grupo' });
    }

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', actividadId)
      .eq('group_id', grupoId);

    if (error) return res.status(500).json({ success: false, error: 'Error al eliminar actividad' });

    return res.status(200).json({ success: true, message: 'Actividad eliminada' });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

// ── MATERIALES ─────────────────────────────────────────────────────────────

export const getMateriales = async (req, res) => {
  try {
    const { id: grupoId } = req.params;
    const profesorId = req.user.userId;

    if (!await verificarOwnership(grupoId, profesorId)) {
      return res.status(403).json({ success: false, error: 'No tienes acceso a este grupo' });
    }

    const { data, error } = await supabase
      .from('materials')
      .select('id, titulo, descripcion, archivo_url, archivo_nombre, archivo_size, categoria, subido_por, fecha_publicacion, created_at')
      .eq('group_id', grupoId)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ success: false, error: 'Error al obtener materiales' });

    return res.status(200).json({ success: true, data: data || [] });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

export const createMaterial = async (req, res) => {
  try {
    const { id: grupoId } = req.params;
    const profesorId = req.user.userId;
    const { titulo, descripcion, archivo_url, archivo_nombre, archivo_size, categoria } = req.body;

    if (!await verificarOwnership(grupoId, profesorId)) {
      return res.status(403).json({ success: false, error: 'No tienes acceso a este grupo' });
    }

    if (!titulo || !archivo_url) {
      return res.status(400).json({ success: false, error: 'Título y URL del archivo son requeridos' });
    }

    const { data, error } = await supabase
      .from('materials')
      .insert([{
        group_id:          grupoId,
        titulo:            titulo.trim(),
        descripcion:       descripcion?.trim() || null,
        archivo_url:       archivo_url.trim(),
        archivo_nombre:    archivo_nombre?.trim() || null,
        archivo_size:      archivo_size || null,
        categoria:         categoria?.trim() || null,
        subido_por:        profesorId,
        fecha_publicacion: new Date().toISOString(),
        created_at:        new Date().toISOString(),
        updated_at:        new Date().toISOString(),
      }])
      .select().single();

    if (error) return res.status(500).json({ success: false, error: 'Error al crear material' });

    return res.status(201).json({ success: true, message: 'Material creado', data });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

export const deleteMaterial = async (req, res) => {
  try {
    const { id: grupoId, materialId } = req.params;
    const profesorId = req.user.userId;

    if (!await verificarOwnership(grupoId, profesorId)) {
      return res.status(403).json({ success: false, error: 'No tienes acceso a este grupo' });
    }

    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', materialId)
      .eq('group_id', grupoId);

    if (error) return res.status(500).json({ success: false, error: 'Error al eliminar material' });

    return res.status(200).json({ success: true, message: 'Material eliminado' });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

// ── CALENDARIO ─────────────────────────────────────────────────────────────

export const getCalendario = async (req, res) => {
  try {
    const profesorId = req.user.userId;

    // Obtener todos los grupos del profesor
    const { data: grupos, error: gruposError } = await supabase
      .from('groups')
      .select('id')
      .eq('profesor_id', profesorId);

    if (gruposError) return res.status(500).json({ success: false, error: 'Error al obtener grupos' });
    if (!grupos || grupos.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const grupoIds = grupos.map(g => g.id);

    // Traer eventos de todos sus grupos + eventos globales del admin (group_id = null)
    const { data, error } = await supabase
      .from('events')
      .select('id, titulo, descripcion, fecha, hora, tipo, importante, group_id, creado_por, created_at')
      .or(`group_id.in.(${grupoIds.join(',')}),group_id.is.null`)
      .order('fecha', { ascending: true });

    if (error) return res.status(500).json({ success: false, error: 'Error al obtener calendario' });

    return res.status(200).json({ success: true, data: data || [] });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

export const getEventosDeGrupo = async (req, res) => {
  try {
    const { id: grupoId } = req.params;
    const profesorId = req.user.userId;

    if (!await verificarOwnership(grupoId, profesorId)) {
      return res.status(403).json({ success: false, error: 'No tienes acceso a este grupo' });
    }

    // Eventos del grupo + eventos globales del admin
    const { data, error } = await supabase
      .from('events')
      .select('id, titulo, descripcion, fecha, hora, tipo, importante, group_id, creado_por, created_at')
      .or(`group_id.eq.${grupoId},group_id.is.null`)
      .order('fecha', { ascending: true });

    if (error) return res.status(500).json({ success: false, error: 'Error al obtener eventos' });

    return res.status(200).json({ success: true, data: data || [] });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

export const createEvento = async (req, res) => {
  try {
    const { id: grupoId } = req.params;
    const profesorId = req.user.userId;
    const { titulo, descripcion, fecha, tipo, importante } = req.body;

    if (!await verificarOwnership(grupoId, profesorId)) {
      return res.status(403).json({ success: false, error: 'No tienes acceso a este grupo' });
    }

    if (!titulo || !fecha) {
      return res.status(400).json({ success: false, error: 'Título y fecha son requeridos' });
    }

    const TIPOS_VALIDOS = ['actividad', 'examen', 'tarea', 'evento'];
    const tipoFinal = TIPOS_VALIDOS.includes(tipo) ? tipo : 'actividad';

    const { data, error } = await supabase
      .from('events')
      .insert([{
        group_id:    grupoId,
        titulo:      titulo.trim(),
        descripcion: descripcion?.trim() || null,
        fecha,
        tipo:        tipoFinal,
        importante:  importante || false,
        creado_por:  profesorId,
        created_at:  new Date().toISOString(),
        updated_at:  new Date().toISOString(),
      }])
      .select().single();

    if (error) return res.status(500).json({ success: false, error: 'Error al crear evento' });

    return res.status(201).json({ success: true, message: 'Evento creado', data });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

export const deleteEvento = async (req, res) => {
  try {
    const { id: grupoId, eventoId } = req.params;
    const profesorId = req.user.userId;

    if (!await verificarOwnership(grupoId, profesorId)) {
      return res.status(403).json({ success: false, error: 'No tienes acceso a este grupo' });
    }

    // Solo puede eliminar eventos de su grupo, no los globales del admin
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventoId)
      .eq('group_id', grupoId);

    if (error) return res.status(500).json({ success: false, error: 'Error al eliminar evento' });

    return res.status(200).json({ success: true, message: 'Evento eliminado' });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};