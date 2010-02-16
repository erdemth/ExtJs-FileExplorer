<?php
include_once '../../bootstrap.php';
require('config.php');

class BogusAction {
	public $action;
	public $method;
	public $data;
	public $tid;
}

$isForm = false;
$isUpload = false;
if(isset($HTTP_RAW_POST_DATA)){
	header('Content-Type: text/javascript');
	$data = json_decode($HTTP_RAW_POST_DATA);
}else if(isset($_POST['extAction'])){ // form post
	$isForm = true;
	$isUpload = $_POST['extUpload'] == 'true';
	$data = new BogusAction();
	$data->action = $_POST['extAction'];
	$data->method = $_POST['extMethod'];
	$data->tid = $_POST['extTID'];
	$data->data = array($_POST, $_FILES);
}else{
	die('Invalid request.');
}

function doRpc($cdata){
    global $API;
	try {
		if(!isset($API[$cdata->action])){
			throw new Exception('Call to undefined action: ' . $cdata->action);
		}

		$action = $cdata->action;
		$a = $API[$action];

		doAroundCalls($a['before'], $cdata);

		$method = $cdata->method;
		$mdef = $a['methods'][$method];
		if(!$mdef){
			throw new Exception("Call to undefined method: $method on action $action");
		}
		doAroundCalls($mdef['before'], $cdata);

		$r = array(
			'type'=>'rpc',
			'tid'=>$cdata->tid,
			'action'=>$action,
			'method'=>$method
		);

		require_once("classes/$action.php");
		$o = new $action();

		$params = isset($cdata->data) && is_array($cdata->data) ? $cdata->data : array();

		$r['result'] = call_user_func_array(array($o, $method), $params);

		doAroundCalls($mdef['after'], $cdata, $r);
		doAroundCalls($a['after'], $cdata, $r);
	}
	catch(Exception $e){
		$r['type'] = 'exception';
		$r['message'] = $e->getMessage();
		$r['where'] = $e->getTraceAsString();
	}
	return $r;
}


function doAroundCalls(&$fns, &$cdata, &$returnData=null){
	if(!$fns){
		return;
	}
	if(is_array($fns)){
		foreach($fns as $f){
			$f($cdata, $returnData);
		}
	}else{
		$fns($cdata, $returnData);
	}
}

$response = null;
if(is_array($data)){
	$response = array();
	foreach($data as $d){
		$response[] = doRpc($d);
	}
}else{
	$response = doRpc($data);
}
if($isForm && $isUpload){
	echo '<html><body><textarea>';
	echo json_encode($response);
	echo '</textarea></body></html>';
}else{	
	echo prepareJSON($response);
}

/*	Function to permit json encoding of javascript functions */
function prepareJSON($resp) {

	$value_arr = array();
	$replace_keys = array();
	
	// replacing all values defined as js functions by trailing ___ with a random number
	recursiveReplace($value_arr,$replace_keys,$resp);
	
	// transforming the data into json
	$encoded_json = json_encode($resp);
	
	// replacing the random numbers with their corresponding values from the value_array
	$encoded_json = str_replace($replace_keys,$value_arr,$encoded_json);

	return $encoded_json;

}

function recursiveReplace(&$value_arr,&$replace_keys,&$resp) {
	foreach($resp as $key => &$value){
			// if value is array recursively check for a function type
			if(is_array($value)) {
				recursiveReplace($value_arr,$replace_keys,$value);
			}
			// Look for values starting with '___'
			else if(strpos($value, '___')===0){
				$rand = rand();
				
				// Store function string.
				$value_arr[$rand] = substr($value,3);
				// Replace function string in $foo with a 'unique' special key.			
				$value = $rand;
				// Later on, we'll look for the value, and replace it.
				$replace_keys[] = $value;
			}
	}

}
