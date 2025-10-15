import { Heart, Trophy, Target } from 'lucide-react';

interface RushUIProps {
  score: number;
  lives: number;
  plantsCorrect: number;
  plantsTotal: number;
}

export default function RushUI({ score, lives, plantsCorrect, plantsTotal }: RushUIProps) {
  return (
    <div className="fixed top-4 left-4 right-4 z-40 pointer-events-none">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white bg-opacity-90 backdrop-blur rounded-2xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <div>
                  <div className="text-xs text-gray-600">Puntuación</div>
                  <div className="text-xl font-bold text-gray-800">{score}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Target className="w-6 h-6 text-green-500" />
                <div>
                  <div className="text-xs text-gray-600">Aciertos</div>
                  <div className="text-xl font-bold text-gray-800">
                    {plantsCorrect}/{plantsTotal}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {[...Array(3)].map((_, index) => (
                <Heart
                  key={index}
                  className={`w-8 h-8 ${
                    index < lives
                      ? 'text-red-500 fill-red-500'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <div className="inline-block bg-white bg-opacity-90 backdrop-blur rounded-xl shadow-lg px-6 py-3">
            <p className="text-sm text-gray-700 font-semibold">
              Use las flechas ← → para moverse entre carriles
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
