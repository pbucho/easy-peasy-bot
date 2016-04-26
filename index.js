/**
 * A Bot for Slack!
 */


/**
 * Define a function for initiating a conversation on installation
 * With custom integrations, we don't have a way to find out who installed us, so we can't message them :(
 */

function onInstallation(bot, installer) {
    if (installer) {
        bot.startPrivateConversation({user: installer}, function (err, convo) {
            if (err) {
                console.log(err);
            } else {
                convo.say('I am a bot that has just joined your team');
                convo.say('You must now /invite me to a channel so that I can be of use!');
            }
        });
    }
}


/**
 * Configure the persistence options
 */

var config = {};
if (process.env.MONGOLAB_URI) {
    var BotkitStorage = require('botkit-storage-mongo');
    config = {
        storage: BotkitStorage({mongoUri: process.env.MONGOLAB_URI}),
    };
} else {
    config = {
        json_file_store: ((process.env.TOKEN)?'./db_slack_bot_ci/':'./db_slack_bot_a/'), //use a different name if an app or CI
    };
}

/**
 * Are being run as an app or a custom integration? The initialization will differ, depending
 */

if (process.env.TOKEN || process.env.SLACK_TOKEN) {
    //Treat this as a custom integration
    var customIntegration = require('./lib/custom_integrations');
    var token = (process.env.TOKEN) ? process.env.TOKEN : process.env.SLACK_TOKEN;
    var controller = customIntegration.configure(token, config, onInstallation);
} else if (process.env.CLIENT_ID && process.env.CLIENT_SECRET && process.env.PORT) {
    //Treat this as an app
    var app = require('./lib/apps');
    var controller = app.configure(process.env.PORT, process.env.CLIENT_ID, process.env.CLIENT_SECRET, config, onInstallation);
} else {
    console.log('Error: If this is a custom integration, please specify TOKEN in the environment. If this is an app, please specify CLIENTID, CLIENTSECRET, and PORT in the environment');
    process.exit(1);
}


/**
 * A demonstration for how to handle websocket events. In this case, just log when we have and have not
 * been disconnected from the websocket. In the future, it would be super awesome to be able to specify
 * a reconnect policy, and do reconnections automatically. In the meantime, we aren't going to attempt reconnects,
 * WHICH IS A B0RKED WAY TO HANDLE BEING DISCONNECTED. So we need to fix this.
 *
 * TODO: fixed b0rked reconnect behavior
 */
// Handle events related to the websocket connection to Slack
controller.on('rtm_open', function (bot) {
    console.log('** The RTM api just connected!');
});

controller.on('rtm_close', function (bot) {
    console.log('** The RTM api just closed');
    // you may want to attempt to re-open
});


/**
 * Core bot logic goes here!
 */
// BEGIN EDITING HERE!

var all_cases = ['direct_mention','mention','direct_message','ambient'];

controller.on('bot_channel_join', function (bot, message) {
    bot.reply(message, "I'm here!")
});

controller.hears(['Andre','andre'],all_cases,function(bot,message){
	bot.reply(message,"Andre??, last time i saw him he was meeting Carlao, if you know what i mean :heart:");
});

controller.hears('rand', all_cases, function (bot, message) {
	var frases = ["slack", "amaral", "içu"];
	var rand = Math.floor((Math.random() * 3) + 0);
    bot.reply(message, frases[rand]);
});

controller.hears('batatas',all_cases, function (bot, message) {
	bot.reply(message, 'fritas!');
});

controller.hears(
	['projecto','projeto','git','commit','pull','push','branch','merge','jenkins','test','slack','fuck'],
	all_cases,function(bot,message){
	bot.reply(message,"FLIP DA TABLE");
	bot.reply(message,"http://www.timeanddate.com/countdown/party?iso=20160527T14&p0=133&msg=fuck+everything&ud=1&font=cursive&csz=1");
});

controller.hears(['pestana', 'ams'],all_cases, function (bot, message) {
	var frases = [
		"the system must accept 5 and 10 bi.. money",
		"you could do it, but if u are not allowded u are not allowded",
		"this is my chafarica",
		"whats meaning putting them together?",
		"you are a rocket science"
	];
	var rand = Math.floor((Math.random() * 5) + 0);
    bot.reply(message, frases[rand]);
});

var adeleHears = ['hello',
'i was wondering',
'to go over',
'they say the time\'s supposed to heal ya',
'hello',
'i\'m in california dreaming',
'when we were younger',
'i\'ve forgotten how it felt',
'there\'s such a difference',
'hello from the other side',
'to tell you i\'m sorry',
'but when i call you never',
'hello from the outside',
'to tell tou i\'m sorry',
'but it don\'t matter it clearly'];

var adeleResponds = ['it\'s me',
'if after all these years you\'d like to meet',
'everything',
'but i ain\'t done much healing',
'can you hear me?',
'about who we used to be',
'and free',
'before the world fell at our feet',
'between us, and a million miles',
'i must have called a thousand times',
'for everything that i\'ve done',
'seem to be home',
'at least i can say that i\'ve tried',
'for breaking your heart',
'doesn\'t tear you apart anymore'];

var firstHello = true;
var firstSorry = true;

controller.hears(adeleHears,'ambient',function(bot,message){
	var inputMessage = message.text.toLowerCase();
	var outcomeIdx = adeleHears.indexOf(inputMessage);

	if(outcomeIdx == 0){
		if(firstHello){
			firstHello = false;
		}else{
			outcomeIdx = 4;
			firstHello = true;
		}
	}
	
	if(outcomeIdx == 10){
		if(firstSorry){
			firstSorry = false;
		}else{
			outcomeIdx = 13;
			firstSorry = true;
		}
	}

	var outcome = adeleResponds[outcomeIdx];
	bot.reply(message,outcome);
});

/**
 * AN example of what could be:
 * Any un-handled direct mention gets a reaction and a pat response!
 */
//controller.on('direct_message,mention,direct_mention', function (bot, message) {
//    bot.api.reactions.add({
//        timestamp: message.ts,
//        channel: message.channel,
//        name: 'robot_face',
//    }, function (err) {
//        if (err) {
//            console.log(err)
//        }
//        bot.reply(message, 'I heard you loud and clear boss.');
//    });
//});
