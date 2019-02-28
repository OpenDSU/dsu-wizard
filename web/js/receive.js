// require('../../../../builds/devel/pskruntime');
// require('../../../../builds/devel/consoleTools');
// require('../../../../builds/devel/webshims');
// require('../../../../builds/devel/httpinteract');
// require('../../../../builds/devel/pskclient');

// const crypto = require('pskcrypto');
// const interact = require('interact');

function receive() {

    const interact = pskclientRequire("interact");
    interact.enableRemoteInteractions();

    $$.remote['localhost'].on('notifier', 'init', (err, res)=>{
        if (err) {
            throw err;
        }

        const content = document.getElementsByClassName('content')[0];

        const response = document.createElement('div');

        response.style.maxWidth = '20%';

        response.innerHTML = res;

        content.appendChild(response);
    })
}