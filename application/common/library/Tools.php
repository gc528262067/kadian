<?php


namespace app\common\library;


use AlibabaCloud\Client\AlibabaCloud;
use AlibabaCloud\Client\Exception\ClientException;
use AlibabaCloud\Client\Exception\ServerException;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xls;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class Tools
{
    /**
     * 互亿无线发送短信
     */
    public static function huYiSms($mobile='', $code, $type='resetpwd'){
        //短信接口地址
        $target = getConfig('huyiUrl');
        $huyiApiId = getConfig('huyiApiId');
        $huyiApiKey = getConfig('huyiApiKey');
        if(empty($mobile)){
            exit('手机号码不能为空');
        }
        if (!$huyiApiId || !$huyiApiKey) {
            return false;
        }
        //记录短信
        $post_data = "account=".$huyiApiId."&password=".$huyiApiKey."&mobile=".$mobile."&content=".rawurlencode("您的验证码是：".$code."。请不要把验证码泄露给其他人。");
        $gets = xml2Array(curlPost($target, $post_data));
        if($gets['SubmitResult']['code']==2){
            trace('互亿无线短信验证码发送成功信息-------------------'.$mobile);
            trace($gets);
            trace($mobile.'-------------------互亿无线短信验证码发送成功信息');
            return true;
        }else{
            trace('互亿无线短信验证码发送失败信息-------------------'.$mobile);
            trace($gets);
            trace($mobile.'-------------------互亿无线短信验证码发送失败信息');
            return false;
        }
    }

    /**
     * 阿里云发送短信
     * @param $mobile 手机号
     * @param $code 验证码
     */
    public static function aliSms($mobile, $code)
    {
        $config = getConfig(['aliyunSmsKey', 'aliyunSmsSecret', 'aliyunSmsSignName', 'aliyunSmsCode']);
        AlibabaCloud::accessKeyClient($config['aliyunSmsKey'], $config['aliyunSmsSecret'])
            ->regionId('ap-northeast-1')
            ->asDefaultClient();
        try {
            $result = AlibabaCloud::rpc()->product('Dysmsapi')->version('2017-05-25')->action('SendSms')->method('POST')->host('dysmsapi.aliyuncs.com')->options([
                    'query' => [
                        'PhoneNumbers' => $mobile,
                        'SignName' => $config['aliyunSmsSignName'],
                        'TemplateCode' => $config['aliyunSmsCode'],
                        'TemplateParam' => "{\"code\":\"{$code}\"}",
                    ],
                ])->request();
            $result = $result->toArray();
            if($result['Message'] == 'OK' && $result['Code'] == 'OK'){
                trace('阿里云短信验证码发送成功信息-------------------'.$mobile);
                trace('手机号'.$mobile.'短信验证码结果是'.$code);
                trace($result);
                trace($mobile.'-------------------阿里云短信验证码发送成功信息');
                return true;
            }else{
                trace('error00----'.$mobile.$result['Message']);
                return false;
            }
        } catch (ClientException $e) {
            trace('error1---'.$mobile.$e->getErrorMessage());
            return false;
        } catch (ServerException $e) {
            trace('error2---'.$mobile.$e->getErrorMessage());
            return false;
        }
    }

    /**
     * 导出Excel   调用返回方式 Demo/export
     * @param  string $path 存放路径
     * @param  string $fileName 文件名称
     * @param  array  $headArr  Excel标题头数组 [['name'=>'标题1', 'width'=>20]] width默认可以没有
     * @param  array  $data     数据内容
     * @param  array  $options  自定义配置信息 ['width'=>15] 目前只有宽度，后续可以增加，可以设置默认宽度
     * @param  string $suffix   文件后缀，xlsx 和 xls
     */
    public static function exportExcel($path='', $fileName = '', $headArr = [], $data = [], $options = [], $suffix = 'xlsx')
    {
        @ini_set('memory_limit', '2048M');
        @set_time_limit(0);
        if (!$headArr || !$data || !is_array($data)) {
            return false;
        }
        $path1 = $path;
        $path = ROOT_PATH.'public/'.$path.date('Ymd');
        $fileName .= "_" . date("YmdHis").rand(100,99999);
        $spreadsheet = new Spreadsheet();
        $objPHPExcel = $spreadsheet->getActiveSheet();
        // 设置表头
        $colum = 'A';
        foreach ($headArr as $v) {
            $objPHPExcel->setCellValue($colum . '1', $v['name']);
            if (!empty($v['width'])) {
                $objPHPExcel->getColumnDimension($colum)->setWidth($v['width']);
            } elseif (!empty($options['width'])) {
                $objPHPExcel->getColumnDimension($colum)->setWidth($options['width']);
            }
            $colum++;
        }
        $column = 2;
        // 行写入
        foreach ($data as $key => $rows) {
            $span = 'A';
            // 列写入
            foreach ($rows as $keyName => $value) {
                $objPHPExcel->setCellValue($span . $column, $value);
                $objPHPExcel->getStyle($span.$column)->getAlignment()->setWrapText(true);
                $objPHPExcel->getStyle($span.$column)->getAlignment()->setHorizontal('left');
                $objPHPExcel->getStyle($span.$column)->getAlignment()->setVertical('center');
                $span++;
            }
            $column++;
        }
        // 清理缓存
        ob_end_clean();
//        header('Content-Disposition: attachment;filename="' . $fileName . '.' . $suffix . '"');
//        header('Cache-Control: max-age=0');

        if ($suffix == 'xlsx') {
//            header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            $writer = new Xlsx($spreadsheet);
        } elseif ($suffix == 'xls') {
//            header('Content-Type:application/vnd.ms-excel');
            $writer = new Xls($spreadsheet);
        }

        // 不存在的目录直接建立
        if(!is_dir($path)){
            $dir_res = mkdir($path, 0755 , true);
            if(!$dir_res){
                return false;
            }
        }
        $path_and_name =$path.'/'.$fileName.'.'.$suffix;
        $writer->save($path_and_name);
        $spreadsheet->disconnectWorksheets();
        unset($spreadsheet);
        $http_type = ((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on') || (isset($_SERVER['HTTP_X_FORWARDED_PROTO'])
                && $_SERVER['HTTP_X_FORWARDED_PROTO'] == 'https')) ? 'https://' : 'http://';
        return ['url'=>$http_type.$_SERVER['HTTP_HOST'].'/'.$path1.date('Ymd').'/'.$fileName.'.'.$suffix,
            'filename' => $fileName.'.'.$suffix];
    }

    /**
     * 阿里移动设备推送
     * @param integer $user_id 用户id
     * @param string $title 推送标题
     * @param string $body 推送内容
     * @param array $ext 推送额外参数 用于跳转到消息详情
     */
    public static function aliMobilePushMsg($user_id, $title, $body, $ext){
        $info = cache('user_device_'.$user_id);
        $device_type = $info['deviceType'];
        $deviceIds = $info['deviceIds'];
        if(!$device_type || !$deviceIds){
            return;
        }
        AlibabaCloud::accessKeyClient(config('aliyun.accessKeyId'), config('aliyun.accessSecret'))
            ->regionId('cn-hangzhou')
            ->asDefaultClient();
        try {
            $AppKey = config('aliyun.android_key');
            $options = [
                'query' => [
                    'RegionId' => "cn-hangzhou",
                    'AppKey' => $AppKey,
                    'PushType' => "NOTICE",
                    'DeviceType' => "ALL",
                    'Target' => "DEVICE",
                    'TargetValue' => $deviceIds,
                    'Body' => $body,
                    'Title' => $title,
                    'AndroidPopupBody'=>'',
                    'AndroidPopupTitle'=>'',
                    'AndroidNotificationChannel'=> 'cunlintao',
                    'AndroidNotificationBarType' => '50',
                    'AndroidActivity'=>'com.cxkj.cunlintao.push.PopupPushActivity',
                    'AndroidExtParameters' => json_encode($ext),
                ],
            ];
            $result = AlibabaCloud::rpc()
                ->product('Push')
                ->version('2016-08-01')
                ->action('Push')
                ->method('POST')
                ->host('cloudpush.aliyuncs.com')
                ->options($options)
                ->request();
            trace('通知结果'.PHP_EOL);
            trace($result);
        } catch (ClientException $e) {
            trace($e->getErrorMessage() . PHP_EOL);
        } catch (ServerException $e) {
            trace($e->getErrorMessage() . PHP_EOL);
        }
    }

}