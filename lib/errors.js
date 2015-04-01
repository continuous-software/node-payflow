"use strict";

var util = require('util');
var assign = require('object-assign');


function PayFlowReportError (error) {
  Error.call(this);
  assign(this, Error)
}

util.inherits(PayFlowReportError, Error);

module.exports = {
  PayFlowReportError: PayFlowReportError
};
