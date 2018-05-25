export class InstructionModel {
    constructor(shipId: string, instructionSet: Instruction[]) {}
}

export enum Instruction {
    Move,
    Shoot,
    TurnLeft,
    TurnRight,
    ShieldFront,
    ShieldBack,
    ShieldLeft,
    ShieldRight,
    DoNothing
}