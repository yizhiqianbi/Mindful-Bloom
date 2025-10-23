import React, { useState, useCallback } from 'react';
import FlowerScene from './components/FlowerScene';

type GameState = 'IDLE' | 'PRACTICING' | 'COMPLETED';

// As requested, the practice duration is 3 minutes.
const PRACTICE_DURATION_SECONDS = 180; 

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [progress, setProgress] = useState(0);

  const handleStartPractice = useCallback(() => {
    setProgress(0);
    setGameState('PRACTICING');
  }, []);
  
  const handlePracticeAgain = useCallback(() => {
    setProgress(0);
    setGameState('PRACTICING');
  }, []);

  const handlePracticeComplete = useCallback(() => {
    setGameState('COMPLETED');
  }, []);

  const handleProgressUpdate = useCallback((newProgress: number) => {
    setProgress(newProgress);
  }, []);

  const getInstructionText = () => {
    switch (gameState) {
      case 'IDLE':
        return 'Ready for a moment of calm? Press Start to begin your focus practice.';
      case 'PRACTICING':
        return 'Gently hold your focus on the flower. Use your mouse or finger to help it bloom.';
      case 'COMPLETED':
        return 'Well done. You have cultivated a beautiful flower through your mindfulness.';
      default:
        return 'A moment of calm.';
    }
  };

  const renderButton = () => {
    const buttonClasses = "px-6 py-3 bg-pink-400 text-white font-semibold rounded-full shadow-lg hover:bg-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 transition-transform transform hover:scale-105";
    
    if (gameState === 'IDLE') {
      return <button onClick={handleStartPractice} className={buttonClasses}>Start Practice</button>;
    }
    if (gameState === 'COMPLETED') {
      return <button onClick={handlePracticeAgain} className={buttonClasses}>Practice Again</button>;
    }
    return null;
  };

  return (
    <main className="relative w-screen h-screen bg-[#FFF5E1] text-[#4A4A4A] select-none">
      <div className="absolute top-0 left-0 w-full h-full">
        <FlowerScene
          gameState={gameState}
          onPracticeComplete={handlePracticeComplete}
          onProgressUpdate={handleProgressUpdate}
          practiceDuration={PRACTICE_DURATION_SECONDS}
        />
      </div>
      <div className="absolute top-0 left-0 p-6 md:p-8 pointer-events-none w-full">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-[#3D3D3D]">Mindful Bloom</h1>
                <p className="mt-2 text-md md:text-lg text-gray-600 max-w-sm">{getInstructionText()}</p>
            </div>
            {gameState === 'PRACTICING' && (
                <div className="w-32 md:w-48 mt-2 pointer-events-none">
                    <div className="h-4 bg-white/50 rounded-full overflow-hidden shadow-inner">
                        <div 
                            className="h-full bg-pink-400 transition-all duration-300 ease-linear"
                            style={{ width: `${progress * 100}%` }}
                            aria-valuenow={progress * 100}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            role="progressbar"
                            aria-label="Focus Progress"
                        />
                    </div>
                </div>
            )}
        </div>
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        {renderButton()}
      </div>
    </main>
  );
};

export default App;
