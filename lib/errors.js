"use strict";

var util = require('util');
var _ = require('lodash');

function PayFlowReportError(error) {
    Error.call(this);
    _.assign(this, error);
}

util.inherits(PayFlowReportError, Error);

module.exports = {
    PayFlowReportError: PayFlowReportError
};
