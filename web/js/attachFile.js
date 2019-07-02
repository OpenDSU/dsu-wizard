function uploadFile(file, transactionId, fileName) {
    const reader  = new FileReader();

    reader.addEventListener("load", function () {
        sendBlobToUrl(`${getBaseURL()}/attachFile/${transactionId}/${fileName}`, reader.result);
    }, false);

    if (file) {
        reader.readAsArrayBuffer(file);
    }
}

function sendBlobToUrl(url, blob) {

    const req = new XMLHttpRequest();
    req.open("POST", url, true);
    req.onload = function (oEvent) {
        const response = document.createElement('div');

        response.innerHTML = `
        <p> Successfully uploaded file </p>
        `;

        document.getElementsByClassName('content')[0].appendChild(response);
    };

    req.send(blob);
}

function readFile() { //TODO: Unused function
    const file    = document.getElementById('fileToUpload').files[0];
    const transactionId = document.getElementById('transactionId').value;

    uploadFile(file, transactionId, file.name);
}
