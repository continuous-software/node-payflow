var _ = require('lodash');
var request = require('request');
var toXml = require('json2xml');
var Promise = require('bluebird');
var assert = require('assert');
var toJson = require('xml2json').toJson;
var errors = require('./errors.js');

function PayFlowReport(options) {

    assert(options.PARTNER, 'PARTNER must be defined');
    assert(options.VENDOR, 'PARTNER must be defined');
    assert(options.PWD, 'PWD must be defined');

    this.endPoint = process.env.NODE_ENV === 'production' ? 'https://payments-reports.paypal.com/reportingengine' : 'https://payments-reports.paypal.com/test-reportingengine';
    _.assign(this, options);

    if (!this.USER) {
        this.USER = options.VENDOR;
    }
}

function formatDate(dateObject) {
    var year = dateObject.getUTCFullYear().toString();
    var month = (dateObject.getUTCMonth() + 1).toString();
    var day = dateObject.getUTCDate().toString();
    var hour = dateObject.getUTCHours().toString();
    var minutes = dateObject.getUTCMinutes().toString();
    var seconds = dateObject.getUTCMinutes().toString();

    month = month.length === 2 ? month : '0' + month;
    day = day.length === 2 ? day : '0' + day;
    hour = hour.length === 2 ? hour : '0' + hour;
    minutes = minutes.length === 2 ? minutes : '0' + minutes;
    seconds = seconds.length === 2 ? seconds : '0' + seconds;

    return year + '-' + month + '-' + day + ' ' + hour + ':' + minutes + ':' + seconds;
}

function createRequestObject(endPoint, requestBody) {
    var xmlContent = toXml(requestBody, {header: true});

    return {
        url: endPoint,
        headers: {
            'Content-Type': 'text/plain',
            'Content-Length': xmlContent.length
        },
        body: xmlContent
    };
}

function defaultCallback(resolve, reject) {
    return function (err, res, body) {
        var json;

        if (err) {
            reject(err);
        } else {
            json = JSON.parse(toJson(body));
            if (json.reportingEngineResponse && json.reportingEngineResponse.baseResponse) {

                if (json.reportingEngineResponse.baseResponse.responseCode == 100) {
                    resolve(json.reportingEngineResponse);
                } else {
                    reject(new errors.PayFlowReportError(json.reportingEngineResponse));
                }

            } else {
                reject(json);
            }
        }
    }
}


PayFlowReport.prototype.runReportRequest = function runReportRequest(type, reportParams) {

    return new Promise(function (resolve, reject) {

        var requestBody = {
            reportingEngineRequest: {
                authRequest: {
                    user: this.USER,
                    vendor: this.VENDOR,
                    partner: this.PARTNER,
                    password: this.PWD
                }
            }
        };
        var runReportRequest = [];
        runReportRequest.push({reportName: type});
        _(reportParams).forEach(function (val) {
            runReportRequest.push({
                reportParam: val
            });
        });
        requestBody.reportingEngineRequest.runReportRequest = runReportRequest;

        request.post(createRequestObject(this.endPoint, requestBody), defaultCallback(resolve, reject));
    }.bind(this));


};

PayFlowReport.prototype.runBatchReport = function runBatchReport(lowerDate, higherDate, processor) {
    var pro = processor || 'PayPal';
    var lowerDateObj = new Date(lowerDate);
    var higherDateObj = higherDate ? new Date(higherDate) : new Date();

    return this.runReportRequest('BatchIDReport', [
        {paramName: 'start_date', paramValue: formatDate(lowerDateObj)},
        {paramName: 'end_date', paramValue: formatDate(higherDateObj)},
        {paramName: 'processor', paramValue: pro}
    ]);
};

PayFlowReport.prototype.getReportData = function getReportData(reportId, page) {

    return new Promise(function (resolve, reject) {

        var requestBody = {
            reportingEngineRequest: {
                authRequest: {
                    user: this.USER,
                    vendor: this.VENDOR,
                    partner: this.PARTNER,
                    password: this.PWD
                },

                getDataRequest: {
                    reportId: reportId,
                    pageNum: page || 1
                }
            }
        };

        request.post(createRequestObject(this.endPoint, requestBody), defaultCallback(resolve, reject));
    }.bind(this));

};

PayFlowReport.prototype.getReportMetadata = function getReportMetaData(reportId) {
    return new Promise(function (resolve, reject) {

        var requestBody = {
            reportingEngineRequest: {
                authRequest: {
                    user: this.USER,
                    vendor: this.VENDOR,
                    partner: this.PARTNER,
                    password: this.PWD
                },

                getMetaDataRequest: {
                    reportId: reportId
                }
            }
        };


        request.post(createRequestObject(this.endPoint, requestBody), defaultCallback(resolve, reject));
    }.bind(this));
};

module.exports = PayFlowReport;