const { BadRequestError } = require("../expressError");
const sqlString = require('sqlstring');

/* Pass in data to update and an object containing js keywords with values as their SQL analog
*  and it will return an object containing {setCols: string with proper SQL keywords, 
*  values: [data corresponding to those keywords]}
*  
*  E.G: {name: bob, numEmployees: 54} => {setCols: `"name" = $1, "num_employees" = $2`, values: ['bob', 54]}
*/

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  // Get the keys from the data object
  const keys = Object.keys(dataToUpdate);
  // If there are no keys, no data was passed in, so throw a BadRequestError
  if (keys.length === 0) throw new BadRequestError("No data");

  // Takes the keys that were passed in, and checks to see if they need to be translated to their SQL analog
  // Either way, an array of 'key=value' items will be returned. E.G: 
  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  // Return an object containing necessary information
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

/* Pass in arguments referring to how we should search for companies, and returns a SQL statement which
*  makes that exact search in the database.
*
* E.G: 
*  {name = 'Dunder Mifflin', maxEmployees = 80} => 
*  'SELECT * FROM companies WHERE name ILIKE '%Dunder Mifflin%' AND num_employees <= 80`
*/

function sqlForFilteredCompanies({name, minEmployees, maxEmployees}) {
  let baseQuery = `SELECT handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl" FROM companies WHERE`;
  let arrOfKeyAndVal = [];

  // make array containing 'key = value' statements
  for (let key in arguments[0]) {
    if (arguments[0][key] !== undefined) arrOfKeyAndVal.push(`${key} = '${arguments[0][key]}'`);
  }

  // create array of sql clauses
  arrOfKeyAndVal = arrOfKeyAndVal.map(clause => {
    if (clause.includes('name')) return `name ILIKE ${sqlString.escape('%' + name + '%')}`;
    else if (clause.includes('minEmployees')) return `num_employees >= ${+sqlString.escape(minEmployees)}`;
    else if (clause.includes('maxEmployees')) return `num_employees <= ${+sqlString.escape(maxEmployees)}`;
  });

  // attach either the concatenated string, or the single array item to the end of: SELECT * FROM companies WHERE
  baseQuery += (arrOfKeyAndVal.length === 1 ? ` ${arrOfKeyAndVal[0]}` : ` ${arrOfKeyAndVal.join(' AND ')}`);

  // return query
  return baseQuery;
}

/* Pass in arguments referring to how we should search for jobs, and returns a SQL statement which
*  makes that exact search in the database.
*
* E.G: 
*  {title: 'CEO', hasEquity: true} => 
*  'SELECT id, title, salary, equity, company_handle AS 'companyHandle' FROM jobs WHERE title ILIKE '%CEO%' AND equity > 0`
*/

function sqlForFilteredJobs({title, minSalary, hasEquity}) {
  let baseQuery = `SELECT id, title, salary, equity, company_handle AS "companyHandle" FROM jobs WHERE`;
  let arrOfKeyAndVal = [];

  // Make array containing 'key = value' statements.
  // If hasEquity is either undefined, or false, we are not filtering by equity, so
  // we will not put it in our arr of " key = 'value' " statements
  for (let key in arguments[0]) {
    if (arguments[0][key] !== undefined && arguments[0][key] !== false) arrOfKeyAndVal.push(`${key} = '${arguments[0][key]}'`);
  }

  // create array of SQL clauses
  arrOfKeyAndVal = arrOfKeyAndVal.map(clause => {
    if (clause.includes('title')) return `title ILIKE ${sqlString.escape('%' + title + '%')}`;
    else if (clause.includes('minSalary')) return `salary >= ${+sqlString.escape(minSalary)}`;
    else if (clause.includes('hasEquity')) return `equity > 0`;
  });

  // attach either the concatenated string, or the single array item to the end of: SELECT * FROM jobs WHERE
  baseQuery += (arrOfKeyAndVal.length === 1 ? ` ${arrOfKeyAndVal[0]}` : ` ${arrOfKeyAndVal.join(' AND ')}`);

  // return query
  return baseQuery;
}

module.exports = { sqlForPartialUpdate, sqlForFilteredCompanies, sqlForFilteredJobs };
