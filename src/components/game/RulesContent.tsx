const steps: string[] = [
  "Все, кроме шпионов, получают одно секретное слово.",
  "По очереди называйте ассоциации, не произнося само слово.",
  "Шпионы пытаются притвориться своими и понять слово.",
  "Если подозреваете игрока — остановите игру и решите всей компанией, выгнать ли его.",
  "Найденный шпион не раскрывает секретное слово, если остались другие шпионы.",
  "Шпион может рискнуть и назвать секретное слово.",
  "Если угадал — шпионы победили. Если ошибся — он раскрыт.",
  "Мирные выигрывают, когда найдены все шпионы.",
  "Если время закончилось, а шпион остался — выигрывают шпионы.",
];

export function RulesContent() {
  return (
    <ol className="flex flex-col gap-2">
      {steps.map((text, i) => (
        <li key={text} className="flex items-start gap-3 rounded-2xl border border-white/6 bg-ink-850 px-4 py-3">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-500/15 font-display text-xs font-bold text-accent-300">
            {i + 1}
          </span>
          <p className="text-[15px] leading-relaxed text-ink-200">{text}</p>
        </li>
      ))}
    </ol>
  );
}
