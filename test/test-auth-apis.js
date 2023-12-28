const mocha = require('mocha');
// const chai = require('chai');
const chai = import('chai');
const expect = chai.expect;
const assert = require('assert')
const request = require('supertest');
const app = require('../app');
const baseURL = 'http://localhost:3000/api/v1/auth';
// const request = Request(app);


describe('test user authentication APIs', function () {

    it('test user login api', function (done) {
        request(baseURL)
            .post('/login')
            .send({ email: 'user2@gmail.com', password: '123456789' })
            .set('Accept', 'application/json')
            .end((err, res) => {

                // expect(res.status).to.be.equal(200)
                // expect(res.token).length.to.be.greaterThan(0)
                // expect(res.status).to.be.equal('success')

                assert.equal(res.status, 200);
                assert.equal(res.body.status, 'success');
                assert.notEqual(res.body.token.length, 0);
                assert.notEqual(res.body.data.length, 0);

                if (err) {
                    console.log('Login API failing', err);
                } else {
                    done();
                }
            })
    });

    it.skip('test user register api', function (done) {
        request(baseURL)
            .post('/signup')
            .send({
                "name": "Test-user",
                "username": "testuser_123",
                "email": "test-user@gmail.com",
                "password": "123456789",
                "passwordConfirm": "123456789"
            })
            .set('Accept', 'application/json')
            .end((err, res) => {

                // expect(res.status).to.be.equal(200)
                // expect(res.token).length.to.be.greaterThan(0)
                // expect(res.status).to.be.equal('success')

                assert.equal(res.status, 200);
                assert.equal(res.body.success, true);
                assert.equal(res.body.message.toLowerCase(), 'user registered successfully');
                assert.notEqual(res.body.token.length, 0);
                assert.notEqual(res.body.data.length, 0);

                if (err) {
                    console.log('Signup API failing', err);
                } else {
                    done();
                }
            })
    });
});

