module.exports = function(RED) {
    const { Kafka } = require('kafkajs'); 
    const { v4: uuidv4 } = require('uuid');

    function KafkajsConsumerNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
            
        let client = RED.nodes.getNode(config.client);    
        
        if(!client){
            return;
        }

        const kafka = new Kafka(client.options)
        
        let consumerOptions = new Object();
        consumerOptions.groupId = config.groupid ? config.groupid : "kafka_js_" + uuidv4();

        let subscribeOptions = new Object();
        subscribeOptions.topic = config.topic;

        let runOptions = new Object();

        if(config.advancedoptions){
            consumerOptions.sessionTimeout =  config.sessiontimeout;
            consumerOptions.rebalanceTimeout =  config.rebalancetimeout;
            consumerOptions.heartbeatInterval =  config.heartbeatinterval;
            consumerOptions.metadataMaxAge =  config.metadatamaxage;
            consumerOptions.allowAutoTopicCreation = config.allowautotopiccreation;
            consumerOptions.maxBytesPerPartition =  config.maxbytesperpartition;
            consumerOptions.minBytes =  config.minbytes;
            consumerOptions.maxBytes =  config.maxbytes;
            consumerOptions.maxWaitTimeInMs =  config.maxwaittimeinms;

            subscribeOptions.fromBeginning = config.frombeginning;

            runOptions.autoCommitInterval =  config.autocommitinterval;
            runOptions.autoCommitThreshold =  config.autocommitthreshold; 
        }



        node.init = async function init(){
            if(config.advancedoptions && config.clearoffsets){
                node.status({fill:"yellow",shape:"ring",text:"Clearing Offset"});
                var admin = kafka.admin();
                await admin.connect();
                await admin.resetOffsets({groupId:config.groupid, topic:config.topic});
                await admin.disconnect()
            }

            node.consumer = kafka.consumer(consumerOptions);
            node.status({fill:"yellow",shape:"ring",text:"Initializing"});

            node.onConnect = function (){
                node.lastMessageTime = new Date().getTime();
                node.status({fill:"green",shape:"ring",text:"Ready"});
            }
    
            node.onDisconnect = function (){
                node.status({fill:"red",shape:"ring",text:"Offline"});
            }
    
            node.onRequestTimeout = function (){
                node.status({fill:"red",shape:"ring",text:"Timeout"});
            }

            node.onError = function (e){
                node.error("Kafka Consumer Error", e.message);
                node.status({fill:"red",shape:"ring",text:"Error"});
            }
    
            node.onMessage = function(topic, partition, message){
                node.lastMessageTime = new Date().getTime();
                var payload = new Object();
                payload.topic = topic;
                payload.partition = partition;
                
                payload.payload = new Object();
                payload.payload = message;
                
                payload.payload.key= message.key ? message.key.toString() : null;
                if (message.value instanceof Buffer && config.advancedoptions && config.allowbinaryvaluepayload) {
                    payload.payload.value = message.value;
                } else {
                    payload.payload.value = message.value.toString();
                }

                for(const [key, value] of Object.entries(payload.payload.headers)){
                    payload.payload.headers[key] = value.toString();
                }
                
                node.send(payload);	
                node.status({fill:"blue",shape:"ring",text:"Reading"});
            }
    
            function checkLastMessageTime() {
                if(node.lastMessageTime != null){
                    timeDiff = new Date().getTime() - node.lastMessageTime;
                    if(timeDiff > 5000){
                        node.status({fill:"yellow",shape:"ring",text:"Idle"});
                    }
                }   
            }
              
            node.interval = setInterval(checkLastMessageTime, 1000);
    
            node.consumer.on(node.consumer.events.CONNECT, node.onConnect);
            node.consumer.on(node.consumer.events.DISCONNECT, node.onDisconnect);
            node.consumer.on(node.consumer.events.REQUEST_TIMEOUT, node.onRequestTimeout);

            await node.consumer.connect();
            await node.consumer.subscribe(subscribeOptions);

            runOptions.eachMessage = async ({ topic, partition, message }) => {
                node.onMessage(topic, partition, message);
            }

            await node.consumer.run(runOptions);
        }

        node.init().catch( e => {
            node.onError(e);
        });

        node.on('close', function(done){
            node.consumer.disconnect().then(() => {
                node.status({});
                clearInterval(node.interval);
                done();
            }).catch(e => {
                node.onError(e);
            });
		});
    }
    RED.nodes.registerType("kafkajs-consumer",KafkajsConsumerNode);
}
