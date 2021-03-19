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
    const buffers = [];
    let formData = [];

    req.on('data', function (dataChunk) {
        buffers.push(dataChunk);
    });

    req.on('end', function () {
        const dataBuf = $$.Buffer.concat(buffers);
        newFormParser(dataBuf, retrieveBoundaryIdentifier(req));
        req.formData = formData;
        callback(undefined, req.formData);
    });

    req.on('error', function (err) {
        callback(err);
    });

    function retrieveBoundaryIdentifier(req){
        let contentType = req.headers["content-type"];
        if(!contentType){
            return;
        }
        const identifier = "boundary=";
        let boundaryIndex = contentType.indexOf(identifier);

        if(boundaryIndex !== -1){
            return contentType.slice(boundaryIndex+identifier.length);
        }
    }

    function newFormParser(data, boundary) {
        //console.log("Read boundary", boundary);
        let boundaryIndexes = [];
        let offset = 0;
        let indexCorrection = 0;

        while(true){
            let index = data.indexOf(boundary, offset);
            if(offset===0 && index > 0){
                //this mechanism is trying to solve the issue when into the header the boundary starts with "----" and
                // into the body starts with "------"
                indexCorrection = index;
            }
            if(index !== -1){
                boundaryIndexes.push(index-indexCorrection);
                offset = index + boundary.length + indexCorrection;
            }else{
                //we need to escape this index discovery loop because we can't find any other boundary so we are done
                break;
            }
        }

        let formItems = [];
        for(let i=0; i<boundaryIndexes.length; i++){
            if(i+1 >= boundaryIndexes.length){
                break;
            }
            let f = data.slice(boundaryIndexes[i]+indexCorrection+boundary.length+"\r\n".length, boundaryIndexes[i+1]);

            //console.log("item", f.toString());
            formItems.push(f);
        }

        for(let i=0; i<formItems.length; i++){
            let parsedItem = {};
            let formItem = formItems[i];

            let testContentDisposition = formItem.indexOf("Content-Disposition:") === 0;

            if(testContentDisposition){
                //we extract the content disposition until the first appearance of the group "\r\n"
                let contentDisposition = formItem.slice(0, formItem.indexOf("\r\n"));
                formItem = formItem.slice(contentDisposition.length+"\r\n".length);

                let metas = contentDisposition.toString().split("; ");
                metas.forEach(meta=>{
                    if(meta.indexOf("name=") === 0){
                        parsedItem.type = meta.replace("name=", "").replace(/\"|'/g, "");
                    }
                    if(meta.indexOf("filename=") === 0){
                        parsedItem.fileName = meta.replace("filename=", "").replace(/\"|'/g, "");
                    }
                })
            }

            let testContentType = formItem.indexOf("Content-Type:") === 0;

            if(testContentType){
                let contentType = formItem.slice(0, formItem.indexOf("\r\n"));
                formItem = formItem.slice(contentType.length+"\r\n".length);

                parsedItem.contentType = contentType.toString().replace("Content-Type: ", "").replace(/\r\n/g, "");
            }

            //no matter if content type line exists or not there is a \r\n before the content
            formItem = formItem.slice("\r\n".length);

            parsedItem.content = formItem.slice(0, formItem.byteLength-"\r\n".length);
            //console.log("ParsedItem", parsedItem);

            formData.push(parsedItem);
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
