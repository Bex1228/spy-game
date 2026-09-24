const steps: { title: string; text: string }[] = [
  {
    title: "Роли",
    text: "Все игроки получают одно секретное слово из категории. Шпион слова не знает — он видит только «Ты шпион».",
  },
  {
    title: "Раздача",
    text: "Телефон передаётся по кругу. Каждый приватно открывает свою карточку, запоминает и скрывает её.",
  },
  {
    title: "Раунд",
    text: "Игроки по очереди задают друг другу вопросы о слове. Отвечайте так, чтобы свои поняли, а шпион — нет.",
  },
  {
    title: "Развязка",
    text: "Когда время вышло, голосуйте, кто шпион. Если шпиона нашли — он может назвать слово и выиграть.",
  },
];

export function RulesContent() {
  return (
    <ol className="flex flex-col gap-3">
      {steps.map((s, i) => (
        <li key={s.title} className="flex gap-3 rounded-2xl border border-white/6 bg-ink-850 p-4">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-500/15 font-display text-xs font-bold text-accent-300">
            {i + 1}
          </span>
          <div>
            <div className="text-[15px] font-bold text-ink-100">{s.title}</div>
            <p className="mt-1 text-sm leading-relaxed text-ink-300">{s.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
