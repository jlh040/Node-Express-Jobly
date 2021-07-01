const { BadRequestError } = require("../expressError");

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

module.exports = { sqlForPartialUpdate };
