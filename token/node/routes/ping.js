// Ping Endpoint returns "pong" - useful for health checking service.
let ping = (req, res) => {
    res.status(200);
    res.send("pong");
};

module.exports = ping;
