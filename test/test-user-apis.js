const assert = require('assert');
const mocha = require('mocha');
const expect = require('chai').expect;
const request = require('supertest');
const User = require('../models/User');
const baseURL = 'http://localhost:3000/api/v1'
const app = require('../app');


describe('test user APIs', function () {

    let token;

    this.beforeAll(function (done) {

        const newUser = {
            "name": "Test-user",
            "username": "testuser_123",
            "email": "test-user@gmail.com",
            "password": "123456789",
            "passwordConfirm": "123456789"
        }

        request(baseURL)
            .post('/auth/signup')
            .send(newUser)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .end((err, res) => {

                expect(res.status).to.be.equal(200)
                expect(res.body.token).length.to.not.equal(0)
                expect(res.body.data).length.to.not.equal(0)
                expect(res.body.success).to.be.equal(true)
                expect(res.body.message).to.be.equal('User Registered successfully')

                // console.log(res.body.data);


                // assert.equal(res.status, 200);
                // assert.equal(res.body.success, true);
                // assert.equal(res.body.message.toLowerCase(), 'user registered successfully');
                // assert.notEqual(res.body.token.length, 0);
                // assert.notEqual(res.body.data.length, 0);

                if (err) {
                    console.log('Signup API failing', err);
                    throw err;
                }

                console.log('Test user created!');
                done();
            })
    });

    this.afterAll(async function () {
        await User.findOneAndDelete({ 'email': 'test-user@gmail.com' });
        console.log('Test user deleted!');
    })

    this.beforeEach(function (done) {
        request(baseURL)
            .post('/auth/login')
            .send({ 'email': 'test-user@gmail.com', 'password': '123456789' })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .end(function (err, res) {

                console.log('Logging test user!');

                expect(res.body.status).to.equal('success')
                expect(res.status).to.be.equal(200);
                expect(res.body.token).length.to.not.equal(0);

                token = res.body.token;

                // console.log(token);
                done();
            })
    })

    it('test send friend request api', function (done) {
        request(baseURL)
            .post('/users/sendrequest')
            .send({ "username": "user2_123" })
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .set('Cookie', `secret=${token}`)
            .end((err, res) => {
                expect(res.status).to.be.equal(200);
                expect(res.body.success).to.be.equal(true);
                expect(res.body.message).to.equal('Friend Request Sent!');

                if (err) {
                    console.log('Send friend request API failing!', err);
                    throw err;
                }
                else {
                    done();
                }
            });
    })
});