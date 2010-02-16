<?php

	// creating the File_Transfer instance (with Http Adapter)
	$upload = new Zend_File_Transfer_Adapter_Http();

//	firelog($upload->getFileInfo());
	
	// setting the destination
	$UPLOAD_DIR = $_POST['path'];
	
	$upload->setDestination($UPLOAD_DIR);

	// adding some validators
	//$upload->addValidator('Extension', false, 'csv');*/
	
	// uploading the file if valid
	if($upload->isValid()) {
		try {
			$upload->addFilter('Rename', array('target'=>$UPLOAD_DIR.'/'.$upload->getFileName(null,false)));
			$upload->receive();

			if($upload->isReceived()){
				$return = array(
					'success'=> true, 
					'message' => 'SUCESS: '.$upload->getFileName(null,false).'('.$upload->getFileSize().')');
			}  else
				$return = array('success'=> false, 'error'=>'ERROR: File Not Received');
		} catch (Exception $e) {
			$return = array('success'=> false, 'error'=>'ERROR: Upload Failure');
		}
	} else $return = array('success'=> false, 'error'=>'ERROR: File not valid');
	
	echo Zend_Json::encode($return);
