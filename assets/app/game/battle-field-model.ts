import { ShipDepartment } from "./ship-model";

export class BattleFieldModel {
    constructor(public rowGrid: Array<TableContent[]>) {} // row grid contain the column array

    static renderGrid(shipDepartment: ShipDepartment, battleField: BattleFieldModel) {
        const leftWeaponColIndex = shipDepartment.leftWeapon.xIndex;
        const leftWeaponRowIndex = shipDepartment.leftWeapon.yIndex;

        const rightWeaponColIndex = shipDepartment.rightWeapon.xIndex;
        const rightWeaponRowIndex = shipDepartment.rightWeapon.yIndex;

        const leftEngineColIndex = shipDepartment.leftEngine.xIndex;
        const leftEngineRowIndex = shipDepartment.leftEngine.yIndex;

        const rightEngineColIndex = shipDepartment.rightEngine.xIndex;
        const rightEngineRowIndex = shipDepartment.rightEngine.yIndex;

        // console.log(leftWeaponColIndex, leftWeaponRowIndex, rightWeaponColIndex, rightWeaponRowIndex, leftEngineColIndex, leftEngineRowIndex, rightEngineColIndex, rightEngineRowIndex);
        battleField.rowGrid[leftWeaponRowIndex][leftWeaponColIndex].color = 'red';
        battleField.rowGrid[rightWeaponRowIndex][rightWeaponColIndex].color = 'red';

        battleField.rowGrid[leftEngineRowIndex][leftEngineColIndex].color = 'blue';
        battleField.rowGrid[rightEngineRowIndex][rightEngineColIndex].color = 'blue';
        // battleField.rowGrid[5][5].color = 'red';
        // console.log(battleField);

        return battleField;
    }
}

export class TableContent {
    constructor(public index, public color: string) {}
}