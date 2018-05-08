import {ShipModel} from "./ship-model";

export class BattleFieldModel {
    constructor(public rowGrid: TableContent[], public colGrid: TableContent[]) {}
}

export class TableContent {
    constructor(public index: number, public backgroundColor: string, public ship: ShipModel) {}
}