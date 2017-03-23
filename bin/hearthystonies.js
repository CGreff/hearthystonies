var unirest = require('unirest');
var Bot = require('slackbots');

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
        console.log("New Message:");
        console.log(data);
        var message = data.text;
        var start = message.indexOf('{');
        var end = message.indexOf('}');

        if ( start !== -1 && end !== -1) {
            var cardName = message.substring(start + 1, end);
            var cardList = getHearthStoneCardImageUri(cardName);
            
            if (Array.isArray(cardList)) {
                if  (cardListcardList.length == 0) {
                    postToChannel('Failed to find card: ' + cardName);
                } else {
                    postToChannel(buildCardMessage(cardList));
                }
            } 
        } 
    }
});

var buildCardMessage = function(cardList) {
    return cardList.map(function(card) {
        return card.img
    }).join("\n");
}

var postToChannel = function(message) {
    bot.postMessageToChannel('r_hearthstone', message);
}

var getCardInfo = function(cardList) {
    var cardSummary = cardList.filter(function(card) {
        return card.type === 'Minion' && card.cardSet !== 'Debug'
    }).map(function (card) {
        return {
            name: card.name,
            class: card.playerClass,
            rarity: card.rarity,
            tribe: card.race,
            cost: card.cost,
            attack: card.attack,
            health: card.health,
            text: card.text,
            img: card.imgGold
        }
    });
}

var getHearthStoneCardImageUri = function(cardName) {    
    unirest.get("https://omgvamp-hearthstone-v1.p.mashape.com/cards/search/" + encodeURIComponent(cardName))
        .header("X-Mashape-Key", hearthStoneApiToken)
        .end(function(response) {
            return getCardInfo(response.body);
        });
}
