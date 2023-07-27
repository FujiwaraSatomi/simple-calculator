import rl from "readline-sync";
import Parser from "./modules/parser.js";
let parser = new Parser();

while(1) {
    let data = rl.question("< ");
    let res = parser.parse(data);
    console.log(`> ${res}`);
}
