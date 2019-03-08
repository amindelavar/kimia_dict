//**********************includes
const { app, BrowserWindow, ipcMain, globalShortcut, Tray, Menu } = require("electron");
const url = require("url");
const path = require("path");
const fs = require("fs");
const reading_funcs = require("./funcs/reading_funcs");
//**********************vars
const VERSION = "0.5.5";
let tray, lang;
//**********************app ready event
app.on("ready", function() {
    //------------------load config.bn
    var config = reading_funcs.load_config_file(`${__dirname}/config/config.bn`);
    //console.log(lang);
    ipcMain.on('load_config', (event, arg) => {
        if (arg == 'version') event.returnValue = VERSION;
        else if (config[arg] != undefined) event.returnValue = config[arg];
    })
    globalShortcut.register(config['kimia_show_shortcut'], () => {
            console.log(config['kimia_show_shortcut'] + ' is pressed');
            mainWin.show();
            // mainWin.web
            mainWin.focus();
        })
        //hide window  
    globalShortcut.register(config['kimia_hide_shortcut'], () => {
            console.log(config['kimia_hide_shortcut'] + ' is pressed');
            mainWin.hide();
        })
        //load lang
    lang = reading_funcs.load_config_file(`${__dirname}/langs/${config['lang']}.bn`);
    //show main window
    let mainWin = new BrowserWindow({ width: 800, height: 600, show: false, icon: __dirname + '/img/logo_mini.png' /*, webPreferences: { devTools: false } */ });

    //splash screen
    let splashScreen = new BrowserWindow({
        width: 250,
        height: 100,
        useContentSize: true,
        center: true,
        resizable: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        transparent: true,
        opacity: .8,
        frame: false
    });
    splashScreen.loadURL(`file://${__dirname}/html/start.html`);

    //mainWin settings
    mainWin.setMenuBarVisibility(false);
    mainWin.loadURL(`file://${__dirname}/html/index.html`);
    mainWin.on('closed', () => {
        app.quit();
        mainWin = null;
    })
    mainWin.once('ready-to-show', () => {
        splashScreen.destroy();
        mainWin.show();
    });
    //set Tray
    tray = new Tray(`${__dirname}/img/logo_mini.png`);
    tray.setToolTip(lang['kimia_des']);
    var try_menu = Menu.buildFromTemplate([{
            label: lang['show_win'],
            click() {
                mainWin.show();
                mainWin.focus();
            }
        },
        {
            label: lang['exit_app'],
            click() { app.exit(); }
        }
    ]);
    tray.setContextMenu(try_menu);
    tray.on('click', () => { mainWin.show(); });
    //close main window
    mainWin.on('close', (e) => {
        //console.log("dgdhdrh");
        mainWin.hide();
        e.preventDefault();
    });
});