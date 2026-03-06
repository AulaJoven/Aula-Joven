// src/controllers/estudianteController.js
import supabase from "../config/supabase.js";

// ── HELPER: verificar inscripción ──────────────────────────────────────────
const verificarInscripcion = async (estudianteId, grupoId) => {
  const { data } = await supabase
    .from("group_students")
    .select("id")
    .eq("group_id", grupoId)
    .eq("student_id", estudianteId)
    .single();
  return !!data;
};

// ── GET /estudiante/mis-materias ───────────────────────────────────────────
export const getMisMaterias = async (req, res) => {
  try {
    const estudianteId = req.user.userId;

    // Grupos donde está inscrito
    const { data: inscripciones, error: inscError } = await supabase
      .from("group_students")
      .select("group_id")
      .eq("student_id", estudianteId);

    if (inscError)
      return res
        .status(500)
        .json({ success: false, error: "Error al obtener materias" });
    if (!inscripciones || inscripciones.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const grupoIds = inscripciones.map((i) => i.group_id);

    // Datos de los grupos con profesor
    const { data: grupos, error: gruposError } = await supabase
      .from("groups")
      .select(
        "id, nombre, materia, grado, profesor_id, users(nombre, apellidos)",
      )
      .in("id", grupoIds);

    if (gruposError)
      return res
        .status(500)
        .json({ success: false, error: "Error al obtener grupos" });

    // Notas del estudiante en todos sus grupos
    const { data: notas } = await supabase
      .from("grades")
      .select("id, group_id, titulo, nota, descripcion, created_at")
      .eq("student_id", estudianteId)
      .in("group_id", grupoIds)
      .order("created_at", { ascending: false });

    // Armar respuesta
    const materias = (grupos || []).map((g) => {
      const notasGrupo = (notas || []).filter((n) => n.group_id === g.id);
      const promedio =
        notasGrupo.length > 0
          ? Math.round(
              (notasGrupo.reduce((sum, n) => sum + Number(n.nota), 0) /
                notasGrupo.length) *
                10,
            ) / 10
          : null;

      return {
        id: g.id,
        nombre: g.nombre,
        materia: g.materia,
        grado: g.grado,
        profesor: g.users
          ? `${g.users.nombre} ${g.users.apellidos}`
          : "Sin asignar",
        totalNotas: notasGrupo.length,
        promedio,
        notas: notasGrupo,
      };
    });

    return res.status(200).json({ success: true, data: materias });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ success: false, error: "Error interno del servidor" });
  }
};

// ── GET /estudiante/grupos/:id/calificaciones ──────────────────────────────
export const getCalificaciones = async (req, res) => {
  try {
    const estudianteId = req.user.userId;
    const { id: grupoId } = req.params;

    // Verificar inscripción
    const inscrito = await verificarInscripcion(estudianteId, grupoId);
    if (!inscrito) {
      return res
        .status(403)
        .json({ success: false, error: "No estás inscrito en este grupo" });
    }

    // Notas del estudiante en el grupo
    const { data: notas, error } = await supabase
      .from("grades")
      .select("id, titulo, nota, descripcion, created_at")
      .eq("student_id", estudianteId)
      .eq("group_id", grupoId)
      .order("created_at", { ascending: false });

    if (error)
      return res
        .status(500)
        .json({ success: false, error: "Error al obtener calificaciones" });

    const promedio =
      notas && notas.length > 0
        ? Math.round(
            (notas.reduce((sum, n) => sum + Number(n.nota), 0) / notas.length) *
              10,
          ) / 10
        : null;

    return res.status(200).json({
      success: true,
      data: {
        notas: notas || [],
        promedio,
        total: notas?.length || 0,
      },
    });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, error: "Error interno del servidor" });
  }
};

// ── GET /estudiante/grupos/:id/actividades ─────────────────────────────────
export const getActividades = async (req, res) => {
  try {
    const estudianteId = req.user.userId;
    const { id: grupoId } = req.params;

    const inscrito = await verificarInscripcion(estudianteId, grupoId);
    if (!inscrito) {
      return res
        .status(403)
        .json({ success: false, error: "No estás inscrito en este grupo" });
    }

    const { data, error } = await supabase
      .from("events")
      .select("id, titulo, descripcion, fecha, tipo, importante, created_at")
      .eq("group_id", grupoId)
      .in("tipo", ["actividad", "tarea", "examen"])
      .order("fecha", { ascending: true });

    if (error)
      return res
        .status(500)
        .json({ success: false, error: "Error al obtener actividades" });

    return res.status(200).json({ success: true, data: data || [] });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, error: "Error interno del servidor" });
  }
};

// ── GET /estudiante/grupos/:id/materiales ──────────────────────────────────
export const getMateriales = async (req, res) => {
  try {
    const estudianteId = req.user.userId;
    const { id: grupoId } = req.params;

    const inscrito = await verificarInscripcion(estudianteId, grupoId);
    if (!inscrito) {
      return res
        .status(403)
        .json({ success: false, error: "No estás inscrito en este grupo" });
    }

    const { data, error } = await supabase
      .from("materials")
      .select(
        "id, titulo, descripcion, archivo_url, archivo_nombre, archivo_size, categoria, created_at",
      )
      .eq("group_id", grupoId)
      .order("created_at", { ascending: false });

    if (error)
      return res
        .status(500)
        .json({ success: false, error: "Error al obtener materiales" });

    return res.status(200).json({ success: true, data: data || [] });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, error: "Error interno del servidor" });
  }
};

// ── GET /estudiante/grupos/:id/eventos ─────────────────────────────────────
export const getEventos = async (req, res) => {
  try {
    const estudianteId = req.user.userId;
    const { id: grupoId } = req.params;

    const inscrito = await verificarInscripcion(estudianteId, grupoId);
    if (!inscrito) {
      return res
        .status(403)
        .json({ success: false, error: "No estás inscrito en este grupo" });
    }

    const { data, error } = await supabase
      .from("events")
      .select(
        "id, titulo, descripcion, fecha, tipo, importante, group_id, created_at",
      )
      .or(`group_id.eq.${grupoId},group_id.is.null`)
      .order("fecha", { ascending: true });

    if (error)
      return res
        .status(500)
        .json({ success: false, error: "Error al obtener eventos" });

    return res.status(200).json({ success: true, data: data || [] });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, error: "Error interno del servidor" });
  }
};

// ── GET /estudiante/calendario ─────────────────────────────────────────────
export const getCalendario = async (req, res) => {
  try {
    const estudianteId = req.user.userId;

    // Obtener grupos del estudiante
    const { data: inscripciones } = await supabase
      .from('group_students')
      .select('group_id')
      .eq('student_id', estudianteId);

    if (!inscripciones || inscripciones.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const grupoIds = inscripciones.map(i => i.group_id);

    // Obtener nombres de los grupos
    const { data: grupos } = await supabase
      .from('groups')
      .select('id, nombre, materia')
      .in('id', grupoIds);

    const grupoMap = {};
    (grupos || []).forEach(g => { grupoMap[g.id] = `${g.materia} — ${g.nombre}`; });

    // Eventos de todos los grupos + globales
    const filtro = grupoIds.map(id => `group_id.eq.${id}`).join(',');
    const { data: eventos, error } = await supabase
      .from('events')
      .select('id, titulo, descripcion, fecha, tipo, importante, group_id, created_at')
      .or(`${filtro},group_id.is.null`)
      .order('fecha', { ascending: true });

    if (error) return res.status(500).json({ success: false, error: 'Error al obtener calendario' });

    const data = (eventos || []).map(ev => ({
      ...ev,
      grupo: ev.group_id ? (grupoMap[ev.group_id] || 'Grupo desconocido') : 'General',
    }));

    return res.status(200).json({ success: true, data });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

// ── Agregar en estudianteController.js ────────────────────────────────────

// GET /estudiante/grupos/:id/asistencia
export const getAsistenciaEstudiante = async (req, res) => {
  try {
    const estudianteId = req.user.userId;
    const { id }       = req.params;

    // Verificar inscripción
    await verificarInscripcion(estudianteId, id);

    const { data, error } = await supabase
      .from('attendance')
      .select('id, fecha, descripcion, presente, created_at')
      .eq('group_id',   id)
      .eq('student_id', estudianteId)
      .order('fecha', { ascending: false });

    if (error) return res.status(500).json({ success: false, error: 'Error al obtener asistencia' });

    const registros  = data || [];
    const total      = registros.length;
    const presentes  = registros.filter(r => r.presente).length;
    const ausentes   = registros.filter(r => !r.presente).length;
    const porcentaje = total > 0 ? Math.round((presentes / total) * 100) : null;

    return res.status(200).json({
      success: true,
      data: {
        registros,
        resumen: { total, presentes, ausentes, porcentaje },
      },
    });
  } catch (e) {
    if (e.message === 'No inscrito') {
      return res.status(403).json({ success: false, error: 'No estás inscrito en este grupo' });
    }
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};