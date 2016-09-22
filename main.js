var serialport = require('serialport');
var SerialPort = serialport.SerialPort;

var port = new SerialPort('/dev/tty.usbserial-A501JVJ5', {
  baudrate: 9600,
  parser: serialport.parsers.raw
});
//10002C32E1EF
//1..........13
var dataz  = '';
var cards = [];
var card = {all:"",key:"",fid:"",kid:""};

port.on('data', function(data) {
    dataz += new Buffer(data);
    if(dataz.length == 14){

      var newcard = card;
      newcard.all = dataz.substring(1, 13);
      newcard.key = parseInt(dataz.substring(3,11), 16);
      newcard.fid = parseInt(dataz.substring(5,7), 16);
      newcard.kid = parseInt(dataz.substring(7,11), 16);
      var exist = 0;
      cards.forEach(function(val,key){
        if(val.key == newcard.key){
          exist = 1;
        }
      });
      if(exist == 0){
        console.log('here');
        cards.push(newcard);
        exist = 0;
      }

      console.log('data received: ', dataz.substring(1, 13));
      console.log('KEY:', parseInt(dataz.substring(3,11), 16));
      console.log('FID:', parseInt(dataz.substring(5,7), 16));
      console.log('KID:', parseInt(dataz.substring(7,11), 16));
      console.log('--------');
      console.log('Cards:', cards);
      dataz = '';

    }
});
