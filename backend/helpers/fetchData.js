const { default: axios } = require("axios")

// Function to fetch keywords data from portal
async function fetchData(keyword, isCompareRequired, fromDate, toDate) {
    global.nullBidsKeys = []
    console.log("Working on Fetching Bids of Keyword : ", keyword);
    var from_endtDate
    var to_endDate
    // Get current date in YYYY-MM-DD format
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const formattedToday = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    // Get a date 1 year from today but 1 day before in YYYY-MM-DD format
    const nextYear = new Date(today);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    nextYear.setDate(nextYear.getDate() - 1);
    const formattedNextYear = `${nextYear.getFullYear()}-${(nextYear.getMonth() + 1).toString().padStart(2, '0')}-${nextYear.getDate().toString().padStart(2, '0')}`;
    if (isCompareRequired) {
        from_endtDate = formattedToday
        to_endDate = formattedNextYear
    }
    else {
        from_endtDate = fromDate.toString()
        to_endDate = toDate.toString()
    }
    try {
        const token = "26422804ab4cd5cb321d9ffcd5ac770a";
        const headers = {
            accept: "application/json, text/javascript, */*; q=0.01",
            "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "sec-ch-ua":
                '"Chromium";v="112", "Google Chrome";v="112", "Not:A-Brand";v="99"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Linux"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest",
            cookie:
                "csrf_gem_cookie=" +
                token +
                "; ci_session=07cea528d9cccf7f87eef6e91393e99b90073779; GEMDCPROD=NODE3; TS01b34dec=015c77a21c9f4e49ae0ef0be6ef5bfcea21a21b45e722e1ca9e00c4dbfb388f9cbe2b7942ecbe5dcf471df7f9c22c7e51763bf3ff324ccfde63f0f8b07030351c6d18e945c8fbaf8c17c518d78a81d5d0655a5ec9a; _ga=GA1.3.1268017623.1681712229; _gid=GA1.3.600264479.1681712229; TS0106b57a=015c77a21ca9606b0a5f428c6defb2f871819ebd16b8c6a0bf5015ebbc2e1e9e36df23b8009e3fecc39af4a2d80db02fa5c2305923cf0371cb87c87641068e5bdc677fff5f",
            Referer: "https://bidplus.gem.gov.in/all-bids",
            "Referrer-Policy": "strict-origin-when-cross-origin",
        };
        const resultsPerPage = 10;
        const hig_value = ""
        const bid_type = "all"
        const bid_status_type = "ongoing_bids"
        const serach_text = "fullText"
        const sorting = "Bid-End-Date-Oldest"
        const csrf_token = "%7D&csrf_bd_gem_nk=" + token;
        // console.log("from Date : ", from_endtDate, "\nto End Date : ", to_endDate)
        const param = { searchBid: keyword, searchType: serach_text }
        const filter = {
            bidStatusType: bid_status_type,
            byType: bid_type,
            highBidValue: hig_value,
            byEndDate: { from: from_endtDate, to: to_endDate },
            sort: sorting,
        }
        const encoded_payload = encodeURIComponent(JSON.stringify(filter)) + csrf_token
        const encoded_param = encodeURIComponent(JSON.stringify(param))
        const new_encoded_payload = "payload=%7B%22param%22%3A" + encoded_param + "%2C%22filter%22%3A" + encoded_payload
        const rows = [];
        const numFound = await axios({
            method: "post",
            url: "https://bidplus.gem.gov.in/all-bids-data",
            headers,
            data: new_encoded_payload,
        })
            .then((resp) => resp.data.response.response.numFound)
            .catch((err) => {
                global.nullBidsKeys.push(keyword);
                throw new Error(`Error fetching bids of keyword : ${keyword}`);
            });
        const numPages = Math.ceil(numFound / resultsPerPage);
        console.log("Toatal Bids pages : ", numPages)
        for (let i = 1; i <= numPages; i++) {
            const newEncodedPayload = i === 1 ? new_encoded_payload : `payload=%7B%22page%22%3A${i}%2C%22param%22%3A` + encoded_param + "%2C%22filter%22%3A" + encoded_payload;
            const resp = await axios({
                method: "post",
                url: "https://bidplus.gem.gov.in/all-bids-data",
                headers,
                data: newEncodedPayload,
            }).catch((err) => {
                global.nullBidsKeys.push(keyword);
                throw new Error(`Error fetching bids of keyword : ${keyword}`);
            });
            // console.log("D:", resp.data.response.response.docs);
            rows.push(...resp.data.response.response.docs);
        }
        return rows;
    } catch (error) {
        console.log(error.message);
        return [];
    }
}

module.exports = fetchData;

