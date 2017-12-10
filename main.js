const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');

//figure out installer some other time and fix the below line (electron-winstaller)
//const app = electron.app

if (handleSquirrelEvent(app)){
  return;
}

// init win
let win;

function createWindow(){
  // Create browser window
  //set up window and use custom logo
  //__dirname is module (?) for current directory
  //win = new BrowserWindow({width:800, heigh:600, icon:__dirname+'/img/pld_logo.png'});
  win = new BrowserWindow({width:800, height:800});



  //hide or show menu bar
  //win.setMenu(null);



  //load index.html page
  //use url module
  win.loadURL(url.format({
    //use path module
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));


  // Open devtools (same as chrome dev tools)
  // () ==> {} is to run a function?
  //win.webContents.openDevTools({detach:true});
  //win.webContents.openDevTools();
  win.on('closed', () => {
    win = null;
  });



}

// Run create window function
app.on('ready', createWindow);

// Quit when all windows are closed
app.on('window-all-closed', () => {
  //check if (not) on mac and quit?
  if(process.platform !== 'darwin'){
    app.quit();
  }
});

function handleSquirrelEvent(application) {
    if (process.argv.length === 1) {
        return false;
    }

    const ChildProcess = require('child_process');
    const path = require('path');

    const appFolder = path.resolve(process.execPath, '..');
    const rootAtomFolder = path.resolve(appFolder, '..');
    const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
    const exeName = path.basename(process.execPath);

    const spawn = function(command, args) {
        let spawnedProcess, error;

        try {
            spawnedProcess = ChildProcess.spawn(command, args, {
                detached: true
            });
        } catch (error) {}

        return spawnedProcess;
    };

    const spawnUpdate = function(args) {
        return spawn(updateDotExe, args);
    };

    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
        case '--squirrel-install':
        case '--squirrel-updated':
            // Optionally do things such as:
            // - Add your .exe to the PATH
            // - Write to the registry for things like file associations and
            //   explorer context menus

            // Install desktop and start menu shortcuts
            spawnUpdate(['--createShortcut', exeName]);

            setTimeout(application.quit, 1000);
            return true;

        case '--squirrel-uninstall':
            // Undo anything you did in the --squirrel-install and
            // --squirrel-updated handlers

            // Remove desktop and start menu shortcuts
            spawnUpdate(['--removeShortcut', exeName]);

            setTimeout(application.quit, 1000);
            return true;

        case '--squirrel-obsolete':
            // This is called on the outgoing version of your app before
            // we update to the new version - it's the opposite of
            // --squirrel-updated

            application.quit();
            return true;
    }
};
