import { Flower2, Zap, BookOpen, Trophy } from 'lucide-react';

interface MainMenuProps {
  onModeSelect: (mode: 'exploration' | 'rush' | 'herbario') => void;
}

export default function MainMenu({ onModeSelect }: MainMenuProps) {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-green-400 via-emerald-500 to-teal-600 flex items-center justify-center z-50">
      <div className="text-center space-y-8 p-8 max-w-2xl">
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Flower2 className="w-16 h-16 text-yellow-300" />
          </div>
          <h1 className="text-5xl font-bold text-white drop-shadow-lg">
            Botanic Quest 3D
          </h1>
          <p className="text-xl text-green-100">
            La Aventura del Jardín Científico
          </p>
        </div>

        <p className="text-white text-lg max-w-md mx-auto">
          Explora un jardín virtual y aprende los nombres científicos de 98 plantas de forma divertida e interactiva
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <button
            onClick={() => onModeSelect('exploration')}
            className="bg-white hover:bg-green-50 text-green-700 font-semibold py-6 px-6 rounded-xl shadow-lg transform transition hover:scale-105 hover:shadow-xl"
          >
            <div className="flex flex-col items-center gap-3">
              <Flower2 className="w-10 h-10" />
              <div>
                <div className="text-lg font-bold">Modo Exploración</div>
                <div className="text-sm text-green-600 mt-1">
                  Recorre el jardín y descubre plantas
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => onModeSelect('rush')}
            className="bg-white hover:bg-orange-50 text-orange-700 font-semibold py-6 px-6 rounded-xl shadow-lg transform transition hover:scale-105 hover:shadow-xl"
          >
            <div className="flex flex-col items-center gap-3">
              <Zap className="w-10 h-10" />
              <div>
                <div className="text-lg font-bold">Modo Rush</div>
                <div className="text-sm text-orange-600 mt-1">
                  Carrera rápida de identificación
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => onModeSelect('herbario')}
            className="bg-white hover:bg-blue-50 text-blue-700 font-semibold py-6 px-6 rounded-xl shadow-lg transform transition hover:scale-105 hover:shadow-xl"
          >
            <div className="flex flex-col items-center gap-3">
              <BookOpen className="w-10 h-10" />
              <div>
                <div className="text-lg font-bold">Herbario Virtual</div>
                <div className="text-sm text-blue-600 mt-1">
                  Revisa tus descubrimientos
                </div>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-8 text-white text-sm space-y-2">
          <p className="flex items-center justify-center gap-2">
            <Trophy className="w-4 h-4" />
            Descubre todas las plantas y conviértete en un maestro botánico
          </p>
        </div>
      </div>
    </div>
  );
}
