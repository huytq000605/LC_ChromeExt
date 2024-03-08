importScripts("jszip.min.js");

console.log("background");

const acceptedExtensions = new Set([
    ".apng",
    ".avif",
    ".gif",
    ".jpg",
    ".jpeg",
    ".jfif",
    ".pjpeg",
    ".pjp",
    ".png",
]);
const fileLinkRegex =
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;

const eventHandler = async function (message, sender, sendResponse) {
    if (message.actionType !== "genQuestion") {
      return
    }
    question = message.question
    // console.log(sender.tab ?
    //             "from a content script:" + sender.tab.url :
    //             "from the extension");
    matches = [...question.content.matchAll(fileLinkRegex)];
    matches.filter((match) => {
        return acceptedExtensions.has(match[0].split(".").slice(-1));
    });
    let imgs = await Promise.all(
        matches.map((match, idx) => {
            let ext = match[0].split(".").slice(-1);
            let fileName = `image${idx}.${ext}`;
            let filePath = `./assets/${fileName}`;
						// TODO: Not mutate
            question.content = question.content.replace(match[0], filePath);
            const promise = fetch(match[0]).then((resp) => resp.blob()).then((blob) => Promise.resolve({fileName, blob}))
            return promise
        })
    );

    let questionMD = `# ${question["id"]}. ${question["title"]}<br> ${
        question["difficulty"]
    }

${question["content"]}

<details>
<summary> Related Topics </summary>
${question["topics"].join("\n")}
</details>


<details>
<summary> Hints </summary>
${question["hints"].join("\n")}
</details>`;

		console.log(imgs)

    let zip = new JSZip();
    let zipFileName = `${question.title}.zip`;
    zip.folder(zipFileName).file("question.md", questionMD);
		imgs.forEach(({fileName, blob}) => {
			zip.folder(zipFileName).folder("assets").file(fileName, blob)
		})
    let zipBase64 = await zip.generateAsync({ type: "base64" });

    sendResponse({ fileName: zipFileName, zipBase64: zipBase64 });
};

chrome.runtime.onMessage.addListener((question, sender, sendResponse) => {
	// listener must return true to let sender knows that we will send response asynchronously
	// listener cannot return a Promise
	eventHandler(question, sender, sendResponse)

	return true
});
