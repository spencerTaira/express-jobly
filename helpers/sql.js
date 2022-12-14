"use strict";

const { BadRequestError } = require("../expressError");

/** Accepts data and jsToSql that needs to be updated and returns
 * {firstName: 'Aliya', age: 32}, {firstName:"first_name"}
 * =>{
 *    setCols:'"first_name"=$1, "age"=$2' ,
 *    values: ["Aliya",32],
 * }
 */
// Describe what jsToSql, be pedantic
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}


module.exports = { sqlForPartialUpdate };
