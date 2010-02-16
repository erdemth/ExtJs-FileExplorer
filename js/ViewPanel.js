Ext.ns('FileExplorer');

/**
 * FileExplorer.ViewPanel
 * @extends Ext.Panel
 *
 * This Panel contains a Grid for viewing all items
 * 
 */
FileExplorer.ViewPanel = function(params) {

	// initializing browzing history
	this.back_array = new Array();
	this.forward_array = new Array();

	// StatusBar
	this.statusbar = new Ext.ux.StatusBar();
	
	// Dialog Box
	this.uploadDialog = new Ext.ux.UploadDialog.Dialog({
		title: 'File Upload',
		url: 'php/upload-request.php',
		base_params: {path: params.base_path},
		reset_on_hide: false,
		allow_close_on_upload: true,
		upload_autostart: false
	});
	this.uploadDialog.on('uploadsuccess',this.doRefresh,this);

	// Task Store
	this.store = new FileExplorer.Store(params.base_path);
	
	// Buttons
	this.back_menu = new Ext.menu.Menu();
	this.back_btn = new Ext.SplitButton({
                tooltip: 'Back',
                scale: 'large',
				width: 40,
                iconCls: 'back',
                iconAlign: 'top',
				disabled: true,
				scope: this,
				handler: this.goBack.createDelegate(this,[1]),
				menu : this.back_menu
 	});
	this.forward_menu = new Ext.menu.Menu();
	this.forward_btn = new Ext.SplitButton({
            	tooltip: 'Forward',
                scale: 'large',
				width: 40,
                iconCls: 'forward',
                iconAlign: 'top',
				disabled: true,
				scope: this,
				handler: this.goForward.createDelegate(this,[1]),
				menu : this.forward_menu
   	});
	this.refresh_btn = new Ext.Button({
             	tooltip: 'Refresh',
                scale: 'large',
				width: 40,
                iconCls: 'refresh',
                iconAlign: 'top',
				scope: this,
				handler: this.doRefresh
	});
	this.upload_btn = {
				tooltip: 'Upload File',
                scale: 'large',
				width: 40,
				iconCls:'upload',
				iconAlign: 'top',
				handler: this.openUploadDialog,
				scope: this
	};

	// icon renderer
	function addIcon(val,n,record) {
		return '<span class="row-item '+record.get('cls')+'">' + val + '</span>';
	}
	// file size renderer
	function formatBytes(bytes) {
		var units = ['B', 'KB', 'MB', 'GB', 'TB'];
		bytes = Math.max(bytes,0);
		var power = Math.floor( (bytes ? Math.log(bytes) : 0) / Math.log(1024));
		power = Math.min(power, units.length -1);
		
		bytes /= Math.pow(1024,power);
		return bytes.toFixed(2) + ' ' + units[power];
	}

	// default params
	var default_params = {
		title: params.base_path,
		iconCls:'folder-explore',
		region:'center',
		layout:'anchor',
		border: true,

		enableColumnHide:true,
		enableColumnMove:true,
		
		// toolbar
        tbar: [this.back_btn,this.forward_btn,this.refresh_btn,'->',this.upload_btn],
		
		// View
		view: new Ext.grid.GroupingView({
			forceFit:true,
			ignoreAdd: true,
			emptyText: 'No Files to display',
			onLoad: Ext.emptyFn
		}),
		
		bbar: this.statusbar,
		
		// plugins
		// plugins: [this.completeColumn,new Ext.ux.grid.GroupSummary()],
		
		// columns
		columns: [{
				header: "Filename",
				width:250,
				sortable: true,
				dataIndex: 'filename',
				id: 'filename',
				renderer: addIcon
			},{
				header: "Size",
				width:50,
				sortable: true,
				dataIndex: 'filesize',
				id: 'filesize',
				align: 'right',
				renderer: formatBytes
			},{
				header: "Type",
				width:50,
				sortable: true,
				dataIndex: 'filetype',
				id: 'filetype'
			},{
				header: "Date Modified",
				width: 150,
				sortable: true,
				renderer: Ext.util.Format.dateRenderer('D Y-m-d g:i:s A'),
				dataIndex: 'date_modified'
			}
		]
		};

	Ext.apply(default_params,params);
	
	// adding Events
	this.addEvents('direction_action');
	
	FileExplorer.ViewPanel.superclass.constructor.call(this, default_params);
}

Ext.extend(FileExplorer.ViewPanel, Ext.grid.GridPanel, {
	/*	Function to handle logic associated to loading the store for the view panel
	------------------------------------------------------------------------------*/
	loadStore: function(path,params) {
		// check if params are defined ie: back or forward
		if(params) {
			switch(params.action) {
				case 'forward':
					// set the cur page to be the current page before any action
					var cur_page = this.store.lastOptions.params.path;

					// loop through number of actions by moving cur_page into back_array and forward page into current
					for(i=0;i<params.inc;i++)	{
						this.back_array.push(cur_page);
						cur_page = this.forward_array.pop();
					}	
				break;
				case 'back':
					// set the cur page to be the current page before any action
					var cur_page = this.store.lastOptions.params.path;

					// loop through number of actions by moving cur_page into forward and back page into current
					for(i=0;i<params.inc;i++)	{
						this.forward_array.push(cur_page);
						cur_page = this.back_array.pop();
					}
				break;
			}
		// fixing forward and back arrays when entering directly
		}else{
			this.forward_array = new Array();		// when you go directly, there is no forward
			if(this.store.lastOptions.params)
				this.back_array.push(this.store.lastOptions.params.path);
			else
				this.back_array.push(this.store.baseParams.path);
		}	
		this.fixBackForward();
		
		// setting title and loading store
		this.setTitle(path);
		this.uploadDialog.setBaseParams({path: path});
		this.store.load({params: {path: path}});
		
	},
	/*	simple Function to Refresh store
	------------------------------------------------------------------------------*/
	doRefresh: function() {
		this.store.reload();
	},
	/*	Function to go Back through array
	------------------------------------------------------------------------------*/
	goBack: function(inc) {
		if(!inc) inc=1;
		this.fireEvent('direction_action',{action:'back',path:this.back_array[this.back_array.length-inc],inc:inc});
	},
	goForward: function(inc) {
		if(!inc) inc=1;
		this.fireEvent('direction_action',{action:'forward',path:this.forward_array[this.forward_array.length-inc],inc:inc});
	},	
	fixBackForward: function() {
		this.back_btn.disable();
		this.forward_btn.disable();
		
		this.back_menu.removeAll();
		this.forward_menu.removeAll();
		
		// recreating the back menu
		if(this.back_array.length){
			for(i=this.back_array.length-1,j=1;i>=0;i--,j++)
				this.back_menu.addItem({
				   text: 		j + '. ' + this.back_array[i],
				   scope: 		this,
				   handler:  	this.goBack.createDelegate(this,[j])				   
				});
			this.back_btn.enable();
		}
		
		// recreating the forward menu
		if(this.forward_array.length){
			for(i=this.forward_array.length-1,j=1;i>=0;i--,j++)	
				this.forward_menu.addItem({
					text: 		j + '. ' + this.forward_array[i],
					scope: 		this,
					handler: 	this.goForward.createDelegate(this,[j])	
				});
			this.forward_btn.enable();
		}
	},
	openUploadDialog: function() {
		this.uploadDialog.show('show-button');
	}
});

/**
 * FileExplorer.Store
 * @extends Ext.data.GroupingStore
 *
 * Provides the store for grouping
 * 
 */
FileExplorer.Store = function(base_path){
	
	FileExplorer.Store.superclass.constructor.call(this, {
		autoLoad: true,
		baseParams: {base_path: base_path,path: base_path},
		sortInfo:{field: 'filename', direction: "ASC"},
		proxy: new Ext.data.DirectProxy({
			paramsAsHash: true,
			api: {
				read: 		ExplorerAction.getFiles
			}
		}),
        reader: new Ext.data.JsonReader({
				root: 'rows'
				,totalProperty: 'totalCount'
				//,idProperty: 'taskId'
        		}, 
				[
					{name: 'filename', mapping: 'filename'},	
					{name: 'filepath', mapping: 'filepath'},
					{name: 'base_path', mapping: 'base_path'},
					{name: 'relative_filepath', mapping: 'relative_filepath'},
					{name: 'filesize', mapping: 'filesize', type: 'int'},
					{name: 'filetype', mapping: 'filetype'},
					{name: 'cls', mapping: 'cls'},
					{name: 'date_modified', mapping: 'date_modified',type: 'date', dateFormat: 'Y-m-d g:i:s A'}
				]
		),
		listeners: {
			scope: this,
			beforeload: function() {
				//	this.setBaseParam('is_archive',this.is_archive);
			}
		}
    });

};

Ext.extend(FileExplorer.Store, Ext.data.GroupingStore, {

});