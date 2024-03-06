(function () {
    let xhrPrototype = XMLHttpRequest.prototype;
    let open = xhrPrototype.open;
    let send = xhrPrototype.send;
    let docURL = "";
    // var setRequestHeader = XHR.setRequestHeader;

    xhrPrototype.open = function (method, url) {
        docURL = url;
        return open.apply(this, arguments);
    };
    // XHR.setRequestHeader = function (header, value) {
    //     this._requestHeaders[header] = value;
    //     return setRequestHeader.apply(this, arguments);
    // };
    xhrPrototype.send = function (postData) {
        this.addEventListener("load", function () {
            // console.log(docURL);
            // console.log(postData);
            let resp = this.response;
            switch (true) {
                case resp instanceof Blob:
                    resp.text().then((responseData) => {
                        // console.log("DISPATCHED EVENT", responseData);
                        document.dispatchEvent(
                            new CustomEvent("leetcode", {
                                detail: responseData,
                            })
                        );
                    });
                    break;
                case resp instanceof ArrayBuffer:
                case resp instanceof Object:
                case resp instanceof Document:
                default:
                    console.log("Different", resp)
                    document.dispatchEvent(
                        new CustomEvent("leetcode", {
                            detail: resp,
                        })
                    );
            }
        });
        return send.apply(this, arguments);
    };
})();
