"use client";

import Game from "../components/Game";
import { useState } from "react";

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 to-blue-900">
      <h1 className="text-4xl font-bold text-center text-white mb-4">
        Guess the Image
      </h1>

      {gameStarted ? (
        <Game />
      ) : (
        <button
          className="p-4 bg-blue-500 text-white rounded-lg"
          onClick={() => setGameStarted(true)}
        >
          Start Game
        </button>
      )}
    </div>
  );
}
