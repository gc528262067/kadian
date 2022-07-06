<?php
return [
    'miniapp' => [
        'appid' => 'wx3c08da484b28e998',
        'appsecret' => '2cefc27e9cb6f9d9d5b1d79c179e7b52'
    ],
    'web' => [
        'appid' => '',
        'appsecret' => ''
    ],
    'pay' => [
        'appid' => 'wxf3390668d9ff2533',  // 服务商商户的APPID
        'mch_id' => '1620760556', //微信支付分配的商户号
        'key' => 'kJ5SiW4Vt1Z1zMNrZJAQihPMC9SmXZWE', // 微信支付商户号秘钥
        'sub_appid' => 'wxaa6028d3ebe10617', //微信分配的子商户公众账号ID，如需在支付完成后获取sub_openid则此参数必传。
        'sub_mch_id' => '1623514409', //	微信支付分配的子商户号
        'device_info' => 'WEB', //终端设备号(门店号或收银设备ID)，注意：PC网页或JSAPI支付请传"WEB"
        'sign_type' => 'MD5', //签名类型，目前支持HMAC-SHA256和MD5，默认为MD5
        'trade_type' => 'JSAPI',//JSAPI -JSAPI支付 NATIVE -Native支付APP -APP支付
        'spbill_create_ip' => '123.12.12.123',
        'notify_url' => '',//接收微信支付异步通知回调地址，通知url必须为直接可访问的url，不能携带参数。公网域名必须为https，如果是走专线接入，使用专线NAT IP或者私有回调域名可使用http。
    ]
];