"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");
const { UnauthorizedError } = require('../expressError');

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/********************************** POST /jobs */

describe('POST /jobs', function() {
    const newJob = {
        title: 'someNewJob',
        salary: 99000,
        equity: 0,
        companyHandle: 'c1'
    };

    test("an admin can create a job", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send(newJob)
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
          job: {
              ...newJob,
              equity: '0',
              id: expect.any(Number)
          },
        });
    });

    test('a non-admin cannot create a job', async () => {
        const resp = await request(app)
          .post('/jobs')
          .send(newJob)
          .set("authorization", `Bearer ${u2Token}`);
        expect(resp.statusCode).toBe(401);
      });
})