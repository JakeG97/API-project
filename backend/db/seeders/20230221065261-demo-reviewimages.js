'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
options.tableName = "ReviewImages"

module.exports = {
  up: async  (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(options, [
      {
        reviewId: 1,
        url: "www.thisphoto.com",
      },
      {
        reviewId: 2,
        url: "www.thatphoto.com",
      },
      {
        reviewId: 3,
        url: "www.otherphoto.com",
      },
    ],
    {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options,null,{});
  }
};