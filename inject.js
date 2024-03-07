const expectedQueries = [
    "query questionTitle",
    "query questionContent",
    "query singleQuestionTopicTags",
    "query questionHints"
];

(function () {
    let xhrPrototype = XMLHttpRequest.prototype;
    let open = xhrPrototype.open;
    let send = xhrPrototype.send;
    let docURL = "";

    xhrPrototype.open = function (method, url) {
        docURL = url;
        return open.apply(this, arguments);
    };
    // XHR.setRequestHeader = function (header, value) {
    //     this._requestHeaders[header] = value;
    //     return setRequestHeader.apply(this, arguments);
    // };
    xhrPrototype.send = function (body) {
        let queryType = null
        if (
            expectedQueries.some((query) => {
                if (body.includes(query)) {
                    queryType = query
                    return true
                }

                return false
            })
        ) {
            this.addEventListener("load", function () {
                let resp = this.response;
                switch (true) {
                    case resp instanceof Blob:
                        resp.text().then((responseData) => {
                            document.dispatchEvent(
                                new CustomEvent("leetcode", {
                                    detail: {
                                        resp: responseData,
                                        queryType: queryType
                                    }
                                })
                            );
                        });
                        break;
                    case resp instanceof ArrayBuffer:
                    case resp instanceof Object:
                    case resp instanceof Document:
                    default:
                        document.dispatchEvent(
                            new CustomEvent("leetcode", {
                                detail: {
                                    queryType: queryType,
                                    resp: resp
                                }
                            })
                        );
                }
            });
        }
        return send.apply(this, arguments);
    };
})();
