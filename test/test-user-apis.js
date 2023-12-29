const assert = require('assert');
const mocha = require('mocha');
const request = require('supertest');
const baseURL = 'http://localhost:3000/api/v1'
const app=require('../app');


describe('test user APIs', async function () {

    let token;

    before(function () {
        request(baseURL)
            .post('/auth/login')
            .send({ 'email': 'test-user@gmail.com', password: '123456789' })
            .set('Accept', 'application/json')
            .end(function (err, res) {

                // console.log(res);

                assert.equal(res.body.status, 'success')
                assert.equal(res.status, 200)
                assert.notEqual(res.body.token.length, 0)
                token = res.body.token;

                // console.log(token);
            })
    });

    it.skip('test send friend request api', async function (done) {
        request(baseURL)
            .post('/users/sendrequest')
            .send({ "username": "user2_123" })
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .set('Cookie', `secret=${token}`)
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.success, true);
                assert.equal(res.body.message, 'Friend Request Sent!');

                if (err) {
                    console.log('Send friend request API failing!', err);
                }
                else {
                    done();
                }
            });
    })

})