import type { Category, Word } from "@/types";
import { places } from "./categories/places";
import { professions } from "./categories/professions";
import { countries } from "./categories/countries";
import { cities } from "./categories/cities";
import { food } from "./categories/food";
import { animals } from "./categories/animals";
import { sports } from "./categories/sports";
import { movies } from "./categories/movies";
import { videogames } from "./categories/videogames";
import { transport } from "./categories/transport";
import { objects } from "./categories/objects";
import { characters } from "./categories/characters";
import { holidays } from "./categories/holidays";
import { nature } from "./categories/nature";
import { music } from "./categories/music";
import { clothes } from "./categories/clothes";
import { hobbies } from "./categories/hobbies";
import { school } from "./categories/school";
import { brands } from "./categories/brands";

/**
 * Встроенные категории. Порядок — порядок отображения в настройках.
 * Чтобы добавить новую категорию, создайте файл в ./categories и добавьте её сюда.
 * Правило словаря: одно слово живёт ровно в одной категории (проверка: npm run check:words).
 */
export const BUILTIN_CATEGORIES: readonly Category[] = [
  places,
  professions,
  countries,
  cities,
  food,
  animals,
  sports,
  movies,
  videogames,
  transport,
  objects,
  characters,
  holidays,
  nature,
  music,
  clothes,
  hobbies,
  school,
  brands,
];

const byId = new Map(BUILTIN_CATEGORIES.map((c) => [c.id, c]));

export function getCategoryById(id: string): Category | undefined {
  return byId.get(id);
}

export function getAllCategoryIds(): string[] {
  return BUILTIN_CATEGORIES.map((c) => c.id);
}

export function getWordText(word: Word): string {
  return typeof word === "string" ? word : word.text;
}
