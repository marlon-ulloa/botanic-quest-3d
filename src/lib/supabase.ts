import { createClient } from '@supabase/supabase-js';
import plantsData from "../data/plants.json";
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Plant {
  id: string;
  //id: number;
  scientific_name: string;
  common_name: string;
  description: string;
  image_url: string;
  family: string;
  //difficulty: 'easy' | 'medium' | 'hard';
  difficulty: string;
  //zone: 'tropical' | 'desert' | 'forest' | 'aquatic';
  zone: string;
  /*created_at: string;*/
}

export interface UserProgress {
  id: string;
  user_id: string;
  plant_id: string;
  discovered_at: string;
  mode: 'exploration' | 'rush';
  attempts: number;
  created_at: string;
}

export interface HighScore {
  id: string;
  user_id: string;
  score: number;
  plants_correct: number;
  plants_total: number;
  created_at: string;
}


// Nueva función que lee del JSON en lugar de Supabase
export async function fetchAllPlantss(): Promise<Plant[]> {
  // Simulamos una llamada asíncrona (por ejemplo, si luego quieres hacerlo remoto)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(plantsData.plants);
    }, 300); // opcional: pequeño delay para simular carga
  });
}

export async function fetchAllPlants(): Promise<Plant[]> {
  const { data, error } = await supabase
    .from('plants')
    .select('*')
    .order('common_name');

  if (error) throw error;
  return data || [];
}

export async function saveProgress(plantId: string, mode: 'exploration' | 'rush', attempts: number = 1) {
  const userId = 'guest';
  const progress = {
    user_id: userId,
    plant_id: plantId,
    mode,
    attempts: attempts,
    discovered_at: new Date().toISOString()
  }
  let datastr = localStorage.getItem("progress");
  let array = [];
  if(datastr){
    array = JSON.parse(datastr);
  } 
  array.push(progress);
  localStorage.setItem("progress", JSON.stringify(array));
  const { error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: userId,
      plant_id: plantId,
      mode,
      attempts,
      discovered_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,plant_id'
    });

  if (error) console.error('Error saving progress:', error);
}

export async function getUserProgress(): Promise<UserProgress[]> {
  /*const userId = 'guest';

  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .order('discovered_at', { ascending: false });

  if (error) {
    console.error('Error fetching progress:', error);
    return [];
  }*/
  let datastr = localStorage.getItem("progress");
  if(!datastr) return [];
  const data = JSON.parse(datastr);
  return data || [];
}

export async function saveHighScore(score: number, plantsCorrect: number, plantsTotal: number) {
  const userId = 'guest';
  const hscore = {
    userId: userId,
    score,
    plants_correct: plantsCorrect,
    plants_total: plantsTotal
  }
  let datastr = localStorage.getItem("score");
  let array = [];
  if(datastr){
    array = JSON.parse(datastr);
  } 
  array.push(hscore);
  localStorage.setItem("score", JSON.stringify(array));
  const { error } = await supabase
    .from('high_scores')
    .insert({
      user_id: userId,
      score,
      plants_correct: plantsCorrect,
      plants_total: plantsTotal
    });

  if (error) console.error('Error saving high score:', error);
}

export async function getTopScores(limit: number = 10): Promise<HighScore[]> {
  /*const { data, error } = await supabase
    .from('high_scores')
    .select('*')
    .order('score', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching high scores:', error);
    return [];
  }*/
 let dscore = localStorage.getItem("score");
 if(!dscore) return [];
 const data = JSON.parse(dscore);
  return data || [];
}
