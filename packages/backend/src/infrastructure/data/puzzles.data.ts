import { DifferencePuzzleEntity } from "../../domain/entities/DifferencePuzzle";

// Using placeholder images — replace with real image pairs in production.
// Zones are in percentage coordinates relative to the image dimensions.
export const puzzlesData: DifferencePuzzleEntity[] = [
  new DifferencePuzzleEntity(
    "puzzle1",
    "https://picsum.photos/seed/city1a/600/400",
    "https://picsum.photos/seed/city1b/600/400",
    [
      { id: "z1", xPercent: 20, yPercent: 30, radiusPercent: 5 },
      { id: "z2", xPercent: 55, yPercent: 60, radiusPercent: 5 },
      { id: "z3", xPercent: 80, yPercent: 25, radiusPercent: 5 },
    ],
    60000
  ),
  new DifferencePuzzleEntity(
    "puzzle2",
    "https://picsum.photos/seed/nature2a/600/400",
    "https://picsum.photos/seed/nature2b/600/400",
    [
      { id: "z1", xPercent: 15, yPercent: 45, radiusPercent: 5 },
      { id: "z2", xPercent: 60, yPercent: 70, radiusPercent: 5 },
      { id: "z3", xPercent: 85, yPercent: 20, radiusPercent: 5 },
      { id: "z4", xPercent: 40, yPercent: 50, radiusPercent: 5 },
    ],
    60000
  ),
];
