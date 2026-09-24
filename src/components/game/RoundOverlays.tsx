"use client";

import { AnimatePresence, motion } from "framer-motion";
import { EyeOff, Megaphone, Search, ShieldAlert, ShieldCheck, UserX } from "lucide-react";
import type { Dispatch, ReactNode } from "react";
import type { Round } from "@/types";
import type { PlayOverlay, SessionAction } from "@/game/session";
import { activePlayers, getPlayer } from "@/game/roundState";
import { Button } from "@/components/ui/Button";
import { pluralize } from "@/utils/format";
import { cn } from "@/utils/cn";
import { PlayerPicker } from "./PlayerPicker";

interface RoundOverlaysProps {
  round: Round;
  overlay: PlayOverlay | null;
  dispatch: Dispatch<SessionAction>;
}

/** Полноэкранные модальные состояния раунда: подозрение, вердикт, попытка шпиона. Слово нигде не показывается. */
export function RoundOverlays({ round, overlay, dispatch }: RoundOverlaysProps) {
  return (
    <AnimatePresence>
      {overlay ? (
        <motion.div
          key={overlay.kind}
          role="dialog"
          aria-modal="true"
          aria-labelledby="round-overlay-title"
          className="absolute inset-0 z-30 flex flex-col bg-ink-950/95 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="flex min-h-0 flex-1 flex-col px-5 pt-safe"
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {overlay.kind === "suspect" ? <SuspectOverlay round={round} overlay={overlay} dispatch={dispatch} /> : null}
            {overlay.kind === "verdict" ? <VerdictOverlay round={round} overlay={overlay} dispatch={dispatch} /> : null}
            {overlay.kind === "guess" ? <GuessOverlay round={round} overlay={overlay} dispatch={dispatch} /> : null}
            {overlay.kind === "guessFailed" ? (
              <GuessFailedOverlay round={round} overlay={overlay} dispatch={dispatch} />
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/* ---------- Общие элементы ---------- */

function OverlayHeader({ icon, eyebrow, title, tone = "default" }: { icon: ReactNode; eyebrow: string; title: string; tone?: "default" | "accent" | "good" }) {
  return (
    <div className="flex flex-col items-center pt-4 text-center">
      <span
        className={cn(
          "flex h-16 w-16 items-center justify-center rounded-full border shadow-float",
          tone === "accent" && "border-accent-400/40 bg-accent-500 text-white shadow-glow-accent",
          tone === "good" && "border-white/10 bg-ivory text-ink-950",
          tone === "default" && "border-white/8 bg-ink-850 text-ivory",
        )}
      >
        {icon}
      </span>
      <div className="mt-5 text-[11px] font-bold uppercase tracking-[0.22em] text-ink-400">{eyebrow}</div>
      <h2 id="round-overlay-title" className="mt-2 font-display text-[26px] font-bold leading-tight text-ivory text-balance">
        {title}
      </h2>
    </div>
  );
}

function Hint({ children }: { children: ReactNode }) {
  return (
    <p className="mx-auto mt-3 max-w-[300px] text-center text-[14px] leading-relaxed text-ink-300 text-balance">
      {children}
    </p>
  );
}

function Footer({ children }: { children: ReactNode }) {
  return <div className="mt-auto flex flex-col gap-2 pt-5 pb-safe">{children}</div>;
}

/* ---------- Подозрение и решение об изгнании ---------- */

function SuspectOverlay({ round, overlay, dispatch }: { round: Round; overlay: Extract<PlayOverlay, { kind: "suspect" }>; dispatch: Dispatch<SessionAction> }) {
  const players = activePlayers(round);
  const selected = overlay.playerId !== null ? getPlayer(round, overlay.playerId) : undefined;

  return (
    <>
      <OverlayHeader icon={<Search size={28} />} eyebrow="Подозрение" title="Кого подозреваете?" />
      <Hint>
        Выберите игрока. Подозреваемый может коротко оправдаться, затем решите всей компанией: выгнать его или
        продолжить игру. Само слово не произносите.
      </Hint>
      <div className="mt-5 min-h-0 flex-1 overflow-y-auto scrollbar-none">
        <PlayerPicker
          players={players}
          selectedId={overlay.playerId}
          onSelect={(id) => dispatch({ type: "SELECT_SUSPECT", playerId: id })}
          label="Подозреваемый"
        />
      </div>
      <Footer>
        <Button
          fullWidth
          variant="danger"
          disabled={!selected}
          onClick={() => dispatch({ type: "ELIMINATE_SUSPECT" })}
          leadingIcon={<UserX size={20} />}
        >
          {selected ? `Выгнать: ${selected.name}` : "Выгнать игрока"}
        </Button>
        <Button fullWidth variant="secondary" onClick={() => dispatch({ type: "CLOSE_OVERLAY" })}>
          Продолжить игру
        </Button>
      </Footer>
    </>
  );
}

/* ---------- Вердикт после изгнания ---------- */

function VerdictOverlay({ round, overlay, dispatch }: { round: Round; overlay: Extract<PlayOverlay, { kind: "verdict" }>; dispatch: Dispatch<SessionAction> }) {
  const player = getPlayer(round, overlay.playerId);
  const name = player?.name ?? `Игрок ${overlay.playerId}`;
  const finished = overlay.wasSpy && overlay.spiesLeft === 0;

  return (
    <>
      <div className="flex flex-1 flex-col justify-center">
        <OverlayHeader
          icon={overlay.wasSpy ? <ShieldAlert size={30} /> : <ShieldCheck size={30} />}
          eyebrow={name}
          title={overlay.wasSpy ? "Шпион найден." : "Это был не шпион."}
          tone={overlay.wasSpy ? "accent" : "good"}
        />
        <Hint>
          {overlay.wasSpy
            ? finished
              ? "Все шпионы раскрыты. Можно переходить к итогам раунда."
              : `${name} выбывает. ${overlay.spiesLeft === 1 ? "Остался ещё один шпион" : `Осталось шпионов: ${overlay.spiesLeft}`} — секретное слово по-прежнему в тайне.`
            : `${name} выбывает из раунда. Роли остальных не раскрываются, игра продолжается.`}
        </Hint>
        {!finished ? (
          <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-white/8 bg-ink-850 px-4 py-2 text-xs font-semibold text-ink-300">
            <EyeOff size={14} /> Слово не показывается
          </div>
        ) : null}
      </div>
      <Footer>
        <Button fullWidth onClick={() => dispatch({ type: "ACKNOWLEDGE" })}>
          {finished ? "К результатам" : "Продолжить игру"}
        </Button>
      </Footer>
    </>
  );
}

/* ---------- Попытка шпиона назвать слово ---------- */

function GuessOverlay({ round, overlay, dispatch }: { round: Round; overlay: Extract<PlayOverlay, { kind: "guess" }>; dispatch: Dispatch<SessionAction> }) {
  const players = activePlayers(round);
  const selected = overlay.playerId !== null ? getPlayer(round, overlay.playerId) : undefined;

  return (
    <>
      <OverlayHeader
        icon={<Megaphone size={28} />}
        eyebrow="Попытка шпиона"
        title={selected ? `${selected.name} называет слово` : "Кто заявляет, что он шпион?"}
      />
      <Hint>
        {selected
          ? "Пусть скажет догадку вслух. Приложение слово не покажет — подтвердить результат должен игрок, который его знает."
          : "Выберите игрока, который готов рискнуть и назвать секретное слово."}
      </Hint>
      <div className="mt-5 min-h-0 flex-1 overflow-y-auto scrollbar-none">
        <PlayerPicker
          players={players}
          selectedId={overlay.playerId}
          onSelect={(id) => dispatch({ type: "SELECT_GUESSER", playerId: id })}
          label="Кто называет слово"
        />
      </div>
      <Footer>
        <div className="grid grid-cols-2 gap-2">
          <Button disabled={!selected} onClick={() => dispatch({ type: "RESOLVE_GUESS", correct: true })}>
            Угадал
          </Button>
          <Button variant="secondary" disabled={!selected} onClick={() => dispatch({ type: "RESOLVE_GUESS", correct: false })}>
            Не угадал
          </Button>
        </div>
        <Button fullWidth variant="ghost" size="md" onClick={() => dispatch({ type: "CLOSE_OVERLAY" })}>
          Отмена
        </Button>
      </Footer>
    </>
  );
}

/* ---------- Шпион не угадал ---------- */

function GuessFailedOverlay({ round, overlay, dispatch }: { round: Round; overlay: Extract<PlayOverlay, { kind: "guessFailed" }>; dispatch: Dispatch<SessionAction> }) {
  const player = getPlayer(round, overlay.playerId);
  const name = player?.name ?? `Игрок ${overlay.playerId}`;
  const finished = overlay.spiesLeft === 0;

  return (
    <>
      <div className="flex flex-1 flex-col justify-center">
        <OverlayHeader icon={<ShieldAlert size={30} />} eyebrow={name} title="Не угадал. Шпион раскрыт." tone="accent" />
        <Hint>
          {finished
            ? "Это был последний шпион — мирные побеждают."
            : `${name} выбывает. ${overlay.spiesLeft} ${pluralize(overlay.spiesLeft, ["шпион остаётся", "шпиона остаются", "шпионов остаются"])} в игре, слово по-прежнему в тайне.`}
        </Hint>
        {!finished ? (
          <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-white/8 bg-ink-850 px-4 py-2 text-xs font-semibold text-ink-300">
            <EyeOff size={14} /> Слово не показывается
          </div>
        ) : null}
      </div>
      <Footer>
        <Button fullWidth onClick={() => dispatch({ type: "ACKNOWLEDGE" })}>
          {finished ? "К результатам" : "Продолжить игру"}
        </Button>
      </Footer>
    </>
  );
}
