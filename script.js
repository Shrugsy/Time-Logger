
//note: to run from cmd: 'npm start'
//to package: 'npm run build'
// const electron = require("electron");
// const ipc = electron.ipcRenderer;
// document.addEventListener("DOMContentLoaded", function(){
//   ipc.send("mainWindowLoaded");
//   ipc.on("resultSent", function(evt, result){
//     //maybe put updateDB here for the initial run?
//     for(var i = 0; i < result.length; i++){
//       addItemToHTML(result[i].taskTitle.toString(), result[i].timeSpent);
//       //console.log(result[i].TimeSpent);
//     };
//   });
// });



var knex = require("knex")({
  client: "sqlite3",
  connection: {
    filename: "./taskDB.sqlite3"
  },
  useNullAsDefault: true
});

//create table if it does not already exist
knex.schema.createTableIfNotExists('Tasks', function(table){
  table.increments('id').primary().unsigned();
  table.string('taskTitle');
  table.integer('myDate');
  table.integer('timeSpent');
  table.string('myComments');
}).then();

//initialize page by reading sql and adding from the database
let myResult = knex.select().from("Tasks");
myResult.then(function(rows){
  //console.log(rows);
  for(var i = 0; i < rows.length; i++){
    addItemToHTML(rows[i].id, rows[i].taskTitle.toString(), rows[i].timeSpent, rows[i].myDate, rows[i].myComments.toString());
  };
});


//Dictionary constructor function
function Dictionary(){
  this.myTasks = [];

  //work out a way to deal with '0' as an input (doesn't AND together well?)
  //maybe just don't have it here? dunno
  this.add = function(id, taskTitle, timeSpent, myDate, myComments){
    //if(id && taskTitle && timeSpent && myDate){
    //if(id && taskTitle && myDate){
      console.log('Adding: ' + taskTitle + ', ID: ' + id);
      this.myTasks.push({
        id: id,
        taskTitle: taskTitle,
        timeSpent: timeSpent,
        myDate: myDate,
        myComments: myComments
      });
    return this.myTasks;
    //}
  };

  //remove by id
  //[DEBUG]
  //is this the problem function?
  this.removeAt = function(id){
    
    for (var i = 0; i < this.myTasks.length; i++){
      if(this.myTasks[i].id === id){
        console.log('Removing: ' + this.myTasks[i].taskTitle + ', ID: '  + id);
        //this.myTasks.splice(this.myTasks[i], 1);
        this.myTasks.splice(i, 1)
        return this.myTasks;
      }
    }
    return this.myTasks;
  };

  //find by id, return 'taskTitle' if found!
  this.findAt = function(id){
    for (var i = 0; i < this.myTasks.length; i++){
      if(this.myTasks[i].id === id){
        //return this.myTasks[i].taskTitle;
        //return index of that id!
        return i;
      }
    }
    return this.myTasks;
  };

  //get length of dictionary
  this.size = function(){
    return this.myTasks.length;
  };

  //note: use Dictionary.myTasks to return all objects
};

var dict1 = new Dictionary();
//dictionary1.add(1, "task1", 999, 1);
//dictionary1.add(2, "task2", 999, 1);
//dictionary1.add(3, "task3", 999, 1);
//console.log(dictionary1.size())
//for above, remember brackets or it returns the function instead of the value!
//console.log(dictionary1.myTasks);


var taskListElement = document.getElementById("listSection");
var jobItems = taskListElement.getElementsByTagName("li");
jobItems[0].addEventListener('click', function(){jobItems[0].getElementsByTagName("input")[0].checked = true});
//document.getElementById('blank').addEventListener("click", (console.log('printMe')));

var taskComments = taskListElement.getElementsByTagName("textarea");

//var sqlite3 = require('sqlite3').verbose();
//var db = new sqlite3.Database('./taskDB.sqlite3');
//db.run("insert into Tasks values(2050, 'job_raw', 92)");


//get this to work if there is no id as well!
//add another input 'id' where if 'id' = 0, it assigns a new id?
var myThing;
function addItemToDatabase(inID, taskTitle, timeSpent, myDate, myComments){
  //var myThing;
  if (inID == null){
  return myThing = knex('Tasks')
  .insert({
    //do something with date later
    taskTitle: taskTitle,
    timeSpent: timeSpent,
    myDate: myDate,
    myComments: myComments
  })
  .returning('id')
  .then(function(id){
    //inIDGlobal = id;
    //console.log('id within then():  ' + id);
    //console.log('inID within then(): ' + inIDGlobal);
    return id[0];
  });

  console.log(myThing);
  //return inIDGlobal;
} else {
  return knex('Tasks')
  .returning('id')
  .then(function(){
    return inID;
  });
  //inID;
};

}

var inIDGlobal;
function addItemToHTML(inID, taskTitle, timeSpent, myDate, myComments) {
  //set the variable equal to the text box in the html bit
  //below is replaced with the 'taskTitle' function input
  //var taskItem = document.getElementById('taskItem').value;
  //if text box has something then continue

  //if id = 0 or id not found in sql database, then add it and get what id sql comes up with
  //var tmp;
  if (taskTitle != ''){
    
    //adds to database if inID == null. Returns wahtever inID is afterwards
    addItemToDatabase(inID, taskTitle, timeSpent, myDate, myComments).then(function(inID){
      //console.log('inID after then(): ' + inID);

      dict1.add(inID, taskTitle, timeSpent, myDate);
      var myListItem = document.createElement('li');
      var label = document.createElement('label');
      var labelText = document.createTextNode('\xa0' + taskTitle + ":" + '\xa0' );
      var labelEditBox = document.createElement('input');
      var label_1 = document.createElement('label');
      
      var radioEntry = document.createElement('input');
      var editButton = document.createElement('button');
      var removeButton = document.createElement('button');


      var commentTextarea = document.createElement('textarea');
      commentTextarea.class = "form-control";
      commentTextarea.rows = "1";
      //commentTextarea.background = "#ffffff";
      commentTextarea.id = "tmpText";
      commentTextarea.style.background = "#b7b7b7";
      commentTextarea.value = myComments;
      commentTextarea.placeholder = "Notes";

      var myBreak = document.createElement('br');

      labelEditBox.style.background = "#b7b7b7";
      labelEditBox.placeholder = taskTitle;
      labelEditBox.rows = "1";


      //editButton.type = "button";
      //editButton.className = "btn btn-primary btn-sm";
      //editButton.style = "float: right";
      //editButton.innerHTML = "Edit";

      removeButton.type = "button";
      removeButton.className = "btn btn-primary btn-sm";
      removeButton.style = "float: right";
      removeButton.innerHTML = "Delete";

      radioEntry.type = "radio";
      radioEntry.name = "selectedJob";
      //radioEntry.value = taskTitle;
      //console.log(radioEntry.checked);
      label.style = "font-weight:bold"
      label.id = "taskTitle"
      label.appendChild(labelText);

      myListItem.className = "list-group-item";
      
      //can't assign a string to below, list item values are for the order?
      //myListItem.value = taskTitle;
      //myListItem.value = "itsastring";
      myListItem.appendChild(radioEntry);
      myListItem.appendChild(label);
      myListItem.appendChild(label_1);
      myListItem.addEventListener("click", function(){radioEntry.checked = true});
      myListItem.appendChild(removeButton);
      //myListItem.appendChild(editButton);

      taskListElement.appendChild(myListItem);
      taskListElement.appendChild(commentTextarea);
      taskListElement.appendChild(myBreak);
      removeButton.addEventListener("click", function(){deleteTask(myListItem, radioEntry, inID), myBreak.remove(), commentTextarea.remove()});
      //editButton.addEventListener("click", function(){editTask(label, labelEditBox, radioEntry)});
      label.addEventListener("click", function(){editTask(label, labelEditBox, radioEntry)});
      //labelEditBox.addEventListener("blur", saveEdit(label, labelEditBox, radioEntry));
      labelEditBox.onblur = function(){

        for (i = 0; i < dict1.size(); i++){
          if (inID == dict1.myTasks[i].id){
            dict1.myTasks[i].taskTitle = this.value
          }
        }

        //radioEntry.value = this.value;
        label.innerHTML = '\xa0' + this.value + ":" + '\xa0' ;
        this.remove();
      };

      function editTask(inLabel, inLabelEditBox, inRadioEntry){
        
        inRadioEntry.parentNode.insertBefore(inLabelEditBox, inRadioEntry.nextSibling);
        inLabelEditBox.focus();
        inLabel.innerHTML = ":" + '\xa0' ;
      };

      function deleteTask(inListItem, inRdButton, inID){
        //console.log('inID: ' + inID);
        //need to remove from dictionary also!

        if (inRdButton.checked == true){
          console.log('radio button checked');
          defaultRdArr = jobItems[0].getElementsByTagName("input");
          defaultRdArr[0].checked = true;
        }

        inListItem.remove();
        dict1.removeAt(inID);
        
        knex('Tasks')
        //.where('taskTitle = taskTitle')
        .where('id', '=', inID)
        .del()
        .then()
      };
  }); 

  }
}

function formatDate(inDateINT, inDayINT, inMonINT, inYearINT){
  var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  outString = days[inDayINT] + ", " + inDateINT + " " + months[inMonINT] + ", " + inYearINT;
  return outString;
}

function openingTime(){
  var myDate = new Date();
  var h = myDate.getHours();
  var m = myDate.getMinutes();
  var s = myDate.getSeconds();
  h = prettyTime(h);
  m = prettyTime(m);
  s = prettyTime(s);

  myDayOfMonth = myDate.getDate();
  myDay = myDate.getDay();
  myMonth = myDate.getMonth();
  myYear = myDate.getFullYear();

  dateString = formatDate(myDayOfMonth, myDay, myMonth, myYear);

  document.getElementById('openingTimeID').innerHTML = h + ":" + m + ":" + s + ", " + dateString;

}

var loggedTimeCount = 0;
//updateInterval in ms
var updateInterval = 1;

var totHrs = 0;
var totMins = 0;
var totSecs = 0;
var totTimeString = '';

lastLoggedTime = new Date().getTime();

//layout: all tasks show on page, but hide all besides current date with toggle? not sure right now
//may have two database files?
//one for current day and one for all previous days
//when midnight ticks, move all tasks to older one and create current task for new 'current day'?

//this function should loop through each 'list-item' and update the checked one?

//currently it is adding the time to whatever is there, might be ok to leave like this?
function writeTime(inTime){

  loggedTimeCount = 0;
  //for (i = 0; i < jobItems.length; i++){
  for (i = 0; i < dict1.size()+1; i++){
    //!= 0 because 0 is for 'no task'
    if (i > 0){
      //loggedTimeCount += jobItems[i].value;
      loggedTimeCount += dict1.myTasks[i-1].timeSpent;
      var tmpLabel = jobItems[i].getElementsByTagName("label");
      //jobTimeString = formatMilliseconds(jobItems[i].value);
      jobTimeString = formatMilliseconds(dict1.myTasks[i-1].timeSpent);
      tmpLabel[1].innerHTML = jobTimeString;
    }
    rdButton = jobItems[i].getElementsByTagName("input");
    //we look through each task and update only the 'checked' one
    //today.getTime() - lastLoggedTime is to calibrate the time since last call
    //we change the className so that only the selected item shows differently
    if (rdButton[0].checked == true){
      //existing value is added to input value (the time increment amount which is the calibrated time since last 'setTimeout' call)
      //write to dictionary time here!

      if (i > 0){
        dict1.myTasks[i-1].timeSpent += inTime;
      }
      jobItems[i].className = "list-group-item list-group-item-action active";
    }
    else{
      jobItems[i].className = "list-group-item";
    }

    //below is just to display the total logged time on the page
    totTimeString = formatMilliseconds(loggedTimeCount);
    document.getElementById('timePassed').innerHTML = totTimeString;
  }

}

//this function updates the times (and comments?) in the database per interval
function updateDatabaseTimes(){
  //ISSUE: times do not update for new tasks!
  //[DEBUG] fix this issue!

  //loop for each object in dictionary. Is there a more efficient way?
  for (i = 0; i < dict1.size(); i++){
    //console.log('updating database');
    //console.log(i);

    //[DEBUG]
    //fix this later on when its split up into spaces, variable, :, space
    //dict1.myTasks[i].taskTitle = jobItems[i+1].getElementsByTagName("Label")[0].innerHTML;
    dict1.myTasks[i].myComments = taskComments[i].value;


    knex('Tasks')
    .where('id', '=', dict1.myTasks[i].id)
    .update({
      taskTitle: dict1.myTasks[i].taskTitle,
      timeSpent: dict1.myTasks[i].timeSpent,
      myComments: dict1.myTasks[i].myComments
    })
    .then()
    //don't forget .then() so it runs!
  }

  //300000 for 5 minutes, 1200000 for 20 minutes?
  dbUpdateInterval = 500;
  var t = setTimeout(updateDatabaseTimes, dbUpdateInterval);
  //console.log('database updated');

}


//this function should count the time (tickTime) and call writeTime?
function tickTime() {
  //note that this will get the time when you call it
  //today will be a statis object?
    var today = new Date();
    var h = prettyTime(today.getHours());
    var m = prettyTime(today.getMinutes());
    var s = prettyTime(today.getSeconds());

    myDayOfMonth = today.getDate();
    myDay = today.getDay();
    myMonth = today.getMonth();
    myYear = today.getFullYear();

    dateString = formatDate(myDayOfMonth, myDay, myMonth, myYear);
    document.getElementById('currentTime').innerHTML = h + ":" + m + ":" + s + ", " + dateString;
    //above is fine to stay here

    //writeTime(job)
    //var selectedJob = document.querySelector('input[name = "selectedJob"]:checked').value;

    timeCalibrated = today.getTime() - lastLoggedTime;
    writeTime(timeCalibrated);


        lastLoggedTime = today.getTime();
        //setTimeout attempts to call this function every 'updatedInterval' Milliseconds
        //however, this fluctuates so it must be calibrated
        var t = setTimeout(tickTime, updateInterval);
}

function prettyTime(i) {
  if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
  return i;
}

function prettyMillisecondTime(i){
  if (i < 10) {i = "00" + i}
  else if (i < 100) {i = "0" + i};
  return i
}

function formatMilliseconds(inMilliseconds){
  var outHours = 0;
  var outMinutes = 0;
  var outSeconds = 0;
  var outMilliseconds = 0;
  var outString = '';

  outHours = prettyTime(Math.floor(inMilliseconds / 3600000));
  outMinutes = prettyTime(Math.floor((inMilliseconds - (outHours * 3600000)) / 60000));
  outSeconds = prettyTime(Math.floor((inMilliseconds - ((outHours * 3600000) + (outMinutes * 60000)))/1000));
  outMilliseconds = prettyMillisecondTime(inMilliseconds - ((outHours * 3600000) + (outMinutes * 60000) + (outSeconds*1000)));
  outString = outHours + " hrs, " + outMinutes + " m, " + outSeconds + " s, " + outMilliseconds + " ms";

  return outString;
}
