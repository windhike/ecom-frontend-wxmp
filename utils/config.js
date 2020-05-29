class Config{
  constructor(){};
}

// Config.restUrl = 'http://58051d77.ngrok.io/ecom-backend-wxmp/public/index.php/api/v1/';
// Config.restUrl = 'http://ec2-18-217-207-79.us-east-2.compute.amazonaws.com/zerg-backend/public/index.php/api/v1/';
Config.restUrl = 'http://z.cn/api/v1/';
Config.onPay=true;  //onPay启用支付,false 关闭支付
Config.templateMsgId='prXVAgEwXpb6-8NUenW0yFgI5yx6ssS4gl75OIsGk4c';
export {Config};