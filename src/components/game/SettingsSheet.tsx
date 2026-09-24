"use client";

import { useState } from "react";
import { History, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { Switch } from "@/components/ui/Switch";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { useGameSettings, usePreferences, useRecentWords } from "@/hooks/useStoredData";

interface SettingsSheetProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsSheet({ open, onClose }: SettingsSheetProps) {
  const { preferences, update } = usePreferences();
  const { reset } = useGameSettings();
  const { recentWords, clear } = useRecentWords();
  const [done, setDone] = useState<"reset" | "history" | null>(null);

  const supportsVibration = typeof navigator !== "undefined" && typeof navigator.vibrate === "function";

  return (
    <Sheet open={open} onClose={onClose} title="Настройки">
      <div className="flex flex-col gap-5 pb-2">
        <section>
          <SectionLabel>Интерфейс</SectionLabel>
          <Switch
            checked={preferences.vibration}
            onChange={(v) => update({ vibration: v })}
            label="Вибрация"
            description={supportsVibration ? "Отклик при раскрытии карточки и конце раунда" : "Это устройство не поддерживает вибрацию"}
          />
        </section>

        <section>
          <SectionLabel>Данные</SectionLabel>
          <div className="flex flex-col gap-2">
            <Button
              variant="secondary"
              size="md"
              fullWidth
              leadingIcon={<History size={18} />}
              onClick={() => {
                clear();
                setDone("history");
              }}
              disabled={recentWords.length === 0}
            >
              {done === "history" ? "История очищена" : `Очистить историю слов (${recentWords.length})`}
            </Button>
            <Button
              variant="secondary"
              size="md"
              fullWidth
              leadingIcon={<RotateCcw size={18} />}
              onClick={() => {
                reset();
                setDone("reset");
              }}
            >
              {done === "reset" ? "Настройки сброшены" : "Сбросить настройки игры"}
            </Button>
          </div>
          <p className="mt-2 px-1 text-xs leading-relaxed text-ink-400">
            Недавние слова не выпадают повторно, пока в категории есть новые. Всё хранится только на этом устройстве.
          </p>
        </section>
      </div>
    </Sheet>
  );
}
