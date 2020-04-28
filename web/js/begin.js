function begin() {
    const baseURL = getBaseURL();
    const req = new XMLHttpRequest();

    const url = `${baseURL}/begin`;
    
    req.open("POST", url, true);
    req.onload = function (oEvent) {
        const content = document.getElementsByClassName('content')[0];

        const response = document.createElement('div');

        response.innerHTML = `
        <p> Keep this transaction id for subsequent requests: ${req.response} </p>
        `;

        content.appendChild(response);
    };

    req.send();
}