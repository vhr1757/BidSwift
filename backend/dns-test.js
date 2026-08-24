const dns = require("dns");

dns.setServers(["8.8.8.8"]);

dns.promises.resolveSrv(
    "_mongodb._tcp.bidswift.ae6hyn6.mongodb.net"
)
.then(result => {
    console.log("SRV records:");
    console.log(result);
})
.catch(error => {
    console.error("DNS error:");
    console.error(error);
});