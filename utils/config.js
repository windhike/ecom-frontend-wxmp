class Config{
  constructor(){};
}

Config.restUrl = 'http://8ba3e07b.ngrok.io/zerg-backend/public/index.php/api/v1/';
// Config.restUrl = 'http://ec2-18-217-207-79.us-east-2.compute.amazonaws.com/zerg-backend/public/index.php/api/v1/';
// Config.restUrl = 'http://z.cn/api/v1/';
Config.onPay=true;  //onPay启用支付,false 关闭支付

export {Config};