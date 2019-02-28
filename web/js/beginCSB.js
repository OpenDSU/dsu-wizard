function beginCSB() {
    const baseURL = getBaseURL();
    const req = new XMLHttpRequest();

    const url = `${baseURL}/beginCSB`;

    console.log('mama are mere ', url);

    req.open("POST", url, true);
    req.onload = function (oEvent) {
        const content = document.getElementsByClassName('content')[0];

        const response = document.createElement('div');

        response.innerHTML = `
        <p> Keep this transaction it for subsequent requests: ${req.response} </p>
        `;

        content.appendChild(response);
    };

    req.send();
}