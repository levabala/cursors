import PIXI = require("pixi.js");
export = PIXI;
export as namespace PIXI;

declare global {
    var PIXI: typeof PIXI;
}
