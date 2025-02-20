
const listToString = (list) => {
    if (list == undefined || list.length == 0) {
        return " None";
    }

    let s = "";
    for (let i = 0; i < list.length; i++) {
        s += ` ${list[i]}`;

        if (i < list.length - 1) {
            s += ",";
        }
    }

    return s;
}

const ppReviews = (reviews) => {
    let ppReviews = "";
    for (let review of reviews) {
        ppReviews += `--  Rating: ${review.rating}
    Date: ${review.date}
    Title: \"${review.title}\"
    Body: \"${review.body}\"

`;
    }

    return ppReviews;
}

const ppRepairStories = (repairStories) => {
    console.log(repairStories);

    let ppStories = "";
    for (let story of repairStories) {
        ppStories += `--  Title: \"${story.title}\"
    Description: \"${story.desc}\"
    Related Parts:${listToString(story.related_parts)}
            
`;
    }

    return ppStories;
}

const ppQnA = (qna) => {
    let ppQnA = "";
    for (let q of qna) {
        ppQnA += `--  Question: \"${q.question}\"
    Answer: \"${q.answer}\"
    Related Parts:${listToString(q.related_parts)}

`;
    }

    return ppQnA;
}

const ppPartInfo = (partInfo) => {
    let ppInfo = `Name: ${partInfo.name}
Type: Part
Manufacturer: ${partInfo.manufacturer}
PartSelect Number: ${partInfo.partselect_num}
Manufacturer Part Number: ${partInfo.manufacturer_num}
Intended for appliances made by the following manufacturers:${listToString(partInfo.intended_for)}.
Price: ${partInfo.price.currency}${partInfo.price.amount}.
Availability: ${partInfo.availability}
PartSelect Description: "${partInfo.description}"
Troubleshooting:
- Fixes the following problems:${listToString(partInfo.troubleshooting.fixes)}.
- Intended for the following types of appliances:${listToString(partInfo.troubleshooting.products)}.
- Replaces the following parts:${listToString(partInfo.troubleshooting.replaces)}.
Reviews:
${ppReviews(partInfo.reviews)}
Repair Stories:
${ppRepairStories(partInfo.repair_stories)}
PartSelect Q&A:
${ppQnA(partInfo.qna)}`;

    return ppInfo
}

const ppModelInfo = (modelInfo) => {
    let ppInfo = `Name: ${modelInfo.name}
Type: Model
Manufacturer Number: ${modelInfo.manufacturer_num}
Manufacturer: ${modelInfo.manufacturer}
Common Symptoms:${listToString(modelInfo.common_symptoms)}
PartSelect Q&A:
${ppQnA(modelInfo.qna)}
Repair Stories:
${ppRepairStories(modelInfo.repair_stories)}`;

    return ppInfo
}

const ppPotentialMatches = (matches) => {
    return `Multiple results came up for that model number, it may refer to:${listToString(matches)}`;
}

const ppInfoResult = (infoResult) => {
    const type = infoResult.type;
    const info = infoResult.info;
    if (type == "PartInfoResult") {
        return ppPartInfo(info);
    } else if (type == "ApplianceInfoResult") {
        return ppModelInfo(info);
    } else {
        return ppPotentialMatches(info.matches);
    }
}

const ppCompatibilityResult = (compatibilityResult) => {
    const type = compatibilityResult.type;
    const info = compatibilityResult.info;

    console.log(compatibilityResult);

    if (type == "CompatibilityResult") {
        return `The part is ${info.compatible ? "" : "not "}compatible with the appliance.`;
    } else if (type == "PotentialMatches") {
        return ppPotentialMatches(info.matches);
    } else {
        return "There is no matching part in the database.";
    }
}

const ppPartsResult = (partsResult) => {
    if (partsResult.type == "PartsList") {
        let ppParts = "";

        for (let part of partsResult.info) {
            ppParts += `Name: ${part.name}
- PartSelect Number: ${part.partselect_num}
- Manufacturer Number: ${part.manufacturer_num}
- Description: ${part.desc}
- Price: ${part.price.currency}${part.price.amount}
- Availability: ${part.availability}

`;
        }

        return ppParts;
    } else {
        return ppPotentialMatches(partsResult.info.matches);
    }
}

const ppRepairHelpData = (repairHelpData) => {
    let ppRepairHelp = "";
    for (let appliance of Object.keys(repairHelpData)) {
        ppRepairHelp += `Appliance: ${appliance} \n`;
        ppRepairHelp += `Symptoms: \n`;

        for (let problem of Object.keys(repairHelpData[appliance].symptoms)) {
            const problem = repairHelpData[appliance].problems[i];
            ppRepairHelp += `   - ${problem.name} \n`;
            ppRepairHelp += `   - Causes\n`;

            for (let cause of repairHelpData[appliance].problems[i].potential_causes) {
                ppRepairHelp += `       -- ${cause.name}: ${cause.description} \n`;
            }
        }
    }

    return ppRepairHelp;
}

const ppModelNumberInfo = (modelNumberInfo) => {
    let ppInfo = "";
    for (let model of Object.keys(modelNumberInfo)) {
        ppInfo += `The model number for a ${model} may be located at the following locations: \n`;
        for (let location of modelNumberInfo[model].locations) {
            ppInfo += `   - ${location} \n`;
        }
        ppInfo += "\n";
    }

    return ppInfo;
}

export {
    ppInfoResult,
    ppCompatibilityResult,
    ppPartsResult,
    ppRepairHelpData,
    ppModelNumberInfo
}