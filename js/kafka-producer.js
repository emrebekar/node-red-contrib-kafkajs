module.exports = function(RED) {
    const { Kafka } = require('kafkajs');

    const acksDict = {
        "all" : -1,
        "none" : 0,
        "leader": 1
    }

    function KafkajsProducerNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node.ready = false;

        let client = RED.nodes.getNode(config.client)
        let kafka = new Kafka(client.options)

        var producerOptions = new Object();

        var sendOptions = new Object();
        sendOptions.topic = config.topic;

        if(config.advancedoptions){
            producerOptions.metadataMaxAge = config.metadatamaxage;
            producerOptions.allowAutoTopicCreation = config.allowautotopiccreation;
            producerOptions.transactionTimeout = config.transactiontimeout;

            if(config.partition){
                sendOptions.partition = config.partition;
            }

            sendOptions.acks = acksDict[config.acknowledge];
            sendOptions.timeout = config.responsetimeout;
        }

        node.sendOptions = sendOptions;
        
        node.init = async function init(){
            const producer = kafka.producer()
            node.producer = producer;

            node.status({fill:"yellow",shape:"ring",text:"Initializing"});
            
            node.onConnect = function (){
                node.ready = true;
                node.lastMessageTime = new Date().getTime();
                node.status({fill:"green",shape:"ring",text:"Ready"});
            }
    
            node.onDisconnect = function (){
                node.ready = false;
                node.status({fill:"red",shape:"ring",text:"Offline"});
            }
    
            node.onRequestTimeout = function (){
                node.status({fill:"red",shape:"ring",text:"Timeout"});
            }
            
            producer.on(producer.events.CONNECT, node.onConnect);
            producer.on(producer.events.DISCONNECT, node.onDisconnect);
            producer.on(producer.events.REQUEST_TIMEOUT, node.onRequestTimeout);

            await producer.connect();   
        }

        node.init();

        function checkLastMessageTime() {
            if(node.lastMessageTime != null){
                timeDiff = new Date().getTime() - node.lastMessageTime;
                if(timeDiff > 5000){
                    node.status({fill:"yellow",shape:"ring",text:"Idle"});
                } 
            }   
        }
          
        node.interval = setInterval(checkLastMessageTime, 1000);

        node.on('input', function(msg) {
            if(node.ready){
                var sendOptions = new Object();
                sendOptions.topic = node.sendOptions.topic;
                sendOptions.acks = node.sendOptions.acks;
                sendOptions.timeout = node.sendOptions.timeout;

                sendOptions.messages = []
                var message = new Object();
                
                message.key = msg.key;
                message.value = msg.payload;

                if(sendOptions.partitions){
                    message.partition = node.sendOptions.partition;
                }
                
                if(msg.partition){
                    message.partition = msg.partition;
                }

                if(msg.headers){
                    message.headers = msg.headers;
                }

                sendOptions.messages.push(message);
                
                node.producer.send(sendOptions).catch((e)=>{
                    node.error(e.message);
                    node.status({fill:"red",shape:"ring",text:"Error"});
                })

                node.lastMessageTime = new Date().getTime();
                node.status({fill:"blue",shape:"ring",text:"Sending"});
            }    
        });

        node.on('close', function(done){
            node.producer.disconnect().then(() => {
                node.status({});
                clearInterval(node.interval);
                done();
            }).catch(e => {
                node.onError(e);
            });
        });
    }
    RED.nodes.registerType("kafkajs-producer",KafkajsProducerNode);
}
