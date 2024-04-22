
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
const AdminManageAssessments = '/AdminManageAssessments.html';
const AdminSchedulePage = '/AdminSchedulePage.html';

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
                            <p class="cardHeader" id="FacultyName">${FacultyIDNumber} ${facultyName}</p>
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
              // console.log('Current FIC and Course Selection: ', currentFaculty + currentCourse);
              viewCoursePanel(currentFaculty, currentCourse);
            } else {
              console.error('Error: Value not found in storage.');
            }
          });
        });

      }else if(path === '/AdminSchedulePage.html'){
        //load the function to display the schedule page
        displayFacultyDropdown();
      }
      
    });
  });
};


//gets the current path of the sidePanel
monitorSidePanelPath();

window.addEventListener('DOMContentLoaded', function () {
  
    const headDiv = document.getElementById('AppBody'); // Replace with the actual ID
    var facultyKeyValue;
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

      if(target.id==='ManageAssessmentsBtn'){
        console.log('Clicked on Manage Assessments');
        chrome.sidePanel.setOptions({path:AdminManageAssessments});

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
        createNewCourse(facultyKeyValue);
      }

      //for clicking the faculty card
      if(target.id==='FacultyName'){
        console.log('Clicked Faculty Card');
        //get the clicked FacultyName or ID
        var facultyString = target.textContent.split(" ");
        // var facultyStringValue = facultyString.split(" ");
        facultyKeyValue = facultyString[0];
        console.log(facultyKeyValue);
        //call the function and pass the name value
        viewDetailsFaculty(facultyKeyValue);

      }

      //for clicking the course card
      if(target.id === 'CourseCode'){
        courseCodeValue = target.innerText;
        chrome.runtime.sendMessage({action: 'passValue1', value: courseCodeValue});
        chrome.runtime.sendMessage({action: 'passValue2', value: facultyKeyValue});
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

      //for managing assessments
      if(target.id==='Admin-Sched-Assessment'){
        console.log("Clicked Schedule Exam");
        //go to different path for schedule
        chrome.sidePanel.setOptions({path:AdminSchedulePage});
      }

      if(target.id==='Admin-View-Assessment'){
        console.log("Clicked View Exams");
        //go to different path for card list of exams
      }

      if(target.id==='Admin-SubmitExamSchedBtn'){
        console.log('Clicked Admin Get Assessment Link');
        //function add the exam to the database then generate a link
        createNewAssessment();
      }

      


    });
});

//function to save each student data to the database
function saveStudentToDB(studentData){

  var currentCourse;
  var currentFaculty;
  //access chrome storage for any passed value
  chrome.storage.local.get('value1', function(data) {
    //course
    currentCourse = data.value1;
    //faculty
    chrome.storage.local.get('value2', function(data) {
      currentFaculty = data.value2;
      if(currentCourse){
        console.log('Current Course and FIC Selection: ', currentCourse + currentFaculty);
      } else {
        console.error('Error: Value not found in storage.');
      }
    });
  });

  //split the student data
  const data = studentData.split(',');
  console.log(data);
  data.forEach((info,index,array) =>{
    if(index === 0){
      var studentNumber = array[index];
      var studentFirstName = array[index+1];
      var studentLastName = array[index+2];
      var studentEmail = array[index+3];

      //initialized firebase access
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
              var newStudent = {
                Email: studentEmail,
                StudentNumber: studentNumber,
                FirstName: studentFirstName,
                LastName: studentLastName,
                IPAddress: '',
                OperatingSystem: '',
                SystemCPU: '',
                SystemDisplayResolution: '',
                Browser: '',
                Geolocation_lat: '',
                Geolocation_long: ''

              }

              //get a db reference
              const db = getDatabase();
              const studentRef = ref(db,'students');
              // const newStudentKey = push(child(ref(db), 'students')).key;
              const newStudentKey = studentNumber;

              //update with the new data to the /students collection
              const updates = {};
              updates['/students/' + newStudentKey] = newStudent;
              update(ref(db), updates)
              .then(()=>{
                console.log('Success in Adding new Student with key: ' + newStudentKey);
                // alert('Success in Adding new Student with key: ' + newStudentKey);
              })
              .catch((err) => {
                console.log("Error with database: " + err);
              })

              //update the Student and Course relationship
              var updateRelationship = {};
              updateRelationship[`takingClasses/${currentCourse}/` + newStudentKey] = studentEmail;
              update(ref(db), updateRelationship)
              .then(()=>{
                console.log('Success in Adding new student to taking Classes');
              })
              .catch((err) => {
                console.log("Error with database: " + err);
              })
              
          }
         })//EOF signInWithCredential
        .catch(err =>{alert("SSO ended with an error" + err);})
      }) 

    }
  
  }, {
    onlyOnce: true
  });
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
function viewCoursePanel(currentFacultyKey,currentCourseKey){

  console.log('Current FIC and Course Selection: ', currentFacultyKey + " " + currentCourseKey);
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
          const db = getDatabase(); 
          const facultyRef = ref(db,`teachingClasses/${currentFacultyKey}/${currentCourseKey}`);
          get(facultyRef)
            .then((snapshot) => {
              if (snapshot.exists()) {
                alert("Success Firebase Access!");
                const course = snapshot.val();
                // console.log("Data: " + course.code); //checking for snapshot return


                var cardListDiv = document.getElementById('cardList');
                cardListDiv.innerHTML='';
    
                const courseCode = course.code;
                const courseSection = course.section;
                const courseTitle = course.title;
                const courseSemester = course.semester;
                const courseUnits = course.units;
                // console.log("Course Key: " + courseCode);
                
                  
                cardListDiv.innerHTML += `<div class="cards">
                        <p class="cardHeader" id="CourseCode">${courseCode}${courseSection}</p>
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
        
             
              } else {
                alert("Snapshot does not exist!");
              }
            })
            .catch((err) => {
                console.log("Error with database: " + err);
            });
        }
         
      }).catch((err) => {
        alert("SSO ended with an error" + err);
      });
  });
  
}

//function to view the faculty details paneldf
function viewDetailsFaculty(facultyKeyValue){
  console.log('Clicked Faculty Card');
  console.log(facultyKeyValue);

  //manipulate the DOM
  // var currentHTML = document.getElementsByClassName("AppDiv-AdminManage");
  document.getElementsByClassName("AppDiv-AdminManage")[0].innerHTML ="";
  
  
  //change the button
  // document.getElementsByClassName("AdminAddButton").innerHTML = '';
  document.getElementsByClassName("AppDiv-AdminManage")[0].innerHTML = `<div class="AdminHeaderDetails">${facultyKeyValue}</div><div class="AdminAddButton"> <button type="button" class="Add-Buttons-Admin" id="Add-New-Course">Add New Course</button> </div> <div id="cardList"></div>`;

  viewDetailsCourse(facultyKeyValue);

  

}

//function to view the classes 
function viewDetailsCourse(facultyKeyValue){
  //manipulate AdminManageFaculty html panel
  //manipulate the DOM
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
            const facultyRef = ref(db,`teachingClasses/${facultyKeyValue}`);
            get(facultyRef)
              .then((snapshot) => {
                if (snapshot.exists()) {
                  alert("Success Firebase Access!");
                  // console.log(snapshot.val()); //checking for snapshot return
                  const childData = snapshot.val();
                 

  
                  var cardListDiv = document.getElementById('cardList');
                  cardListDiv.innerHTML='';
                  //loop through the snapshot
                  for(const courseId in childData){
                    
                        const course = childData[courseId];
                        const courseCode = course.code;
                        const courseSection = course.section;
                        const courseTitle = course.title;
                        const courseSemester = course.semester;
                        const courseUnits = course.units;
                        console.log("Course Key: " + courseCode);
                        
                          
                        cardListDiv.innerHTML += `<div class="cards">
                                <p class="cardHeader" id="CourseCode">${courseCode}${courseSection}</p>
                                  <div class="cardDivText">
                                      <div class="cardSubDiv">
                                          <p id="card-labels">Course Title:</p>
                                          <p class="cardText" id="CourseTitle">${courseTitle}</p>
                                      </div>      
                                </div>
                              </div>`;
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
                  numOfClasses: 0
                }

                //get a db reference
                const db = getDatabase();
                const facultyRef = ref(db,'faculty-in-charge/');
                const teachingRef = ref(db,'teachingClasses/')
                

                //update with the new data to the collection
                const updates = {};
                updates['/faculty-in-charge/' + facultyID] = newFaculty;
                update(ref(db), updates)
                  .then(()=>{
                    console.log('Success in Adding new Faculty with key: ' + facultyID);
                    alert('Success in Adding new Faculty');
                  })
                  .catch((err) => {
                    console.log("Error with database: " + err);
                  })

                //update teaching classes collection
                var newRelationship = {courseId:''}
                const updatesRelation = {};
                updatesRelation['/teachingClasses/' + facultyID] = newRelationship;
                update(ref(db), updatesRelation)
                .then(()=>{
                  console.log('Success in Adding new Faculty to teaching Classes');
                  alert('Success in Adding new Faculty to teaching Classes');
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
function createNewCourse(facultyKeyValue){
   //get all the input
   var courseTitle = document.getElementById('CourseTitleInput').value;
   var courseCode = document.getElementById('CourseCodeInput').value;
   var courseSection = document.getElementById('CourseSectionInput').value;
   var courseSemester = document.getElementById('CourseSemInput').value;
   var courseUnits = document.getElementById('CourseUnitsInput').value;

   console.log(facultyKeyValue);

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
                semester: courseSemester
               }

                //find the current faculty
                //get a db reference
                const db = getDatabase();
                const classesRef = ref(db,'classes/');
                const takingRef = ref(db,'takingClasses/')
                const teachingRef = ref(db,'teachingClasses/')
                //make a key
                const courseKey = courseCode+courseSection;
                
                //update classes collection
                const updateCourse ={};
                updateCourse[`/classes/` + courseKey] = newCourse;
                update(ref(db), updateCourse)
                  .then(()=>{
                    console.log('Success in Adding new course');
                    alert('Success in Adding new course');  
                  }).catch((err) => {
                      console.log("Error with database: " + err);
                  })
                
                
                //update the Student and Course relationship
                var newRelationship = {studentId:''}
                const updatesRelation = {};
                updatesRelation['/takingClasses/' + courseKey] = newRelationship;
                update(ref(db), updatesRelation)
                .then(()=>{
                  console.log('Success in Adding new course to taking Classes');
                })
                .catch((err) => {
                  console.log("Error with database: " + err);
                })

                //update the FIC and Course relationship
                // var newRelationshipFaculty = { `${courseKey}`: newCourse};
                const updatesRelationFaculty = {};
                updatesRelationFaculty[`/teachingClasses/${facultyKeyValue}/${courseKey}`] = newCourse
                update(ref(db), updatesRelationFaculty)
                .then(()=>{
                  console.log('Success in Adding new course to teaching Classes');
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
        
            }).catch(err =>{alert("SSO ended with an error" + err);})
          })
}

function viewFacultyCourses(facultyKeyValue){
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
            const facultyRef = ref(db,`teachingClasses/${facultyKeyValue}`);
            get(facultyRef)
              .then((snapshot) => {
                if (snapshot.exists()) {
                  alert("Success Firebase Access!");
                  // console.log(snapshot.val()); //checking for snapshot return
                  const childData = snapshot.val();
                  var courseDropdownDiv = document.getElementById('courselist');
                  courseDropdownDiv.innerHTML ='';
                  //loop through the snapshot
                  for(const courseId in childData){
                    
                    const course = childData[courseId];
                    const courseCode = course.code;
                    const courseSection = course.section;
                    console.log("Course Key: " + courseCode);

                    const courseOption = document.createElement('option');
                    courseOption.value =courseId;
                    courseOption.textContent = courseCode + courseSection;
                    courseDropdownDiv.append(courseOption);
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
//function to display the options for the dropdown menu
function displayFacultyDropdown(){
  console.log("Create New Assessment");
  //manipulate the DOM
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
            const facultyRef = ref(db,'/faculty-in-charge');
            const teachingRef = ref(db,'/teachingClasses');
            get(facultyRef)
              .then((snapshot) => {
                if (snapshot.exists()) {
                  alert("Success Firebase Access!");
                  // console.log(snapshot.val()); //checking for snapshot return
                  const childData = snapshot.val();
                 

  
                  var facultyDropdownDiv = document.getElementById('facultylist');
                  // cardListDiv.innerHTML='';
                  //loop through the snapshot
                  for(const facultyId in childData){
                    const faculty = childData[facultyId];
                    const facultyName = faculty.name;
                    console.log("Faculty Key: " + facultyId);      
                    
                    const facultyOption = document.createElement('option');
                    facultyOption.value =facultyId;
                    facultyOption.textContent = facultyName;
                    facultyDropdownDiv.append(facultyOption);
                  }
               
                
                } else {
                  alert("Success Firebase Access!");
                }
              })
              .catch((err) => {
                  console.log("Error with database: " + err);
              });
            
            //get the input faculty of the user
            var selectedFaculty;
            document.getElementById('facultylist').addEventListener('change', function(){
              selectedFaculty = this.value;
              console.log("Selected Faculty: " + selectedFaculty);
              //loop through the courses taught by the chosen faculty
              viewFacultyCourses(selectedFaculty);
            })
           
          }
      })
      .catch((err) => {
        alert("SSO ended with an error" + err);
      });
  });
  
}

//function to add the scheduled exam by the admin
function createNewAssessment(){
  //get all the input
  var examName = document.getElementById('assessmentName').value;
  var facultySelected = document.getElementById('facultylist').value;
  var courseSelected = document.getElementById('courselist').value;
  var startDateSelected = document.getElementById('start-date').value;
  var endDateSelected = document.getElementById('end-date').value;
  var examLink = document.getElementById('assessmentLinkInput').value;

  var assessmentKey = examName+courseSelected+startDateSelected;

  //save to database
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
            user.providerData.forEach((profile) => {
              const FIC = profile.displayName;
                
              const db = getDatabase(); 
                set(ref(db,'assessments/' + assessmentKey),{
                  FacultyInCharge: FIC,
                  name: examName,
                  course: courseSelected,
                  link:examLink,
                  access_code: 'GHB456',
                  expected_time_start: startDateSelected,
                  expected_time_end: endDateSelected,
                  
                })
                .then(()=> {
                  alert("Saved to database!");
                })
                .catch((err) => {
                  console.log(("error with database" + err));
                })
              });

            }
       })//EOF signInWithCredential
      .catch(err =>{alert("SSO ended with an error" + err);})
  }) 

  alert('Exam Scheduled! The code is: GHB456');

}