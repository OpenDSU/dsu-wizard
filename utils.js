function bodyParser(req, callback) {
    let bodyContent = '';

    req.on('data', function (dataChunk) {
        bodyContent += dataChunk;
    });

    req.on('end', function () {
        req.body = bodyContent;
        callback(undefined, req.body);
    });

    req.on('error', function (err) {
        callback(err);
    });
}

function formDataParser(req, callback) {
    let formData = [];
    let currentFormItem;
    let currentBoundary;
    let dataBuf = Buffer.alloc(0);
    let defaultItem = {
        bufferStartIndex: 0,
        bufferEndIndex: 0,
        increaseBothBuffers: (size) => {
            currentFormItem.bufferStartIndex += size;
            currentFormItem.bufferEndIndex += size;
        },
        increaseEndBuffer: (size) => {
            currentFormItem.bufferEndIndex += size;
        }
    }

    req.on('data', function (dataChunk) {
        dataBuf = Buffer.concat([dataBuf, dataChunk]);
    });

    req.on('end', function () {
        formParser(dataBuf);
        req.formData = formData;
        callback(undefined, req.formData);
    });

    req.on('error', function (err) {
        callback(err);
    });

    function formParser(data) {
        let dataAsString = data.toString();
        let dataArray = dataAsString.split(/[\r\n]+/g);

        currentFormItem = defaultItem;
        for (let dataLine of dataArray) {
            let lineHandled = false;
            if (dataLine.indexOf('------') === 0) {
                if (typeof currentBoundary === "undefined") {
                    //we got a new boundary
                    currentBoundary = dataLine;

                    currentFormItem.increaseBothBuffers(dataLine.length + 2)

                    lineHandled = true;
                } else if (dataLine.indexOf(currentBoundary) + '--' !== -1) {
                    //we found a boundary end
                    currentBoundary = undefined;

                    //Due to encoding method of the characters, in some scenarios we will need to prevent the lose of bytes
                    //That's why in the final boundary we add them back
                    currentFormItem.increaseEndBuffer(data.byteLength - dataAsString.length);
                    currentFormItem = {
                        type: currentFormItem.type,
                        content: data.slice(currentFormItem.bufferStartIndex + 2, currentFormItem.bufferEndIndex + 2)
                    }
                    //we add the formItem to formData and consider that is done
                    formData.push(currentFormItem);

                    currentFormItem = defaultItem;
                    lineHandled = true;
                }
            }
            if (dataLine.indexOf('Content-Disposition:') !== -1) {
                const formItemMeta = dataLine.split("; ");
                for (let meta of formItemMeta) {
                    if (meta.indexOf("name=") === 0) {
                        currentFormItem.type = meta.replace("name=", "").replace(/\"|'/g, "");
                        break;
                    }
                }

                currentFormItem.increaseBothBuffers(dataLine.length + 2)
                lineHandled = true;
            }
            if (dataLine.indexOf('Content-Type:') !== -1) {
                currentFormItem.increaseBothBuffers(dataLine.length + 2)
                lineHandled = true;
            }
            if (!lineHandled) {
                currentFormItem.increaseEndBuffer(dataLine.length + 1)
            }
        }
    }
}

function redirect(req, res) {
    const URL_PREFIX = require("./constants").URL_PREFIX;
    res.statusCode = 303;
    let redirectLocation = 'index.html';

    if (!req.url.endsWith('/')) {
        redirectLocation = `${URL_PREFIX}/` + redirectLocation;
    }

    res.setHeader("Location", redirectLocation);
    res.end();
}

module.exports = {
    bodyParser,
    formDataParser,
    redirect
}