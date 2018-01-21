const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
//figure out installer some other time and fix the below line (electron-winstaller)
//const app = electron.app

if (handleSquirrelEvent(app)){
  return;
}

var knex = require("knex")({
  client: "sqlite3",
  connection: {
    filename: "./taskDB.sqlite3"
  },
  useNullAsDefault: true
});

class Store{
  constructor(opts) {
    // Renderer process has to get `app` module via `remote`, whereas the main process can get it directly
    // app.getPath('userData') will return a string of the user's app data directory path.
    const userDataPath = (app || remote.app).getPath('userData');
    console.log(userDataPath);
    // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
    this.path = path.join(userDataPath, opts.configName + '.json');
    //console.log(this.path);

    this.data = parseDataFile(this.path, opts.defaults);
  }

  // This will just return the property on the `data` object
  get(key) {
    return this.data[key];
  }

  // ...and this will set it
  set(key, val) {
    this.data[key] = val;
    // Wait, I thought using the node.js' synchronous APIs was bad form?
    // We're not writing a server so there's not nearly the same IO demand on the process
    // Also if we used an async API and our app was quit before the asynchronous write had a chance to complete,
    // we might lose that data. Note that in a real app, we would try/catch this.
    fs.writeFileSync(this.path, JSON.stringify(this.data));
  }
}

function parseDataFile(filePath, defaults) {
  // We'll try/catch it in case the file doesn't exist yet, which will be the case on the first application run.
  // `fs.readFileSync` will return a JSON string which we then parse into a Javascript object
  try {
    return JSON.parse(fs.readFileSync(filePath));
  } catch(error) {
    // if there was some kind of error, return the passed in defaults instead.
    return defaults;
  }
}

// expose the class
module.exports = Store;


const store = new Store({
  // We'll call our data file 'user-preferences'
  configName: 'user-preferences',
  defaults: {
    // 800x600 is the default size of our window
    windowBounds: { width: 800, height: 800 }
  }
})


// init win
let win;

function createWindow(){
  // Create browser window
  //set up window and use custom logo
  //__dirname is module (?) for current directory
  //win = new BrowserWindow({width:800, heigh:600, icon:__dirname+'/img/pld_logo.png'});
  //win = new BrowserWindow({width:800, height:800});
  // First we'll get our height and width. This will be the defaults if there wasn't anything saved
  let { width, height } = store.get('windowBounds');

  // Pass those values in to the BrowserWindow options
  win = new BrowserWindow({ width, height });

  // The BrowserWindow class extends the node.js core EventEmitter class, so we use that API
  // to listen to events on the BrowserWindow. The resize event is emitted when the window size changes.
  win.on('resize', () => {
    // The event doesn't pass us the window size, so we call the `getBounds` method which returns an object with
    // the height, width, and x and y coordinates.
    let { width, height } = win.getBounds();
    // Now that we have them, save them using the `set` method.
    store.set('windowBounds', { width, height });
    //store.set('test', {});
  });



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

  win.once("ready-to-show", () => {win.show()});
  win.once("ready-to-show", () => {console.log("READY TO SHOW!")});

  // ipcMain.on("mainWindowLoaded", function (){
  //   knex.schema.createTableIfNotExists('Tasks', function (table){
  //     table.integer('myDate');
  //     table.string('taskTitle');
  //     table.integer('timeSpent');

  //   }).then();

  //   let result = knex.select().from("Tasks")
  //   result.then(function(rows){
  //     win.webContents.send("resultSent", rows);
  //   });
  // });


  // Open devtools (same as chrome dev tools)
  // () ==> {} is to run a function?
  //win.webContents.openDevTools({detach:true});
  //win.webContents.openDevTools();
  win.on('closed', () => {
    win = null;
  });

  //below doesnt even work
  //var imported = document.createElement('script');
  //imported.src = './script.js';
  //document.head.appendChild(imported);
  //win.onbeforeunload = updateDB();
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

//global.jQuery = require('jquery');
//$.getScript('./script.js');
//win.onbeforeunload = updateDB();




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
