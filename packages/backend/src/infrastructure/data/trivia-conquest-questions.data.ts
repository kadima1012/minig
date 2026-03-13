export interface TcQuestionSeed {
  id: string;
  text: string;
  options: [string, string, string, string];
  correctIndex: number;
  category: string;
  isTiebreaker: false;
}

export interface TcTiebreakerSeed {
  id: string;
  text: string;
  numericAnswer: number;
  category: string;
  isTiebreaker: true;
}

type QuestionData = TcQuestionSeed | TcTiebreakerSeed;

// ── Science Questions ──────────────────────────────────────────────

const scienceQuestions: QuestionData[] = [
  { id: "sci-1", text: "What planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], correctIndex: 1, category: "science", isTiebreaker: false },
  { id: "sci-2", text: "What is the chemical symbol for gold?", options: ["Go", "Gd", "Au", "Ag"], correctIndex: 2, category: "science", isTiebreaker: false },
  { id: "sci-3", text: "How many bones are in the adult human body?", options: ["186", "206", "226", "246"], correctIndex: 1, category: "science", isTiebreaker: false },
  { id: "sci-4", text: "What gas do plants absorb from the atmosphere?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], correctIndex: 2, category: "science", isTiebreaker: false },
  { id: "sci-5", text: "What is the speed of light in km/s (approx)?", options: ["200,000", "300,000", "400,000", "150,000"], correctIndex: 1, category: "science", isTiebreaker: false },
  { id: "sci-6", text: "Which element has the atomic number 1?", options: ["Helium", "Lithium", "Hydrogen", "Carbon"], correctIndex: 2, category: "science", isTiebreaker: false },
  { id: "sci-7", text: "What is the largest organ in the human body?", options: ["Liver", "Brain", "Lung", "Skin"], correctIndex: 3, category: "science", isTiebreaker: false },
  { id: "sci-8", text: "What type of animal is a dolphin?", options: ["Fish", "Reptile", "Mammal", "Amphibian"], correctIndex: 2, category: "science", isTiebreaker: false },
  { id: "sci-9", text: "What is the hardest natural substance on Earth?", options: ["Gold", "Iron", "Diamond", "Platinum"], correctIndex: 2, category: "science", isTiebreaker: false },
  { id: "sci-10", text: "Which planet has the most moons?", options: ["Jupiter", "Saturn", "Uranus", "Neptune"], correctIndex: 1, category: "science", isTiebreaker: false },
  { id: "sci-11", text: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi Body"], correctIndex: 2, category: "science", isTiebreaker: false },
  { id: "sci-12", text: "What vitamin does the sun help produce?", options: ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"], correctIndex: 3, category: "science", isTiebreaker: false },
  { id: "sci-13", text: "How many chambers does the human heart have?", options: ["2", "3", "4", "5"], correctIndex: 2, category: "science", isTiebreaker: false },
  { id: "sci-14", text: "What is the most abundant gas in Earth's atmosphere?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"], correctIndex: 2, category: "science", isTiebreaker: false },
  { id: "sci-15", text: "What particle orbits the nucleus of an atom?", options: ["Proton", "Neutron", "Electron", "Photon"], correctIndex: 2, category: "science", isTiebreaker: false },
  { id: "sci-16", text: "What is the boiling point of water in Celsius?", options: ["90", "100", "110", "120"], correctIndex: 1, category: "science", isTiebreaker: false },
  { id: "sci-17", text: "Which blood type is known as the universal donor?", options: ["A+", "B-", "AB+", "O-"], correctIndex: 3, category: "science", isTiebreaker: false },
  { id: "sci-18", text: "What is the chemical formula for table salt?", options: ["NaO", "NaCl", "KCl", "CaCl"], correctIndex: 1, category: "science", isTiebreaker: false },
  { id: "sci-19", text: "What is the closest star to Earth?", options: ["Proxima Centauri", "Sirius", "The Sun", "Alpha Centauri"], correctIndex: 2, category: "science", isTiebreaker: false },
  { id: "sci-20", text: "How long does light from the Sun take to reach Earth?", options: ["4 minutes", "8 minutes", "12 minutes", "16 minutes"], correctIndex: 1, category: "science", isTiebreaker: false },
  { id: "sci-21", text: "What process do plants use to make food?", options: ["Respiration", "Fermentation", "Photosynthesis", "Oxidation"], correctIndex: 2, category: "science", isTiebreaker: false },
  { id: "sci-22", text: "What is the pH of pure water?", options: ["5", "7", "9", "10"], correctIndex: 1, category: "science", isTiebreaker: false },
  { id: "sci-23", text: "Which planet is the hottest in our solar system?", options: ["Mercury", "Venus", "Mars", "Jupiter"], correctIndex: 1, category: "science", isTiebreaker: false },
  { id: "sci-24", text: "What is the chemical symbol for iron?", options: ["Ir", "In", "Fe", "Fr"], correctIndex: 2, category: "science", isTiebreaker: false },
  { id: "sci-25", text: "What force keeps us on the ground?", options: ["Magnetism", "Friction", "Gravity", "Inertia"], correctIndex: 2, category: "science", isTiebreaker: false },
  // Tiebreakers
  { id: "sci-tb-1", text: "How many kilometers is the Earth's circumference?", numericAnswer: 40075, category: "science", isTiebreaker: true },
  { id: "sci-tb-2", text: "How many light-years away is Proxima Centauri?", numericAnswer: 4.24, category: "science", isTiebreaker: true },
  { id: "sci-tb-3", text: "What is the average temperature of the Sun's surface in Celsius?", numericAnswer: 5500, category: "science", isTiebreaker: true },
];

// ── Movies Questions ───────────────────────────────────────────────

const moviesQuestions: QuestionData[] = [
  { id: "mov-1", text: "Who directed 'Inception'?", options: ["Steven Spielberg", "Christopher Nolan", "James Cameron", "Ridley Scott"], correctIndex: 1, category: "movies", isTiebreaker: false },
  { id: "mov-2", text: "What year was the first 'Star Wars' movie released?", options: ["1975", "1977", "1979", "1980"], correctIndex: 1, category: "movies", isTiebreaker: false },
  { id: "mov-3", text: "Which movie won Best Picture at the 2020 Oscars?", options: ["1917", "Joker", "Parasite", "Once Upon a Time in Hollywood"], correctIndex: 2, category: "movies", isTiebreaker: false },
  { id: "mov-4", text: "Who played the Joker in 'The Dark Knight'?", options: ["Jack Nicholson", "Jared Leto", "Joaquin Phoenix", "Heath Ledger"], correctIndex: 3, category: "movies", isTiebreaker: false },
  { id: "mov-5", text: "What is the highest-grossing film of all time?", options: ["Avengers: Endgame", "Avatar", "Titanic", "Star Wars: TFA"], correctIndex: 1, category: "movies", isTiebreaker: false },
  { id: "mov-6", text: "In 'The Matrix', what color pill does Neo take?", options: ["Blue", "Red", "Green", "Yellow"], correctIndex: 1, category: "movies", isTiebreaker: false },
  { id: "mov-7", text: "Who played Jack in 'Titanic'?", options: ["Brad Pitt", "Tom Hanks", "Leonardo DiCaprio", "Matt Damon"], correctIndex: 2, category: "movies", isTiebreaker: false },
  { id: "mov-8", text: "What is the name of Batman's butler?", options: ["Jarvis", "Alfred", "Edwin", "Geoffrey"], correctIndex: 1, category: "movies", isTiebreaker: false },
  { id: "mov-9", text: "Which movie features the quote 'Here's looking at you, kid'?", options: ["Gone with the Wind", "The Godfather", "Casablanca", "Citizen Kane"], correctIndex: 2, category: "movies", isTiebreaker: false },
  { id: "mov-10", text: "How many 'Lord of the Rings' movies are there?", options: ["2", "3", "4", "5"], correctIndex: 1, category: "movies", isTiebreaker: false },
  { id: "mov-11", text: "Who directed 'Pulp Fiction'?", options: ["Martin Scorsese", "Quentin Tarantino", "David Fincher", "Coen Brothers"], correctIndex: 1, category: "movies", isTiebreaker: false },
  { id: "mov-12", text: "What animated movie features a clownfish named Nemo?", options: ["Shark Tale", "Finding Nemo", "The Little Mermaid", "Moana"], correctIndex: 1, category: "movies", isTiebreaker: false },
  { id: "mov-13", text: "Which actor played Iron Man in the MCU?", options: ["Chris Evans", "Chris Hemsworth", "Robert Downey Jr.", "Mark Ruffalo"], correctIndex: 2, category: "movies", isTiebreaker: false },
  { id: "mov-14", text: "What is Darth Vader's real name?", options: ["Luke Skywalker", "Han Solo", "Anakin Skywalker", "Obi-Wan Kenobi"], correctIndex: 2, category: "movies", isTiebreaker: false },
  { id: "mov-15", text: "Which 1994 movie takes place mostly in prison?", options: ["Forrest Gump", "Pulp Fiction", "The Shawshank Redemption", "Leon"], correctIndex: 2, category: "movies", isTiebreaker: false },
  { id: "mov-16", text: "Who voiced Woody in 'Toy Story'?", options: ["Tim Allen", "Tom Hanks", "Billy Crystal", "Robin Williams"], correctIndex: 1, category: "movies", isTiebreaker: false },
  { id: "mov-17", text: "What is the name of the wizarding school in Harry Potter?", options: ["Durmstrang", "Beauxbatons", "Hogwarts", "Ilvermorny"], correctIndex: 2, category: "movies", isTiebreaker: false },
  { id: "mov-18", text: "Which movie features a dinosaur theme park?", options: ["King Kong", "Jurassic Park", "Godzilla", "The Lost World"], correctIndex: 1, category: "movies", isTiebreaker: false },
  { id: "mov-19", text: "Who directed 'Schindler's List'?", options: ["Steven Spielberg", "Roman Polanski", "Francis Ford Coppola", "Stanley Kubrick"], correctIndex: 0, category: "movies", isTiebreaker: false },
  { id: "mov-20", text: "In which movie does a character say 'I see dead people'?", options: ["The Others", "The Sixth Sense", "Ghost", "Poltergeist"], correctIndex: 1, category: "movies", isTiebreaker: false },
  { id: "mov-21", text: "What year was 'The Godfather' released?", options: ["1970", "1972", "1974", "1976"], correctIndex: 1, category: "movies", isTiebreaker: false },
  { id: "mov-22", text: "Which superhero is from Wakanda?", options: ["Spider-Man", "Black Panther", "Thor", "Doctor Strange"], correctIndex: 1, category: "movies", isTiebreaker: false },
  { id: "mov-23", text: "Who directed 'Interstellar'?", options: ["Ridley Scott", "Denis Villeneuve", "Christopher Nolan", "Alfonso Cuaron"], correctIndex: 2, category: "movies", isTiebreaker: false },
  { id: "mov-24", text: "What is the name of the lion in 'The Lion King'?", options: ["Mufasa", "Simba", "Scar", "Rafiki"], correctIndex: 1, category: "movies", isTiebreaker: false },
  { id: "mov-25", text: "Which franchise features the DeLorean time machine?", options: ["Terminator", "Back to the Future", "Bill & Ted", "Doctor Who"], correctIndex: 1, category: "movies", isTiebreaker: false },
  // Tiebreakers
  { id: "mov-tb-1", text: "How many Academy Awards has Walt Disney won (personal)?", numericAnswer: 22, category: "movies", isTiebreaker: true },
  { id: "mov-tb-2", text: "What was the worldwide box office of Titanic (1997) in millions of dollars?", numericAnswer: 2202, category: "movies", isTiebreaker: true },
  { id: "mov-tb-3", text: "In what year was the first Academy Awards ceremony held?", numericAnswer: 1929, category: "movies", isTiebreaker: true },
];

// ── History Questions ──────────────────────────────────────────────

const historyQuestions: QuestionData[] = [
  { id: "his-1", text: "In what year did World War II end?", options: ["1943", "1944", "1945", "1946"], correctIndex: 2, category: "history", isTiebreaker: false },
  { id: "his-2", text: "Who was the first President of the United States?", options: ["Thomas Jefferson", "John Adams", "George Washington", "Benjamin Franklin"], correctIndex: 2, category: "history", isTiebreaker: false },
  { id: "his-3", text: "Which ancient wonder was located in Egypt?", options: ["Colossus of Rhodes", "Great Pyramid of Giza", "Hanging Gardens", "Temple of Artemis"], correctIndex: 1, category: "history", isTiebreaker: false },
  { id: "his-4", text: "Who discovered America in 1492?", options: ["Vasco da Gama", "Ferdinand Magellan", "Christopher Columbus", "Amerigo Vespucci"], correctIndex: 2, category: "history", isTiebreaker: false },
  { id: "his-5", text: "What empire was ruled by Julius Caesar?", options: ["Greek Empire", "Roman Empire", "Ottoman Empire", "Persian Empire"], correctIndex: 1, category: "history", isTiebreaker: false },
  { id: "his-6", text: "In which city was JFK assassinated?", options: ["Washington D.C.", "Dallas", "New York", "Chicago"], correctIndex: 1, category: "history", isTiebreaker: false },
  { id: "his-7", text: "What wall divided Berlin from 1961 to 1989?", options: ["Iron Curtain", "Berlin Wall", "Hadrian's Wall", "Great Wall"], correctIndex: 1, category: "history", isTiebreaker: false },
  { id: "his-8", text: "Who painted the Mona Lisa?", options: ["Michelangelo", "Raphael", "Leonardo da Vinci", "Donatello"], correctIndex: 2, category: "history", isTiebreaker: false },
  { id: "his-9", text: "What was the name of the ship that sank in 1912?", options: ["Lusitania", "Britannic", "Titanic", "Olympic"], correctIndex: 2, category: "history", isTiebreaker: false },
  { id: "his-10", text: "Who was the first person to walk on the moon?", options: ["Buzz Aldrin", "Yuri Gagarin", "Neil Armstrong", "John Glenn"], correctIndex: 2, category: "history", isTiebreaker: false },
  { id: "his-11", text: "The French Revolution began in which year?", options: ["1776", "1789", "1799", "1804"], correctIndex: 1, category: "history", isTiebreaker: false },
  { id: "his-12", text: "What ancient civilization built Machu Picchu?", options: ["Aztec", "Maya", "Inca", "Olmec"], correctIndex: 2, category: "history", isTiebreaker: false },
  { id: "his-13", text: "Who wrote 'The Art of War'?", options: ["Confucius", "Sun Tzu", "Lao Tzu", "Genghis Khan"], correctIndex: 1, category: "history", isTiebreaker: false },
  { id: "his-14", text: "Which country was formerly known as Persia?", options: ["Iraq", "Turkey", "Iran", "Syria"], correctIndex: 2, category: "history", isTiebreaker: false },
  { id: "his-15", text: "What year did the Chernobyl disaster occur?", options: ["1984", "1986", "1988", "1990"], correctIndex: 1, category: "history", isTiebreaker: false },
  { id: "his-16", text: "Who was known as the 'Iron Lady'?", options: ["Angela Merkel", "Margaret Thatcher", "Indira Gandhi", "Golda Meir"], correctIndex: 1, category: "history", isTiebreaker: false },
  { id: "his-17", text: "What ancient civilization built the Parthenon?", options: ["Roman", "Egyptian", "Greek", "Persian"], correctIndex: 2, category: "history", isTiebreaker: false },
  { id: "his-18", text: "In what year did the Berlin Wall fall?", options: ["1987", "1988", "1989", "1990"], correctIndex: 2, category: "history", isTiebreaker: false },
  { id: "his-19", text: "Who led India to independence through non-violence?", options: ["Jawaharlal Nehru", "Mahatma Gandhi", "Subhas Chandra Bose", "B.R. Ambedkar"], correctIndex: 1, category: "history", isTiebreaker: false },
  { id: "his-20", text: "What was the longest war in history?", options: ["Hundred Years War", "Thirty Years War", "Reconquista", "Punic Wars"], correctIndex: 2, category: "history", isTiebreaker: false },
  { id: "his-21", text: "Which pharaoh's tomb was discovered in 1922?", options: ["Ramses II", "Cleopatra", "Tutankhamun", "Khufu"], correctIndex: 2, category: "history", isTiebreaker: false },
  { id: "his-22", text: "What treaty ended World War I?", options: ["Treaty of Paris", "Treaty of Versailles", "Treaty of Vienna", "Treaty of Ghent"], correctIndex: 1, category: "history", isTiebreaker: false },
  { id: "his-23", text: "Who was the first Emperor of China?", options: ["Kublai Khan", "Qin Shi Huang", "Sun Yat-sen", "Confucius"], correctIndex: 1, category: "history", isTiebreaker: false },
  { id: "his-24", text: "What year did Columbus reach America?", options: ["1490", "1491", "1492", "1493"], correctIndex: 2, category: "history", isTiebreaker: false },
  { id: "his-25", text: "Which country gifted the Statue of Liberty to the USA?", options: ["England", "Spain", "France", "Germany"], correctIndex: 2, category: "history", isTiebreaker: false },
  // Tiebreakers
  { id: "his-tb-1", text: "In what year was the Great Wall of China construction started?", numericAnswer: 700, category: "history", isTiebreaker: true },
  { id: "his-tb-2", text: "How many years did the Roman Empire last (from founding to fall of Western Rome)?", numericAnswer: 503, category: "history", isTiebreaker: true },
  { id: "his-tb-3", text: "How many people died in World War II (in millions)?", numericAnswer: 70, category: "history", isTiebreaker: true },
];

// ── Tech Questions ─────────────────────────────────────────────────

const techQuestions: QuestionData[] = [
  { id: "tec-1", text: "What does 'HTML' stand for?", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "Home Tool Markup Language"], correctIndex: 0, category: "tech", isTiebreaker: false },
  { id: "tec-2", text: "Who founded Microsoft?", options: ["Steve Jobs", "Bill Gates", "Mark Zuckerberg", "Jeff Bezos"], correctIndex: 1, category: "tech", isTiebreaker: false },
  { id: "tec-3", text: "What does 'CPU' stand for?", options: ["Central Process Unit", "Central Processing Unit", "Computer Personal Unit", "Central Program Utility"], correctIndex: 1, category: "tech", isTiebreaker: false },
  { id: "tec-4", text: "Which company created the iPhone?", options: ["Samsung", "Google", "Apple", "Microsoft"], correctIndex: 2, category: "tech", isTiebreaker: false },
  { id: "tec-5", text: "What programming language was created by Brendan Eich?", options: ["Python", "Java", "JavaScript", "C++"], correctIndex: 2, category: "tech", isTiebreaker: false },
  { id: "tec-6", text: "What does 'URL' stand for?", options: ["Uniform Resource Locator", "Universal Resource Link", "Unified Resource Locator", "Universal Reference Locator"], correctIndex: 0, category: "tech", isTiebreaker: false },
  { id: "tec-7", text: "What was the first social media platform to reach 1 billion users?", options: ["Twitter", "Instagram", "Facebook", "YouTube"], correctIndex: 2, category: "tech", isTiebreaker: false },
  { id: "tec-8", text: "What does 'RAM' stand for?", options: ["Read Access Memory", "Random Access Memory", "Rapid Access Module", "Runtime Application Memory"], correctIndex: 1, category: "tech", isTiebreaker: false },
  { id: "tec-9", text: "Who is the CEO of Tesla?", options: ["Jeff Bezos", "Tim Cook", "Elon Musk", "Satya Nadella"], correctIndex: 2, category: "tech", isTiebreaker: false },
  { id: "tec-10", text: "What year was the first iPhone released?", options: ["2005", "2006", "2007", "2008"], correctIndex: 2, category: "tech", isTiebreaker: false },
  { id: "tec-11", text: "What does 'AI' stand for?", options: ["Automated Intelligence", "Artificial Intelligence", "Applied Information", "Advanced Integration"], correctIndex: 1, category: "tech", isTiebreaker: false },
  { id: "tec-12", text: "Which company owns Android?", options: ["Apple", "Microsoft", "Google", "Samsung"], correctIndex: 2, category: "tech", isTiebreaker: false },
  { id: "tec-13", text: "What is the most popular programming language in 2024?", options: ["Java", "Python", "JavaScript", "C#"], correctIndex: 1, category: "tech", isTiebreaker: false },
  { id: "tec-14", text: "What does 'SSD' stand for?", options: ["Solid State Drive", "Super Speed Disk", "Solid System Device", "Static Storage Drive"], correctIndex: 0, category: "tech", isTiebreaker: false },
  { id: "tec-15", text: "Who created Linux?", options: ["Dennis Ritchie", "Linus Torvalds", "Richard Stallman", "Ken Thompson"], correctIndex: 1, category: "tech", isTiebreaker: false },
  { id: "tec-16", text: "What does 'HTTP' stand for?", options: ["HyperText Transfer Protocol", "High Tech Transfer Protocol", "Hyper Transfer Text Protocol", "Home Transfer Text Protocol"], correctIndex: 0, category: "tech", isTiebreaker: false },
  { id: "tec-17", text: "Which company created ChatGPT?", options: ["Google", "Meta", "OpenAI", "Anthropic"], correctIndex: 2, category: "tech", isTiebreaker: false },
  { id: "tec-18", text: "What is the main language used for iOS development?", options: ["Java", "Kotlin", "Swift", "C#"], correctIndex: 2, category: "tech", isTiebreaker: false },
  { id: "tec-19", text: "What does 'VPN' stand for?", options: ["Virtual Private Network", "Visual Processing Node", "Verified Protected Network", "Virtual Public Network"], correctIndex: 0, category: "tech", isTiebreaker: false },
  { id: "tec-20", text: "Which company acquired GitHub in 2018?", options: ["Google", "Amazon", "Apple", "Microsoft"], correctIndex: 3, category: "tech", isTiebreaker: false },
  { id: "tec-21", text: "What was the first search engine?", options: ["Google", "Yahoo", "Archie", "AltaVista"], correctIndex: 2, category: "tech", isTiebreaker: false },
  { id: "tec-22", text: "What does 'CSS' stand for?", options: ["Cascading Style Sheets", "Computer Style System", "Creative Style Syntax", "Coded Style Sheets"], correctIndex: 0, category: "tech", isTiebreaker: false },
  { id: "tec-23", text: "What is the default port for HTTPS?", options: ["80", "443", "8080", "3000"], correctIndex: 1, category: "tech", isTiebreaker: false },
  { id: "tec-24", text: "Which company makes the PlayStation?", options: ["Nintendo", "Microsoft", "Sony", "Sega"], correctIndex: 2, category: "tech", isTiebreaker: false },
  { id: "tec-25", text: "What does 'API' stand for?", options: ["Application Programming Interface", "Automated Program Integration", "Applied Programming Interface", "Application Process Interface"], correctIndex: 0, category: "tech", isTiebreaker: false },
  // Tiebreakers
  { id: "tec-tb-1", text: "In what year was the World Wide Web invented?", numericAnswer: 1989, category: "tech", isTiebreaker: true },
  { id: "tec-tb-2", text: "How many transistors (in billions) does the Apple M2 chip have?", numericAnswer: 20, category: "tech", isTiebreaker: true },
  { id: "tec-tb-3", text: "How many active users does Facebook have (in billions)?", numericAnswer: 3, category: "tech", isTiebreaker: true },
];

// ── Gaming Questions ───────────────────────────────────────────────

const gamingQuestions: QuestionData[] = [
  { id: "gam-1", text: "What is the best-selling video game of all time?", options: ["GTA V", "Minecraft", "Tetris", "Wii Sports"], correctIndex: 1, category: "gaming", isTiebreaker: false },
  { id: "gam-2", text: "What company created Mario?", options: ["Sega", "Sony", "Nintendo", "Atari"], correctIndex: 2, category: "gaming", isTiebreaker: false },
  { id: "gam-3", text: "In which game do you fight against Creepers?", options: ["Fortnite", "Minecraft", "Terraria", "Roblox"], correctIndex: 1, category: "gaming", isTiebreaker: false },
  { id: "gam-4", text: "What is the main character's name in 'The Legend of Zelda'?", options: ["Zelda", "Link", "Ganon", "Epona"], correctIndex: 1, category: "gaming", isTiebreaker: false },
  { id: "gam-5", text: "Which game features the Battle Royale mode with 100 players?", options: ["Call of Duty", "Fortnite", "Overwatch", "Apex Legends"], correctIndex: 1, category: "gaming", isTiebreaker: false },
  { id: "gam-6", text: "What year was the original PlayStation released?", options: ["1992", "1994", "1996", "1998"], correctIndex: 1, category: "gaming", isTiebreaker: false },
  { id: "gam-7", text: "What game features the character Master Chief?", options: ["Destiny", "Halo", "Gears of War", "Call of Duty"], correctIndex: 1, category: "gaming", isTiebreaker: false },
  { id: "gam-8", text: "In 'Among Us', what are the impostors trying to do?", options: ["Complete tasks", "Eliminate crewmates", "Fix the ship", "Escape"], correctIndex: 1, category: "gaming", isTiebreaker: false },
  { id: "gam-9", text: "Which game features characters called 'Champions' in a MOBA?", options: ["Dota 2", "League of Legends", "Smite", "Heroes of the Storm"], correctIndex: 1, category: "gaming", isTiebreaker: false },
  { id: "gam-10", text: "What fruit does Pac-Man eat?", options: ["Apples", "Cherries", "Bananas", "Grapes"], correctIndex: 1, category: "gaming", isTiebreaker: false },
  { id: "gam-11", text: "Which company developed 'The Witcher 3'?", options: ["BioWare", "CD Projekt Red", "Bethesda", "Ubisoft"], correctIndex: 1, category: "gaming", isTiebreaker: false },
  { id: "gam-12", text: "What color is Sonic the Hedgehog?", options: ["Red", "Green", "Blue", "Yellow"], correctIndex: 2, category: "gaming", isTiebreaker: false },
  { id: "gam-13", text: "In 'Pokemon', what type is Pikachu?", options: ["Fire", "Water", "Electric", "Normal"], correctIndex: 2, category: "gaming", isTiebreaker: false },
  { id: "gam-14", text: "What game takes place in the world of Azeroth?", options: ["Final Fantasy", "World of Warcraft", "Elder Scrolls", "Guild Wars"], correctIndex: 1, category: "gaming", isTiebreaker: false },
  { id: "gam-15", text: "Which game series features the 'Covenant' as enemies?", options: ["Mass Effect", "Halo", "Destiny", "Doom"], correctIndex: 1, category: "gaming", isTiebreaker: false },
  { id: "gam-16", text: "What is the currency in 'Fortnite'?", options: ["Coins", "Gems", "V-Bucks", "Credits"], correctIndex: 2, category: "gaming", isTiebreaker: false },
  { id: "gam-17", text: "Which game features a character named Kratos?", options: ["Devil May Cry", "Bayonetta", "God of War", "Darksiders"], correctIndex: 2, category: "gaming", isTiebreaker: false },
  { id: "gam-18", text: "What is the main resource in 'Clash of Clans'?", options: ["Gold", "Diamonds", "Wood", "Iron"], correctIndex: 0, category: "gaming", isTiebreaker: false },
  { id: "gam-19", text: "Which racing game features blue shells?", options: ["Need for Speed", "Gran Turismo", "Mario Kart", "Forza"], correctIndex: 2, category: "gaming", isTiebreaker: false },
  { id: "gam-20", text: "What studio created 'Dark Souls'?", options: ["Capcom", "FromSoftware", "Square Enix", "Konami"], correctIndex: 1, category: "gaming", isTiebreaker: false },
  { id: "gam-21", text: "In 'GTA V', what city is the game set in?", options: ["Liberty City", "Vice City", "Los Santos", "San Fierro"], correctIndex: 2, category: "gaming", isTiebreaker: false },
  { id: "gam-22", text: "What does 'NPC' stand for in gaming?", options: ["New Player Character", "Non-Player Character", "Normal Playing Character", "Network Player Control"], correctIndex: 1, category: "gaming", isTiebreaker: false },
  { id: "gam-23", text: "Which game features building with blocks in a sandbox world?", options: ["Roblox", "Minecraft", "Terraria", "Lego Worlds"], correctIndex: 1, category: "gaming", isTiebreaker: false },
  { id: "gam-24", text: "What is the highest rank in chess?", options: ["King", "Queen", "Grandmaster", "Champion"], correctIndex: 2, category: "gaming", isTiebreaker: false },
  { id: "gam-25", text: "Which game has a mode called 'Zombies'?", options: ["Battlefield", "Call of Duty", "Halo", "Medal of Honor"], correctIndex: 1, category: "gaming", isTiebreaker: false },
  // Tiebreakers
  { id: "gam-tb-1", text: "How many copies has Minecraft sold worldwide (in millions)?", numericAnswer: 300, category: "gaming", isTiebreaker: true },
  { id: "gam-tb-2", text: "In what year was the first video game console (Magnavox Odyssey) released?", numericAnswer: 1972, category: "gaming", isTiebreaker: true },
  { id: "gam-tb-3", text: "How many Pokemon were in the original generation?", numericAnswer: 151, category: "gaming", isTiebreaker: true },
];

export const allTriviaConquestQuestions: QuestionData[] = [
  ...scienceQuestions,
  ...moviesQuestions,
  ...historyQuestions,
  ...techQuestions,
  ...gamingQuestions,
];
