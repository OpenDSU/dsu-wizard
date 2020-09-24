function setTemplateSSI() {
    const baseURL = getBaseURL();
    const req = new XMLHttpRequest();
    const transactionId = document.getElementById('transactionId').value;
    const url = `${baseURL}/setTemplateSSI/${transactionId}`;
    const templateSSI = document.getElementById('templateSSI').value;

    req.open("POST", url, true);
    req.onload = function (oEvent) {
        const content = document.getElementsByClassName('content')[0];

        const response = document.createElement('div');

        response.innerHTML = `
        <p> The SSI ${templateSSI} was successfully added </p>
        `;

        content.appendChild(response);
    };

    req.send(templateSSI);
}