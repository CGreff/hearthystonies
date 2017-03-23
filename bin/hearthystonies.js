var unirest = require('unirest');
var Bot = require('slackbots');
var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

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

        if ((start !== -1 && end !== -1) && (end - start > 4)) {
            var cardName = message.substring(start + 1, end);
            var cardList = getHearthStoneCards(cardName);    
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
    return cardList.filter(function(card) {
        return (isPlayable()) && card.cardSet !== 'Debug'
    }).map(function (card) {
        var cardImg;
        if (card.rarity === 'Legendary') {
            cardImg = card.imgGold;
        } else {
            cardImg = card.img;
        }
        return {
            name: card.name,
            class: card.playerClass,
            rarity: card.rarity,
            tribe: card.race,
            cost: card.cost,
            attack: card.attack,
            health: card.health,
            text: card.text,
            img: cardImg
        }
    });
}

var isPlayable = function(card) {
    return isMinion(card) || isSpell(card) || isWeapon();
}

var isMinion = function(card) {
    return card.type === 'Minion'
}

var isWeapon = function(card) {
    return card.type === 'Weapon'
}

var isSpell = function(card) {
    return card.type === 'Spell' && card.playerClass !== 'Neutral'; 
}

var getHearthStoneCards= function(cardName) {    
    var request = unirest.get("https://omgvamp-hearthstone-v1.p.mashape.com/cards/search/" + encodeURIComponent(cardName))
        .header("X-Mashape-Key", hearthStoneApiToken)
        .end(function(response) {
            if (!response.body.hasOwnProperty('error')) {
                cards = getCardInfo(response.body);
                console.log("Received Card List: " + JSON.stringify(cards));
            
                if  (cards.length > 0)  {
                    console.log("Posting cards: " + cards);
                    postToChannel(buildCardMessage(cards));
                } else {
                    failedToFind(cardName);
                }
            } else {
                    failedToFind(cardName);
                } 
        });
}

var failedToFind = function(cardName) {
    console.log("Got no cards back for: " +cardName);
    postToChannel('Failed to find card: ' + cardName);
}