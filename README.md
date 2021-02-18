# node-red-contrib-kafkajs

This node can be used in order to produce and consume messages to Kafka. It is highly depends on 'kafka-js' library. Consists three nodes.

- kafka-client
- kafka-producer
- kafka-consumer

Further details can be found in following pages:

Client Configuration: https://kafka.js.org/docs/configuration
Consuming Messages: https://kafka.js.org/docs/consuming
Producing Messages: https://kafka.js.org/docs/producing

## Input Parameters
### kafkajs-client
#### Name (Optional)
Name wanted to be shown in Node
#### Brokers
Brokers comma delimited (Multiple host is provided)
#### Client ID
ID of client to be connected to Kafka Cluster
#### Request Timeout
Request timeout of Kafka Client
#### Connection Timeout
Connection timeout of Kafka Client
#### Log Level
Log level of Kafka Cient

#### Authentication
#### TLS
Check if tls security is required for Kafka Cluster
#### CA Certs (Optional)
CA Root certificate path defined in Kafka Cluster
#### Client Cert (Optional)
Client cert path created by openssl derived from Private Key (pem)
#### Private Key (Optional)
Private Key path created by openssl (pem)
#### Passphare (Optional)
Passphrase of created private Key
#### Self Sign
Check if want to be allowed untrusted certificates

#### SASL/PLAIN
Check if sasl auth is required for Kafka Cluster
#### Username
Username in order to connect to Kafka Cluster
#### Password
Password in order to connect to Kafka Cluster
#### Use SSL
Activate SSL Connection

#### Advanced Retry Options
Advanced Retry Options of Kafka Client

### kafkajs-producer
#### Name (Optional)
Name wanted to be shown on your node
#### Client
Client which is wanted to be connect
#### Topic
Topic name of selected broker which is wanted to be consume
#### Advanced Options
Advanced options of Producer

### kafkajs-consumer
#### Name (Optional)
Name wanted to be shown on your node
#### Client
Client which is wanted to be connect
#### Group ID
Group ID of consumer. If it is null, custom uuid will be generated for every connection
#### Topic
Topic name of selected broker which is wanted to be consume
#### Advanced Options
Advanced options of Consumer

## Installation
```
npm install node-red-contrib-kafkajs
```
## Screenshots

![kafkajs-client](https://raw.githubusercontent.com/emrebekar/node-red-contrib-kafkajs/master/images/kafka-client.PNG)

![kafkajs-consumer](https://raw.githubusercontent.com/emrebekar/node-red-contrib-kafkajs/master/images/kafka-consumer.PNG)

![kafkajs-producer](https://raw.githubusercontent.com/emrebekar/node-red-contrib-kafkajs/master/images/kafka-producer.PNG)
