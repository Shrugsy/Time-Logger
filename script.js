
//note: to run from cmd: 'npm start'
//to package: 'npm run build'

var taskListElement = document.getElementById("listSection");
var jobItems = taskListElement.getElementsByTagName("li");
var jobList = [];
var myIndex = 0;
jobItems[0].addEventListener('click', function(){jobItems[0].getElementsByTagName("input")[0].checked = true});
//document.getElementById('blank').addEventListener("click", (console.log('printMe')));

function addItem() {
  //set the variable equal to the text box in the html bit
  var taskItem = document.getElementById('taskItem').value;
  //if text box has something then continue
  if (taskItem != ''){
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
    radioEntry.value = taskItem;
    //console.log(radioEntry.checked);


    label.style = "font-weight:bold"
    label.appendChild(document.createTextNode('\xa0' + taskItem + ":" + '\xa0' ));

    myListItem.className = "list-group-item";
    myListItem.value = 0;
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

function startTime() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    h = prettyTime(h);
    m = prettyTime(m);
    s = prettyTime(s);

    myDayOfMonth = today.getDate();
    myDay = today.getDay();
    myMonth = today.getMonth();
    myYear = today.getFullYear();

    dateString = formatDate(myDayOfMonth, myDay, myMonth, myYear);
    document.getElementById('currentTime').innerHTML = h + ":" + m + ":" + s + ", " + dateString;

    var selectedJob = document.querySelector('input[name = "selectedJob"]:checked').value;

    loggedTimeCount = 0;
    for (i = 0; i < jobItems.length; i++){
        if (i != 0){
        loggedTimeCount += jobItems[i].value;
        var tmpLabel = jobItems[i].getElementsByTagName("label");
        jobTimeString = formatMilliseconds(jobItems[i].value);
        tmpLabel[1].innerHTML = jobTimeString;
      }

        rdButton = jobItems[i].getElementsByTagName("input");
        selectedState = rdButton[0].checked;

        if (selectedState == true){
          jobItems[i].value += (((today.getTime() - lastLoggedTime)));
          jobItems[i].className = "list-group-item list-group-item-action active";
        }
        else{
          jobItems[i].className = "list-group-item";
        }

        totTimeString = formatMilliseconds(loggedTimeCount);
        document.getElementById('timePassed').innerHTML = totTimeString;

      }

        lastLoggedTime = today.getTime();
        var t = setTimeout(startTime, updateInterval);
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
