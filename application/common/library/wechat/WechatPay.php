<?php
namespace app\common\library\wechat;


use think\Exception;

class WechatPay
{
    protected $payConfig;
    protected $config;
    protected $SSLCERT_PATH = EXTEND_PATH.'cert/wechat/apiclient_cert.pem';//证书路径
    protected $SSLKEY_PATH = EXTEND_PATH.'cert/wechat/apiclient_key.pem';//证书路径
    public function __construct($file = null)
    {
        // 加载微信支付配置
        $this->payConfig = config('wechat.pay');
        $this->config = [
            'appid' => $this->payConfig['appid'],
            'mch_id' => $this->payConfig['mch_id'],
            'sub_appid' => $this->payConfig['sub_appid'],
            'sub_mch_id' => $this->payConfig['sub_mch_id'],
            'nonce_str' => $this->getNonceStr(),
            'spbill_create_ip' => $this->payConfig['spbill_create_ip'],
            'trade_type' => $this->payConfig['trade_type'],
        ];
    }

    private function MakeSign($data)
    {
        //签名步骤一：按字典序排序参数
        ksort($data);
        $string = $this->ToUrlParams($data);
        //签名步骤二：在string后加入KEY
        $string = $string . "&key=".$this->payConfig['key'];
        //签名步骤三：MD5加密
        $string = md5($string);
        //签名步骤四：所有字符转为大写
        $result = strtoupper($string);
        return $result;
    }

    private function getNonceStr()
    {
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        $noceStr = "";
        for ($i = 0; $i < 32; $i++) {
            $noceStr .= $chars[ mt_rand(0, strlen($chars) - 1) ];
        }
        return $noceStr;
    }

    private function postData(){
        $receipt = $_REQUEST;
        if($receipt==null){
            $receipt = file_get_contents("php://input");
            if($receipt == null){
                $receipt = $GLOBALS['HTTP_RAW_POST_DATA'];
            }
        }
        return $receipt;
    }

    //生成xml格式数据
    private function ToXml($array)
    {
        if (!is_array($array) || count($array) <= 0) {
            return;
        }
        $xml = '<xml version="1.0">';
        foreach ($array as $key => $val) {
            if (is_numeric($val)) {
                $xml .= "<" . $key . ">" . $val . "</" . $key . ">";
            } else {
                $xml .= "<" . $key . "><![CDATA[" . $val . "]]></" . $key . ">";
            }
        }
        $xml .= "</xml>";
        return $xml;
    }

    private function xmlToarr($xml)
    {
        if (!$xml) {
            return '';
        }
        //将XML转为array 禁止引用外部xml实体
        libxml_disable_entity_loader(true);
        $data = json_decode(json_encode(simplexml_load_string($xml, 'SimpleXMLElement', LIBXML_NOCDATA)), true);
        return $data;
    }

    private function ToUrlParams($array)
    {
        $buff = "";
        foreach ($array as $k => $v) {
            if ($k != "sign" && $v != "" && !is_array($v)) {
                $buff .= $k . "=" . $v . "&";
            }
        }
        $buff = trim($buff, "&");
        return $buff;
    }

    //支付请求--退款使用
    private function httpRequest($url, $data = null, $headers = array())
    {
        $curl = curl_init();
        if (count($headers) >= 1) {
            curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
        }
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, FALSE);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, FALSE);
        if (!empty($data)) {
            curl_setopt($curl, CURLOPT_POST, 1);
            curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
        }
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        $output = curl_exec($curl);
        curl_close($curl);
        return $output;
    }

    //需要使用证书的请求--退款使用
    protected function postXmlSSLCurl($url, $xml, $second=30){
        $ch = curl_init();
        //超时时间
        curl_setopt($ch,CURLOPT_TIMEOUT,$second);
        //这里设置代理，如果有的话
        //curl_setopt($ch,CURLOPT_PROXY, '8.8.8.8');
        //curl_setopt($ch,CURLOPT_PROXYPORT, 8080);
        curl_setopt($ch,CURLOPT_URL, $url);
        curl_setopt($ch,CURLOPT_SSL_VERIFYPEER,FALSE);
        curl_setopt($ch,CURLOPT_SSL_VERIFYHOST,FALSE);
        //设置header
        curl_setopt($ch,CURLOPT_HEADER,FALSE);
        //要求结果为字符串且输出到屏幕上
        curl_setopt($ch,CURLOPT_RETURNTRANSFER,TRUE);
        //设置证书
        //使用证书：cert 与 key 分别属于两个.pem文件
        //默认格式为PEM，可以注释
        curl_setopt($ch,CURLOPT_SSLCERTTYPE,'PEM');
        curl_setopt($ch,CURLOPT_SSLCERT, $this->SSLCERT_PATH);
        //默认格式为PEM，可以注释
        curl_setopt($ch,CURLOPT_SSLKEYTYPE,'PEM');
        curl_setopt($ch,CURLOPT_SSLKEY, $this->SSLKEY_PATH);
        //post提交方式
        curl_setopt($ch,CURLOPT_POST, true);
        curl_setopt($ch,CURLOPT_POSTFIELDS,$xml);
        $data = curl_exec($ch);
        //返回结果
        if($data){
            curl_close($ch);
            return $data;
        }
        else {
            $error = curl_errno($ch);
            curl_close($ch);
            throw new Exception("curl出错，错误码:$error"."");
        }
    }

    private function refundDecrypt($str)
    {
        $decrypt = base64_decode($str,true);
        $key = md5($this->payConfig['key']);
        return openssl_decrypt($decrypt , 'aes-256-ecb',$key, OPENSSL_RAW_DATA);
    }

    //退款回调结果处理
    public function checkRefundData($receipt=null){
        if(!$receipt){
            throw new Exception('缺少验签参数');
        }
        $postData = $this->xmlToarr($receipt);   //微信支付成功，返回回调地址url的数据：XML转数组Array
        trace($postData);
        if($postData['return_code'] == 'SUCCESS'){
            $data = $this->xmlToarr($this->refundDecrypt($postData['req_info'])); // 对信息进行解密
            trace('解密req_info获得的内容');
            trace($data);
            trace('解密req_info获得的内容');
            if(is_array($data) && $data['refund_status'] == 'SUCCESS'){
                return $data;
            }else{
                throw new Exception('解密req_info失败，请查看log');
            }
        }else{
            trace('************************* 微信支付退款回调，接受回调时间.......'.date('Y-m-d H:i:s').'************************* ');
            trace($postData);
            trace('************************* 微信支付退款回调，接受回调时间.......'.date('Y-m-d H:i:s').'************************* ');
            throw new Exception('退款回调失败，请查看log');
        }

    }
    // 验证签名--支付成功
    public function checkSign($receipt=null){
        if(!$receipt){
            throw new Exception('缺少验签参数');
        }
        $postData = $this->xmlToarr($receipt);   //微信支付成功，返回回调地址url的数据：XML转数组Array
        $userSign = $this->MakeSign($postData);   //再次生成签名，与$postSign比较
        trace('签名信息比较---------');
        trace($receipt);
        trace($postData);
        trace($postData['sign']);
        trace($userSign);
        if($postData['result_code'] === 'SUCCESS' && $postData['return_code'] === 'SUCCESS'){
            if($postData['sign'] == $userSign){
                return $postData;
            }
            throw new Exception('签名验证失败');
        }
        throw new Exception('回调失败');
    }

    // 获取微信小程序支付配置信息
    public function getMiniAppServicePayInfo($data)
    {
        $signData = array_merge($data, $this->config);
        // 获取签名
        $signData['sign'] = $this->MakeSign($signData);
        $xml = $this->ToXml($signData);
        //发起预支付请求
        $url = 'https://api.mch.weixin.qq.com/pay/unifiedorder'; //发起支付接口链接
        $xml_to_arr = $this->xmlToarr($this->httpRequest($url, $xml));
        if($xml_to_arr['return_code'] == 'SUCCESS' && $xml_to_arr['return_msg'] == 'OK' && $xml_to_arr['result_code'] == 'SUCCESS'){
            //用于签名
            $time = time();
            $sign_data = [
                'appId' => $this->payConfig['sub_appid'],
                'nonceStr' => $xml_to_arr['nonce_str'],
                'package' => 'prepay_id='.$xml_to_arr['prepay_id'],
                'signType' => 'MD5',
                'timeStamp' => "{$time}",
            ];
            $result = [
                'timeStamp' => "{$time}", //时间戳
                'nonceStr' => $xml_to_arr['nonce_str'], //随机字符串
                'signType' => 'MD5', //签名算法，暂支持 MD5
                'package' => $sign_data['package'], //统一下单接口返回的 prepay_id 参数值，提交格式如：prepay_id=*
                'paySign' => $this->MakeSign($sign_data), //签名,具体签名方案参见微信公众号支付帮助文档;$data['out_trade_no'] = $out_trade_no;
            ];
            return $result;
        }else{
            throw new Exception($xml_to_arr['return_msg']);
        }
    }

    //微信支付小程序退款
    public function miniAppRefund($data){
        $refundData = [
            'appid' => $this->payConfig['appid'],
            'mch_id' => $this->payConfig['mch_id'],
            'sub_appid' => $this->payConfig['sub_appid'],
            'sub_mch_id' => $this->payConfig['sub_mch_id'],
            'nonce_str' => $this->getNonceStr(),
            'sign_type' => $this->payConfig['sign_type'],
            'out_refund_no' => time(),
        ];
        $signData = array_merge($data, $refundData);
        // 获取签名
        $signData['sign'] = $this->MakeSign($signData);
        $url = 'https://api.mch.weixin.qq.com/secapi/pay/refund';
        $xml = $this->ToXml($signData);
        $xml_to_arr = $this->xmlToarr($this->postXmlSSLCurl($url, $xml));
        if($xml_to_arr['return_code'] == 'SUCCESS' && $xml_to_arr['result_code'] == 'SUCCESS'){
            return true;
        }else{
            throw new Exception($xml_to_arr['err_code_des']);
        }
    }

    // 微信付款到零钱
    public function payMoney2User($data){

        $signData = array_merge($data,[
            'mch_appid' => $this->payConfig['appid'],
            'mchid' => $this->payConfig['mch_id'],
            'nonce_str' => $this->getNonceStr(),
            'check_name' => 'NO_CHECK',
            'amount' => 1,
            'desc' => '转账给用户',
        ]);
        $signData['sign'] = $this->MakeSign($signData);
        $url = 'https://api.mch.weixin.qq.com/mmpaymkttransfers/promotion/transfers';
        $xml = $this->ToXml($signData);
        $xml_to_arr = $this->xmlToarr($this->postXmlSSLCurl($url, $xml));
        if($xml_to_arr['return_code'] == 'SUCCESS' && $xml_to_arr['result_code'] == 'SUCCESS'){
            return $xml_to_arr;
        }else{
            throw new Exception($xml_to_arr['err_code_des']);
        }
    }


}