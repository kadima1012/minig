import { TcCategory } from "@minigames/shared";
import { AxialCoord } from "../value-objects/HexCoord";

export class TcHexagon {
  public ownerId: string | null = null;
  public ownerUsername: string | null = null;
  public ownerColor: string | null = null;

  constructor(
    public readonly id: string,
    public readonly q: number,
    public readonly r: number,
    public readonly category: TcCategory,
    public readonly neighborIds: string[]
  ) {}

  get coord(): AxialCoord {
    return { q: this.q, r: this.r };
  }

  isNeutral(): boolean {
    return this.ownerId === null;
  }

  isOwnedBy(userId: string): boolean {
    return this.ownerId === userId;
  }

  isNeighbor(hexId: string): boolean {
    return this.neighborIds.includes(hexId);
  }

  setOwner(userId: string | null, username: string | null, color: string | null): void {
    this.ownerId = userId;
    this.ownerUsername = username;
    this.ownerColor = color;
  }
}
