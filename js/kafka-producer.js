module.exports = function(RED) {
    const { Kafka } = require('kafkajs');

    function KafkaProducerNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        let ready = false;

        let broker = RED.nodes.getNode(config.broker)
        let kafka = new Kafka(broker.options)
        const producer = kafka.producer()

        node.status({fill:"yellow",shape:"ring",text:"Initializing"});
        
        producer.connect()
        producer.on(producer.events.CONNECT, function(){
            ready = true;
            node.status({fill:"green",shape:"ring",text:"Ready"});
        })

        producer.on(producer.events.DISCONNECT, function(){
            ready = false;
            node.status({fill:"red",shape:"ring",text:"Offline"});
        })

        producer.on(producer.events.REQUEST_TIMEOUT, function(){
            ready = false;
            node.status({fill:"red",shape:"ring",text:"Timeout"});
        })

        node.on('input', function(msg) {
            if(ready){
                const produce = async () => {
                    await producer.send({topic: config.topic,messages: [{ value: msg.payload }]})
                }
                produce().catch((error)=>{
                    node.status({fill:"red",shape:"ring",text:"Error"});
                })
            }    
        });
    }
    RED.nodes.registerType("kafka-producer",KafkaProducerNode);
}
