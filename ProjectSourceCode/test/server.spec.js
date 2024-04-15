// ********************** Initialize server **********************************

const server = require('../src/index.js'); //TODO: Make sure the path to your index.js is correctly added

// ********************** Import Libraries ***********************************

const chai = require('chai'); // Chai HTTP provides an interface for live integration testing of the API's.
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const {assert, expect} = chai;

// ********************** DEFAULT WELCOME TESTCASE ****************************

describe('Server!', () => {
  // Sample test case given to test / endpoint.
  it('Returns the default welcome message', done => {
    chai
      .request(server)
      .get('/welcome')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals('success');
        assert.strictEqual(res.body.message, 'Welcome!');
        done();
      });
  });
});

// *********************** TODO: WRITE 2 UNIT TESTCASES **************************

// Example Positive Testcase :
// API: /add_user
// Input: {id: 5, name: 'John Doe', dob: '2020-02-20'}
// Expect: res.status == 200 and res.body.message == 'Success'
// Result: This test case should pass and return a status 200 along with a "Success" message.
// Explanation: The testcase will call the /add_user API with the following input
// and expects the API to return a status of 200 along with the "Success" message.

describe('Testing Register API', () => {

  // Positive Testcase :
  // API: /register
  // Input: {username: 'John Doe', password: 'testpassword'}
  // Expect: res.status == 200 and res.to.redirectTo(/^.*127\.0\.0\.1.*\/login$/)
  // Result: This test case should pass and return a status 200 along with redirecting to the login endpoint.
  // Explanation: The testcase will call the /register API with the following input
  // and expects the API to return a status of 200 along with redirecting to the login endpoint
  it('Positive : /register', done => {
    chai
      .request(server)
      .post('/register')
      .send({username: 'John Doe', password: 'testpassword'})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res).to.redirectTo(/^.*127\.0\.0\.1.*\/login$/); // Checks for 127.0.0.1.(something)/login redirect
        done();
      });
  });

  // Negative Testcase :
  // API: /register
  // Input: {username: 10, password: 23}
  // Expect: res.status == 400 and res.should.have.html == true
  // Result: This test case should pass and return a status 400 along with rendering the register page again.
  // Explanation: The testcase will call the /register API with the following invalid inputs
  // and expects the API to return a status of 400 along with rendering the register page again.
  it('Negative : /register. Checking invalid entries', done => {
    chai
      .request(server)
      .post('/register')
      .send({username: 10, password: 23})
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res).to.be.html; // Should have rendered register page again
        done();
      });

  });
});

// *********************************** PART C *************************************

describe('Testing Login API', () => {
  // Positive Testcase :
  // API: /login
  // Input: {username: 'John Doe', password: 'testpassword'}
  // Expect: res.status == 200 and res.to.redirectTo(/^.*127\.0\.0\.1.*\/home$/)
  // Result: This test case should pass and return a status 200 along with redirecting to the home endpoint.
  // Explanation: The testcase will call the /login API with the following input
  // and expects the API to return a status of 200 along with redirecting to the home endpoint
  it('Positive : /login', done => {
    chai
      .request(server)
      .post('/login')
      .send({username: 'John Doe', password: 'testpassword'})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res).to.redirectTo(/^.*127\.0\.0\.1.*\/home$/); // Checks for 127.0.0.1.(something)/home redirect
        done();
      });
  });

  // Negative Testcase :
  // API: /login
  // Input: {username: 10, password: 23}
  // Expect: res.status == 400 and res.should.have.html == true
  // Result: This test case should pass and return a status 400 along with rendering the login page again.
  // Explanation: The testcase will call the /login API with the following invalid inputs
  // and expects the API to return a status of 400 along with rendering the login page again.
  it('Negative : /login. Checking nonexistent user login', done => {
    chai
      .request(server)
      .post('/login')
      .send({username: 10, password: 23})
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res).to.be.html; // Should have rendered login page again
        done();
      });
  });
});
// ********************************************************************************