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

    test("bad request with missing data", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send({
              title: "ajob",
              salary: 25000,
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(400);
    });

    test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
            ...newJob,
            salary: "not-a-number",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
    });
});

/************************************** GET /jobs */

describe('GET /jobs', () => {
    test("an anonymous user can get all jobs", async function () {
        const resp = await request(app).get("/jobs");
        expect(resp.body).toEqual({
          jobs:
            [
                {
                  id: expect.any(Number),
                  title: "c1Job",
                  salary: 20000,
                  equity: '0',
                  companyHandle: "c1",
                },
                {
                  id: expect.any(Number),
                  title: "c2Job",
                  salary: 50000,
                  equity: '0.75',
                  companyHandle: "c2",
                },
                {
                  id: expect.any(Number),
                  title: "c3Job",
                  salary: 80000,
                  equity: '0.97',
                  companyHandle: "c3",
                },
            ]
        });
    });

    test('an anonymous user can search for a particular job', async () => {
        const result = await db.query(`SELECT id FROM jobs WHERE title = 'c1Job'`);
        const id = result.rows[0].id;

        const resp = await request(app).get(`/jobs/${id}`);
        expect(resp.body).toEqual({
          job: {
            id,
            title: "c1Job",
            salary: 20000,
            equity: '0',
            companyHandle: "c1"
          }
        });
    });

    // test('a user is able to search by job title', async () => {
    //     const resp = await request(app).get('/jobs?title=c2Job')
    //     expect(resp.body).toEqual({
    //       jobs: [
    //         {
    //             id: expect.any(Number),
    //             title: "c2Job",
    //             salary: 50000,
    //             equity: '0.75',
    //             companyHandle: "c2"
    //         }
    //       ]
    //     })
    // });

    // test('a user is able to search by minSalary', async () => {
    //     const resp = await request(app).get('/jobs?minSalary=80000')
    //     expect(resp.body).toEqual({
    //       jobs: [
    //         {
    //             id: expect.any(Number),
    //             title: "c3Job",
    //             salary: 80000,
    //             equity: '0.97',
    //             companyHandle: "c3"
    //         }
    //       ]
    //     })
    // });

    test('a user is able to search by hasEquity', async () => {
        const resp = await request(app).get('/jobs?hasEquity=true')
        expect(resp.body).toEqual({
          jobs: [
            {
                id: expect.any(Number),
                title: "c2Job",
                salary: 50000,
                equity: '0.75',
                companyHandle: "c2",
            },
            {
                id: expect.any(Number),
                title: "c3Job",
                salary: 80000,
                equity: '0.97',
                companyHandle: "c3",
            },
        ]
        })
    });







})