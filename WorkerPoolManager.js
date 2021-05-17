const workers = {};
const busyWorkers = {};
const retryIntervalTimeout = 1000;

function WorkerPoolManager(script, workerLimit = 5){

	 function getWorker(callback){
		const { Worker } = require('worker_threads');

		function createNewWorker(cb){
			let numberOfWorkers = Object.keys(workers).length;
			if(numberOfWorkers === workerLimit){
				setTimeout(()=>{
					this.getWorker(callback);
				}, retryIntervalTimeout);
			}
			//console.log("Creating a worker for script", script);
			const worker = new Worker(script, { eval: true });
			workers[worker.threadId] = worker;
			return cb(undefined, worker);
		}

		function reserveWorker(){
			const ws = Object.keys(workers);
			const numberOfWorkers = ws.length;
			const busy = Object.keys(busyWorkers);
			const numberOfBusyWorkers = busy.length;

			if((numberOfWorkers === 0 || numberOfWorkers === numberOfBusyWorkers) && numberOfWorkers < workerLimit){
				// no worker available and the workerLimit not reached
				return createNewWorker((err, worker)=>{
					return callback(undefined, worker);
				});
			}

			//searching for a free worker
			for(let i=0; i<numberOfWorkers; i++){
				const workerId = ws[i];
				if(typeof busyWorkers[workerId] === "undefined"){
					const worker = workers[workerId];
					busyWorkers[workerId] = worker;
					return callback(undefined, worker);
				}
			}

			//no free worker available... retrying later
			setTimeout(()=>{
				reserveWorker();
			}, retryIntervalTimeout);
		}

		reserveWorker();
	}

	function releaseWorker(worker){
		busyWorkers[worker.threadId] = undefined;
		delete busyWorkers[worker.threadId];
	}

	this.runTask = function(task, callback){
		getWorker((err, worker) => {
			if(err){
				return callback(err);
			}

			let delivered = false;
			function deliverMessage(err, result){
				if(!delivered){
					delivered = true;
					releaseWorker(worker);
					callback(err, result);
				}else{
					console.log("Something wrong happened during task execution.");
				}
			}

			function messageHandler(message){
				worker.off("message", messageHandler);
				deliverMessage(undefined, message);
			}

			function errorHandler(err){
				//console.log("Caught error", err);
				worker.off("error", errorHandler);
				//if the worker is in unstable state is better to remove it from the workers list
				workers[worker.threadId] = undefined;
				delete workers[worker.threadId];

				deliverMessage(err);
			}

			worker.on("message", messageHandler);
			worker.on("error", errorHandler);

			worker.postMessage(task);

		});
	}
}

module.exports = WorkerPoolManager;