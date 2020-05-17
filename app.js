const Discord = require('discord.js');
const client = new Discord.Client();
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const config = require('./config.json');
const package = require('./package.json');
const fs = require('fs');

client.once('ready', () => {
    console.log('LegBot is Online !');
    log("Fresh start")
});
client.login(config.token);

client.on('message', postedMessage => {
    if (postedMessage.content.substring(0, 1) == config.trigger) {
        var args = postedMessage.content.substring(1).split(' ');
        var cmd = args[0];
		client.legBotMessage = postedMessage;

        args = args.splice(1);
        switch(cmd) {
            case '#':
            case 'set':
                getSetInfos(args);
            break;
            case "part":
                getPartsInfos(args);
            break;
            case 'bl':
                message.channel.send('https://www.bricklink.com/v2/catalog/catalogitem.page?S='+args);
                log("bl " + args);
            break;
            case 'bi':
            case "review":
                getReview(args);
            break;
            case "bs":
                message.channel.send('https://brickset.com/sets/'+args);
                log("bs " + args);
            break;
            case "LegBot":
            case "help":
                showHelp();
            break;
            case "inviteLegBot":
                client.generateInvite(['SEND_MESSAGES']).then(link=>message.author.send(link));
                log("invite");
            break;
            case "credits":
                showCredits();
            break;
            case "botinfo":
                showStats();
            break;
         }
     }
});


/**************************  FUNCTIONS *******************************/

getReview = function(set) {
	var channel = client.legBotMessage.channel;

    var review = httpGet('https://brickinsights.com/api/sets/'+set+'-1');
    var message = '';

    if (review.error) {
        log("review-not-found " + set);
        message = review.error;
    } else {
		message = new Discord.RichEmbed()
		.setColor('#F2CD37')
		.setTitle(review.name + ' ' + review.year)
		.setURL(review.url)
		.setThumbnail("https://brickinsights.com/storage/sets/"+set+"-1.jpg")
		.addField('Rated',review.name +" is rated **"+ review.average_rating + "/100**") /*+ ", belongs to the "+ set.primary_category.name +" category")*/
		.addField('Links', "More reviews at [BrickInsignt]("+review.url+")")
		.setFooter('Source : BrickInsignt');

		log("review " + set);
    }
	channel.send(message);
}

getSetInfos = function(setNumber) {
	var channel = client.legBotMessage.channel;

	if (!setNumber.length) {
        log("set-no-id " + setNumber);
		client.legBotMessage.react('🤔');
		return;
	}

	var key = "key="+config.rebrickableToken;

    var set = httpGet('https://rebrickable.com/api/v3/lego/sets/'+setNumber+"-1/?"+key);
    // var set = httpGet('https://brickinsights.com/api/sets/'+setNumber+'-1'); RIP
    var BLlink = "https://www.bricklink.com/v2/catalog/catalogitem.page?S="+setNumber;
    var BSet = "https://brickset.com/sets?query="+setNumber;


    if (set.error) {
        log("set-not-found " + setNumber);
		channel.send("Set "+setNumber+" not found... ");
		client.legBotMessage.react('🙄');
    } else {
        if (set.set_url) {
            rebrickableSetUrl = set.set_url;
        }

        var setCard = new Discord.RichEmbed()
            .setColor('#F2CD37')
            .setTitle(setNumber + ' ' + set.name)
            .setURL(rebrickableSetUrl)
            .setThumbnail(set.set_img_url)
            .addField('General',"Released in "+ set.year) /*+ ", belongs to the "+ set.primary_category.name +" category")*/
            .addField('Pieces', "Made of **" + set.num_parts +"** parts")
            // .addField('Price', formatPrice(set))
            .addField('Links', "[Brickset]("+BSet+")   -   [Bricklink]("+BLlink+")")
            .setFooter('Source : Rebrickable');

        log("set " + setNumber);
        channel.send(setCard);
    }
}

showStats = function() {
    var stats = new Discord.RichEmbed()
        .setColor("#3F51B5")
        .setTitle("LegBot")
        .setThumbnail("https://cdn.discordapp.com/avatars/"+client.user.id+'/'+client.user.avatar+'.png')
        .setURL("https://github.com/ThibautPlg/Discord-LEGO-Bot")
        .addField('ID', client.user.id)
        .addField('Uptime', (process.uptime() + "").toHHMMSS(), true)
        .addField('Version', package.version, true)
        .addField('\u200b', '\u200b', true)
        .addField('Server count', client.guilds.size, true)
        .addField('Total channels', client.channels.size, true)
        .addField('Total users', client.users.size, true);
    log("stats");
    client.legBotMessage.author.send(stats);
}

showHelp = function() {
    var t = config.trigger;
    var help = new Discord.RichEmbed()
        .setColor("#009688")
        .setTitle("LegBot help")
        .setThumbnail("https://cdn.discordapp.com/avatars/"+client.user.id+'/'+client.user.avatar+'.png')
        .addField('Hey !', "Thanks for using this LEGO bot ! :kissing_smiling_eyes: \n To use me, type the following commands :")
        .addField('Commands : ', "`"+t+"# or "+t+"set [SET NUMBER]`  to have general usefull infos about the set number.\n"+
        "`"+t+"part [PART ID]`  to have informations about a piece (Bricklink id). You can add multiple pieces separated by a space.\n"+
        "`"+t+"bs [SET NUMBER]`  to show a link to Brickset about the provided set number \n"+
        "`"+t+"bl [SET NUMBER]`  to show a BrickLink link to the searched set number \n"+
        "`"+t+"review [SET NUMBER]`  to have infos about the requested set (rating, reviews...) \n"+
        "`"+t+"help`  to display this message... Not that useful if you're reading this tho. \n "+
        "`"+t+"inviteLegBot` to get a link to invite LegBot to your server. \n \n"+
        "`"+t+"credits`  to show dev credits");
    log("help");
    client.legBotMessage.author.send(help);
}

showCredits = function() {
    var credits = new Discord.RichEmbed()
        .setColor("#03A9F4")
        .setTitle("LegBot")
        .setThumbnail("https://cdn.discordapp.com/avatars/"+client.user.id+'/'+client.user.avatar+'.png')
        .setURL("https://github.com/ThibautPlg/Discord-LEGO-Bot")
        .addField('General', "This bot has been developped by Thibaut P\n \
        Twitter : [@thibaut_plg](https://twitter.com/thibaut_plg)")
        .addField('APIs and ressources', "\
        - Rebrickable API : https://rebrickable.com/api/\n\
        - Brick Insight public API : https://brickinsights.com/ \n \
        - Brickset links : https://brickset.com \n \
        - BrickLink links : https://www.bricklink \n \
        - BrickOwl links : https://www.brickowl.com\n")
        .addField('Technos', "This bot is based on [discord.js](https://discord.js.org/)")
        .addField('Github', "This bot is available on [Github](https://github.com/ThibautPlg/Discord-LEGO-Bot)");
    log("credits");
    client.legBotMessage.author.send(credits);
}

getPartsInfos = function(partNo) {

	if (!partNo.length) {
		// There is no part id given
		log("part-no-id " + partNo);
		client.legBotMessage.react('🤔');
		return;
	} else if (partNo.length > 1) {
		partNo = partNo.filter(function(a){
			// Remove text from message (prevent searching on involunteer text instead of piece number)
			var filter = new RegExp(".*?\\d+.*?\\S","i");
			return String(a).match(filter);
		})

		var piecesMax = config.piecesMax || "2";
		//Multiple pieces searched
		if (partNo.length > piecesMax) {
			// Limiting to prevent message flooding
			partNo = partNo.splice(0, piecesMax);
			client.legBotMessage.channel.send("Hi **"+ message.author.username +"**, you asked for more than "+piecesMax+" pieces. To prevent flooding I'll show you only the "+piecesMax+" firsts");
		}
		partNo.forEach(part => {
			getPartsInfos([part]);
		});
		return;
	}
	var key = "key="+config.rebrickableToken;
    var color = "";

    //can be a BL or Rebrickable id
    var part = httpGet('https://rebrickable.com/api/v3/lego/parts/?bricklink_id='+partNo+"&"+key); //2436b

    if (part && part.count >= 1) {
        var rebrickableNo = part.results['0'].part_num; //10201
        var productionState = '';

        var bricklinkId = part.results['0'].external_ids.BrickLink;
        var bricklinkUrl = 'https://www.bricklink.com/v2/search.page?q='+rebrickableNo;
        if (bricklinkId) {
           bricklinkUrl = "https://www.bricklink.com/v2/catalog/catalogitem.page?P="+ bricklinkId
        }
        var brickOwlId = part.results['0'].external_ids.BrickOwl;
        var brickOwlUrl = 'https://www.brickowl.com/search/catalog?query=266404'+rebrickableNo;
        if (brickOwlId) {
            brickOwlUrl = "https://www.brickowl.com/search/catalog?query=266404"+ brickOwlId
        }
        var legoId = part.results['0'].external_ids.LEGO ? part.results['0'].external_ids.LEGO : rebrickableNo;
        var legoUrl = 'https://www.lego.com/fr-fr/page/static/pick-a-brick?query='+legoId;

        if (rebrickableNo !== partNo) {
            //We need to query with the rebrickable ID to have further informations.
            var part = httpGet('https://rebrickable.com/api/v3/lego/parts/'+rebrickableNo+"/?" + key);
        }

        if(new Date().getFullYear() <= part.year_to) {
            // Still in production ?
            productionState = "[:green_circle: Still in production !] \n";
            color = "#8BC34A";
        } else {
            productionState = "[:orange_circle:  No more produced] \n";
            color = "#F2CD37";
        }

        const partsInfo = new Discord.RichEmbed()
            .setColor(color)
            .setTitle(part.name)
            .setURL(part.part_url)
            .setThumbnail(part.part_img_url)
            .addField('General', productionState + part.name +"\n \
                Released in "+ part.year_from + ", at least produced until "+ part.year_to);

            if(part.molds.length) {
                partsInfo.addField("Similar to", getSimilarParts(part));
            }

            partsInfo
            .addField('Shop : ', "[Bricklink]("+bricklinkUrl+")  |  [BrickOwl]("+brickOwlUrl+") |  [Lego PaB]("+legoUrl+")", true)
            .setFooter('Source : '+ part.part_url);

            client.legBotMessage.channel.send(partsInfo);
            log("part " + partNo);
    } else {
		client.legBotMessage.channel.send("I'm so sorry **"+ client.legBotMessage.author.username +"**, I didn't find the part you were looking for. :(");
		client.legBotMessage.react('🙄')
        log("part-not-found " + partNo);
	}
	if(!part) {
		client.legBotMessage.channel.send("It looks like Rebrickable is down, I can't get my data ! 😐");
		client.legBotMessage.react('😐')
        log("part-not-found-down " + partNo);
	}
}

var getSimilarParts = function(part) {
    var molds = part.molds;
    var txt = '';
    if (molds) {
        var total = molds.length;
        var some = molds;
        if (total > 5) {
            some = molds.slice(0,5);
        }
        for(mold in some) {
            txt += "["+some[mold]+"](https://rebrickable.com/parts/"+some[mold]+")";
            if(mold < total-1) {
                txt += "  |  "; //just to add sexy separators
            }
        }

    }
    return txt;
}

/*************************   Stuff used by function      ****************************/

httpGet = function(theUrl) {
    var xmlHttp = new XMLHttpRequest();
	xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
	xmlHttp.timeout = 5000; //5 sec of timeout
    xmlHttp.send( null );
    // return xmlHttp.responseText;
    var data = JSON.parse(xmlHttp.responseText) ? JSON.parse(xmlHttp.responseText) : false;
    return data;
}

String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time = hours+':'+minutes+':'+seconds;
    return time;
}


formatPrice = function(set) {
    message = "Priced **$"+ set.retail_price_usd+"**";
    if (set.retail_price_usd !== set.retail_price_usd_inflation_adjusted) {
        message += " ( $"+ set.retail_price_usd_inflation_adjusted+" with inflation)";
    }
    message += "\n";
    message += "Price per Piece ratio : $"+ set.ppp_usd +"\n"
    return message;
}

/********************************* Logs  *******************************/
if (config && config.log && config.log.active) {
    var logfile = config.log.logfile || "log.txt";
    // Add a dated prefix to the logfile
    logfile = (new Date).toISOString().slice(0,10)+"_"+logfile;
    var logger = fs.createWriteStream(logfile, {
        flags: 'a'
    })
}

log = function(msg) {
    if (config && config.log && config.log.active && !!logger) {
		logger.write((new Date).toISOString().slice(0,19) + "  " + msg + "\n");
		console.log((new Date).toISOString().slice(0,19) + "  " + msg + "\n");
	}
}

debug = function(msg) {
    if (config && config.log && config.log.debug && !!logger) {
		console.log(msg + "\n");
	}
}
/*********************** Custom functions if needed *********************/
if (config && config.moreFunctions){
	var customFiles = config.moreFunctions;
	if (!Array.isArray(config.moreFunctions)){
		customFiles = [customFiles];
	}
	customFiles.forEach(customFile => {
		eval(fs.readFileSync(customFile)+'');
	});
}