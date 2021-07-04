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

    // test('a user is able to search by hasEquity', async () => {
    //     const resp = await request(app).get('/jobs?hasEquity=true')
    //     expect(resp.body).toEqual({
    //       jobs: [
    //         {
    //             id: expect.any(Number),
    //             title: "c2Job",
    //             salary: 50000,
    //             equity: '0.75',
    //             companyHandle: "c2",
    //         },
    //         {
    //             id: expect.any(Number),
    //             title: "c3Job",
    //             salary: 80000,
    //             equity: '0.97',
    //             companyHandle: "c3",
    //         },
    //     ]
    //     })
    // });

    // test('a user is able to search by hasEquity and minSalary', async () => {
    //     const resp = await request(app).get('/jobs?hasEquity=true&minSalary=35000')
    //     expect(resp.body).toEqual({
    //       jobs: [
    //         {
    //             id: expect.any(Number),
    //             title: "c2Job",
    //             salary: 50000,
    //             equity: '0.75',
    //             companyHandle: "c2",
    //         },
    //         {
    //             id: expect.any(Number),
    //             title: "c3Job",
    //             salary: 80000,
    //             equity: '0.97',
    //             companyHandle: "c3",
    //         },
    //     ]
    //     })
    // });

    // test('a user is able to search by title and minSalary', async () => {
    //     const resp = await request(app).get('/jobs?title=c3Job&minSalary=70000')
    //     expect(resp.body).toEqual({
    //       jobs: [
    //         {
    //             id: expect.any(Number),
    //             title: "c3Job",
    //             salary: 80000,
    //             equity: '0.97',
    //             companyHandle: "c3",
    //         }
    //     ]
    //     });
    // });

    // test('if minSalary is not a number return 400', async () => {
    //     const resp = await request(app).get('/jobs?minSalary=hello');
    //     expect(resp.statusCode).toBe(400);
    // });

    // test('if invalid parameters are passed in the query string return 400', async () => {
    //     const resp = await request(app).get('/jobs?igloo=polarbear&title=c3Job');
    //     expect(resp.statusCode).toBe(400);
    // });

    test("fails: test next() handler", async function () {
        // there's no normal failure event which will cause this route to fail ---
        // thus making it hard to test that the error-handler works with it. This
        // should cause an error, all right :)
        await db.query("DROP TABLE jobs CASCADE");
        const resp = await request(app)
            .get("/jobs")
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(500);
    });
});

/************************************** GET /jobs/:id */

describe('GET /jobs/:id', () => {
    test("works for anon", async function () {
        const result = await db.query(`SELECT id FROM jobs WHERE title = 'c1Job'`)
        const id = result.rows[0].id;

        const resp = await request(app).get(`/jobs/${id}`);
        expect(resp.body).toEqual({
          job: {
            id,
            title: "c1Job",
            salary: 20000,
            equity: '0',
            companyHandle: "c1",
          },
        });
    });

    test("not found for no such job", async function () {
        const resp = await request(app).get(`/jobs/99000`);
        expect(resp.statusCode).toEqual(404);
    });
});

/*************************************** PATCH /jobs/:id */

describe('PATCH /jobs/:id', () => {
    test("an admin can update a job", async function () {
        const result = await db.query(`SELECT id FROM jobs WHERE title = 'c1Job'`)
        const id = result.rows[0].id;

        const resp = await request(app)
            .patch(`/jobs/${id}`)
            .send({
              equity: 0.34,
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.body).toEqual({
          job: {
            id,
            title: "c1Job",
            salary: 20000,
            equity: '0.34',
            companyHandle: "c1",
          },
        });
    });

    test("a non-admin cannot update a job", async function () {
        const result = await db.query(`SELECT id FROM jobs WHERE title = 'c1Job'`)
        const id = result.rows[0].id;

        const resp = await request(app)
            .patch(`/jobs/${id}`)
            .send({
              equity: 0.34,
            })
            .set("authorization", `Bearer ${u2Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test("an anonymous user cannot update a job", async function () {
        const result = await db.query(`SELECT id FROM jobs WHERE title = 'c1Job'`)
        const id = result.rows[0].id;

        const resp = await request(app)
            .patch(`/jobs/${id}`)
            .send({
              equity: 0.34,
            })
        expect(resp.statusCode).toEqual(401);
    });

    test("not found on no such job", async function () {
        const resp = await request(app)
            .patch(`/jobs/900010000`)
            .send({
              title: "doesNotMatter",
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(404);
    });

    test("bad request on id change attempt", async function () {
        const result = await db.query(`SELECT id FROM jobs WHERE title = 'c1Job'`)
        const id = result.rows[0].id;

        const resp = await request(app)
            .patch(`/jobs/${id}`)
            .send({
              id: 850,
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(400);
    });

    test("bad request on companyHandle change attempt", async function () {
        const result = await db.query(`SELECT id FROM jobs WHERE title = 'c1Job'`)
        const id = result.rows[0].id;

        const resp = await request(app)
            .patch(`/jobs/${id}`)
            .send({
              companyHandle: 'newHandle',
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(400);
    });

    
})
