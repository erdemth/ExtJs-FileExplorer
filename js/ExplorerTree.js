Ext.ns('FileExplorer');

/**
 * FileExplorer.ExplorerTree
 * @extends Ext.Panel
 *
 * This Panel contains a Tree for exploring the Filesystem
 * 
 */
FileExplorer.ExplorerTree = function(params) {

	var default_params = {
		title: 'Explorer',
		region:'west',
		collapsible: true,
		collapseMode: 'mini',

		width: 175,
		minSize: 130,
		maxSize: 400,
		
		rootVisible: true,
		lines: false,
		useArrows: true,
		split: true,
		autoScroll: true,
		
		root: new Ext.tree.AsyncTreeNode({
			text:	params.base_path,
			id:		params.base_path,
			expanded:true
		}),
		loader : new Ext.tree.TreeLoader({
			directFn: ExplorerAction.getFolderList,
			paramsAsHash: true,
			baseParams: {base_path: ''}
		})
	};

	Ext.apply(default_params,params);
	
	FileExplorer.ExplorerTree.superclass.constructor.call(this, default_params);
}

Ext.extend(FileExplorer.ExplorerTree, Ext.tree.TreePanel, {
	/*	Utility functions for working with paths and arrays
	-------------------------------------------------------*/
	pathToArray: function(path) {
		return path.split('/');
	},
	arrayToPath: function(a) {
		return a.join('/');
	},
	
	/*	Function to Find a Node and Highlight it (no click)
	-------------------------------------------------------*/
	selectNode: function(id,expand) {
		var node = this.getNodeById(id);

		// can directly select the node
		if(node){	
			this.ensureVisible(node);
			if(expand)	node.expand(false);
			
		// can't select node, so need to traverse tree recursively starting at parent 
		} else {
			var select_path_array = this.pathToArray(id);
			var parent_path_array = this.pathToArray(id);
			parent_path_array.pop();
			this._findNodeByAncestors(parent_path_array,select_path_array,function(success,node) {
				if(success)	this.ensureVisible(node);
			},this);
		}
	},

	/*	Function to recursively traverse the tree using the given path to find the node
	-------------------------------------------------------*/
	_findNodeByAncestors: function(ancestor_path_array,select_path_array,callback,scope) {

		// cur_node is ancestor of Node we are looking for
		var ancestor_node = this.getNodeById(this.arrayToPath(ancestor_path_array));
		
		// ancestor node found
		if(ancestor_node){

			// expand ancestor and try to select the child, if not selectable, that means node may be present in descendants
			ancestor_node.expand(false,true,function() {
				select_node = this.getNodeById(this.arrayToPath(select_path_array));

				// select node found, select it !
				if(select_node)	{
					callback.createDelegate(scope,[true,select_node])();
					return;
					
				// select node not found, then send child of ancestor
				} else {
					
					// Stop recursion when ancestor path is back to select_path
					if(ancestor_path_array.length+1 >= select_path_array.length) {
						callback.createDelegate(scope,[false,null])();
						return;
					}
					var child_path_array = select_path_array.slice(0,ancestor_path_array.length+1);
					this._findNodeByAncestors(child_path_array,select_path_array,callback,scope);
				}
			},this);
			
		// select node is not child of this node, then go to parent
		} else {
			ancestor_path_array.pop();
			
			// Stop recursion when there are no more ancestors
			if(ancestor_path_array.length == 0) {
				callback.createDelegate(scope,[false,null])();
				return;
			}
			
			return this._findNodeByAncestors(ancestor_path_array,select_path_array,callback,scope);
		}
	},

	/*	Function to ensure a node is visible and selected
	-------------------------------------------------------*/
	ensureVisible: function(node) {
		node.select();
		if(node.parentNode)	this.expandAncestors(node.parentNode);
	},
	
	/*	Function to recursively expand a nodes parents
	-------------------------------------------------------*/
	expandAncestors: function(node) {
		node.expand(false);
		if(node.parentNode) this.expandAncestors(node.parentNode);
	}
});