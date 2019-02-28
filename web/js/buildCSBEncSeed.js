
function buildCSBEncSeed() {
    const baseURL = getBaseURL();
    const req = new XMLHttpRequest();
    const transactionId = document.getElementById('transactionId').value;
    const url = `${baseURL}/buildCSB/${transactionId}`;
    const remoteEndpoint = document.getElementById('remoteEndpoint');


    const publicKey = document.getElementById('publicKey');

    const body = JSON.stringify({
        remoteEndpoint,
        publicKey
    });



    req.open("POST", url, true);

    req.onload = function (oEvent) {
        const content = document.getElementsByClassName('content')[0];

        const response = document.createElement('div');

        response.style.maxWidth = '20%';

        response.innerHTML = req.response;

        content.appendChild(response);
    };

    req.send(body);
}

