"use client";

import { useEffect, useRef } from "react";

/**
 * Перехватывает системную кнопку «Назад» во время игры: вместо ухода со страницы
 * (или возврата к чужой карточке) вызывает onBack — например, открывает диалог выхода.
 */
export function useBackGuard(active: boolean, onBack: () => void) {
  const onBackRef = useRef(onBack);

  useEffect(() => {
    onBackRef.current = onBack;
  }, [onBack]);

  useEffect(() => {
    if (!active || typeof window === "undefined") return;

    const pushGuard = () => {
      const current = window.history.state;
      const base = current && typeof current === "object" ? current : {};
      window.history.pushState({ ...base, spyGuard: true }, "", window.location.href);
    };

    pushGuard();

    const onPopState = () => {
      pushGuard();
      onBackRef.current();
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [active]);
}
