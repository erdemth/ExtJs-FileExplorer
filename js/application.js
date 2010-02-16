/**
  * Application Layout
  * by Daniel Dallala
  * 
  */

// create namespace
Ext.ns('FileExplorer');

/*	Global Variables
------------------------------------*/

/* Helper Functions */

/*	Create Application
---------------------------------*/
FileExplorer.app = function() {
	// do NOT access DOM from here; elements don't exist yet
 
 	// private variables
 
	// private functions
 	
	// public space
	return {
		// public methods
		init: function(params) {
			Ext.apply(this,params);
			
			Ext.QuickTips.init();
			
			// extending time limit on Ajax requests
			Ext.Ajax.timeout =  60000*5;
			
			/*	Adding Direct Provider
			------------------------------*/
			Ext.Direct.addProvider(Ext.app.REMOTING_API);

			/*---------------------------------------
			 *	Explorer Tree Panel Panel
			 *--------------------------------------*/
			this.explorer =  new FileExplorer.ExplorerTree({base_path: this.base_path});
			this.explorer.on('click',this.onExplorerClick,this);


			/*---------------------------------------
			 *	View Panel Panel
			 *--------------------------------------*/	
			this.viewPanel = new FileExplorer.ViewPanel({base_path: this.base_path});	
			this.viewPanel.on('rowdblclick',this.onItemDblClick,this);
			this.viewPanel.on('direction_action',this.doDirectionAction,this);


			// Status Bar 
			Ext.Ajax.on('beforerequest', this.showStatusLoading, this);
			Ext.Ajax.on('requestcomplete', this.stopStatusLoading, this);
			Ext.Ajax.on('requestexception', this.stopStatusLoading, this);


			/*---------------------------------------
			 *	VIEWPORT
			 *--------------------------------------*/	
			this.viewport = new Ext.Viewport({
				id: 'viewport',
				layout: 'border',
				items: [
					this.explorer,
					this.viewPanel
				
				],
				renderTo: Ext.getBody()
			});
			
		},
		
		/*	Public Default Variables
		--------------------------*/
		web_base: false,

		/*	Get functions
		*---------------------------*/		
		getStatusBar: function() {
			return this.viewPanel.statusbar;
		},
		getIFrame: function() {
			if(!this.myFrame) {
				this.myFrame = new Ext.ux.ManagedIFrame.Window({
					title         : 'Simple MIF.Window',
					width         : 845,
					height        : 469,
					maximizable   : true,
					constrain     : true,
					closeAction   : 'hide',
					loadMask      : {msg: 'Loading...'},
					autoScroll    : true,
					defaultSrc 	  : null
				});
			}
			return this.myFrame;
		},
		
		/*	Show functions
		*---------------------------*/
		showStatusLoading:  function() {
			this.getStatusBar().showBusy();
		},
		stopStatusLoading:  function() {
			this.getStatusBar().clearStatus(); // setIcon
		},

		/*	Event functions
		*---------------------------*/
		onExplorerClick: function(node) {
			this.viewPanel.loadStore(node.attributes.id);
		},
		onItemDblClick: function(grid,rowIndex,e) {
			var i = grid.getStore().getAt(rowIndex);
			if(i.get('filetype') == 'dir') {
				this.goTo(i.get('filepath'));
			} else {
				if(this.web_base !== false) {
					window.open(this.web_base + i.get('relative_filepath'));
				} 
				else {
					this.showStatusLoading();
					this.getIFrame().setTitle(i.get('filename'));
					this.getIFrame().show();
					this.getIFrame().submitAsTarget({
                               url      : 'view-file.php',
                               method   : 'POST',
                               params   : {filepath: i.get('filepath'), ext: i.get('filetype')},
							   scope	: this,
							   callback	: this.stopStatusLoading
                           });
				}
			}
		},
		doDirectionAction: function(params) {
			this.goTo(params.path,{action:params.action,inc:params.inc});
		},
		
		/*	Action functions
		*---------------------------*/
		goTo: function(dir_path,params) {
			this.viewPanel.loadStore(dir_path,params);
			this.explorer.selectNode(dir_path);
		},
		goForward: function(dir_path,inc) {
			this.goTo(dir_path,{action:'forward',inc:inc});
		},
		goBack: function(dir_path,inc) {
			this.goTo(dir_path,{action:'back',inc:inc});
		}
		

	};
}();