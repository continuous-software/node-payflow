var qs = require('query-string');
var assert = require('assert');
var util = require('util');
var BaseGateway = require('42-cent-base').BaseGateway;
var mapKeys = require('42-cent-util').mapKeys;
var Promise = require('bluebird');
var GatewayError = require('42-cent-base').GatewayError;
var report = require('payflow-report').factory;
var reportErrors = require('payflow-report').errors;
var request = require('request');
var ccschema = require('./schemas.js');

/**
 *
 * @param options
 * @constructor
 * @augments BaseGateway
 */
function PayFlowGateway(options) {

  assert(options.PARTNER, 'PARTNER must be provided');
  assert(options.VENDOR, 'VENDOR must be provided');
  assert(options.PWD, 'PWD must be provided');

  this.credentials = {
    "PARTNER": options.PARTNER,
    "VENDOR": options.VENDOR,
    "USER": options.USER || options.VENDOR,
    "PWD": options.PWD
  };

  this.endpoint = options.testMode === true ? 'https://pilot-payflowpro.paypal.com' : 'https://payflowpro.paypal.com';

  BaseGateway.call(this, options);

  this._report = report(this.credentials);
}

util.inherits(PayFlowGateway, BaseGateway);

function postRequest(params, service) {

  var post = Promise.promisify(request.post);

  util._extend(params, service.credentials);

  return post(service.endpoint, {
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: qs.stringify(params)
  }).then(function (result) {
    return qs.parse('?' + result[1]);
  });
}

PayFlowGateway.prototype.sendTransaction = function sendTransaction(type) {

  var service = this;

  return function (order, creditCard, prospect, other) {
    var params = {};

    util._extend(params, order);
    util._extend(params, creditCard);
    util._extend(params, prospect);

    params.expDate = creditCard.expirationMonth + creditCard.expirationYear;

    params = mapKeys(params, ccschema);
    params.TRXTYPE = type;
    params.TENDER = 'C';

    util._extend(params, other);

    return postRequest(params, service)
      .then(function (result) {

        if (result.RESULT !== '0') {
          throw new GatewayError(result.RESPMSG || 'error with PayFlow gateway', result);
        }

        return {
          _original: result,
          transactionId: result.PNREF,
          authCode: result.AUTHCODE
        };
      });
  }
};

/**
 * @inheritDoc
 */
PayFlowGateway.prototype.submitTransaction = function submitTransaction(order, creditCard, prospect, other) {
  return this.sendTransaction('S')(order, creditCard, prospect, other);
};

/**
 * @inheritDoc
 */
PayFlowGateway.prototype.authorizeTransaction = function authorizeTransaction(order, creditCard, prospect, other) {
  return this.sendTransaction('A')(order, creditCard, prospect, other);
};

/**
 * @inheritDoc
 */
PayFlowGateway.prototype.getSettledBatchList = function getSettledBatchList(from, to) {

  var report = this._report;

  return report.runBatchReport(from, to)
    .then(function (response) {
      var reportId = response.runReportResponse.reportId;
      return report.getReportData(reportId);
    })
    .then(function (data) {
      var dataRows = data.getDataResponse.reportDataRow;
      return dataRows.map(function (val) {
        return {
          batchId: val.columnData[1].data,
          settlementDate: val.columnData[3].data,
          chargeAmount: val.columnData[4].data,
          chargeCount: val.columnData[5].data,
          refundAmount: val.columnData[6].data,
          refundCount: val.columnData[7].data,
          voidCount: 'N/A',
          declineCount: 'N/A',
          errorCount: 'N/A'
        };
      });
    })
    .catch(function (error) {
      var err = new Error(error);
      var message;
      var responseObject;
      if (error instanceof reportErrors.PayFlowReportError) {
        responseObject = error.runReportResponse || error.getMetaDataResponse || error.getDataResponse || {baseResponse: {}};
        message = responseObject.statusMsg || error.baseResponse.responseMsg || 'something went wrong';
        err = new GatewayError(message, error);
      }
      throw err;
    });
};

/**
 * @inheritDoc
 */
PayFlowGateway.prototype.refundTransaction = function refundTransaction(transactionId, options) {

  var params = {ORIGID: transactionId};

  util._extend(params, options);

  params.TRXTYPE = 'C';
  params.TENDER = 'C';

  return postRequest(params, this)
    .then(function (result) {
      if (result.RESULT !== '0') {
        throw new GatewayError(result.RESPMSG || 'error with PayFlow gateway', result);
      }

      return {
        _original: result
      };
    })

};

/**
 * @inheritDoc
 */
PayFlowGateway.prototype.voidTransaction = function voidTransaction(transactionId, options) {

  var params = {
    ORIGID: transactionId,
    TRXTYPE: 'V',
    TENDER: 'C'
  };
  util._extend(params, options);

  return postRequest(params, this)
    .then(function (result) {
      if (result.RESULT !== '0') {
        throw new GatewayError(result.RESPMSG || 'error with PayFlow gateway', result);
      }

      return {
        _original: result
      };
    });

};

/**
 * @inheritDoc
 *
 * you can specify an initial charge fee with trialAmount filed on subscription plan
 */
PayFlowGateway.prototype.createSubscription = function createSubscription(cc, props, subPlan, other) {
  function formatDate(date) {
    var month = date.getUTCMonth().toString();
    var day = date.getUTCDate().toString();
    var year = date.getUTCFullYear().toString();

    month = month.length === 2 ? month : '0' + month;
    day = day.length === 2 ? day : '0' + day;

    return month + day + year;
  }

  var params = {
    TRXTYPE: 'R',
    TENDER: 'C',
    ACTION: 'A',
    ACCT: cc.creditCardNumber,
    AMT: subPlan.amount,
    START: formatDate(subPlan.startingDate),
    TERM: subPlan.iterationCount
  };

  switch (subPlan.periodUnit) {
    case 'months':
    {
      if (subPlan.periodLength == 4) {
        params.PAYPERIOD = 'QTER';
      } else if (subPlan.periodLength == 6) {
        params.PAYPERIOD = 'SMYR';
      } else if (subPlan.periodLength == 12) {
        params.PAYPERIOD = 'YEAR';
      } else {
        params.PAYPERIOD = 'MONT';
      }
      break;
    }
    case 'weeks':
    {
      if (subPlan.periodLength == 2) {
        params.PAYPERIOD = 'BIWK';
      } else {
        params.PAYPERIOD = 'WEEK';
      }
      break;
    }
    case 'days':
    {
      params.PAYPERIOD = 'DAYS';
      break;
    }
    default:
    {
      params.PAYPERIOD = 'MONT';
    }
  }

  if (params.PAYPERIOD === 'DAYS') {
    params.FREQUENCY = subPlan.periodLength || 1;
  }

  if (subPlan.trialAmount) {
    params.OPTIONALTRX = 'S';
    params.OPTIONALTRXAMT = subPlan.amount;
  }

  util._extend(params, other);

  return postRequest(params, this)
    .then(function (result) {
      if (result.RESULT !== '0') {
        throw new GatewayError(result.RESPMSG || 'error with PayFlow gateway', result);
      }

      return {
        subscriptionId: result.PROFILEID,
        _original: result
      };
    })
};

/**
 * @inheritsDoc
 * Note, this does not actually create a customer profile but create a reference transaction (authorization with 1$) to validate the payment profile and use later as token
 */
PayFlowGateway.prototype.createCustomerProfile = function createCustomerProfile(creditCard, billing, shipping, other) {
  var prosect = {};

  billing = billing || {};
  shipping = shipping || {};
  util._extend(prosect, billing);
  util._extend(prosect, shipping);

  return this.authorizeTransaction({amount: 1}, creditCard, prosect, other)
    .then(function (res) {
      return {
        _original: res._original,
        profileId: res.transactionId
      }
    });
};

PayFlowGateway.prototype.chargeCustomer = function chargeCustomer(order, prospect, other) {
  other = other || {};
  other.ORIGID = prospect.profileId;
  return this.submitTransaction(order, {}, {}, other);
};

module.exports = PayFlowGateway;