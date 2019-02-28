function addBackup() {
    const baseURL = getBaseURL();
    const req = new XMLHttpRequest();
    const transactionId = document.getElementById('transactionId').value;
    const url = `${baseURL}/addBackup/${transactionId}`;
    const backup = document.getElementById('backup').value;

    req.open("POST", url, true);
    req.onload = function (oEvent) {
        const content = document.getElementsByClassName('content')[0];

        const response = document.createElement('div');

        response.innerHTML = `
        <p> The url was ${backup} successfully added </p>
        `;

        content.appendChild(response);
    };

    req.send(backup);
}