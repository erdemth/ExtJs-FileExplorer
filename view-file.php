<?php
	$brushes = array(
		'php'	=> 'php; html-script: true',
		'css'	=> 'css',
		'html'	=> 'xml',
		'htm'	=> 'xml',
		'xml'	=> 'xml',
		'js'	=> 'js',
		'json'	=> 'js',
		'sh'	=> 'bash',
		'bash'	=> 'bash',
		'bsh'	=> 'bash',
		'pl'	=> 'pl',
		'java'	=> 'java',
		'py'	=> 'py',
		'sql'	=> 'sql',
		'vb'	=> 'vb',
		'txt'	=> 'text',
		'h'		=> 'text'
	);
	
	$path= $_POST['filepath'];
	$ext = strtolower($_POST['ext']);
	
	// reading file
	if (file_exists($path) && is_readable($path)) {

		$handle = fopen($path, "rb");
		$contents = fread($handle, filesize($path));
		fclose($handle);

		/*-----------------
		*	IMG FILE
		*-----------------*/
		if(in_array($ext,array('png','gif','jpeg','jpg'))) {
			header("Content-Type: image/$ext");
			echo $contents;
			die('img');
		}

		
		/*-----------------------------------------------------
		*	TEXT FILE
		*------------------------------------------------------*/
		
		// finding brush type
		if(array_key_exists($ext,$brushes))	
			$brush_type = $brushes[$ext];
		else
			$brush_type = $brushes['txt'];		
	
		echo '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
							 "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">';
		echo '<html xmlns="http://www.w3.org/1999/xhtml">';
		echo '<head>';
		echo '<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />';
		echo '<title>File Explorer</title>';
		echo '<style type="text/css">
			body {
			background-color:#FFFFFF;
		}
		</style>';
		
		echo '<script src="js/plugins/shCore-all.js"></script>';
		echo '<link type="text/css" rel="stylesheet" href="css/shCore-all.css"/>';
		echo '<script type="text/javascript"> 
			SyntaxHighlighter.config.clipboardSwf = \'clipboard.swf\';
			SyntaxHighlighter.all();
		</script>';
		
		echo '</head>';
		echo '<body>';
		echo "<pre class=\"brush: $brush_type\">";
		echo htmlspecialchars($contents, ENT_QUOTES);
		echo "</pre>";
		echo '</body>';
		echo '</html>';
		die();

		
	// file error
	} else {
		die("File \"$path\" not found or inaccessible.");
	}
	
