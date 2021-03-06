/**
 *
 * Author(s):
 * + x10c-Lab
 *   - agus sugianto (agus.delonge@gmail.com)
 */

var m_app_adm_user;
var m_app_adm_user_d = _g_root +'/module/app_adm_user/';

function M_AppAdmUser()
{
	this.ha_level	= 0;
	this.id_user		= 0;

	this.record = new Ext.data.Record.create([
			{name: 'id_user'}
		,	{name: 'pass'}
		,	{name: 'stat'}
		]);

	this.store = new Ext.ux.data.PagingArrayStore({
			url		: m_app_adm_user_d +'data.jsp'
		,	fields	: this.record
		,	autoLoad: false
		,	idIndex	: 0
		});

	this.form_user = new Ext.form.TextField({
			fieldLabel	: 'ID User'
		,	allowBlank	: false
		,	width		: 200
		});
		
	this.form_pass = new Ext.form.TextField({
			fieldLabel	: 'Kata Kunci'
		,	name		: 'password'
		,	inputType	: 'password'
		,	allowBlank	: false
		,	width		: 200
		});

	this.form_stat = new Ext.form.Checkbox();

	this.btn_add = new Ext.Button({
			text	: 'Tambah'
		,	iconCls	: 'add16'
		,	scope	: this
		,	handler	: function() {
				this.do_add();
			}
		});

	this.btn_ref = new Ext.Button({
			text		: 'Refresh'
		,	iconCls		: 'refresh16'
		,	scope		: this
		,	handler		: function() {
				this.do_load();
			}
		});

	this.btn_del = new Ext.Button({
			text		: 'Hapus'
		,	iconCls		: 'del16'
		,	disabled	: true
		,	scope		: this
		,	handler		: function() {
				this.do_del();
			}
		});

	this.btn_edit = new Ext.Button({
			text		: 'Ubah'
		,	iconCls		: 'edit16'
		,	scope		: this
		,	handler		: function() {
				this.do_change_password();
			}
		});

	this.btn_cancel = new Ext.Button({
			text	: 'Batal'
		,	iconCls	: 'del16'
		,	scope	: this
		,	handler	: function() {
				this.do_cancel();
			}
	});

	this.btn_save = new Ext.Button({
			text		: 'Simpan'
		,	iconCls		: 'save16'
		,	scope		: this
		,	handler		: function() {
				this.do_save();
			}
		});

	this.cm = new Ext.grid.ColumnModel({
		columns: [
				new Ext.grid.RowNumberer({width:40})
			,{
				id			: 'id_user'
			,	header		: 'ID User'
			,	dataIndex	: 'id_user'
			,	filterable	: true
			},{
				header		: 'Status Aktif'
			,	dataIndex	: 'stat'
			,	align		: 'center'
			,	editor		: this.form_stat
			,	renderer	: function(value) {
					if (value == '1') {
						return 'Aktif';
					}
					return 'Tidak Aktif';
				}
			}]
	,	defaults: {
			sortable	: true
		}
	});

	this.sm = new Ext.grid.RowSelectionModel({
			singleSelect	: true
		,	listeners	: {
				scope		: this
			,	selectionchange	: function(sm) {
					var data = sm.getSelections();

					if (data.length && this.ha_level == 4) {
						this.btn_del.setDisabled(false);
					} else {
						this.btn_del.setDisabled(true);
					}
				}
			}
		});

	this.editor = new MyRowEditor(this);

	this.filters = new Ext.ux.grid.GridFilters({
			encode	: true
		,	local	: true
		});

	this.panel = new Ext.grid.GridPanel({
			title				: 'Daftar User'
		,	id					: 'app_adm_user_panel'
		,	autoExpandColumn	: 'id_user'
		,	store				: this.store
		,	sm					: this.sm
		,	cm					: this.cm
		,	plugins				: [this.editor, this.filters]
		,	tbar				: [
				this.btn_ref
			,	'-'
			,	this.btn_add
			,	'-'
			,	this.btn_edit
			,	'-'
			,	this.btn_del
			]
		,	bbar		: new Ext.PagingToolbar({
				store	: this.store
			,	pageSize: 50
			,	plugins	: [this.filters]
			})
		,       listeners       : {
				scope		: this
			,	rowclick	:
					function (g, r, e) {
						return this.do_edit();
					}
			}
		});

	this.win_add = new Ext.Window({
		title		: 'Pengaturan User'
	,	modal		: true
	,	layout		: 'form'
	,	labelAlign	: 'left'
	,	padding		: 6
	,	closable	: false
	,	resizable	: false
	,	plain		: true
	,	autoHeight	: true
	,	width		: 350
	,	items		: [
			this.form_user
		,	this.form_pass
		]
	,	bbar		: [
			this.btn_cancel, '->'
		,	this.btn_save
		]
	});

	this.do_change_password = function()
	{
		if (this.ha_level < 3) {
			return false;
		}

		var data = this.sm.getSelections();
		if (!data.length) {
			return false;
		}

		var r = data[0];

		this.id_user = r.data['id_user'];
		this.form_user.setValue(r.data['id_user']);
		this.form_user.setReadOnly(true);
		this.form_pass.setValue('');

		this.dml_type = '3';

		this.win_add.show();
		return true;
	}

	this.do_edit = function()
	{
		if (this.ha_level >= 3) {
			this.dml_type = 'update_stat';
			return true;
		}
		return false;
	}

	this.do_add = function()
	{
		this.dml_type = '2';

		this.form_stat.setValue(true);
		this.form_user.setValue('');
		this.form_user.setReadOnly(false);
		this.form_pass.setValue('');

		this.win_add.show();
	}

	this.do_del = function()
	{
		var data = this.sm.getSelections();
		if (!data.length) {
			return;
		}

		this.dml_type = '4';
		this.do_save(data[0]);
	}

	this.do_save = function(record)
	{
		var id_user;
		var pass	= this.form_pass.getValue();
		var passenc	= '';
		var aktif	= (this.form_stat.getValue() == true) ? '1' : '0';

		if (this.dml_type == '2') {
			id_user	= this.form_user.getValue();
			passenc	= Sha256.hash(pass, true);
		} else
		if (this.dml_type == '3') {
			id_user	= this.id_user;
			passenc	= Sha256.hash(pass, true);
		} else
		if (this.dml_type == 'update_stat'
		||  this.dml_type == '4') {
			id_user = record.data['id_user'];
		}

		Ext.Ajax.request({
			params  : {
				dml_type	: this.dml_type
			,	id_user		: id_user
			,	password	: passenc
			,	status_user	: aktif
			}
		,	url	: m_app_adm_user_d +'submit.jsp'
		,	scope	: this
		,	waitMsg	: 'Mohon Tunggu ...'
		,	success : function (response) {
				var msg = Ext.util.JSON.decode(response.responseText);

				if (msg.success == false) {
					Ext.MessageBox.alert(
					'Pesan Kesalahan', msg.info);
				}

				this.win_add.hide();
				this.do_load();
			}
		});
	}

	this.do_cancel = function()
	{
		this.win_add.hide();
	}

	this.do_load = function()
	{
		delete this.store.lastParams;

		this.store.load({
			params	: {
				start	: 0
			,	limit	: 50
			}
		});
	}

	this.do_refresh = function(ha_level)
	{
		this.ha_level = ha_level;

		if (this.ha_level <= 1) {
			this.btn_add.setDisabled(true);
		} else {
			this.btn_add.setDisabled(false);
		}

		this.do_load();
	}
}

m_app_adm_user = new M_AppAdmUser();

//@ sourceURL=app_adm_user.layout.js
