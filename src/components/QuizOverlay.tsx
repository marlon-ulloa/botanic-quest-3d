import { useState, useEffect } from 'react';
import { Plant } from '../lib/supabase';
import { CheckCircle, XCircle } from 'lucide-react';

interface QuizOverlayProps {
  plant: Plant;
  options: string[];
  onAnswer: (correct: boolean, attempts: number) => void;
}

export default function QuizOverlay({ plant, options, onAnswer }: QuizOverlayProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5); // ⏱️ contador de 10 segundos


   // Contador regresivo
  useEffect(() => {
  const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onAnswer(false, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAnswer = (answer: string) => {
    if (showResult) return;

    setSelectedAnswer(answer);
    const correct = answer === plant.scientific_name;
    setIsCorrect(correct);
    setShowResult(true);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (correct) {
      setTimeout(() => {
        onAnswer(true, newAttempts);
      }, 1500);
    }
  };

  const handleRetry = () => {
    setSelectedAnswer(null);
    setShowResult(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 animate-fade-in">


      {/* ⏱️ Contador visual arriba a la derecha */}
        <div className="flex justify-center top-4 right-6 text-gray-800 font-semibold text-lg">
          ⏳ {timeLeft}s
        </div>




        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            ¿Cuál es el nombre científico de esta planta?
          </h2>
          <p className="text-lg text-green-600 font-semibold">
            {plant.common_name}
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrectAnswer = option === plant.scientific_name;

            let buttonClass = 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-2 border-gray-300';

            if (showResult && isSelected) {
              buttonClass = isCorrect
                ? 'bg-green-100 text-green-800 border-2 border-green-500'
                : 'bg-red-100 text-red-800 border-2 border-red-500';
            } else if (showResult && isCorrectAnswer) {
              buttonClass = 'bg-green-100 text-green-800 border-2 border-green-500';
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                disabled={showResult}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-left transition transform hover:scale-102 disabled:cursor-not-allowed ${buttonClass}`}
              >
                <div className="flex items-center justify-between">
                  <span className="italic">{option}</span>
                  {showResult && isSelected && (
                    isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )
                  )}
                  {showResult && !isSelected && isCorrectAnswer && (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {showResult && (
          <div className="text-center">
            {isCorrect ? (
              <div className="space-y-3">
                <div className="text-green-600 font-bold text-xl">
                  ¡Correcto! 🌟
                </div>
                <p className="text-gray-600">
                  Has descubierto una nueva planta para tu herbario
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-red-600 font-bold text-xl">
                  Intenta de nuevo
                </div>
                <p className="text-gray-600 mb-4">
                  La respuesta correcta es: <span className="font-semibold italic">{plant.scientific_name}</span>
                </p>
                <button
                  onClick={handleRetry}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-xl transition"
                >
                  Reintentar
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
