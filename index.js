var PayFlowGateway = require('./lib/PayFlowGateway.js');
var PayFlowReport = require('./lib/PayFlowReport.js');

module.exports = {
  gateway: function factory(conf) {
    return new PayFlowGateway(conf);
  },
  report: {
    factory: function PayFlowReportFactory(options) {
      return new PayFlowReport(options);
    },
    errors: require('./lib/errors.js')
  }
};
