import { ShipDepartment } from "./ship-model";

export class BattleFieldModel {
    constructor(public rowGrid: Array<TableContent[]>) {} // row grid contain the column array

    static renderGrid(shipDepartment: ShipDepartment, battleField: BattleFieldModel, colourFront: string, colourBack: string) {

        const leftWeaponRowIndex = shipDepartment.leftWeapon.xIndex;
        const leftWeaponColIndex = shipDepartment.leftWeapon.yIndex;

        const rightWeaponRowIndex = shipDepartment.rightWeapon.xIndex;
        const rightWeaponColIndex = shipDepartment.rightWeapon.yIndex;

        const leftEngineRowIndex = shipDepartment.leftEngine.xIndex;
        const leftEngineColIndex = shipDepartment.leftEngine.yIndex;

        const rightEngineRowIndex = shipDepartment.rightEngine.xIndex;
        const rightEngineColIndex = shipDepartment.rightEngine.yIndex;

        // console.log(leftWeaponColIndex, leftWeaponRowIndex, rightWeaponColIndex, rightWeaponRowIndex, leftEngineColIndex, leftEngineRowIndex, rightEngineColIndex, rightEngineRowIndex);
        battleField.rowGrid[leftWeaponRowIndex][leftWeaponColIndex].color = colourFront;
        battleField.rowGrid[rightWeaponRowIndex][rightWeaponColIndex].color = colourFront;

        battleField.rowGrid[leftEngineRowIndex][leftEngineColIndex].color = colourBack;
        battleField.rowGrid[rightEngineRowIndex][rightEngineColIndex].color = colourBack;

        return battleField;
    }
}

export class TableContent {
    constructor(public index, public color: string) {}
}