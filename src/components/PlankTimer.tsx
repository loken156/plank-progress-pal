
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Play, 
  Pause, 
  RotateCcw,
  CheckCircle
} from "lucide-react";

const PlankTimer = () => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    let interval: number | undefined;
    
    if (isActive) {
      interval = window.setInterval(() => {
        setSeconds(seconds => seconds + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes < 10 ? '0' + minutes : minutes}:${remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds}`;
  };

  const handleStart = () => {
    setIsActive(true);
    setIsCompleted(false);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setSeconds(0);
    setIsActive(false);
    setIsCompleted(false);
  };

  const handleComplete = () => {
    setIsActive(false);
    setIsCompleted(true);
    // Here we would save the plank data
    console.log("Plank completed:", seconds);
  };

  return (
    <Card className="plank-card w-full max-w-md mx-auto overflow-hidden">
      <div className="bg-gradient-to-r from-plank-blue to-plank-green p-4 text-white">
        <h2 className="text-xl font-bold font-poppins text-center">Dagens Planka</h2>
      </div>
      <CardContent className="p-6">
        {isCompleted ? (
          <div className="text-center py-6 animate-fade-in">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-4">
              <CheckCircle className="w-12 h-12 text-plank-green" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Bra jobbat!</h3>
            <p className="text-gray-600 mb-4">Du plankade i {formatTime(seconds)}</p>
            <Button 
              className="plank-btn-outline"
              onClick={handleReset}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Ny planka
            </Button>
          </div>
        ) : (
          <>
            <div className="flex justify-center items-center my-8">
              <div className="relative">
                {isActive && (
                  <span className="absolute inset-0 rounded-full animate-pulse-ring bg-plank-blue opacity-30"></span>
                )}
                <div className={`w-36 h-36 rounded-full flex items-center justify-center ${isActive ? 'bg-plank-blue' : 'bg-gray-100'}`}>
                  <span className={`text-3xl font-bold ${isActive ? 'text-white' : 'text-gray-700'}`}>
                    {formatTime(seconds)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {!isActive ? (
                <Button 
                  className="plank-btn-primary flex-grow"
                  onClick={handleStart}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Starta
                </Button>
              ) : (
                <Button 
                  className="plank-btn-outline flex-grow"
                  onClick={handlePause}
                >
                  <Pause className="mr-2 h-4 w-4" />
                  Pausa
                </Button>
              )}
              
              {seconds > 0 && (
                <>
                  <Button 
                    className="plank-btn-outline flex-grow"
                    onClick={handleReset}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Återställ
                  </Button>
                  
                  {!isActive && (
                    <Button 
                      className="plank-btn-secondary flex-grow"
                      onClick={handleComplete}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Spara planka
                    </Button>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PlankTimer;
