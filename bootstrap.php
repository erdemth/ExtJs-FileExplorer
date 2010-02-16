<?php

/**
 * Description of bootstrap
 *
 * @author dan
 */


// ERROR DISPLAY
//---------------------------------
error_reporting(E_ALL|E_STRICT);
ini_set('display_errors', true);


// DEFINING GLOBAL PATHS
//--------------------------------------
defined('APPLICATION_PATH')
    or define('APPLICATION_PATH', dirname(__FILE__));

defined('APPLICATION_ENVIRONMENT')
    or define('APPLICATION_ENVIRONMENT', 'development');

set_include_path(APPLICATION_PATH . '/php/library'
    . PATH_SEPARATOR . get_include_path()
);


// 1.10 - loading classes
require_once 'Zend/Loader/Autoloader.php';
$loader = Zend_Loader_Autoloader::getInstance();
$loader->registerNamespace('My_');

require_once "File/CSV/DataSource.php";

// SAVING TO REGISTRY - global variables
//------------------------------------------------
$registry = Zend_Registry::getInstance();

// LOG
//-----------------------------------------
$writer = new Zend_Log_Writer_Firebug();
$logger = new Zend_Log($writer);
$request = new Zend_Controller_Request_Http();
$response = new Zend_Controller_Response_Http();
$channel = Zend_Wildfire_Channel_HttpHeaders::getInstance();
$channel->setRequest($request);
$channel->setResponse($response);

$registry->writer = $writer;
$registry->logger = $logger;
$registry->request = $request;
$registry->response = $response;
$registry->channel = $channel;

/**
 * Function to implement FirePHP logging using easy to remember functioin firelog
 *
 * @return null
 */
function firelog($str, $priority=Zend_Log::INFO) {
    $logger = Zend_Registry::get('logger');
    $response = Zend_Registry::get('response');
    $channel = Zend_Registry::get('channel');

    // Start output buffering
    ob_start();

    // Now you can make calls to the logger

    $logger->log($str,$priority);

    // Flush log data to browser
    $channel->flush();
    $response->sendHeaders();
}

/**
 * Function to implement FirePHP logging using easy to remember functioin fb
 *
 * @return null
 */
function fb($message, $label=null) {
    if ($label!=null) {
        $message = array($label,$message);
    }

    $logger = Zend_Registry::get('logger');
    $response = Zend_Registry::get('response');
    $channel = Zend_Registry::get('channel');

    // Start output buffering
    ob_start();

    // Now you can make calls to the logger

    $logger->debug($message);

    // Flush log data to browser
    $channel->flush();
    $response->sendHeaders();
}