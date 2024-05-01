
//Script for Admin 

//import for SDKs
import { FirebaseApp } from './firebase';
import {getAuth,signInWithCredential,GoogleAuthProvider} from 'firebase/auth';
import {getDatabase,ref,set,on, onValue, get, update,push, child, query,orderByChild,equalTo, orderByValue,setValue} from 'firebase/database';
import { nanoid } from 'nanoid';
import { customAlphabet } from 'nanoid';
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
const AdminViewAssessments = '/AdminViewAssessments.html';
const AdminManageStudents = '/AdminManageStudents.html';
const AdminViewAllCourses = '/AdminViewAllCourses.html';


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
      }else if(path === '/AdminViewAssessments.html'){
        //load all the assessments in the database
        viewAssessmentsList();
      }else if(path === '/AdminManageStudents.html'){
        viewStudentsList();
      }else if(path === '/AdminViewAllCourses.html')
        viewCoursesList();
      
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
        console.log('Clicked on Manage Courses FIC');
        chrome.sidePanel.setOptions({path:AdminManageCourse});
      }

      if(target.id==='ManageAssessmentsBtn'){
        console.log('Clicked on Manage Assessments');
        chrome.sidePanel.setOptions({path:AdminManageAssessments});

      }
      
      if(target.id==='ManageStudentsBtn'){
        console.log('Clicked on Manage Students');
        chrome.sidePanel.setOptions({path:AdminManageStudents});
      }

      if(target.id === 'ManageViewCourseBtn'){
        console.log('Clicked on Manage Courses');
        chrome.sidePanel.setOptions({path:AdminViewAllCourses});
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
        chrome.sidePanel.setOptions({path:AdminViewAssessments});
      }

      if(target.id==='Admin-SubmitExamSchedBtn'){
        console.log('Clicked Admin Get Assessment Link');
        //function add the exam to the database then generate a link
        createNewAssessment();
      }

      


    });
});

//function to update the path /takingAssessments/assessmentKey/Student
function updateTakingAssessmentsStudent(courseGivenAssessment, assessmentKey){

  console.log("ADMIN - Update the path !!!");
  console.log(courseGivenAssessment);
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
            //look for which students are taking the exam
            const db = getDatabase(); 
            const takingClassesRef = ref(db,`takingClasses/${courseGivenAssessment}`);
            get(takingClassesRef)
              .then((snapshot) => {
                if (snapshot.exists()) {
                  alert("Success Firebase Access!");
                  //checking for snapshot return
                  const childData = snapshot.val();
                  for(const studentId in childData){
                    const student = childData[studentId];
                    // console.log(studentEmail);
                    var studentInfo = {
                      studentNumber: studentId,
                      studentEmail: student.Email
                    }
                    //now update the database path /takingAssessments/assessmentKey/student
                    const updateTakingAssessments = {};
                    updateTakingAssessments[`/takingAssessments/${assessmentKey}/students/${studentId}`] = studentInfo;
                    update(ref(db),updateTakingAssessments)
                    .then(()=> {
                      alert("Saved Exam to database!");
                    }).catch((err) => {
                      console.log(("error with database" + err));
                    })
                    
                  }
                
                } else {
                  alert("Success Firebase Access!");
                }
              })
              .catch((err) => {
                  console.log("Error with database: " + err);
              });
          }
       })//EOF signInWithCredential
      .catch(err =>{alert("SSO ended with an error" + err);})
  }) 


}

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
                Geolocation_long: '',
                authProviderUID:''

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
              var studentInfo = {
                Email: studentEmail,
                StudentNumber: studentNumber
              }
              var updateRelationship = {};
              updateRelationship[`takingClasses/${currentCourse}/` + newStudentKey] = studentInfo;
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

//function to view the faculty details panel
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
                if (snapshot.exists() && snapshot.hasChildren()) {
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
                  alert("Snapshot does not exist! No courses to show");
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
                  authProviderUID: "",
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
                var newRelationship = {}
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
                   //load the new database
                   location.reload();

                })
                .catch((err) => {
                  console.log("Error with database: " + err);
                })
               
            }
        
            }).catch(err =>{alert("SSO ended with an error" + err);})
          })
}

//function to loop through the courses taught by the chosen faculty for the dropdown menu
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

//function to generate a 6 digit code
function generateExamCode(){
  const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6)
  var ID = nanoid(6);
  return ID;
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
  //generate 6 character code
  var examAccessCode = generateExamCode();
  var assessmentKeyGenerator = examName+courseSelected+examAccessCode;
  var assessmentKey =  assessmentKeyGenerator.split(" ").join("");

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
           
            const db = getDatabase(); 
            // const assessmentsRef = ref(db,'assessments/');
            // const takingAssessmentsRef = ref(db, 'takingAssessments/');
            update(ref(db,'assessments/' + assessmentKey),{
              FacultyInCharge: facultySelected,
              name: examName,
              course: courseSelected,
              link:examLink,
              access_code: examAccessCode,
              expected_time_start: startDateSelected,
              expected_time_end: endDateSelected,
                  
            }).then(()=> {
              alert("Saved to database!");
            }).catch((err) => {
              console.log(("error with database" + err));
            })

            //update taking assessments
            update(ref(db,'takingAssessments/' + assessmentKey),{
              FacultyInCharge: facultySelected,
              name: examName,
              course: courseSelected,
              link:examLink,
              access_code: examAccessCode,
              expected_time_start: startDateSelected,
              expected_time_end: endDateSelected,
              students: {}
                  
            }).then(()=> {
              alert("Saved to database!");
            }).catch((err) => {
              console.log(("error with database" + err));
            })
           
            //call function that will update which students will take the assessment
            updateTakingAssessmentsStudent(courseSelected, assessmentKey);
          }
       })//EOF signInWithCredential
      .catch(err =>{alert("SSO ended with an error" + err);})
  }) 

  alert('Exam Scheduled! The code is: ' + examAccessCode);

}

//function to view the list of all assessments
function viewAssessmentsList(){
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
            const assessmentRef = ref(db,`/assessments`);
            get(assessmentRef)
              .then((snapshot) => {
                if (snapshot.exists()) {
                  alert("Success Firebase Access!");
                  //checking for snapshot return
                  const childData = snapshot.val();
                  var cardListDiv = document.getElementById('cardList');
                  cardListDiv.innerHTML='';
                  //loop through the snapshot
                  for(const assessmentId in childData){
                    const assessment = childData[assessmentId];
                    const assessmentFIC = assessment.FacultyInCharge;
                    const assessmentName = assessment.name;
                    const assessmentCourseSection = assessment.course;
                    const assessmentLink = assessment.link;
                    const assessmentCode = assessment.access_code;
                    const assessmentStartTime = assessment.expected_time_start;
                    const assessmentEndTime = assessment.expected_time_end;

                    cardListDiv.innerHTML += `<div class="cards">
                                <p class="cardHeader" id="ExamName">${assessmentName}</p>
                                  <div class="cardDivText">
                                      <div class="cardSubDiv">
                                          <p id="card-labels">Assigned Course and Section:</p>
                                          <p class="cardText" id="CourseTitle">${assessmentCourseSection}</p>
                                      </div>
                                      <div class="cardSubDiv">
                                          <p id="card-labels">Faculty-in-Charge:</p>
                                          <p class="cardText" id="CourseTitle">${assessmentFIC}</p>
                                      </div>  
                                      <div class="cardSubDiv">
                                          <p id="card-labels">Link:</p>
                                          <p class="cardText" id="CourseTitle">${assessmentLink}</p>
                                      </div>  
                                      <div class="cardSubDiv">
                                          <p id="card-labels">Access Code:</p>
                                          <p class="cardText" id="CourseTitle">${assessmentCode}</p>
                                      </div>  
                                      <div class="cardSubDiv">
                                          <p id="card-labels">Start Time and Date:</p>
                                          <p class="cardText" id="CourseTitle">${assessmentStartTime}</p>
                                      </div>  
                                      <div class="cardSubDiv">
                                          <p id="card-labels">End Time and Date:</p>
                                          <p class="cardText" id="CourseTitle">${assessmentEndTime}</p>
                                      </div>  
                                </div>
                              </div>`;

                  }
               
                } else {
                  alert("ERROR: Firebase Access!");
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

//function to view the list of all students
function viewStudentsList(){
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
            const studentRef = ref(db,`/students`);
            get(studentRef)
              .then((snapshot) => {
                if (snapshot.exists()) {
                  alert("Success Firebase Access!");
                  //checking for snapshot return
                  const childData = snapshot.val();
                  var cardListDiv = document.getElementById('cardList');
                  cardListDiv.innerHTML='';
                  //loop through the snapshot
                  for(const studentId in childData){
                    const student = childData[studentId];
                    const studentFirstName = student.FirstName;
                    const studentLastName = student.LastName;
                    const studentNumber = student.StudentNumber;
                    

                    cardListDiv.innerHTML += `<div class="cards">
                                <p class="cardHeader" id="StudentFullName">${studentFirstName}  ${studentLastName}</p>
                                  <div class="cardDivText">
                                      <div class="cardSubDiv">
                                          <p id="card-labels">Studenr Number:</p>
                                          <p class="cardText" id="CourseTitle">${studentNumber}</p>
                                      </div>
                                     
                                  </div>
                              </div>`;

                  }
               
                } else {
                  alert("ERROR: Firebase Access!");
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

//function to view all courses /classes
function viewCoursesList(){
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
              const studentRef = ref(db,`/classes`);
              get(studentRef)
                .then((snapshot) => {
                  if (snapshot.exists()) {
                    alert("Success Firebase Access!");
                    //checking for snapshot return
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
                            <div class="cardSubDiv">
                            <p id="card-labels">Course Semester:</p>
                            <p class="cardText" id="CourseTitle">${courseSemester}</p>
                        </div>
                        <div class="cardSubDiv">
                            <p id="card-labels">Course Units:</p>
                            <p class="cardText" id="CourseTitle">${courseUnits}</p>
                        </div>   
                            </div>
                        </div>`;
  
                    }
                 
                  } else {
                    alert("ERROR: Firebase Access!");
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