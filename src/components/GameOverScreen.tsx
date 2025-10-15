import { Trophy, Home, RotateCcw } from 'lucide-react';

interface GameOverScreenProps {
  score: number;
  plantsCorrect: number;
  plantsTotal: number;
  onRestart: () => void;
  onMainMenu: () => void;
}

export default function GameOverScreen({
  score,
  plantsCorrect,
  plantsTotal,
  onRestart,
  onMainMenu
}: GameOverScreenProps) {
  const percentage = plantsTotal > 0 ? Math.round((plantsCorrect / plantsTotal) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        <div className="mb-6">
          <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            ¡Juego Terminado!
          </h2>
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-6">
            <div className="text-4xl font-bold text-orange-600 mb-1">
              {score}
            </div>
            <div className="text-sm text-orange-700 font-semibold">
              Puntos Totales
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-600">
                {plantsCorrect}
              </div>
              <div className="text-xs text-green-700 font-semibold">
                Aciertos
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-600">
                {percentage}%
              </div>
              <div className="text-xs text-blue-700 font-semibold">
                Precisión
              </div>
            </div>
          </div>

          <div className="text-gray-600">
            Identificaste <span className="font-bold text-green-600">{plantsCorrect}</span> de{' '}
            <span className="font-bold">{plantsTotal}</span> plantas correctamente
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={onRestart}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Jugar de Nuevo
          </button>

          <button
            onClick={onMainMenu}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-xl transition flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Menú Principal
          </button>
        </div>
      </div>
    </div>
  );
}
