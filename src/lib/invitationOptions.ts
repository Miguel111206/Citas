export type Choice = {
  value: string;
  label: string;
  emoji: string;
};

export const timeOptions = [
  { value: "12:00", label: "12:00 PM" },
  { value: "12:30", label: "12:30 PM" },
  { value: "13:00", label: "1:00 PM" },
  { value: "13:30", label: "1:30 PM" },
  { value: "14:00", label: "2:00 PM" },
  { value: "14:30", label: "2:30 PM" },
  { value: "15:00", label: "3:00 PM" },
  { value: "15:30", label: "3:30 PM" },
  { value: "16:00", label: "4:00 PM" },
  { value: "16:30", label: "4:30 PM" },
  { value: "17:00", label: "5:00 PM" },
  { value: "18:00", label: "6:00 PM" },
] as const;

export const activities: Choice[] = [
  { value: "Movie", label: "Pelicula", emoji: "🎬" },
  { value: "Walk", label: "Caminata", emoji: "🌅" },
  { value: "Bowling", label: "Bowling", emoji: "🎳" },
  { value: "Arcade", label: "Arcade", emoji: "🎮" },
  { value: "Mall", label: "Centro comercial", emoji: "🛍️" },
  { value: "Coffee", label: "Cafe", emoji: "☕" },
  { value: "Painting", label: "Pintar", emoji: "🎨" },
  { value: "Stargazing", label: "Ver estrellas", emoji: "🌌" },
];

export const foods: Choice[] = [
  { value: "Pizza", label: "Pizza", emoji: "🍕" },
  { value: "Sushi", label: "Sushi", emoji: "🍣" },
  { value: "Burgers", label: "Hamburguesas", emoji: "🍔" },
  { value: "Pasta", label: "Pasta", emoji: "🍝" },
  { value: "Mexican", label: "Mexicano", emoji: "🌮" },
  { value: "HotDogs", label: "Perros calientes", emoji: "🌭" },
];

export const allowedTimes: ReadonlySet<string> = new Set(
  timeOptions.map((item) => item.value),
);
export const allowedActivities: ReadonlySet<string> = new Set(
  activities.map((item) => item.value),
);
export const allowedFoods: ReadonlySet<string> = new Set(
  foods.map((item) => item.value),
);
