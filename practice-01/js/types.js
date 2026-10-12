"use strict";

const expr1 = "8" + 2;
console.log('1) "8" + 2 =', expr1, "| тип:", typeof expr1);

const expr2 = "8" - 2;
console.log('2) "8" - 2 =', expr2, "| тип:", typeof expr2);

const expr3 = Number("8") + 2;
console.log('3) Number("8") + 2 =', expr3, "| тип:", typeof expr3);

const expr4 = "12" > "3";
console.log('4) "12" > "3" =', expr4, "| тип:", typeof expr4);

const expr5 = 12 === "12";
console.log('5) 12 === "12" =', expr5, "| тип:", typeof expr5);

const expr6 = Number("");
console.log('6) Number("") =', expr6, "| тип:", typeof expr6);

const expr7 = Number("text");
console.log('7) Number("text") =', expr7, "| тип:", typeof expr7);

const expr8 = Boolean("false");
console.log('8) Boolean("false") =', expr8, "| тип:", typeof expr8);

const expr9 = typeof null;
console.log("9) typeof null =", expr9, "| тип результата:", typeof expr9);

const expr10 = typeof NaN;
console.log("10) typeof NaN =", expr10, "| тип результата:", typeof expr10);
