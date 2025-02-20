import * as cheerio from "cheerio";

const parseReviews = ($) => {
    const reviews = []
    $('div.pd__cust-review__submitted-review').each((i, elm) => {
        const review = {}

        review.rating = (parseInt($('div.rating__stars__upper', elm).attr('style').split(": ")[1].split("%")[0]) / 20) + " / 5";
        review.date = $('div.pd__cust-review__submitted-review__header > span', elm).first()[0].nextSibling.data.split(" - ")[1].trim();

        review.title = $('div.bold', elm).first().text();
        review.body = $('div.js-searchKeys', elm).first().text();

        reviews.push(review);
    })

    return reviews;
}

const parseRepairStories = ($) => {
    const repair_stories = []
    $('div.repair-story').each((i, elm) => {
        const story = {}
        story.title = $('div.repair-story__title', elm).text();

        const desc_element = $('div.repair-story__instruction', elm);
        if ($('div.js-searchKeys', desc_element).length) {
            story.desc = $('div.repair-story__instruction > div.js-searchKeys', elm).text().split("\n")[1].trim();
        } else {
            story.desc = $('div.repair-story__instruction__content', desc_element)[0].children[0].data;
        }

        story.related_parts = [];
        $('img.js-imgTagHelper', elm).each((i, elm) => {
            story.related_parts.push(elm.attribs.title);
        });

        repair_stories.push(story);
    })

    return repair_stories;
}

const parseQnA = ($) => {
    const qna = []
    $('div.qna__question.js-qnaResponse').each((i, elm) => {
        const q = {};

        q.question = $('div.qna__question.js-qnaResponse > div.js-searchKeys', elm).text();
        q.answer = $('div.qna__ps-answer__msg > div.js-searchKeys', elm).text();

        q.related_parts = [];
        $('img.js-imgTagHelper', elm).each((i, elm) => {
            q.related_parts.push(elm.attribs.title);
        });

        qna.push(q);
    });

    return qna;
}

const parsePartInfo = ($) => {
    const info = {};
    info.name = $('h1[itemprop=name]').text();

    info.partselect_num = $('span[itemprop=productID]').text();
    info.manufacturer_num = $('span[itemprop=mpn]').text();

    const price = $('span.price.pd__price[itemprop=price]');
    info.price = { 'currency': $('span.price__currency', price).text(), 'amount': $('span.js-partPrice', price).text() };
    info.availability = $('span[itemprop=availability]').text();

    const brands = $('span[itemprop=brand]')
    info.manufacturer = brands.text().split("\n")[1].trim();
    info.intended_for = brands.next().text().split("\n")[1].trim().slice(4).split(", ");

    info.description = $('div[itemprop=description]').text();

    info.troubleshooting = {};
    $('div.col-md-6.mt-3 div').each((i, elm) => {
        if (i != 2) {
            const text = (i < 2) ? elm.next.data : elm.children[0].data;
            const formatted = text.split("\n")[1].trim();

            switch (i) {
                case 0:
                    info.troubleshooting.fixes = formatted.split(" | ");
                    break;
                case 1:
                    info.troubleshooting.products = formatted.slice(0, -1).split(", ");
                    break;
                case 3:
                    info.troubleshooting.replaces = formatted.split(",  ");
                    break;
            }
        }
    });

    return info;
}

const parseModelInfo = ($) => {
    const info = {}

    const main = $('div[id=main]');
    info.name = main.attr('data-description');

    info.manufacturer_num = main.attr('data-model-num');
    info.manufacturer = main.attr('data-brand')

    info.qna = []
    $('div.qna__question.js-qnaResponse').each((i, elm) => {
        const q = {};
        q.question = $('div.qna__question.js-qnaResponse > div.js-searchKeys', elm).text();
        q.answer = $('div.qna__ps-answer__msg > div.js-searchKeys', elm).text();

        q.related_parts = [];
        $('img.js-imgTagHelper', elm).each((i, elm) => {
            q.related_parts.push(elm.attribs.title);
        });

        info.qna.push(q);
    });

    info.common_symptoms = []
    $('div.symptoms__descr').each((i, elm) => {
        info.common_symptoms.push(elm.children[0].data);
    });

    return info
}

const autocompleteAPIURL = (searchTerm, numResults) => {
    return `http://partselect.com/api/search/autocompletemodels?searchterm=${searchTerm}&numresults=${numResults}`;
};

const getAutoComplete = async (searchTerm, maxResults) => {
    const response = await fetch(autocompleteAPIURL(searchTerm, maxResults));
    const body = await response.json();

    return { num_matches: body.matches, matches: Object.values(body.items) };
}

const searchAPIURL = (searchTerm) => {
    return `http://partselect.com/api/search?searchterm=${searchTerm}`;
};

const partCommentAPIURl = (baseURL, inventoryID, handler, searchTerm, currentPage = '1', pageSize = '10', sortColumn = 'rating', sortOrder = 'desc') => {
    return `${baseURL}?currentPage=${currentPage}&inventoryID=${inventoryID}&handler=${handler}&pageSize=${pageSize}&sortColumn=${sortColumn}&sortOrder=${sortOrder}&searchTerm=${searchTerm}&`;
}

const modelCommentAPIURL = (modelNumber, masterID, handler, searchTerm, pageSize = '5', sortColumn = 'rating', sortOrder = 'desc', currentPage = '1') => {
    return `https://www.partselect.com/Models/${modelNumber}/?currentPage=${currentPage}&modelMasterID=${masterID}&modelNumber=${modelNumber}&handler=${handler}&pageSize=${pageSize}&sortColumn=${sortColumn}&sortOrder=${sortOrder}&searchTerm=${searchTerm}&`
}

const modelRepairAPIURL = (modelNumber, searchTerm) => {
    return `https://www.partselect.com/Models/${modelNumber}/Instructions/?SearchTerm=${searchTerm}`
}

const getInfo = async (id, query = "") => {
    const response = await fetch(searchAPIURL(id));
    const body = await response.text();
    const $ = cheerio.load(body);

    const main_element = $('div[id=main]');
    const page_type = main_element.attr('data-page-type');
    if (page_type == "PartDetail") {
        const partInfo = parsePartInfo($);

        if (query == "") {
            partInfo.reviews = parseReviews($);
            partInfo.qna = parseQnA($);
            partInfo.repair_stories = parseRepairStories($);
        } else {
            const baseURL = response.url.split("?")[0];
            const inventoryID = partInfo.partselect_num.substring(2);

            partInfo.reviews = parseReviews(cheerio.load(await (await fetch(partCommentAPIURl(partCommentAPIURl(baseURL, inventoryID, "CustomerReviews", query)))).text()));
            partInfo.qna = parseQnA(cheerio.load(await (await fetch(partCommentAPIURl(partCommentAPIURl(baseURL, inventoryID, "QuestionsAndAnswers", query)))).text()));
            partInfo.repair_stories = parseRepairStories(cheerio.load(await (await fetch(partCommentAPIURl(partCommentAPIURl(baseURL, inventoryID, "RepairStories", query)))).text()));
        }

        return { type: "PartInfoResult", info: partInfo };
    } else {
        const autocomplete = await getAutoComplete(id, 5);
        if (autocomplete.num_matches == 1) {
            const modelInfo = parseModelInfo($);
            const master_id = main_element.attr('data-model-id');

            if (query == "") {
                modelInfo.qna = parseQnA($);
                modelInfo.repair_stories = parseRepairStories($);
            } else {
                modelInfo.qna = parseQnA(cheerio.load(await (await fetch(modelCommentAPIURL(modelInfo.manufacturer_num, master_id, "QuestionsAndAnswers", query))).text()));
                modelInfo.repair_stories = parseRepairStories(cheerio.load(await (await fetch(modelRepairAPIURL(modelInfo.manufacturer_num, query))).text()));
            }

            return { type: "ApplianceInfoResult", info: modelInfo };
        } else {
            return { type: "PotentialMatches", info: { matches: autocomplete.matches } };
        }
    }
}

const partCompatibilityAPIURL = (modelNumber, inventoryId, partDescription) => {
    return `http://partselect.com/api/Part/PartCompatibilityCheck?modelnumber=${modelNumber}&inventoryid=${inventoryId}&partdescription=${partDescription}`;
}

const getPartCompatibility = async (modelNumber, partNumber) => {
    const autocomplete = await getAutoComplete(modelNumber, 5);
    if (autocomplete.num_matches > 1) {
        return { type: "PotentialMatches", info: { matches: autocomplete.matches } };
    } else {
        const infoResult = await getInfo(partNumber);
        if (infoResult.type == "PartInfoResult") {
            const inventoryId = infoResult.info.partselect_num.substring(2);
            const response = await fetch(partCompatibilityAPIURL(modelNumber, inventoryId));
            const body = await response.json();

            return { type: "CompatibilityResult", info: { compatible: body.compatibilityCheckResult == "MODEL_PARTSKU_MATCH" } };
        } else {
            return { type: "InvalidPart", info: {} };
        }
    }
}

const partsAPIURL = (modelNumber, query) => {
    return `http://www.partselect.com/Models/${modelNumber}/Parts/?SearchTerm=${query}`;
}

const getParts = async (modelNumber, query = "") => {
    const autocomplete = await getAutoComplete(modelNumber, 5);
    if (autocomplete.num_matches != 1) {
        return { type: "PotentialMatches", info: { matches: autocomplete.matches } };
    } else {
        console.log(modelNumber);
        console.log(query);

        const response = await fetch(partsAPIURL(modelNumber, query));
        const body = await response.text();
        const $ = cheerio.load(body);

        const parts = [];
        $('div.mega-m__part').each((i, elm) => {
            const part = {}

            part.name = $('a.mega-m__part__name', elm).text();

            const partNumQuery = $('div > span.bold', elm);
            part.partselect_num = partNumQuery.first()[0].nextSibling.data.trim();
            part.manufacturer_num = partNumQuery.last()[0].nextSibling.data.trim();
            part.desc = $('div.mb-1', elm).first()[0].nextSibling.data.trim();

            const price_elem = $('div.mega-m__part__price', elm);
            const currency_elem = $('span.price__currency', price_elem);
            part.price = { currency: currency_elem.first().text(), amount: currency_elem.first()[0].nextSibling.data.trim() };

            console.log(part.price);

            part.availability = $('div.mega-m__part__avlbl span', elm).text();

            parts.push(part);
        })

        console.log(parts);

        return { type: "PartsList", info: parts };
    }
}

const getRepairHelpData = async () => {
    const partselectURL = "https://www.partselect.com";
    const repairResponse = await fetch(partselectURL + "/Repair/");
    const repairBody = await repairResponse.text();
    const $ = cheerio.load(repairBody);

    const productsList = {};
    const productsListElement = $('div.products-list');
    $('span', productsListElement).each((i, elm) => {
        productsList[elm.children[0].data] = { link: partselectURL + elm.parent.attribs.href };
    });

    let product = "";
    for (product of Object.keys(productsList)) {
        const productURL = productsList[product].link;
        const productResponse = await fetch(productURL);
        const productBody = await productResponse.text();
        const $ = cheerio.load(productBody);

        const problemsList = [];
        const problemsListElement = $('div.symptom-list');
        $('h3', problemsListElement).each(async (i, elm) => {
            const problemName = elm.children[0].data;

            const problemURL = partselectURL + elm.parent.parent.attribs.href;
            const problemResponse = await fetch(problemURL);
            const problemBody = await problemResponse.text();
            const $ = cheerio.load(problemBody);

            const potentialCauses = []
            const causeListElement = $('div.symptom-list');
            $('h2', causeListElement).each((i, elm2) => {
                const cause = { name: elm2.children[0].data };
                cause.description = $('div.col-lg-6', elm2.next.next).first().text();

                potentialCauses.push(cause);
            });

            problemsList.push({ name: problemName, potential_causes: potentialCauses });
        });

        productsList[product].problems = problemsList;
    }

    return productsList;
}

const getModelNumberInfo = async () => {
    const partSelectURL = "https://www.partselect.com";
    const modelNumberResponse = await fetch(partSelectURL + "/Find-Your-Model-Number/");
    const modelNumberBody = await modelNumberResponse.text();
    const $ = cheerio.load(modelNumberBody);

    const productsList = {};
    $('a.justify-content-end.mb-3').each((i, elm) => {
        const name = $('span', elm).text();
        productsList[name] = { link: partSelectURL + elm.attribs.href };
    })

    for (let product of Object.keys(productsList)) {
        const locationResponse = await fetch(productsList[product].link);
        const locationBody = await locationResponse.text();
        const $ = cheerio.load(locationBody);

        const potentialLocations = [];
        const listElement = $('ul.mnl-tool__side-menu__list');
        $('li', listElement).each((i, elm) => {
            potentialLocations.push(elm.children[0].data);
        });

        productsList[product].locations = potentialLocations
    }

    return productsList;
}

export {
    getInfo,
    getPartCompatibility,
    getParts,
    getRepairHelpData,
    getModelNumberInfo
};