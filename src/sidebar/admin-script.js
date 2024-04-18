
//Script for Admin 

//import for SDKs
import { FirebaseApp } from './firebase';
import {getAuth,signInWithCredential,GoogleAuthProvider} from 'firebase/auth';
import {getDatabase,ref,set,on, onValue, get, update,push, child, query,orderByChild,equalTo, orderByValue,setValue} from 'firebase/database';
//Initialize Firebase
const auth = getAuth(FirebaseApp);
//Initialize database
const database = getDatabase(FirebaseApp);
// const fs = require("fs");
// const { parse } = require("csv-parse");

//Variables for HTML
const AdminManageFaculty = '/AdminManageFaculty.html';
const AdminManageCourse = '/AdminManageCourses.html';
const AdminViewFaculty = '/AdminViewFaculty.html';

//Variables for modal
// const modal = document.getElementsByClassName("Add-Modal")[0];
// const overlay = document.getElementsByClassName("modal-Overlay")[0];

// function openModal () {

//     //check which modal to open
//     // const modal = document.getElementsByClassName("Add-Faculty-Modal");
//     modal.style.display = "block";
//     overlay.style.display = "block";
    
// };

// function closeModal(){
//     modal.style.display = "none";
//     overlay.style.display = "none";
// };

//display the faculty data
function displayFacultyList(){
  console.log('Hello!');
  //get a reference

  //check if there is a logged in user
  chrome.identity.getAuthToken({ interactive: true }, token =>
    {
      if ( chrome.runtime.lastError || ! token ) {
        alert(`SSO ended with an error: ${JSON.stringify(chrome.runtime.lastError)}`)
        return
      }

      //firebase authentication
      signInWithCredential(auth, GoogleAuthProvider.credential(null, token))
      .then(res =>{
          const user = auth.currentUser;
          //get profile uid
          if (user !== null) {
            const db = getDatabase(); 
            const facultyRef = ref(db,'faculty-in-charge/');
            get(facultyRef)
              .then((snapshot) => {
                if (snapshot.exists()) {
                  alert("Success Firebase Access!");
                  // console.log(snapshot.val()); //checking for snapshot return
                  const facultyData = snapshot.val();
                  var cardListDiv = document.getElementById('cardList');
                  //modify the card list div
                 
                  cardListDiv.innerHTML='';
                  //loop through the snapshot
                  for(const facultyId in facultyData){
                    const faculty = facultyData[facultyId];
                    const facultyName = faculty.name;
                    const facultyEmail = faculty.email;
                    const FacultyIDNumber = faculty.employeeNum;

                    
                    //html for every faculty
                    
                      cardListDiv.innerHTML += `<div class="cards">
                            <p class="cardHeader" id="FacultyName">${facultyName}</p>
                              <div class="cardDivText">
                                  <div class="cardSubDiv">
                                      <p id="card-labels">ID Number:</p>
                                      <p class="cardText" id="FacultyNumber">${FacultyIDNumber}</p>
                                  </div>
                                  <div class="cardSubDiv">
                                      <p id="card-labels">Num of Courses:</p>
                                      <p class="cardText" id="FacultyNumCourses">10</p>
                                  </div>
                            </div>
                          </div>`;
                        
                      
                      // facultyDiv.innerHTML+=facultyHTML
                      
                  }

                } else {
                  alert("Success Firebase Access!");
                }
              })
              .catch((err) => {
                  console.log("Error with database: " + err);
              });
          }
      })
      .catch((err) => {
        alert("SSO ended with an error" + err);
      });
  });
}



//Function to get SidePanel path
function monitorSidePanelPath() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    //get the current tab information
    const tabId = tabs[0].id;
    //get the sidepanel information
    chrome.sidePanel.getOptions({ tabId }, function(options) {
      const path = options.path;
      console.log('path: ' + path);
      if(path === '/AdminManageFaculty.html'){
        displayFacultyList();

      }else if(path ==='/AdminManageCourses.html'){
        //access chrome storage for any passed value
        chrome.storage.local.get('value1', function(data) {
          //course
          var currentCourse = data.value1;
          //faculty
          chrome.storage.local.get('value2', function(data) {
            var currentFaculty = data.value2;
            if(currentCourse){
              console.log('Current FIC and Course Selection: ', currentCourse + currentFaculty);
              viewCoursePanel(currentFaculty, currentCourse);
            } else {
              console.error('Error: Value not found in storage.');
            }
          });
        });

      }
      
    });
  });
};


//gets the current path of the sidePanel
monitorSidePanelPath();

window.addEventListener('DOMContentLoaded', function () {
  
    const headDiv = document.getElementById('AppBody'); // Replace with the actual ID
    var facultyNameValue;
    var courseCodeValue;
    
  
    headDiv.addEventListener('click', function (event) {
      console.log('Click event fired');
  
      const target = event.target;

      //For Admin Dashboard Events
      if (target.id === 'ManageFacultyBtn'){
        console.log('Clicked on Manage Faculty')
        chrome.sidePanel.setOptions({path:AdminManageFaculty})
      }

      if(target.id === 'ManageCourseBtn'){
        console.log('Clicked on Manage Courses');
        chrome.sidePanel.setOptions({path:AdminManageCourse});
      }
  
      // Check if the clicked element is the Add New Faculty
      if (target.id === 'Add-New-Faculty') {
        console.log('Clicked on Add New Faculty');
        // openModal();
        let modal = document.getElementsByClassName("Add-Faculty-Modal")[0];
        let overlay = document.getElementsByClassName("modal-faculty-Overlay")[0];
        modal.style.display = "block";
        overlay.style.display = "block";
      }

      if (target.className === 'ModalCloseBtn'){
        console.log('Clicked Close Modal');
        //closeModal();
        let modal = document.getElementsByClassName("Add-Faculty-Modal")[0];
        let overlay = document.getElementsByClassName("modal-faculty-Overlay")[0];
        modal.style.display = "none";
        overlay.style.display = "none";

      }

      //for adding a new faculty
      if(target.id === 'Add-Faculty-DB'){
        console.log('Clicked Add New Faculty');
        createNewFaculty();
      }

      //modal open for new course
      if(target.id ==='Add-New-Course'){
        console.log('Clicked on Add New Course');
        // openModal(); for adding new course
        let modal = document.getElementsByClassName("Add-Course-Modal")[0];
        let overlay = document.getElementsByClassName("modal-course-Overlay")[0];
        modal.style.display = "block";
        overlay.style.display = "block";
      }

      //modal close for course
      if(target.className === 'CourseModalCloseBtn'){
        let modal = document.getElementsByClassName("Add-Course-Modal")[0];
        let overlay = document.getElementsByClassName("modal-course-Overlay")[0];
        modal.style.display = "none";
        overlay.style.display = "none";
      }

      //for adding a new course
      if(target.id==='Add-Course-DB'){
        console.log('Clicked Add New Course');
        createNewCourse(facultyNameValue);
      }

      //for clicking the faculty card
      if(target.id==='FacultyName'){
        // console.log('Clicked Faculty Card');
        //get the clicked FacultyName or ID
        facultyNameValue = target.textContent;
        //call the function and pass the name value
        viewDetailsFaculty(facultyNameValue);

      }

      //for clicking the course card
      if(target.id === 'CourseCode'){
        courseCodeValue = target.textContent;
        chrome.runtime.sendMessage({action: 'passValue1', value: courseCodeValue});
        chrome.runtime.sendMessage({action: 'passValue2', value: facultyNameValue});
        chrome.sidePanel.setOptions({path:AdminManageCourse});
      }

      //for clicking the add new classlist button
      //add classlist csv modal and function
      if(target.id === 'Add-New-Classlist'){
        console.log("Clicked Add New Classlist CSV");
        var reader = new FileReader();
        reader.addEventListener('load', function() {
          // console.log(this.result);
          uploadClasslistCSV(this.result);
        });
        reader.readAsText(document.querySelector('input').files[0]);
      }


    });
});

//function to save each student data to the DB
function saveStudentToDB(studentData){

  // console.log(studentData)
  const data = studentData.split(',');
  console.log(data);
  data.forEach((info,index,array) =>{
    if(index === 0){
      var studentNumber = array[index];
      var studentFirstName = array[index+1];
      var studentLastName = array[index+2];
      var studentEmail = array[index+3];

      console.log('Student Email is: ' + studentEmail);
    }
    
    
  })
  //loop through the student data object list
  // for(var info in data){
  //   console.log(info);
  // }
  // // console.log('\n');
}


//function to upload the classlist as CSV file and parse each student line of data
function uploadClasslistCSV(contents){
  //open file handler
 
    const rows = contents.split('\n');
    //skip first line (label)
    // console.log(rows);
    rows.forEach((row, index)=>{
      //skip first line (label)
      if(index === 0) return;
      parseData(row)
    });
    
    function parseData(data){
      const items = data.split('\n');
      items.forEach(item=> {
        //item is now each sudent data
        saveStudentToDB(item);
      });
    } 
}
//function to view courses panel
function viewCoursePanel(currentFacultyValue, currentCourseCodeValue){

  console.log('Current FIC and Course Selection: ', currentFacultyValue + currentCourseCodeValue);
  chrome.identity.getAuthToken({ interactive: true }, token =>
    {
      if ( chrome.runtime.lastError || ! token ) {
        alert(`SSO ended with an error: ${JSON.stringify(chrome.runtime.lastError)}`)
        return
      }

      //firebase authentication
      signInWithCredential(auth, GoogleAuthProvider.credential(null, token))
      .then(res =>{
          const user = auth.currentUser;
          //get profile uid
          if (user !== null) {
            const db = getDatabase(); 
            const facultyRef = ref(db,'faculty-in-charge/');
            onValue(facultyRef, (snapshot) => {
              snapshot.forEach((childSnapshot) => {
                const childKey = childSnapshot.key;
                const childData = childSnapshot.val();
                //each childData is already the object itself
                if(childData.name === currentFacultyValue){
                  var cardListDiv = document.getElementById('cardList');
                  //modify the card list div
                
                  cardListDiv.innerHTML='';
                  //loop through the child snapshot
                  for(const courses in childData.classes){
          
                    const course = childData.classes[courses];
                    const courseCode = course.code;
                    const courseSection = course.section;
                    const courseTitle = course.title;
                    const courseSemester = course.semester;
                    const courseUnits = course.units;
                    // console.log("Course Key: " + courseCode);
                    
                      
                    cardListDiv.innerHTML += `<div class="cards">
                            <p class="cardHeader" id="CourseCode">${courseCode} </p>
                              <div class="cardDivText">
                                  <div class="cardSubDiv">
                                      <p id="card-labels">Course Title:</p>
                                      <p class="cardText" id="CourseTitle">${courseTitle}</p>
                                  </div>
                                  <div class="cardSubDiv">
                                    <p id="card-labels">Course Semester:</p>
                                    <p class="cardText" id="CourseTitle">${courseSemester}</p>
                                </div>
                                <div class="cardSubDiv">
                                    <p id="card-labels">Course Units:</p>
                                    <p class="cardText" id="CourseTitle">${courseUnits}</p>
                                </div>

                            </div>
                          </div>
                          <!-- Button to Add Classlist CSV -->
                          <div class="AdminAddButton">
                              <input id="csvFileInput" type="file"/>
                              <button type="button" class="Add-Buttons-Admin" id="Add-New-Classlist">Upload</button>
                          </div>`;

                  
                    
                  }
                }
              })//EOF forEach loop;
            }, {
              onlyOnce: true
            });
          }
      })
      .catch((err) => {
        alert("SSO ended with an error" + err);
      });
  });
  
}

//function to view the faculty details paneldf
function viewDetailsFaculty(facultyNameValue){
  console.log('Clicked Faculty Card');

  //manipulate the DOM
  // var currentHTML = document.getElementsByClassName("AppDiv-AdminManage");
  document.getElementsByClassName("AppDiv-AdminManage")[0].innerHTML ="";
  
  
  //change the button
  // document.getElementsByClassName("AdminAddButton").innerHTML = '';
  document.getElementsByClassName("AppDiv-AdminManage")[0].innerHTML = `<div class="AdminHeaderDetails">${facultyNameValue}</div><div class="AdminAddButton"> <button type="button" class="Add-Buttons-Admin" id="Add-New-Course">Add New Course</button> </div> <div id="cardList"></div>`;

  viewDetailsCourse(facultyNameValue);

  

}

//function to view the classes 
function viewDetailsCourse(facultyNameValue){
  //manipulate AdminManageFaculty html panel
  //manipulatr the DOM
   //check if there is a logged in user
   chrome.identity.getAuthToken({ interactive: true }, token =>
    {
      if ( chrome.runtime.lastError || ! token ) {
        alert(`SSO ended with an error: ${JSON.stringify(chrome.runtime.lastError)}`)
        return
      }

      //firebase authentication
      signInWithCredential(auth, GoogleAuthProvider.credential(null, token))
      .then(res =>{
          const user = auth.currentUser;
          //get profile uid
          if (user !== null) {
            const db = getDatabase(); 
            const facultyRef = ref(db,'faculty-in-charge/');
            onValue(facultyRef, (snapshot) => {
              snapshot.forEach((childSnapshot) => {
                const childKey = childSnapshot.key;
                const childData = childSnapshot.val();
                //each childData is already the object itself
                if(childData.name === facultyNameValue){
                  var cardListDiv = document.getElementById('cardList');
                  //modify the card list div
                
                  cardListDiv.innerHTML='';
                  //loop through the child snapshot
                  for(const courses in childData.classes){
          
                    const course = childData.classes[courses];
                    const courseCode = course.code;
                    const courseSection = course.section;
                    const courseTitle = course.title;
                    // console.log("Course Key: " + courseCode);
                    
                      
                    cardListDiv.innerHTML += `<div class="cards">
                              <p class="cardHeader" id="CourseCode">${courseCode} </p>
                                <div class="cardDivText">
                                <div class="cardSubDiv">
                                        <p id="card-labels">Course Section:</p>
                                        <p class="cardText" id="CourseTitle">${courseSection}</p>
                                    </div>
                                    <div class="cardSubDiv">
                                        <p id="card-labels">Course Title:</p>
                                        <p class="cardText" id="CourseTitle">${courseTitle}</p>
                                    </div>
                              </div>
                            </div>`;

                  
                    
                  }
                }
              })//EOF forEach loop;
            }, {
              onlyOnce: true
            });
          }
      })
      .catch((err) => {
        alert("SSO ended with an error" + err);
      });
  });
}

//function to create and save the new faculty
function createNewFaculty(){

    //get all the input
    var facultyName = document.getElementById('FacultyNameInput').value;
    var facultyID = document.getElementById('FacultyIDNumber').value;
    var facultyEmail = document.getElementById('FacultyEmail').value;

    console.log(facultyName);
    console.log(facultyID);
    console.log(facultyEmail);

    //check if there is a logged in user
    chrome.identity.getAuthToken({ interactive: true }, token =>
        {
          if ( chrome.runtime.lastError || ! token ) {
            alert(`SSO ended with an error: ${JSON.stringify(chrome.runtime.lastError)}`)
            return
          }
    
          //firebase authentication
          signInWithCredential(auth, GoogleAuthProvider.credential(null, token))
          .then(res =>{
              const user = auth.currentUser;
                
              if (user !== null) {
                //there is a user signed in
                //new data 
                var newFaculty = {
                  name: facultyName,
                  email: facultyEmail,
                  employeeNum: facultyID,
                  classes: {
                    class1: false,
                    class2: false
                  }
                }

                //get a db reference
                const db = getDatabase();
                const facultyRef = ref(db,'faculty-in-charge');
                const newfacultyKey = push(child(ref(db), 'faculty-in-charge')).key;

                //update with the new data to the collection
                const updates = {};
                updates['/faculty-in-charge/' + newfacultyKey] = newFaculty;
                update(ref(db), updates)
                  .then(()=>{
                    console.log('Success in Adding new Faculty with key: ' + newfacultyKey);
                    alert('Success in Adding new Faculty');
                    //automatic close modal
                    let modal = document.getElementsByClassName("Add-Faculty-Modal")[0];
                    let overlay = document.getElementsByClassName("modal-faculty-Overlay")[0];
                    modal.style.display = "none";
                    overlay.style.display = "none";
                    //load the new database
                    monitorSidePanelPath();
                  })
                  .catch((err) => {
                    console.log("Error with database: " + err);
                  })

                
              }
           })//EOF signInWithCredential
          .catch(err =>{alert("SSO ended with an error" + err);})
      }) 
}

//function to create and save the new course
function createNewCourse(facultyNameValue){
   //get all the input
   var courseTitle = document.getElementById('CourseTitleInput').value;
   var courseCode = document.getElementById('CourseCodeInput').value;
   var courseSection = document.getElementById('CourseSectionInput').value;
   var courseSemester = document.getElementById('CourseSemInput').value;
   var courseUnits = document.getElementById('CourseUnitsInput').value;

   console.log(facultyNameValue);

   //check if there is a logged in user
   chrome.identity.getAuthToken({ interactive: true }, token =>
       {
         if ( chrome.runtime.lastError || ! token ) {
           alert(`SSO ended with an error: ${JSON.stringify(chrome.runtime.lastError)}`)
           return
         }
   
         //firebase authentication
         signInWithCredential(auth, GoogleAuthProvider.credential(null, token))
         .then(res =>{
             const user = auth.currentUser;
               
             if (user !== null) {
               //there is a user signed in
               //new data for course
               var newCourse = {
                title:courseTitle,
                code:courseCode,
                section: courseSection,
                units: courseUnits,
                semester: courseSemester,
                students: {
                  student1: null,
                  student2: null
                },
                assessment: {
                  assessment1: null
                }
               }

               //find the current faculty
               //get a db reference
                const db = getDatabase();
                const facultyRef = ref(db,'faculty-in-charge/');
                

                onValue(facultyRef, (snapshot) => {
                  snapshot.forEach((childSnapshot) => {
                    const childKey = childSnapshot.key;
                    const childData = childSnapshot.val();
                    //each childData is already the object itself
                    if(childData.name === facultyNameValue){
                      alert("Success Firebase Access! " + childData.name + " FIC Exists");
                      //add the course
                      //new key for the course
                      const newCourseKey = push(child(ref(db), `/faculty-in-charge/${childKey}/classes`)).key;
                      const updateCourse ={};
                      updateCourse[`/faculty-in-charge/${childKey}/classes/` + newCourseKey] = newCourse;
                      update(ref(db), updateCourse)
                        .then(()=>{
                          console.log('Success in Adding new course');
                          alert('Success in Adding new course');
                          //close add course modal
                          let modal = document.getElementsByClassName("Add-Course-Modal")[0];
                          let overlay = document.getElementsByClassName("modal-course-Overlay")[0];
                          modal.style.display = "none";
                          overlay.style.display = "none";
                          
                        })
                        .catch((err) => {
                          console.log("Error with database: " + err);
                        })

                      }
                    
                  })//EOF forEach loop;
                }, {
                  onlyOnce: true
                });
                
             }
          })//EOF signInWithCredential
         .catch(err =>{alert("SSO ended with an error" + err);})
     }) 
   
}