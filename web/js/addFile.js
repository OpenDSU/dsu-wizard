function uploadFile(file, transactionId, dossierPath) {
    const reader  = new FileReader();

    reader.addEventListener("load", function () {
        sendBlobToUrl(`${getBaseURL()}/addFile/${transactionId}`, reader.result, dossierPath);
    }, false);

    if (file) {
        reader.readAsArrayBuffer(file);
    }
}

function sendBlobToUrl(url, blob, dossierPath) {

    const req = new XMLHttpRequest();
    req.open("POST", url, true);
    req.setRequestHeader("x-dossier-path", dossierPath);
    req.onload = function (oEvent) {
        const response = document.createElement('div');

        response.innerHTML = `
        <p> Successfully uploaded file </p>
        `;

        document.getElementsByClassName('content')[0].appendChild(response);
    };

    req.send(blob);
}

function readFile() {
    const file    = document.getElementById('fileToUpload').files[0];
    const transactionId = document.getElementById('transactionId').value;
    const dossierPath = document.getElementById('dossierPath').value;

    uploadFile(file, transactionId, dossierPath + '/' + file.name);
}
