-- Script de Inicialización de 20 Plazas de Estacionamiento en Supabase
-- Ejecuta este script en el SQL Editor de tu proyecto de Supabase.
-- Usa INSERT ... ON CONFLICT para no destruir datos relacionados.

-- Asegurarse de que la tabla tenga la estructura correcta
ALTER TABLE parking_slots
  ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'Libre',
  ADD COLUMN IF NOT EXISTS usuario_id BIGINT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS fecha_entrada TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ultimo_cargo TIMESTAMPTZ DEFAULT NULL;

-- Insertar las 20 plazas (actualiza si ya existen)
INSERT INTO parking_slots (identificador_plaza, estado, usuario_id, fecha_entrada, ultimo_cargo) VALUES
('A-1',  'Libre', NULL, NULL, NULL),
('A-2',  'Libre', NULL, NULL, NULL),
('A-3',  'Libre', NULL, NULL, NULL),
('A-4',  'Libre', NULL, NULL, NULL),
('A-5',  'Libre', NULL, NULL, NULL),
('A-6',  'Libre', NULL, NULL, NULL),
('A-7',  'Libre', NULL, NULL, NULL),
('A-8',  'Libre', NULL, NULL, NULL),
('A-9',  'Libre', NULL, NULL, NULL),
('A-10', 'Libre', NULL, NULL, NULL),
('B-1',  'Libre', NULL, NULL, NULL),
('B-2',  'Libre', NULL, NULL, NULL),
('B-3',  'Libre', NULL, NULL, NULL),
('B-4',  'Libre', NULL, NULL, NULL),
('B-5',  'Libre', NULL, NULL, NULL),
('B-6',  'Libre', NULL, NULL, NULL),
('B-7',  'Libre', NULL, NULL, NULL),
('B-8',  'Libre', NULL, NULL, NULL),
('B-9',  'Libre', NULL, NULL, NULL),
('B-10', 'Libre', NULL, NULL, NULL)
ON CONFLICT (identificador_plaza)
DO UPDATE SET
  estado = 'Libre',
  usuario_id = NULL,
  fecha_entrada = NULL,
  ultimo_cargo = NULL;

-- Opcional: Deshabilitar RLS en parking_slots para que el backend tenga acceso completo
-- (Solo si no tienes SUPABASE_SERVICE_ROLE_KEY configurada en Vercel)
-- ALTER TABLE parking_slots DISABLE ROW LEVEL SECURITY;
