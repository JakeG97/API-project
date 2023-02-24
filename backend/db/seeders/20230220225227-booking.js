'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
options.tableName = 'Bookings';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(options, [
      {
        spotId: 1,
        userId: 1,
        startDate: "2023-02-20",
        endDate: "2023-02-24"
      },
      {
        spotId: 2,
        userId: 2,
        startDate: "2023-02-25",
        endDate: "2023-03-01"
      },
      {
        spotId: 3,
        userId: 3,
        startDate: "2023-03-03",
        endDate: "2023-03-07"
      }
    ], 
    {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, null, {});
  },
};
