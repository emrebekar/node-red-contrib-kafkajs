module.exports = function(RED) {
    const { Kafka } = require('kafkajs'); 

    function KafkaConsumerNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
            
        let broker = RED.nodes.getNode(config.broker);        
        const kafka = new Kafka(broker.options)
        const consumer = kafka.consumer({ groupId: 'test-group', maxWaitTimeInMs: 100})

        consumer.on(consumer.events.CONNECT, function(){
            node.status({fill:"green",shape:"ring",text:"Ready"});
        })

        consumer.on(consumer.events.DISCONNECT, function(){
            node.status({fill:"red",shape:"ring",text:"Offline"});
        })

        consumer.on(consumer.events.REQUEST_TIMEOUT, function(){
            node.status({fill:"red",shape:"ring",text:"Timeout"});
        })

        const run = async () => {
            await consumer.connect()
            await consumer.subscribe({ topic: config.topic })
          
            await consumer.run({
              eachMessage: async ({ message }) => {
                var msg = { payload:message }
                node.send(msg);
              },
            })
        }

        run().catch((e)=>{
            node.status({fill:"red",shape:"ring",text:"Error"});
        })
    }
    RED.nodes.registerType("kafka-consumer",KafkaConsumerNode);
}
