function setDLDomain() {
    const baseURL = getBaseURL();
    const req = new XMLHttpRequest();
    const transactionId = document.getElementById('transactionId').value;
    const url = `${baseURL}/setEndpoint/${transactionId}`;
    const dlDomain = document.getElementById('dlDomain').value;

    req.open("POST", url, true);
    req.onload = function (oEvent) {
        const content = document.getElementsByClassName('content')[0];

        const response = document.createElement('div');

        response.innerHTML = `
        <p> The domain ${dlDomain} was successfully added </p>
        `;

        content.appendChild(response);
    };

    req.send(dlDomain);
}