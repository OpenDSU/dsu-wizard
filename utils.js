function bodyParser(req, callback) {
	let bodyContent = '';

	req.on('data', function (dataChunk) {
		bodyContent += dataChunk;
	});

	req.on('end', function () {
		req.body = bodyContent;
		callback(undefined, req.body);
	});

	req.on('error', function (err) {
		callback(err);
	});
}

function formDataParser(req, callback) {
	let formData = [];
	let currentFormItem;
	let currentBoundary;
	let dataBuf = Buffer.alloc(0);
	req.on('data', function (dataChunk){
		dataBuf = Buffer.concat([dataBuf, dataChunk]);
	});

	req.on('end', function () {
		formParser(dataBuf);
		req.formData = formData;
		callback(undefined, req.formData);
	});

	req.on('error', function (err) {
		callback(err);
	});

	function formParser(data) {
		data = data.toString();
		let dataArray = data.split(/[\r\n]+/);
		let removeOneLine = false;
		dataArray.forEach((dataLine)=>{
			let lineHandled = false;
			if(dataLine.indexOf('------') === 0){
				if(typeof currentBoundary === "undefined"){
					//we got a new boundary
					currentBoundary = dataLine;
					lineHandled = true;
				}else{
					if(dataLine.indexOf(currentBoundary)+'--' !== -1){
						//we found a boundary end
						currentBoundary = undefined;
						//we add the formItem to formData and consider that is done
						formData.push(currentFormItem);
						currentFormItem = undefined;
						lineHandled = true;
						removeOneLine = true;
					}else{
						//it's just content... we do nothing at this point
					}
				}
			}
			if(dataLine.indexOf('Content-Disposition:') !== -1){
				const formItemMeta = dataLine.split("; ");
				formItemMeta.forEach(meta=>{
					if(meta.indexOf("name=") !== -1){
						const itemType = meta.replace("name=", "");
						currentFormItem = {
							type: itemType,
							content: "",
							ingestContent: function(data){
								currentFormItem.content += data+'\r\n';
							}
						}
					}
				});
				lineHandled = true;
				removeOneLine = true;
			}
			if(dataLine.indexOf('Content-Type:') !== -1){
				const contentType = dataLine.replace('Content-Type: ', "");
				switch(currentFormItem.type){
					case "file":
						if(contentType.indexOf("text/") !== -1){
							currentFormItem.content = "";
							currentFormItem.ingestContent = function(data){
								currentFormItem.content += data+'\r\n';
							}
						}else{
							currentFormItem.content = [];
						}
						break;
					default:
						currentFormItem.content = "";
				}
				lineHandled = true;
				removeOneLine = true;
			}
			if(!lineHandled){
				//it's pure content
				if(!removeOneLine){
					currentFormItem.ingestContent(dataLine);
				}else{
					removeOneLine = false;
				}
			}
		});
	}
}

function redirect(req, res) {
	const URL_PREFIX = require("./constants").URL_PREFIX;
	res.statusCode = 303;
	let redirectLocation = 'index.html';

	if (!req.url.endsWith('/')) {
		redirectLocation = `${URL_PREFIX}/` + redirectLocation;
	}

	res.setHeader("Location", redirectLocation);
	res.end();
}

module.exports = {
	bodyParser,
	formDataParser,
	redirect
}