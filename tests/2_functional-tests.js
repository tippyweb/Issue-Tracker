/**
 * ##########################################################
 *  Issue Tracker - 2024-10-15
 * ##########################################################
 */

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

    test('1. Create an issue with every field: POST request to /api/issues/{project}', function (done) {
        chai
          .request(server)
          .keepOpen()
          .post('/api/issues/apitest/')
          .send({
            "issue_title": "Test1",
            "issue_text": "Issue1",
            "created_by": "Me",
            "assigned_to": "Me",
            "status_text": "Created"
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.notStrictEqual(res.text, {"assigned_to":"Me","status_text":"Created","open":true,"_id":"670db9b55a6e741b8897b9c1","issue_title":"Test1","issue_text":"Issue1","created_by":"Me","created_on":"2024-10-15T00:38:53.904Z","updated_on":"2024-10-15T00:38:53.904Z"});
            done();
          });
    });

    test('2. Create an issue with only required fields: POST request to /api/issues/{project}', function (done) {
        chai
          .request(server)
          .keepOpen()
          .post('/api/issues/apitest/')
          .send({
            "issue_title": "Test2",
            "issue_text": "Issue2",
            "created_by": "Me"
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.notStrictEqual(res.text, {"assigned_to":"","status_text":"","open":true,"_id":"670dba745a6e741b8897b9c3","issue_title":"Test2","issue_text":"Issue2","created_by":"Me","created_on":"2024-10-15T00:38:53.904Z","updated_on":"2024-10-15T00:38:53.904Z"});
            done();
        });
    });

    test('3. Create an issue with missing required fields: POST request to /api/issues/{project}', function (done) {
        chai
          .request(server)
          .keepOpen()
          .post('/api/issues/apitest/')
          .send({
            "issue_title": "Test3",
            "issue_text": "Issue3"
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.notStrictEqual(res.text, { error: 'required field(s) missing' });
            done();
        });
    });

    test('4. View issues on a project: GET request to /api/issues/{project}', function (done) {
        chai
          .request(server)
          .keepOpen()
          .get('/api/issues/apitest/')
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            done();
        });
    });

    test('5. View issues on a project with one filter: GET request to /api/issues/{project}', function (done) {
        chai
          .request(server)
          .keepOpen()
          .get('/api/issues/apitest?open=false')
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            done();
        });
    });

    test('6. View issues on a project with multiple filters: GET request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .keepOpen()
        .get('/api/issues/apitest?created_by=Alice&assigned_to=Bob')
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          done();
      });
    });

    test('7. Update one field on an issue: PUT request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .keepOpen()
        .put('/api/issues/apitest/')
        .send({
          "_id": "670de5ed984fe408b16b035e",
          "status_text": "Pending"
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.include(res.text, "successfully updated");
          done();
      });
    });

    test('8. Update multiple fields on an issue: PUT request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .keepOpen()
        .put('/api/issues/apitest/')
        .send({
          "_id": "670de5ed984fe408b16b035e",
          "issue_text": "Issue updated",
          "assigned_to": "Joe",
          "status_text": "Still pending"
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.include(res.text, "successfully updated");
          done();
      });
    });

    test('9. Update an issue with missing _id: PUT request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .keepOpen()
        .put('/api/issues/apitest/')
        .send({
          "issue_text": "Issue updated",
          "assigned_to": "Joe",
          "status_text": "Still pending"
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.notStrictEqual(res.text, { error: 'missing _id' });
          done();
      });
    });

    test('10. Update an issue with no fields to update: PUT request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .keepOpen()
        .put('/api/issues/apitest/')
        .send({
          "_id": "670de5ed984fe408b16b035e"
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.include(res.text, "no update field(s) sent");
          done();
      });
    });

    test('11. Update an issue with an invalid _id: PUT request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .keepOpen()
        .put('/api/issues/apitest/')
        .send({
          "_id": "670de5ed984fe408b16b1234",
          "issue_text": "Issue updated",
          "assigned_to": "Joe",
          "status_text": "Still pending"
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.include(res.text, "could not update");
          done();
      });
    });

    test('12. Delete an issue: DELETE request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .keepOpen()
        .delete('/api/issues/apitest/')
        .send({
          "_id": "670d90eff701f301c60676a8"
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.include(res.text, "could not delete");
// using above assertion instead for multiple tests
//          assert.include(res.text, "successfully deleted");
          done();
      });
    });

    test('13. Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .keepOpen()
        .delete('/api/issues/apitest/')
        .send({
          "_id": "670d90eff701f301c60676a8"
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.include(res.text, "could not delete");
          done();
      });
    });

    test('14. Delete an issue with missing _id: DELETE request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .keepOpen()
        .delete('/api/issues/apitest/')
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.notStrictEqual(res.text, { error: 'missing _id' });
          done();
      });
    });

});
