var PayFlowGateway = require('./lib/PayFlowGateway.js');

module.exports = function factory(conf) {
    return new PayFlowGateway(conf);
};
