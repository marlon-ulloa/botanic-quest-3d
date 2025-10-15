/*
  # Botanic Quest 3D Database Schema

  ## Overview
  Creates the database structure for the Botanic Quest 3D educational game.
  Stores plant information and tracks user progress through discoveries.

  ## New Tables
  
  ### `plants`
  Stores the complete catalog of 98 plants with scientific data
  - `id` (uuid, primary key) - Unique identifier
  - `scientific_name` (text, unique) - Official scientific name (e.g., "Rosa canina")
  - `common_name` (text) - Common name in Spanish
  - `description` (text) - Educational description
  - `image_url` (text) - URL or path to plant image
  - `family` (text) - Plant family classification
  - `difficulty` (text) - Learning difficulty: easy, medium, hard
  - `zone` (text) - Garden zone: tropical, desert, forest, aquatic
  - `created_at` (timestamptz) - Record creation timestamp

  ### `user_progress`
  Tracks individual user discoveries and achievements
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid) - Reference to authenticated user
  - `plant_id` (uuid) - Reference to discovered plant
  - `discovered_at` (timestamptz) - When the plant was identified
  - `mode` (text) - Discovery mode: exploration or rush
  - `attempts` (integer) - Number of attempts before success
  - `created_at` (timestamptz) - Record creation timestamp

  ### `high_scores`
  Stores high scores for Rush Mode
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid) - Reference to authenticated user
  - `score` (integer) - Points achieved
  - `plants_correct` (integer) - Number of correct identifications
  - `plants_total` (integer) - Total plants encountered
  - `created_at` (timestamptz) - When score was achieved

  ## Security
  - Enable RLS on all tables
  - Authenticated users can read all plants
  - Users can only read/write their own progress and scores
  - Public read access to plants table for game data

  ## Indexes
  - Index on scientific_name for quick lookups
  - Index on user_id for progress queries
  - Index on zone for filtering by garden area
*/

-- Create plants table
CREATE TABLE IF NOT EXISTS plants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scientific_name text UNIQUE NOT NULL,
  common_name text NOT NULL,
  description text NOT NULL,
  image_url text DEFAULT '',
  family text DEFAULT '',
  difficulty text DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  zone text DEFAULT 'forest' CHECK (zone IN ('tropical', 'desert', 'forest', 'aquatic')),
  created_at timestamptz DEFAULT now()
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plant_id uuid NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  discovered_at timestamptz DEFAULT now(),
  mode text DEFAULT 'exploration' CHECK (mode IN ('exploration', 'rush')),
  attempts integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, plant_id)
);

-- Create high_scores table
CREATE TABLE IF NOT EXISTS high_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  score integer DEFAULT 0,
  plants_correct integer DEFAULT 0,
  plants_total integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_plants_scientific_name ON plants(scientific_name);
CREATE INDEX IF NOT EXISTS idx_plants_zone ON plants(zone);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_plant_id ON user_progress(plant_id);
CREATE INDEX IF NOT EXISTS idx_high_scores_user_id ON high_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_high_scores_score ON high_scores(score DESC);

-- Enable Row Level Security
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE high_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies for plants table (public read)
CREATE POLICY "Anyone can view plants"
  ON plants FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert plants"
  ON plants FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "Only admins can update plants"
  ON plants FOR UPDATE
  TO authenticated
  USING (false);

-- RLS Policies for user_progress table
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for high_scores table
CREATE POLICY "Anyone can view high scores"
  ON high_scores FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own scores"
  ON high_scores FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users cannot update scores"
  ON high_scores FOR UPDATE
  TO authenticated
  USING (false);

-- Insert sample plant data (20 examples to start)
INSERT INTO plants (scientific_name, common_name, description, family, difficulty, zone) VALUES
('Rosa canina', 'Rosal silvestre', 'Arbusto espinoso de la familia de las rosáceas, conocido por sus flores rosadas y sus frutos rojos llamados escaramujos.', 'Rosaceae', 'easy', 'forest'),
('Aloe vera', 'Sábila', 'Planta suculenta medicinal utilizada desde la antigüedad para tratar heridas y problemas de piel.', 'Asphodelaceae', 'easy', 'desert'),
('Lavandula angustifolia', 'Lavanda', 'Planta aromática perenne con flores violetas, ampliamente utilizada en perfumería y aromaterapia.', 'Lamiaceae', 'easy', 'forest'),
('Monstera deliciosa', 'Costilla de Adán', 'Planta tropical trepadora famosa por sus grandes hojas perforadas y su fruto comestible.', 'Araceae', 'medium', 'tropical'),
('Ficus elastica', 'Árbol del caucho', 'Árbol tropical de hojas grandes y brillantes, cultivado como planta ornamental de interior.', 'Moraceae', 'medium', 'tropical'),
('Sansevieria trifasciata', 'Lengua de suegra', 'Planta suculenta muy resistente, conocida por su capacidad de purificar el aire interior.', 'Asparagaceae', 'easy', 'desert'),
('Helianthus annuus', 'Girasol', 'Planta anual de flores amarillas grandes que siguen el movimiento del sol, cultivada por sus semillas comestibles.', 'Asteraceae', 'easy', 'forest'),
('Mentha piperita', 'Menta', 'Hierba aromática perenne utilizada en gastronomía y medicina tradicional.', 'Lamiaceae', 'easy', 'forest'),
('Nymphaea alba', 'Nenúfar blanco', 'Planta acuática de flores blancas flotantes, símbolo de pureza en muchas culturas.', 'Nymphaeaceae', 'medium', 'aquatic'),
('Cactus opuntia', 'Nopal', 'Cactus de tallos aplanados comestibles, típico de zonas áridas de América.', 'Cactaceae', 'medium', 'desert'),
('Orchidaceae phalaenopsis', 'Orquídea mariposa', 'Planta epífita tropical conocida por sus flores elegantes y duraderas.', 'Orchidaceae', 'hard', 'tropical'),
('Spathiphyllum wallisii', 'Cuna de Moisés', 'Planta tropical de interior con flores blancas en forma de espata, excelente purificadora de aire.', 'Araceae', 'easy', 'tropical'),
('Citrus limon', 'Limonero', 'Árbol frutal pequeño que produce limones, rico en vitamina C.', 'Rutaceae', 'medium', 'forest'),
('Thymus vulgaris', 'Tomillo', 'Hierba aromática mediterránea utilizada en cocina y medicina natural.', 'Lamiaceae', 'easy', 'forest'),
('Echinocactus grusonii', 'Asiento de suegra', 'Cactus globular de gran tamaño con espinas doradas, originario de México.', 'Cactaceae', 'medium', 'desert'),
('Victoria amazonica', 'Victoria regia', 'Planta acuática gigante con hojas circulares flotantes de hasta 3 metros de diámetro.', 'Nymphaeaceae', 'hard', 'aquatic'),
('Dracaena marginata', 'Drácena marginada', 'Planta de interior resistente con hojas largas y estrechas con bordes rojizos.', 'Asparagaceae', 'easy', 'tropical'),
('Rosmarinus officinalis', 'Romero', 'Arbusto aromático mediterráneo utilizado como condimento y planta medicinal.', 'Lamiaceae', 'easy', 'forest'),
('Agave americana', 'Pita', 'Planta suculenta de gran tamaño utilizada para producir fibras y bebidas alcohólicas.', 'Asparagaceae', 'medium', 'desert'),
('Nelumbo nucifera', 'Loto sagrado', 'Planta acuática sagrada en culturas asiáticas, conocida por sus flores rosadas y hojas repelentes al agua.', 'Nelumbonaceae', 'hard', 'aquatic')
ON CONFLICT (scientific_name) DO NOTHING;
