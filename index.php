<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
<link rel="icon" type="image/vnd.microsoft.icon" href="favicon.ico">
<title>File Explorer</title>

    <!-- ** CSS ** -->
    <!-- base library -->
    <link rel="stylesheet" type="text/css" href="ext/resources/css/ext-all.css" />

    <!-- ** Javascript ** -->
    <!-- ExtJS library: base/adapter -->
    <script type="text/javascript" src="ext/adapter/ext/ext-base.js"></script>

    <!-- ExtJS library: all widgets -->
    <script type="text/javascript" src="ext/ext-all.js"></script>
    <script type="text/javascript" src="ext/ux-all.js"></script>
          
	<!--- Styles --->
	<link rel="stylesheet" type="text/css" href="css/application.css">
	<link rel="stylesheet" type="text/css" href="css/Ext.ux.Statusbar.css">
	<link rel="stylesheet" type="text/css" href="css/Ext.ux.UploadDialog.css">

	<script type="text/javascript" src="php/direct/api.php"></script>

	<!--- Plugins --->
	<script type="text/javascript" src="js/plugins/Ext.ux.StatusBar.js"></script>
	<script type="text/javascript" src="js/plugins/miframe/multidom.js"></script>
	<script type="text/javascript" src="js/plugins/miframe/mif.js"></script>
	<script type="text/javascript" src="js/plugins/Ext.ux.UploadDialog.js"></script>
	

	<!--- Classes --->
	<script type="text/javascript" src="js/ExplorerTree.js"></script>
	<script type="text/javascript" src="js/ViewPanel.js"></script>

	<!-- The Application File -->
	<script type="text/javascript" src="js/application.js"></script>


	<script type="text/javascript">
		Ext.onReady(function() {
			FileExplorer.app.init({
				base_path: '/var/www/'
				//,web_base: ''
			});
		});
	</script>

</head>

<body>
</body>
</html>
