
//note: to run from cmd: 'npm start'
//to package: 'npm run build'
const electron = require("electron");
const ipc = electron.ipcRenderer;
document.addEventListener("DOMContentLoaded", function(){
  ipc.send("mainWindowLoaded");
  ipc.on("resultSent", function(evt, result){
    for(var i = 0; i < result.length; i++){
      addItem(result[i].taskTitle.toString(), result[i].timeSpent);
      //console.log(result[i].TimeSpent);
    };
  });
});

var taskListElement = document.getElementById("listSection");
var jobItems = taskListElement.getElementsByTagName("li");
var jobList = [];
var myIndex = 0;
jobItems[0].addEventListener('click', function(){jobItems[0].getElementsByTagName("input")[0].checked = true});
//document.getElementById('blank').addEventListener("click", (console.log('printMe')));


//var sqlite3 = require('sqlite3').verbose();
//var db = new sqlite3.Database('./taskDB.sqlite3');
//db.run("insert into Tasks values(2050, 'job_raw', 92)");




function addItem(taskName, taskSeconds) {
  //set the variable equal to the text box in the html bit
  //below is replaced with the 'taskName' function input
  //var taskItem = document.getElementById('taskItem').value;
  //if text box has something then continue
  if (taskName != ''){
    var myListItem = document.createElement('li');
    var label = document.createElement('label');
    var label_1 = document.createElement('label');
    var radioEntry = document.createElement('input');
    var removeButton = document.createElement('button');
    var myBreak = document.createElement('br');

    removeButton.type = "button";
    removeButton.className = "btn btn-primary btn-sm";
    removeButton.style = "float: right";
    removeButton.innerHTML = "Delete Task";

    radioEntry.type = "radio";
    radioEntry.name = "selectedJob";
    radioEntry.value = taskName;
    //console.log(radioEntry.checked);


    label.style = "font-weight:bold"
    label.appendChild(document.createTextNode('\xa0' + taskName + ":" + '\xa0' ));

    myListItem.className = "list-group-item";
    myListItem.value = taskSeconds;
    myListItem.appendChild(radioEntry);
    myListItem.appendChild(label);
    myListItem.appendChild(label_1);
    myListItem.addEventListener("click", function(){radioEntry.checked = true});
    myListItem.appendChild(removeButton);

    taskListElement.appendChild(myListItem);
    taskListElement.appendChild(myBreak);
    removeButton.addEventListener("click", function(){deleteTask(myListItem, radioEntry), myBreak.remove()});

    function deleteTask(inListItem, inRdButton){

      if (inRdButton.checked == true){
        defaultRdArr = jobItems[0].getElementsByTagName("input");
        defaultRdArr[0].checked = true;
      }
      inListItem.remove();
    }
    myIndex = myIndex + 1;
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
  for (i = 0; i < jobItems.length; i++){
    //!= 0 because 0 is for 'no task'
    if (i != 0){
      loggedTimeCount += jobItems[i].value;
      var tmpLabel = jobItems[i].getElementsByTagName("label");
      jobTimeString = formatMilliseconds(jobItems[i].value);
      tmpLabel[1].innerHTML = jobTimeString;
    }
    rdButton = jobItems[i].getElementsByTagName("input");
    //we look through each task and update only the 'checked' one
    //today.getTime() - lastLoggedTime is to calibrate the time since last call
    //we change the className so that only the selected item shows differently
    if (rdButton[0].checked == true){
      jobItems[i].value += (inTime);
      jobItems[i].className = "list-group-item list-group-item-action active";
    }
    else{
      jobItems[i].className = "list-group-item";
    }
    totTimeString = formatMilliseconds(loggedTimeCount);
    document.getElementById('timePassed').innerHTML = totTimeString;
  }

}


//function addListener
window.onbeforeunload = function(e){
  updateDB();
  //alert("test");
  //e.returnValue = "Exiting!";
  //return "this is a string";
  return null;
}

function addListener(){
  window.addEventListener('beforeunload', onbeforeunload);
  function onbeforeunload(e){
    alert('test');
    updateDB();
    //var t = setTimeout(updateDB(),1000);
    //var t = setTimeout(updateDB(),1000);
    //e.returnValue = false;
    //return null;
  }

}


//this function should write all tasks to the database
function updateDB(){

  //var sqlite3 = require('sqlite3').verbose();
  //var db = new sqlite3.Database('./taskDB.sqlite3');
  //db.run("delete from Tasks");
  //db.run("insert into Tasks values(2050, 'job_raw', 92)");


  //alert('test');
  //alert(db);


  //alert("Saving data");
  var knex = require("knex")({
    client: "sqlite3",
    connection: {
      filename: "./taskDB.sqlite3"
    },
    useNullAsDefault: true
  });

  //console.log(knex);

  //this deletes all existing entries from the sqlite3 database
  //maybe there is a better way to handle this?

  //when run 'onload', items are deleted but new items not re-inserted?
  //they dont' exist yet?
  //begin bulk cmt
  console.log(jobItems.length);
  if (jobItems.length > 1){
    knex('Tasks').del().then();

    //note: we use i = 1 and not 0 here because 0 is for 'no task'!
    for (i = 1; i < jobItems.length; i++){
      //below writes each task to the sqlite3 database!
      knex('Tasks').insert({
        //do something with date later
        myDate: 0,
        taskTitle: jobItems[i].getElementsByTagName("input")[0].value,
        timeSpent: jobItems[i].value
      }).then();
    }
  }


  //end bulk cmt



  //alert(knex);
  //alert(jobItems[1]);
  //alert(jobItems[1].value);
  //I think below is 20 minutes (in milliseconds)
  //the idea is that this saves every x minutes
  //300000 for 5 minutes, 1200000 for 20 minutes?
  dbUpdateInterval = 10000;
  var t = setTimeout(updateDB, dbUpdateInterval);

  //var t = setTimeout(updateDB, 1000);
  console.log('database updated!');
  //return null;
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
