function addEndpoint() {
    const baseURL = getBaseURL();
    const req = new XMLHttpRequest();
    const transactionId = document.getElementById('transactionId').value;
    const url = `${baseURL}/addEndpoint/${transactionId}`;
    const endpoint = document.getElementById('endpoint').value;

    req.open("POST", url, true);
    req.onload = function (oEvent) {
        const content = document.getElementsByClassName('content')[0];

        const response = document.createElement('div');

        response.innerHTML = `
        <p> The url was ${endpoint} successfully added </p>
        `;

        content.appendChild(response);
    };

    req.send(endpoint);
}