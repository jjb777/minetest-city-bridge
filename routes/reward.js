var express = require('express');
var router = express.Router();
var dsteem = require('dsteem');
var fetch = require('node-fetch');

var client = new dsteem.Client('https://api.steemit.com');

var account = '<STEEM-ACCOUNT>'; // eg. @city-mc
var active_key = '<STEEM-ACTIVE-KEY>';
var token_symbol = 'NEOXAG';
var token_amount = '7';
var transaction_memo = '[Reward] neoxian.city: thanks for playing minetest!';


/* GET reward. */
router.get('/:account', function(req, res, next) {
  client.database.getAccounts([req.params.account]).then(function (value) {
    console.log(value);
    if (value.length === 1) {
      // found user name
      toDiscord(req.params.account);
      res.send("reward sent to " + req.params.account);
    } else {
      res.send("user '" + req.params.account + "' not found.");
    }
  }).catch(function (reason) {
    res.send("does not exist");
  });
});

module.exports = router;

// send tokens
function send(to_person) {
  console.log("reward for "+to_person);
  var custom_json = (my_id, my_data) => {
    var key = dsteem.PrivateKey.fromString(active_key);

    client.broadcast.json({
      required_auths: [account],
      required_posting_auths: [],
      id: my_id,
      json: JSON.stringify(my_data),
    }, key).then(
        result => {
          console.log(result);
          console.log("reward sent");
          toDiscord(to_person);
        },
        error => {
          console.error(error);
          console.log("could not send reward");
        }
  )}

  custom_json('ssc-mainnet1', {'contractName':'tokens', 'contractAction':'transfer','contractPayload':{'symbol': token_symbol,'to': to_person,'quantity': token_amount,'memo': transaction_memo}});

}

// send msg to discord
function toDiscord(to_person) {
  var url = '<WEBHOOK-URL>';
  var msg = ":moneybag: {"+to_person+"} you are rewarded with "+token_amount+" "+token_symbol+". Thanks for playing minetest.";

  fetch(url, {
    "method":"POST",
    "headers": {"Content-Type": "application/json"},
    "body": JSON.stringify({
      "content": msg
    })
  }).then(res=> console.log(res)).catch(err => console.error(err));

}
