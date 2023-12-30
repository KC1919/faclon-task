const mocha = require('mocha');
const expect = require('chai').expect;
const assert = require('assert')
const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const baseURL = 'http://localhost:3000/api/v1/auth';
// const request = Request(app);


describe('test user authentication APIs', function () {

    it('test user login api', function (done) {
        request(baseURL)
            .post('/login')
            .send({ email: 'user2@gmail.com', password: '123456789' })
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .end((err, res) => {

                expect(res.status).to.be.equal(200)
                expect(res.body.token).length.to.be.greaterThan(0)
                expect(res.body.status).to.be.equal('success')

                // console.log(res.body.token);

                // assert.equal(res.status, 200);
                // assert.equal(res.body.status, 'success');
                // assert.notEqual(res.body.token.length, 0);
                // assert.notEqual(res.body.data.length, 0);

                if (err) {
                    console.log('Login API failing', err);
                } else {
                    done();
                }
            })
    });

    it('test user register api', function (done) {

        const newUser = {
            "name": "Test-user",
            "username": "testuser_123",
            "email": "test-user@gmail.com",
            "password": "123456789",
            "passwordConfirm": "123456789"
        }

        request(baseURL)
            .post('/signup')
            .send(newUser)
            .set('Accept', 'application/json')
            .end(async (err, res) => {

                console.log('Testing register api');

                expect(res.status).to.be.equal(200)
                expect(res.body.token).length.to.not.equal(0)
                expect(res.body.data).length.to.not.equal(0)
                expect(res.body.success).to.be.equal(true)
                expect(res.body.message).to.be.equal('User Registered successfully')


                await User.findOneAndDelete({'email':'test-user@gmail.com'});

                // assert.equal(res.status, 200);
                // assert.equal(res.body.success, true);
                // assert.equal(res.body.message.toLowerCase(), 'user registered successfully');
                // assert.notEqual(res.body.token.length, 0);
                // assert.notEqual(res.body.data.length, 0);

                if (err) {
                    console.log('Signup API failing', err);
                    throw err
                } else {
                    done();
                }
            })
    });
});