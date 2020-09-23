function getBaseURL() {
    const protocol = window.location.protocol;
    const host = window.location.hostname;
    const port = window.location.port;

    return `${protocol}//${host}:${port}/dsuWizard`;
}

