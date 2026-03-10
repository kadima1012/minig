import { RpsChoice, RpsRound, RoundOutcome } from "@minigames/shared";

const CHOICES: RpsChoice[] = [RpsChoice.Rock, RpsChoice.Paper, RpsChoice.Scissors];

function determineOutcome(player: RpsChoice, cpu: RpsChoice): RoundOutcome {
  if (player === cpu) return RoundOutcome.Draw;
  if (
    (player === RpsChoice.Rock && cpu === RpsChoice.Scissors) ||
    (player === RpsChoice.Paper && cpu === RpsChoice.Rock) ||
    (player === RpsChoice.Scissors && cpu === RpsChoice.Paper)
  ) {
    return RoundOutcome.Win;
  }
  return RoundOutcome.Lose;
}

export class PlayRoundUseCase {
  execute(playerChoice: RpsChoice): RpsRound {
    const cpuChoice = CHOICES[Math.floor(Math.random() * CHOICES.length)];
    const outcome = determineOutcome(playerChoice, cpuChoice);
    return { playerChoice, cpuChoice, outcome };
  }
}
