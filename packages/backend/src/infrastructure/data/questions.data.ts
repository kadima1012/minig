import { Question } from "../../domain/entities/Question";

export const questionsData: Question[] = [
  new Question("q1", "What is the capital of France?", ["Berlin", "Madrid", "Paris", "Rome"], 2, "Geography", 15000),
  new Question("q2", "Which planet is closest to the Sun?", ["Venus", "Mercury", "Earth", "Mars"], 1, "Science", 15000),
  new Question("q3", "How many sides does a hexagon have?", ["5", "6", "7", "8"], 1, "Math", 15000),
  new Question("q4", "Who painted the Mona Lisa?", ["Van Gogh", "Picasso", "Leonardo da Vinci", "Michelangelo"], 2, "Art", 15000),
  new Question("q5", "What is the largest ocean on Earth?", ["Atlantic", "Indian", "Arctic", "Pacific"], 3, "Geography", 15000),
  new Question("q6", "What is 12 × 12?", ["124", "144", "132", "148"], 1, "Math", 15000),
  new Question("q7", "Which element has the symbol 'O'?", ["Gold", "Oxygen", "Osmium", "Silver"], 1, "Science", 15000),
  new Question("q8", "In what year did World War II end?", ["1943", "1944", "1945", "1946"], 2, "History", 15000),
  new Question("q9", "What is the smallest country in the world?", ["Monaco", "San Marino", "Vatican City", "Liechtenstein"], 2, "Geography", 15000),
  new Question("q10", "Which programming language was created by Brendan Eich?", ["Python", "Java", "JavaScript", "Ruby"], 2, "Technology", 15000),
  new Question("q11", "What is the speed of light (approx)?", ["200,000 km/s", "300,000 km/s", "400,000 km/s", "150,000 km/s"], 1, "Science", 15000),
  new Question("q12", "Who wrote 'Romeo and Juliet'?", ["Charles Dickens", "William Shakespeare", "Mark Twain", "Homer"], 1, "Literature", 15000),
  new Question("q13", "How many bones are in the adult human body?", ["186", "196", "206", "216"], 2, "Science", 15000),
  new Question("q14", "What is the chemical symbol for gold?", ["Go", "Gd", "Au", "Ag"], 2, "Science", 15000),
  new Question("q15", "Which country invented pizza?", ["USA", "Greece", "France", "Italy"], 3, "Culture", 15000),
];
