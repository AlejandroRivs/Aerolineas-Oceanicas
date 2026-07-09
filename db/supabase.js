const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
// Usar Service Role Key para bypass de RLS en operaciones del servidor
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Cliente de Supabase inicializado correctamente.');
  } catch (err) {
    console.error('Error al inicializar el cliente de Supabase:', err.message);
  }
} else {
  console.warn('Faltan variables de entorno para Supabase (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY). Usando modo Mock para PostgreSQL.');
}

module.exports = supabase;
