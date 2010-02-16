<?php
class ExplorerAction {

   /**
     * Method to get the Directory for a Tree by Level
     * 
     * @return json
     */	
	function getFolderList($params) {

		//define the path as relative
		$path = $params->node;
		
		//using the opendir function
		if(false === ($dir_handle = @opendir($path))) 
			return array();// or die("Unable to open $path");

		$rows = array();
		while (false !== ($file = readdir($dir_handle))) {
			if ($file != "." && $file != "..") {
				$filename = $path . '/' . $file;
				if(is_dir($filename)) {
					$row = array();
					$row['text'] 	= $file;
					$row['leaf'] 	= false;
					$row['id'] 		= $filename;
					$rows[]			= $row;
				}
			}
		}
	
		//closing the directory
		closedir($dir_handle);			

		return $rows;
	}
	
   /**
     * Method to get the Directory Listing
     * 
     * @return json
     */	
	function getFiles($data) {

		//define the path as relative
		$path = $data->path;
		
		//using the opendir function
		if(false === ($dir_handle = @opendir($path))) 
			return array("totalCount"=>0,"rows"=>array());// or die("Unable to open $path");
		
		$rows = array();
		while (false !== ($file = readdir($dir_handle))) {
			if ($file != "." && $file != "..") {
				$filename = $path . '/' . $file;
					$row = array();
					$row['filename'] 	= $file;
					$row['filepath'] 	= $filename;
					$row['base_path']	= $data->base_path;
					$row['relative_filepath']= substr($filename,strlen($data->base_path));
					$row['filesize'] 	= (is_dir($filename)?$this->_getdirsize($filename):filesize($filename));
					$row['filetype'] 	= (is_dir($filename)?'dir':substr(strrchr($file, '.'), 1));
					$row['cls'] 		= (is_dir($filename)?'dir':substr(strrchr($file, '.'), 1));
					$row['date_modified'] = date ("Y-m-d H:i:s A", filemtime($filename));
					$rows[]				= $row;
			}
		}
	
		//closing the directory
		closedir($dir_handle);	

		$result = array(
			"totalCount" => sizeof($rows),
			"rows" => $rows
		);

		return $result;
	}
	
   /**
     * Method to get the Directory Size
     * 
     * @return json
     */	
	function _getdirsize($path) 
    { 
		$result=explode("\t",exec("du -s ".$path),2); 
		return ($result[1]==$path ? $result[0] : "error"); 
    }
}
