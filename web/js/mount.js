function mount() {
    const baseURL = getBaseURL();
    const req = new XMLHttpRequest();
    const transactionId = document.getElementById('transactionId').value;
    const mountPath = document.getElementById('mountPath').value;
    const seed = document.getElementById('mountedDossierSeed').value;
    const url = `${baseURL}/mount/${transactionId}`;

    req.open("POST", url, true);
    req.setRequestHeader('x-mount-path', mountPath);
    req.setRequestHeader('x-mounted-dossier-seed', seed);
    req.onload = function (oEvent) {
        const content = document.getElementsByClassName('content')[0];

        const response = document.createElement('div');

        response.innerHTML = `
        <p> The rawDossier having the SEED ${seed} successfully added at path ${mountPath}</p>
        `;

        content.appendChild(response);
    };

    req.send();
}