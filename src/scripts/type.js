/* 
 * System Designer
 *
 * https://system-designer.github.io
 *
 * Copyright 2016 Erwan Carriou
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

runtime.on('ready', function () {
    var system = this.system('design');

    // DIALOG COPYRIGHT
    var DialogCopyright = this.require('DialogCopyright');
    DialogCopyright.on('init', function (config) {
        var html = '',
            dom = null;

        $('#designer-dialog-copyright').empty();

        html = this.require('dialog-modal-copyright.html');
        document.querySelector('#designer-dialog-copyright').insertAdjacentHTML('afterbegin',
            html.source()
                .replace(/{{title}}/gi, this.title())
                .replace(/{{message}}/gi, this.message())
        );

        //events
        dom = document.getElementById('designer-dialog-copyright-modal-ok');
        dom.addEventListener('click', function (event) {
            this.ok();
        }.bind(this));

    });

    DialogCopyright.on('show', function () {
        $('#designer-dialog-copyright-modal').modal('show');
    });

    DialogCopyright.on('hide', function () {
        $('#designer-dialog-copyright-modal').modal('hide');
    });

    // MenuBar
    var MenuBar = this.require('MenuBar');
    MenuBar.on('init', function (conf) {
        var menuHeader = [],
            menuItems = [],
            menuActions = [],
            menuSearch = [],
            self = this;

        // menu header
        menuHeader = this.require('db').collections().MenuHeader.find({
            "type": this.designer().type()
        });
        this.header(this.require(menuHeader[0]._id));

        // menu items
        menuItems = this.require('db').collections().MenuItem.find({
            "type": this.designer().type()
        });

        menuItems.sort(function (itemA, itemB) {
            if (itemA.position > itemB.position) {
                return 1;
            }
            if (itemA.position < itemB.position) {
                return -1;
            }
            return 0;
        });

        menuItems.forEach(function (menuItem) {
            var id = menuItem._id;
            self.items().push(self.require(id));
        });

        // menu actions
        menuActions = this.require('db').collections().MenuAction.find({
            "type": this.designer().type()
        });

        menuSearch = this.require('db').collections().MenuSearch.find({
            "type": this.designer().type()
        });

        menuActions = menuActions.concat(menuSearch);

        menuActions.sort(function (itemA, itemB) {
            if (itemA.position > itemB.position) {
                return 1;
            }
            if (itemA.position < itemB.position) {
                return -1;
            }
            return 0;
        });

        menuActions.forEach(function (menuAction) {
            var id = menuAction._id;
            self.actions().push(self.require(id));
        });

    });

    MenuBar.on('render', function () {
        var length = 0,
            i = 0,
            item = null,
            domHeader = document.getElementById('designer-menubar-header'),
            domItems = document.getElementById('designer-menubar-items'),
            domAction = document.getElementById('designer-menubar-actions'),
            self = this;

        function _removeActive() {
            var length = 0,
                i = 0,
                item = null;

            length = domItems.children.length;
            for (i = 0; i < length; i++) {
                item = domItems.children[i];
                $(item).removeClass('active');
            }
        }

        // header
        domHeader.insertAdjacentHTML('afterbegin', this.header().html().source());

        // items
        this.items().forEach(function (item) {
            domItems.insertAdjacentHTML('beforeend', '<li>' + item.html().source() + '</>');
        });

        // events
        var callback = function () {
            _removeActive();
            $(this).addClass('active');
        };
        length = domItems.children.length;
        for (i = 0; i < length; i++) {
            item = domItems.children[i];
            item.addEventListener('click', callback);
            item.addEventListener('click', function () {
                this.click();
            }.bind(self.items(i)));
        }

        // actions
        this.actions().forEach(function (action) {
            domAction.insertAdjacentHTML('afterbegin', '<li>' + action.html().source() + '</>');
        });

        // focus on first element
        if (length > 0) {
            this.designer().context(this.items(0).name());
            item = domItems.children[0];
            $(item).addClass('active');
        }
    });

    // ToolBar
    var ToolBar = this.require('ToolBar');
    ToolBar.on('init', function (conf) {
        var toolBarItems = [],
            self = this;

        // items
        toolBarItems = this.require('db').collections().ToolBarItem.find({
            "type": this.designer().type()
        });

        // sort items
        toolBarItems.sort(function (itemA, itemB) {
            if (itemA.position > itemB.position) {
                return 1;
            }
            if (itemA.position < itemB.position) {
                return -1;
            }
            return 0;
        });

        toolBarItems.forEach(function (toolBarItem) {
            var id = toolBarItem._id;
            self.items().push(self.require(id));
        });
    });

    ToolBar.on('render', function () {
        var domItems = document.getElementById('designer-toolbar-items'),
            i = 0,
            length = 0,
            item = null,
            self = this;

        // items
        this.items().forEach(function (item) {
            domItems.insertAdjacentHTML('beforeend', '<li>' + item.html().source() + '</>');
        });

        // events
        length = domItems.children.length;
        for (i = 0; i < length; i++) {
            item = domItems.children[i];
            item.addEventListener('click', function () {
                this.click();
            }.bind(self.items(i)));
        }
    });

    // Workspace
    var Workspace = this.require('Workspace');
    Workspace.on('init', function (conf) {
        var Editor = null,
            designer = null,
            editor = null;

        Editor = this.require('Editor');
        designer = this.require('designer');

        if (designer.isCordova()) {
            editor = new Editor({
                '_id': 'editor',
                'type': 'codemirror',
                'context': 'type',
                'editor': CodeMirror($('#designer-editor')[0], {
                    lineNumbers: true,
                    styleActiveLine: true,
                    'mode': 'application/json',
                    'theme': 'eclipse',
                    'tabSize': 2,
                    'autoCloseBrackets': true
                })
            });
        } else {
            editor = new Editor({
                '_id': 'editor',
                'type': 'ace',
                'context': 'type',
                'editor': ace.edit('designer-editor')
            });
        }
    });

    Workspace.on('render', function () {
        this.require('editor').render();
    });

    // Server
    var Server = this.require('Server');
    Server.on('start', function () {
        var RuntimeChannel = null,
            channel = null,
            id = '',
            system = null,
            designer = this.require('designer'),
            editor = this.require('editor');

        this.require('storage').on('changed', function (obj) {
            if (typeof obj['system-designer-message'] !== 'undefined') {
                $db.RuntimeMessage.insert(obj['system-designer-message'].newValue);
            }
        }, true);

        RuntimeChannel = this.require('RuntimeChannel');
        channel = new RuntimeChannel({
            '_id': 'channel'
        });

        channel.on('send', function (message) {
            if (message.event.indexOf('$system') !== 0) {
                var config = this.require('storage').get('system-designer-config'),
                    designer = this.require('designer'),
                    messages = [];

                if (designer.isCordova()) {
                    messages = designer.messages();
                    messages.push(message);
                    designer.messages(messages);
                }

                this.require('storage').set('system-designer-message', message);

                // message for server debug
                if (typeof config !== 'undefined' && typeof config.debugType !== 'undefined' && config.debugType === 'server' && config.urlServer) {
                    $.post(config.urlServer + ':8888/' + message.event, encodeURIComponent(JSON.stringify(message.data)));
                }
            }
        });

        id = document.location.href.split('#')[1].split('?')[0];
        systemId = document.location.href.split('#')[2].split('?')[0];

        system = this.require('storage').get(systemId);
        type = system.types[id];

        designer.store().uuid(id);
        designer.store().data(type);

        document.title = 'type ' + id + ' · system ' + system.name;

        editor.initValue(JSON.stringify(type, null, '\t'), 2);
    }, true);

    // Designer
    var Designer = this.require('Designer');
    Designer.on('init', function (conf) {
        var Store = null,
            store = null,
            MenuBar = null,
            menubar = null,
            ToolBar = null,
            toolbar = null,
            Workspace = null,
            workspace = null,
            Server = null,
            server = null;

        // type
        this.type(window.location.href.split('.html')[0].split('/')[window.location.href.split('.html')[0].split('/').length - 1]);

        // store
        Store = this.require('Store');
        store = new Store();

        // menu
        MenuBar = this.require('MenuBar');
        menubar = new MenuBar({
            designer: this
        });
        ToolBar = this.require('ToolBar');
        toolbar = new ToolBar({
            designer: this
        });

        // workspace
        Workspace = this.require('Workspace');
        workspace = new Workspace({
            designer: this
        });

        // server
        Server = this.require('Server');
        server = new Server({
            'designer': this
        });

        this.store(store);
        this.menubar(menubar);
        this.toolbar(toolbar);
        this.workspace(workspace);
        this.server(server);
    });

    Designer.on('render', function () {
        if (this.isCordova()) {
            this.updateCordovaContext();
        }
        this.menubar().render();
        this.toolbar().render();
        this.workspace().render();
        this.server().start();

        this.updateRouter();

        // TODO create a function
        $(function () {
            $('[data-toggle="tooltip"]').tooltip({ 'container': 'body', delay: { "show": 1000, "hide": 100 } });
        });
    });

    Designer.on('updateRouter', function () {
        var menubar = [],
            i = 0,
            length = 0,
            id = '',
            href = '';

        id = decodeURIComponent(document.location.href.split('#')[1]);
        collection = document.location.href.split('#')[2];

        // update menubar
        menubar = $('#designer-menubar-items > li > a');
        length = menubar.length;
        for (i = 0; i < length; i++) {
            href = menubar[i].href;
            context = href.split('#')[href.split('#').length - 1];
            menubar[i].href = '#' + id + '#' + collection + '#' + context;
        }
    });

    Designer.on('clear', function () {
        this.refresh();
    });

    Designer.on('context', function (val) {
        this.workspace().clear();
        this.workspace().refresh();
    });

    Designer.on('save', function () {
        var val = this.require('editor').getValue(),
            type = null,
            designer = this.require('designer'),
            message = this.require('message');

        try {
            type = JSON.parse(val);
        } catch (e) {
            message.danger('Can not save your type: your type has an invalid structure.');
            return;
        }

        if (!type.name) {
            message.danger('The property \'name\' is missing.');
            return;
        }

        if (!type.type) {
            message.danger('The property \'type\' is missing.');
            return;
        }

        if (type._id && type._id.indexOf(' ') !== -1) {
            message.danger('Invalid \'_id\'. <br>Space is not authorized in the value of \'_id\'.');
            return;
        }

        designer.store().data(type);

        // check if ID change
        if (designer.store().uuid() !== designer.store().data().name) {
            this.require('channel').$editorDeleteType(designer.store().uuid());
            designer.store().uuid(designer.store().data().name);

            // update title
            document.title = 'type ' + designer.store().uuid() + ' · ' + document.title.split('·')[1].trim();
        }

        this.require('channel').$editorUpdateType(designer.store().uuid(), designer.store().data());
        message.success('Type saved.');
    });

    // start
    system.on('start', function start() {
        var Designer = null,
            designer = null;

        Designer = this.require('Designer');
        designer = new Designer({
            '_id': 'designer'
        });
        designer.render();
    });

    system.start();
});