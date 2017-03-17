var unirest = require('unirest');
var Bot = require('slackbots');
// var brandonInsulter = require('./brandon-insulter');

var slackApiToken = process.env.SLACK_API_KEY;
var hearthStoneApiToken = process.env.HEARTHSTONE_API_KEY;

var bot = new Bot({
    token: slackApiToken,
    name: 'hearthystonies'
});

bot.on('start', function() {
});

bot.on('message', function(data) {
    if (data.type === 'message') {

        //If Brandon
//         if(data.user === 'U0DRGBFLZ') {
//                 if (Math.random() <= 0.1) {
//                     bot.postMessageToChannel('general', brandonInsulter.generateBrandonInsult());
//                 }
//         }

        console.log("New Message:");
        console.log(data);
        var message = data.text;
        var start = message.indexOf('{');
        var end = message.indexOf('}');

        if ( start !== -1) {
            getHearthStoneCardImageUri(message.substring(start + 1, end));
        }
    }
});


var getHearthStoneCardImageUri = function(cardName) {    
    unirest.get("https://omgvamp-hearthstone-v1.p.mashape.com/cards/search/" + encodeURIComponent(cardName))
		.header("X-Mashape-Key", hearthStoneApiToken)
		.end(function (result) {
            if (typeof result.body[0].imgGold !== 'undefined') {
  			   bot.postMessageToChannel('r_hearthstone', result.body[0].imgGold);
            }
		});
}
