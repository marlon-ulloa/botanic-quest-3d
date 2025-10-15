import { useState, useEffect } from 'react';
import { X, Flower2, ChevronLeft } from 'lucide-react';
import { Plant, getUserProgress, fetchAllPlants, fetchAllPlantss } from '../lib/supabase';

interface HerbarioProps {
  onClose: () => void;
}

export default function Herbario({ onClose }: HerbarioProps) {
  const [discoveredPlants, setDiscoveredPlants] = useState<Plant[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDiscoveredPlants();
  }, []);

  const loadDiscoveredPlants = async () => {
    try {
      const progress = await getUserProgress();
      const allPlants = await fetchAllPlantss();
      console.log(progress);
      const discoveredIds = new Set(progress.map(p => p.plant_id));
      console.log(discoveredIds);
      const discovered = allPlants.filter(plant => discoveredIds.has(plant.id));
      console.log(discovered);
      console.log(allPlants);

      setDiscoveredPlants(discovered);
    } catch (error) {
      console.error('Error loading herbario:', error);
    } finally {
      setLoading(false);
    }
  };

  const zoneColors: { [key: string]: string } = {
    tropical: 'bg-green-100 text-green-800 border-green-300',
    desert: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    forest: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    aquatic: 'bg-cyan-100 text-cyan-800 border-cyan-300'
  };

  const zoneNames: { [key: string]: string } = {
    tropical: 'Tropical',
    desert: 'Desierto',
    forest: 'Bosque',
    aquatic: 'Acuática'
  };

  if (selectedPlant) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-green-50 to-emerald-100 z-50 overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          <button
            onClick={() => setSelectedPlant(null)}
            className="flex items-center gap-2 text-green-700 hover:text-green-900 mb-6 font-semibold"
          >
            <ChevronLeft className="w-5 h-5" />
            Volver al Herbario
          </button>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white">
              <div className="flex items-start gap-4">
                <Flower2 className="w-12 h-12 flex-shrink-0" />
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-2">{selectedPlant.common_name}</h2>
                  <p className="text-xl italic text-green-100">{selectedPlant.scientific_name}</p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Familia</h3>
                <p className="text-gray-600">{selectedPlant.family || 'No especificada'}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Zona</h3>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border-2 ${zoneColors[selectedPlant.zone]}`}>
                  {zoneNames[selectedPlant.zone]}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Descripción</h3>
                <p className="text-gray-600 leading-relaxed">{selectedPlant.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Dificultad</h3>
                <div className="flex gap-2">
                  {['easy', 'medium', 'hard'].map((level) => (
                    <div
                      key={level}
                      className={`w-8 h-8 rounded ${
                        selectedPlant.difficulty === level
                          ? level === 'easy'
                            ? 'bg-green-500'
                            : level === 'medium'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-gray-600 capitalize">
                    {selectedPlant.difficulty === 'easy' ? 'Fácil' :
                     selectedPlant.difficulty === 'medium' ? 'Media' : 'Difícil'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-green-50 to-emerald-100 z-50 overflow-auto">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Flower2 className="w-10 h-10 text-green-600" />
            <div>
              <h1 className="text-3xl font-bold text-green-800">Herbario Virtual</h1>
              <p className="text-green-600">
                {discoveredPlants.length} plantas descubiertas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-white hover:bg-gray-50 text-gray-700 p-3 rounded-full shadow-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
            <p className="mt-4 text-green-700">Cargando herbario...</p>
          </div>
        ) : discoveredPlants.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Flower2 className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              Aún no has descubierto plantas
            </h2>
            <p className="text-gray-500">
              Juega en Modo Exploración o Modo Rush para empezar a coleccionar plantas
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {discoveredPlants.map((plant) => (
              <button
                key={plant.id}
                onClick={() => setSelectedPlant(plant)}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-105 overflow-hidden text-left"
              >
                <div className="bg-gradient-to-br from-green-400 to-emerald-500 h-40 flex items-center justify-center">
                  <Flower2 className="w-20 h-20 text-white opacity-80" />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-800 mb-1">
                    {plant.common_name}
                  </h3>
                  <p className="text-sm italic text-gray-600 mb-3">
                    {plant.scientific_name}
                  </p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${zoneColors[plant.zone]}`}>
                    {zoneNames[plant.zone]}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
