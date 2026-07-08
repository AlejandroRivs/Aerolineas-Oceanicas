const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('Cliente de Supabase inicializado correctamente.');
  } catch (err) {
    console.error('Error al inicializar el cliente de Supabase:', err.message);
  }
} else {
  console.warn('Faltan variables de entorno para Supabase (SUPABASE_URL / SUPABASE_ANON_KEY). Usando modo Mock para PostgreSQL.');
}

module.exports = supabase;
