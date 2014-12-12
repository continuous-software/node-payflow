var config = require('../config.js');
var factory = require('../index.js').report.factory;
var assert = require('assert');
var errors = require('../index.js').report.errors;

describe('PayFlowReport api', function () {
    var PayFlow;

    beforeEach(function () {
        PayFlow = factory(config);
    });

    it('should run a Batch report', function (done) {
        PayFlow.runBatchReport(new Date(Date.now() - 24 * 3600 * 1000 * 7)).then(function (result) {

            var baseResponse = result.baseResponse;
            var runReportResponse = result.runReportResponse;

            assert.equal(baseResponse.responseCode, 100, 'it should have a success response code');
            assert(runReportResponse.reportId, 'it should have a reportId');
            assert.equal(runReportResponse.statusCode, 3, 'it should have the correct statusCode');
            done();
        }, function (error) {
            console.log(error);
        });
    });

    it('should handler web service error', function (done) {
        PayFlow.runBatchReport(new Date(Date.now()), new Date(Date.now() - 24 * 3600 * 1000 * 7)).then(function (result) {
            throw new Error('should not get here');
        }, function (error) {
            assert(error instanceof errors.PayFlowReportError);
            assert.equal(error.runReportResponse.statusCode, 109, 'should have the appropriate error message');
            done();
        });
    });

    xit('should get report data', function (done) {
        PayFlow.runBatchReport(new Date(Date.now() - 24 * 3600 * 1000 * 7)).then(function (result) {

            var baseResponse = result.baseResponse;
            var runReportResponse = result.runReportResponse;

            assert.equal(baseResponse.responseCode, 100, 'it should have a success response code');
            assert(runReportResponse.reportId, 'it should have a reportId');
            assert.equal(runReportResponse.statusCode, 3, 'it should have the correct statusCode');

            return PayFlow.getReportData(runReportResponse.reportId);
        })
            .then(function (result) {
                done();
            })
            .catch(function (err) {
                console.log(err);
            });
    });


    it('should get report metadata', function (done) {
        PayFlow.runBatchReport(new Date(Date.now() - 24 * 3600 * 1000 * 7)).then(function (result) {

            var baseResponse = result.baseResponse;
            var runReportResponse = result.runReportResponse;

            assert.equal(baseResponse.responseCode, 100, 'it should have a success response code');
            assert(runReportResponse.reportId, 'it should have a reportId');
            assert.equal(runReportResponse.statusCode, 3, 'it should have the correct statusCode');

            return PayFlow.getReportMetadata(runReportResponse.reportId);
        })
            .then(function (result) {
                assert.equal(result.baseResponse.responseCode, 100, 'it should have the success response code');
                assert(result.getMetaDataResponse, 'getMetaData response should be defined');
                done();
            })
            .catch(function (err) {
                console.log(err);
            });
    });
});
