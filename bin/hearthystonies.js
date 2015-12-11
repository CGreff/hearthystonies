var unirest = require('unirest');
var Bot = require('slackbots');

var slackApiToken = process.env.SLACK_API_KEY;
var hearthStoneApiToken = process.env.HEARTHSTONE_API_KEY;

var bot = new Bot({
    token: slackApiToken,
    name: 'hearthystonies'
});

bot.on('start', function() {
    bot.postMessageToChannel('general', 'I link card images! Try it out by typing a card name surrounded by squiggly brackets!');
});

bot.on('message', function(data) {
    if (data.type === 'message') {
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
  			   bot.postMessageToChannel('general', result.body[0].imgGold);
            }
		});
}
