"use client";

import { AnimatePresence } from "framer-motion";
import { useCallback, useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useBackGuard } from "@/hooks/useBackGuard";
import { useGameSession } from "@/hooks/useGameSession";
import { useGameSettings } from "@/hooks/useStoredData";
import { isInGame } from "@/game/session";
import { settingsForQuickPlay } from "@/game/rules";
import { HomeScreen } from "@/screens/HomeScreen";
import { SetupScreen } from "@/screens/SetupScreen";
import { RevealScreen } from "@/screens/RevealScreen";
import { RoundStartScreen } from "@/screens/RoundStartScreen";
import { TimerScreen } from "@/screens/TimerScreen";
import { ResultsScreen } from "@/screens/ResultsScreen";

/** Корневой оркестратор: переключает экраны по фазе сессии. */
export function GameApp() {
  const { state, dispatch, startRound } = useGameSession();
  const { settings } = useGameSettings();
  const [exitOpen, setExitOpen] = useState(false);

  const inGame = isInGame(state);
  useBackGuard(
    inGame,
    useCallback(() => setExitOpen(true), []),
  );

  const quickPlay = () => startRound(settingsForQuickPlay(settings));

  return (
    <main className="relative">
      <AnimatePresence mode="wait" initial={false}>
        {state.phase === "home" ? (
          <HomeScreen key="home" settings={settings} onQuickPlay={quickPlay} onSetup={() => dispatch({ type: "GO_SETUP" })} />
        ) : state.phase === "setup" ? (
          <SetupScreen key="setup" onBack={() => dispatch({ type: "GO_HOME" })} onStart={startRound} />
        ) : state.phase === "reveal" ? (
          <RevealScreen
            key="reveal"
            round={state.round}
            playerIndex={state.playerIndex}
            step={state.step}
            onReveal={() => dispatch({ type: "REVEAL_CARD" })}
            onHide={() => dispatch({ type: "HIDE_CARD" })}
            onNext={() => dispatch({ type: "NEXT_PLAYER" })}
          />
        ) : state.phase === "roundStart" ? (
          <RoundStartScreen key="roundStart" round={state.round} onBegin={() => dispatch({ type: "BEGIN_ROUND" })} />
        ) : state.phase === "playing" ? (
          <TimerScreen key="playing" round={state.round} onEnd={() => dispatch({ type: "END_ROUND" })} />
        ) : (
          <ResultsScreen
            key="results"
            round={state.round}
            revealed={state.revealed}
            onReveal={() => dispatch({ type: "REVEAL_RESULTS" })}
            onNewRound={() => startRound(settingsForQuickPlay(settings))}
            onSettings={() => dispatch({ type: "GO_SETUP" })}
            onHome={() => dispatch({ type: "GO_HOME" })}
          />
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={exitOpen}
        title="Выйти из игры?"
        description="Текущий раунд будет потерян. Настройки и имена игроков сохранятся."
        confirmLabel="Выйти на главную"
        cancelLabel="Остаться"
        destructive
        onConfirm={() => {
          setExitOpen(false);
          dispatch({ type: "GO_HOME" });
        }}
        onCancel={() => setExitOpen(false)}
      />
    </main>
  );
}
