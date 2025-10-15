import { useEffect, useRef, useState } from 'react';
import { GameEngine } from './game/GameEngine';
import { ExplorationMode } from './game/ExplorationMode';
import { RushMode } from './game/RushMode';
import { Plant, fetchAllPlants, fetchAllPlantss, saveProgress, saveHighScore } from './lib/supabase';
import MainMenu from './components/MainMenu';
import Herbario from './components/Herbario';
import QuizOverlay from './components/QuizOverlay';
import RushUI from './components/RushUI';
import GameOverScreen from './components/GameOverScreen';

type GameMode = 'menu' | 'exploration' | 'rush' | 'herbario';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const explorationRef = useRef<ExplorationMode | null>(null);
  const rushRef = useRef<RushMode | null>(null);

  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [plants, setPlants] = useState<Plant[]>([]);
  const [currentQuizPlant, setCurrentQuizPlant] = useState<Plant | null>(null);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);

  const [rushScore, setRushScore] = useState(0);
  const [rushLives, setRushLives] = useState(3);
  const [rushCorrect, setRushCorrect] = useState(0);
  const [rushTotal, setRushTotal] = useState(0);
  const [showGameOver, setShowGameOver] = useState(false);
  const [gameOverStats, setGameOverStats] = useState({ score: 0, correct: 0, total: 0 });

  const rushPlantIndexRef = useRef(0);
  let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  useEffect(() => {
    loadPlants();
   // isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }, []);

  useEffect(() => {
    //isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current);
    engineRef.current = engine;

    return () => {
      engine.dispose();
      explorationRef.current?.dispose();
      rushRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (gameMode === 'exploration' && plants.length > 0 && !explorationRef.current) {
      startExplorationMode();
    } else if (gameMode === 'rush' && plants.length > 0 && !rushRef.current) {
      startRushMode();
    }
  }, [gameMode, plants]);

  const loadPlants = async () => {
    try {
      //const data = await fetchAllPlants();
      const data = await fetchAllPlantss();
      setPlants(data);
    } catch (error) {
      console.error('Error loading plants:', error);
    }
  };

  const startExplorationMode = () => {
    if (!engineRef.current || plants.length === 0) return;

    const exploration = new ExplorationMode();
    exploration.loadPlants(plants);

    exploration.onPlantNear = (plant: Plant) => {
      showQuiz(plant);
    };

    explorationRef.current = exploration;
    engineRef.current.setScene(exploration.getScene(), exploration.getCamera());
    engineRef.current.setUpdateCallback(() => exploration.update());
    engineRef.current.start();
  };

  const startRushMode = () => {
    if (!engineRef.current || plants.length === 0) return;

    const rush = new RushMode();
    rushRef.current = rush;

    rushPlantIndexRef.current = 0;
    setRushScore(0);
    setRushLives(3);
    setRushCorrect(0);
    setRushTotal(0);
    setShowGameOver(false);

    rush.onQuizResult = (correct: boolean, plant: Plant) => {
      if (correct) {
        saveProgress(plant.id, 'rush', 1);
      }

      const stats = rush.getStats();
      setRushScore(stats.score);
      setRushLives(stats.lives);
      setRushCorrect(stats.correct);
      setRushTotal(stats.total);

      if (stats.lives > 0) {
        setTimeout(() => {
          loadNextRushPlant();
        }, 1000);
      }
    };

    rush.onGameOver = (score: number, correct: number, total: number) => {
      saveHighScore(score, correct, total);
      setGameOverStats({ score, correct, total });
      setShowGameOver(true);
      engineRef.current?.stop();
    };

    engineRef.current.setScene(rush.getScene(), rush.getCamera());
    engineRef.current.setUpdateCallback(() => rush.update());
    engineRef.current.start();

    loadNextRushPlant();
  };

  const loadNextRushPlant = () => {
    if (!rushRef.current) return;

    const shuffled = [...plants].sort(() => Math.random() - 0.5);
    const plant = shuffled[rushPlantIndexRef.current % shuffled.length];
    rushPlantIndexRef.current++;

    rushRef.current.loadNextQuiz(plant, plants);
  };

  const showQuiz = (plant: Plant) => {
    const wrongPlants = plants
      .filter(p => p.id !== plant.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);

    const options = [
      plant.scientific_name,
      wrongPlants[0]?.scientific_name || '',
      wrongPlants[1]?.scientific_name || ''
    ].sort(() => Math.random() - 0.5);

    setCurrentQuizPlant(plant);
    setQuizOptions(options);
  };

  const handleQuizAnswer = (correct: boolean, attempts: number) => {
    if (!currentQuizPlant) return;

    if (correct && explorationRef.current) {
      explorationRef.current.markPlantDiscovered(currentQuizPlant.id);
      saveProgress(currentQuizPlant.id, 'exploration', attempts);
    }

    setCurrentQuizPlant(null);
    setQuizOptions([]);
  };

  const handleModeSelect = (mode: 'exploration' | 'rush' | 'herbario') => {
    setGameMode(mode);

    if (mode === 'exploration' || mode === 'rush') {
      if (explorationRef.current) {
        explorationRef.current.dispose();
        explorationRef.current = null;
      }
      if (rushRef.current) {
        rushRef.current.dispose();
        rushRef.current = null;
      }
    }
  };

  const handleBackToMenu = () => {
    setGameMode('menu');
    engineRef.current?.stop();

    if (explorationRef.current) {
      explorationRef.current.dispose();
      explorationRef.current = null;
    }
    if (rushRef.current) {
      rushRef.current.dispose();
      rushRef.current = null;
    }

    setCurrentQuizPlant(null);
    setShowGameOver(false);
    document.getElementById("mobile-controls")?.remove();
  };

  const handleRestartRush = () => {
    setShowGameOver(false);
    if (rushRef.current) {
      rushRef.current.dispose();
      rushRef.current = null;
    }
    startRushMode();
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <canvas
        ref={canvasRef}
        className={`w-full h-full ${gameMode === 'menu' || gameMode === 'herbario' ? 'hidden' : ''}`}
      />

      {gameMode === 'menu' && (
        <MainMenu onModeSelect={handleModeSelect} />
      )}

      {gameMode === 'herbario' && (
        <Herbario onClose={handleBackToMenu} />
      )}

      {gameMode === 'exploration' && currentQuizPlant && (
        <QuizOverlay
          plant={currentQuizPlant}
          options={quizOptions}
          onAnswer={handleQuizAnswer}
        />
      )}

      {gameMode === 'rush' && !showGameOver && (
        <RushUI
          score={rushScore}
          lives={rushLives}
          plantsCorrect={rushCorrect}
          plantsTotal={rushTotal}
        />
      )}

      {gameMode === 'rush' && showGameOver && (
        <GameOverScreen
          score={gameOverStats.score}
          plantsCorrect={gameOverStats.correct}
          plantsTotal={gameOverStats.total}
          onRestart={handleRestartRush}
          onMainMenu={handleBackToMenu}
        />
      )}

      {(gameMode === 'exploration' || gameMode === 'rush') && !currentQuizPlant && !showGameOver && (
        <button
          onClick={handleBackToMenu}
          className="fixed top-4 left-4 z-40 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-lg transition"
        >
          ← Menú Principal
        </button>
      )}

      {gameMode === 'exploration' && !currentQuizPlant && !isMobile  && (
        <div className="fixed bottom-4 left-4 right-4 z-40 pointer-events-none">
          <div className="max-w-md mx-auto bg-white bg-opacity-90 backdrop-blur rounded-xl shadow-lg p-4 text-center">
            <p className="text-sm text-gray-700 font-semibold">
              Usa WASD para moverte y acércate a las plantas para identificarlas
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
