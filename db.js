var firstRoute = require("./bannerList.json");
var secondRoute = require("./cinema.json");
var thirdRoute = require("./moviesList.json");
var fourthRoute = require("./systemCinema.json");
var fifthRoute = require("./user.json");
var sixthRoute = require("./bookingTicket.json");
var seventhRoute = require("./bookedSeat.json");

module.exports = function () {
  return {
    banner: firstRoute,
    cinemaList: secondRoute,
    moviesList: thirdRoute.content,
    systemCinema: fourthRoute,
    usersList: fifthRoute,
    seatList: sixthRoute,
    bookedSeat: seventhRoute,
  };
};
