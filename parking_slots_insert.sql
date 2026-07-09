-- Script de Inicialización de 20 Plazas de Estacionamiento en Supabase
-- Ejecuta este comando en la consola SQL de Supabase para habilitar las 20 plazas de demostración.

-- Limpia cualquier registro anterior
TRUNCATE TABLE parking_slots CASCADE;

-- Insertar las 20 plazas
INSERT INTO parking_slots (identificador_plaza, estado) VALUES
('A-1', 'Libre'),
('A-2', 'Libre'),
('A-3', 'Libre'),
('A-4', 'Libre'),
('A-5', 'Libre'),
('A-6', 'Libre'),
('A-7', 'Libre'),
('A-8', 'Libre'),
('A-9', 'Libre'),
('A-10', 'Libre'),
('B-1', 'Libre'),
('B-2', 'Libre'),
('B-3', 'Libre'),
('B-4', 'Libre'),
('B-5', 'Libre'),
('B-6', 'Libre'),
('B-7', 'Libre'),
('B-8', 'Libre'),
('B-9', 'Libre'),
('B-10', 'Libre');
