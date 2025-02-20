import { getInfo, getRepairHelpData, getModelNumberInfo, getParts } from "./utils.js";
import { ppRepairHelpData, ppModelNumberInfo, ppPartsResult, ppInfoResult } from "./pp.js";
import * as cheerio from "cheerio";
import fs from "fs";

// console.log(await getParts("WDT780SAEM1", "muh"));
console.log(ppInfoResult(await getInfo("WDT780SAEM1", "model")));

// console.log(ppModelNumberInfo(await getModelNumberInfo()));

// const repairHelpInfo = await getRepairHelpData();
// fs.writeFileSync('./data.json', JSON.stringify(repairHelpInfo, null, 2), 'utf-8');

// const repairHelpInfo = JSON.parse(fs.readFileSync("./repair_data.json", "utf-8"));
// console.log("Second " + repairHelpInfo);
// console.log(Object.keys(repairHelpInfo));
// console.log(ppRepairHelpData(repairHelpInfo));

// fs.writeFileSync('./repair_help.txt', ppRepairHelpData(repairHelpInfo), 'utf-8');

// const something = await fetch("https://www.partselect.com/Repair/Washer/Noisy/");
// const somethingBody = await something.text();
// const $ = cheerio.load(somethingBody);

// const symtpom_list = $('div.symptom-list');

// $('h2', symtpom_list).each((i, elm) => {
//     console.log(elm);
//     console.log(elm.next.next.children[0]);
//     console.log($('div.col-lg-6', elm.next.next).first().text());
// });