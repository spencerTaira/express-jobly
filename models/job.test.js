"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "new",
    salary: 50000,
    equity: .00005,
    companyHandle: "c1",
  };
  const returnedJob = {
    title: "new",
    salary: 50000,
    equity: "0.00005",
    companyHandle: "c1",
  };
  test("works", async function () {
    const job = await Job.create(newJob);
    expect(job).toEqual(returnedJob);

    const result = await db.query(
      `SELECT  title,
            salary,
            equity,
            company_handle AS "companyHandle"
           FROM jobs
           WHERE title = 'new'`);
    expect(result.rows).toEqual([
      {
        title: "new",
        salary: 50000,
        equity: "0.00005",
        companyHandle: "c1",
      },
    ]);
  });

  test("bad request with dupe", async function () {
    try {
      await Job.create(newJob);
      await Job.create(newJob);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

// /************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        title: "J1",
        salary: 1,
        equity: "0.00000001",
        companyHandle: "c1",
      },
      {
        title: "J2",
        salary: 2,
        equity: "0.00000002",
        companyHandle: "c2",
      },
      {
        title: "J3",
        salary: 3,
        equity: "0.00000003",
        companyHandle: "c3",
      },
    ]);
  });
});

// /************************************** get */

describe("get", function () {
  test("works", async function () {

    let job = await Job.get(1);
    expect(job).toEqual({
      title: "J1",
      salary: 1,
      equity: "0.00000001",
      companyHandle: "c1",
    });
  });

  test("not found if no such company", async function () {
    try {
      await Job.get(10000);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});


/************************************** update */

describe("update", function () {
  const updateData = {
    title: "New Job",
    salary: 1234,
    equity: 0.1234,
    companyHandle: "c1",
  };

  test("works", async function () {
    let job = await Job.update(1, updateData);
    expect(job).toEqual({
      id: 1,
      title: "New Job",
      salary: 1234,
      equity: "0.1234",
      companyHandle: "c1",
    });

    const result = await db.query(
      `SELECT title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE id = 1`);

    expect(result.rows).toEqual([{
      title: "New Job",
      salary: 1234,
      equity: "0.1234",
      companyHandle: "c1",
    }]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      title: "New Job",
      salary: null,
      equity: null,
      companyHandle: "c1",
    };

    let job = await Job.update(1, updateDataSetNulls);
    expect(job).toEqual({
      id: 1,
      ...updateDataSetNulls,
    });

    const result = await db.query(
      `SELECT title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE id = 1`);

    expect(result.rows).toEqual([{
      title: "New Job",
      salary: null,
      equity: null,
      companyHandle: "c1",
    }]);
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(10000, updateData);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(1, {});
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

// /************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(1);
    const res = await db.query(
      "SELECT id FROM jobs WHERE id=1");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such company", async function () {
    try {
      await Job.remove(10000);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

//   /************************************** sql filter conversion */
//   // only pass in name test
//   describe("convert", function () {
//     test("Converts js object to partial sql clause and an query params array",
//       function () {
//         const input = {
//           name: 'java',
//           minEmployees: 1,
//           maxEmployees: 10
//         };

//         const convertedJsObj = Company.sqlForCompanyFilter(input);
//         expect(convertedJsObj).toEqual({
//           filters:
//             `name ILIKE $1 AND num_employees >= $2 AND num_employees <= $3`,
//           values: ['%java%', 1, 10]
//         });
//       });
//   });

//   test("no data", function () {
//     try {
//       Company.sqlForCompanyFilter({});
//       throw new Error("This is wrong");
//     } catch (err) {
//       expect(err instanceof BadRequestError).toBeTruthy();
//     }
//   });

// });


// /************************************** Filter*/

// describe("filter", function () {
//   test("run a query based on name filter", async function () {
//     const test = {
//       name: "1"
//     };
//     const queryResult = await Company.filter(test);

//     expect(queryResult).toEqual(
//       [{
//         handle: "c1",
//         name: "C1",
//         description: "Desc1",
//         numEmployees: 1,
//         logoUrl: "http://c1.img"
//       }]
//     );
//   });

//   test("run a query using numEmployees Min and Max filters", async function () {
//     const testFilter = {
//       minEmployees: 2,
//       maxEmployees: 3
//     };
//     const results = await Company.filter(testFilter);

//     expect(results).toEqual([
//       {
//         handle: "c2",
//         name: "C2",
//         description: "Desc2",
//         numEmployees: 2,
//         logoUrl: "http://c2.img"
//       },
//       {
//         handle: "c3",
//         name: "C3",
//         description: "Desc3",
//         numEmployees: 3,
//         logoUrl: "http://c3.img"
//       }
//     ]);
//   });

//   test("invalid min max numEmployees filters", async function () {
//     const testFilter = {
//       minEmployees: 3,
//       maxEmployees: 2
//     };

//     try {
//       const results = await Company.filter(testFilter);
//       throw new Error('You should not reach this!');
//     } catch (err) {
//       expect(err instanceof BadRequestError).toBeTruthy();
//       expect(err.message).toEqual('Min employees greater than max employees');
//     }
//   });
// });