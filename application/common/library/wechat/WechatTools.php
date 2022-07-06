<?php
namespace app\common\library\wechat;




use think\Exception;

class WechatTools
{
    // 微信的所有配置
    protected $config;
    /**
     * 构造函数
     * @param array $options
     */
    public function __construct($options = [])
    {
        $this->config = config('wechat');
    }

    /**
     * 获取小程序用户openid
     * @param array $options
     */
    public function getUserOpenId($code=null){
        if(!$code){
            throw new Exception('缺少小程序code');
        }
        $wechatApp = ($this->config)['miniapp'];
        $url = 'https://api.weixin.qq.com/sns/jscode2session?appid='.$wechatApp['appid'].'&secret='.$wechatApp['appsecret'].'&js_code='.$code.'&grant_type=authorization_code';
        $result = json_decode(curlGet($url), true);
        if (isset($result['errcode']) && $result['errcode']) {
            throw new Exception($result['errmsg']);
        }
        return $result;
    }


    /**
     * 微信小程序获取access_token
     */
    public function getAccessToken()
    {
        $access_token = cache('access_token');
        trace('$access_token');
        trace($access_token);
        if ($access_token && $access_token['expiretime'] > time()) {
            return $access_token['access_token'];
        } else {
            cache('access_token', []);
            $wechatApp = ($this->config)['miniapp'];
            $res = curlGet('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' . $wechatApp['appid'] . '&secret=' . $wechatApp['appsecret']);
            $result = json_decode($res, true);
            if (!isset($result['access_token'])) {
                cache('access_token', []);
                throw new Exception($result['errmsg']);
            } else {
                $data['access_token'] = $result['access_token'];
                $data['createtime'] = time();
                $data['expiretime'] = time() + $result['expires_in'];
                cache('access_token', $data);
                return $data['access_token'];
            }
        }
    }

    /**
     * 发送订阅消息
     */
    public function miniAppMessageSend($data)
    {
        $access_token = $this->getAccessToken();
        if (!$access_token) {
            throw new Exception('获取accessToken失败');
        }
        $url = 'https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=' . $access_tokenx;;
        $res = curlPost($url, $data);
        $result = json_decode($res, true);
        if ($result['errcode'] == 0) {
            return true;
        }
        return false;
    }

    /**
     * 微信小程序获取用户手机号
     */

    public function getWechatUserMobile($code = '')
    {
        $access_token = $this->getAccessToken();
        if(!$access_token){
            throw new Exception('获取accessToken失败');
        }
        $url = 'https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token='.$access_token;
        $res = json_decode(curlPost($url,['code' => $code]), true);
        if($res['errcode'] == 0){
            return $res['phone_info']['purePhoneNumber'];
        }else{
            throw new Exception( $res['errmsg']);
        }
    }

    /**
     * 生成微信小程序二维码
     */
    public function getWechatMiniAppQrCode($user_id)
    {
        if(!empty($user_id)){
            throw new Exception('缺少用户id');
        }
        $access_token = $this->getAccessToken();
        if(!$access_token){
            throw new Exception('获取accessToken失败');
        }
        $url = 'https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token='.$access_token;
        $params = [
            'page' => 'pages/index/index',
            'width' => '500',
            'scene' => 'user_id='.$user_id
        ];
        $rs = curlPost($url, $params);// 正确的请求则返回图片buffer对象
        $json_arr = json_decode($rs, true);
        if($json_arr['errcode'] != 0){
            throw new Exception($json_arr['errmsg']);
        }
        if(!$json_arr){
            $path = '/uploads/storeQrCode/h' . $user_id . '.jpg';
            file_put_contents($path, $rs);
            return ['path' => $path, 'msg' => '', 'success' => true];
        }
        return  '';
    }

}