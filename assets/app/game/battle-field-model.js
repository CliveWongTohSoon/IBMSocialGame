"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BattleFieldModel = /** @class */ (function () {
    function BattleFieldModel(rowGrid) {
        this.rowGrid = rowGrid;
    } // row grid contain the column array
    BattleFieldModel.renderGrid = function (shipDepartment, battleField, colourFront, colourBack) {
        var leftWeaponRowIndex = shipDepartment.leftWeapon.yIndex, leftWeaponColIndex = shipDepartment.leftWeapon.xIndex;
        var rightWeaponRowIndex = shipDepartment.rightWeapon.yIndex, rightWeaponColIndex = shipDepartment.rightWeapon.xIndex;
        var leftEngineRowIndex = shipDepartment.leftEngine.yIndex, leftEngineColIndex = shipDepartment.leftEngine.xIndex;
        var rightEngineRowIndex = shipDepartment.rightEngine.yIndex, rightEngineColIndex = shipDepartment.rightEngine.xIndex;
        /*console.log('Left weapon: (', leftWeaponColIndex, ', ', leftWeaponRowIndex, ') ; ',
             'Right Weapon: (' , rightWeaponColIndex, ', ', rightWeaponRowIndex, ') ; ',
                        'Left Engine: (', leftEngineColIndex, ', ', leftEngineRowIndex, ') ; ',
                       'Right Engine: (', rightEngineColIndex, ', ', rightEngineRowIndex, ')');*/
        battleField.rowGrid[leftWeaponRowIndex][leftWeaponColIndex].color = colourFront;
        battleField.rowGrid[rightWeaponRowIndex][rightWeaponColIndex].color = colourFront;
        battleField.rowGrid[leftEngineRowIndex][leftEngineColIndex].color = colourBack;
        battleField.rowGrid[rightEngineRowIndex][rightEngineColIndex].color = colourBack;
        return battleField;
    };
    return BattleFieldModel;
}());
exports.BattleFieldModel = BattleFieldModel;
var TableContent = /** @class */ (function () {
    function TableContent(index, color) {
        this.index = index;
        this.color = color;
    }
    return TableContent;
}());
exports.TableContent = TableContent;
// static wrapAround(sizeX: number, sizeY: number, indexX: number, indexY: number){
//     let newX: number;
//     let newY: number;
//     if (indexX >= sizeX){
//         newX = indexX - sizeX;
//     }
//     else if (indexX < 0){
//         newX = indexX + sizeX;
//     }
//     else{newX = indexX}
//     if (indexY >= sizeY){
//         newY = indexY - sizeY;
//     }
//     else if (indexY < 0){
//         newY = indexY + sizeY;
//     }
//     else{newY = indexY}
//     return{X: newX, Y: newY}
