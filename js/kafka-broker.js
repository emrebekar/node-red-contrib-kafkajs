module.exports = function(RED) {
    const fs = require('fs');
    const kafka = require('kafka-node');

    function KafkaBrokerNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node.kafkaClient = null;
        var options = new Object();
        
        options.brokers = config.hosts.split(",");

        options.ssl = new Object();

        if(config.usetls){
            options.ssl.ca = [fs.readFileSync(config.cacert, 'utf-8')];
            options.ssl.cert = [fs.readFileSync(config.clientcert, 'utf-8')];
            options.ssl.key = [fs.readFileSync(config.privatekey, 'utf-8')];
            options.ssl.passphrase = config.passphrase;
            options.ssl.rejectUnauthorized = config.selfsign;
        }
        
        node.options = options;
    }
    RED.nodes.registerType("kafka-broker",KafkaBrokerNode);
}
