//contains listeners and functions
// Import the functions you need from the SDKs you need
import { FirebaseApp } from './firebase';
import {getAuth,signInWithCredential,GoogleAuthProvider} from 'firebase/auth';
import {getDatabase,ref,set,on, onValue, get, update,push, child, query,orderByChild,equalTo, orderByValue,setValue} from 'firebase/database';
import { nanoid } from 'nanoid';
import { customAlphabet } from 'nanoid';
//Initialize Firebase
const auth = getAuth(FirebaseApp);
//Initialize database
const database = getDatabase(FirebaseApp);


import '../stylesheet.css';
const facultyDashboardPage = '/FacultyDashboardPage.html';
const facultySchedulePage = '/FacultySchedulePage.html';
const StudentExamDetailsPage = '/StudentAssessmentDetails.html';
//Admin Routes
const AdminDashboard = '/AdminDashboard.html';
const facultyViewAssessments = '/FacultyManageAssessments.html';

//Function to get SidePanel path
function monitorSidePanelPath() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    //get the current tab information
    const tabId = tabs[0].id;
    //get the sidepanel information
    chrome.sidePanel.getOptions({ tabId }, function(options) {
      const path = options.path;
      console.log('path: ' + path);
      if(path === '/FacultySchedulePage.html'){
        var receivedUserId;
        chrome.storage.local.get('currentUserId', function(data) {
          receivedUserId = data.currentUserId;
          viewFacultyCourses(receivedUserId);
        });
        
      }else if(path === '/FacultyManageAssessments.html'){
        var receivedUserId;
        chrome.storage.local.get('currentUserId', function(data) {
          receivedUserId = data.currentUserId;
          viewFacultyAssessmentsList(receivedUserId);
        });
      }
    });
  });
};


//gets the current path of the sidePanel
monitorSidePanelPath();

window.addEventListener('DOMContentLoaded', function () {
  
  const headDiv = document.getElementById('AppBody'); // Replace with the actual ID

  headDiv.addEventListener('click', function (event) {
    console.log('Click event fired');

    const target = event.target;
    var currentUserId;

    //For faculty dashboard events
    if(target.id === 'ScheduleBtn'){
      console.log('Clicked on Schedule Assessment');
      chrome.sidePanel.setOptions({path:facultySchedulePage});

    }
    if(target.id === 'ManageBtn'){
      console.log('Clicked on Manage Assessment');
      chrome.sidePanel.setOptions({path:facultyViewAssessments});

    }

    if(target.id === 'SubmitExamSchedBtn'){
      console.log('Clicked Submit Exam Sched');
      scheduleExam(currentUserId);
     
    }
  });
});

//function to generate a 6 digit code
function generateExamCode(){
  const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6)
  var ID = nanoid(6);
  return ID;
}
//function to update the path /takingAssessments/assessmentKey/Student
function updateTakingAssessmentsStudent(courseGivenAssessment, assessmentKey){

  console.log("FIC - Update the path !!!");
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

//function to loop through the courses taught by the chosen faculty for the dropdown menu
function viewFacultyCourses(facultyKeyValue){
  console.log("curr: " + facultyKeyValue);
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

//function to save the schedule of the exam
function scheduleExam(){
  
  var examAccessCode = generateExamCode();
  var receivedUserId;
  chrome.storage.local.get('currentUserId', function(data) {
    receivedUserId = data.currentUserId;
  });

 
  //get all the input
  var examName = document.getElementById('assessmentName').value;
  var courseSelected = document.getElementById('courselist').value;
  var startDateSelected = document.getElementById('start-date').value;
  var startTimeSelected = document.getElementById('start-time').value;
  var endDateSelected = document.getElementById('end-date').value;
  var endTimeSelected = document.getElementById('end-time').value;
  var examLink = document.getElementById('assessmentLinkInput').value;

  console.log(examName);
  console.log(examAccessCode);
  console.log(courseSelected);
  console.log(startDateSelected);
  console.log(endDateSelected);
  console.log(examLink);
  
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
            user.providerData.forEach((profile) => {
              const facultyName = profile.displayName;
              const db = getDatabase(); 
              update(ref(db,'assessments/' + assessmentKey),{
                FacultyInCharge: receivedUserId,
                FacultyInChargeName: facultyName,
                name: examName,
                course: courseSelected,
                link:examLink,
                access_code: examAccessCode,
                expected_time_start: startTimeSelected,
                expected_time_end: endTimeSelected,
                date_start:startDateSelected,
                date_end:endDateSelected
                    
              }).then(()=> {
                alert("Saved to database!");
              }).catch((err) => {
                console.log(("error with database" + err));
              })

              //update taking assessments
              update(ref(db,'takingAssessments/' + assessmentKey),{
                FacultyInCharge: receivedUserId,
                FacultyInChargeName: facultyName,
                name: examName,
                course: courseSelected,
                link:examLink,
                access_code: examAccessCode,
                expected_time_start: startTimeSelected,
                expected_time_end: endTimeSelected,
                date_start:startDateSelected,
                date_end:endDateSelected,
                students: {}
                    
              }).then(()=> {
                alert("Saved to database!");
              }).catch((err) => {
                console.log(("error with database" + err));
              })
            
              //call function that will update which students will take the assessment
              updateTakingAssessmentsStudent(courseSelected, assessmentKey);

              //update scheduled assessments
              update(ref(db,`scheduledAssessments/${receivedUserId}/${assessmentKey}`),{
                name: examName,
                course: courseSelected,
                FacultyInCharge: receivedUserId,
                FacultyInChargeName: facultyName,
                link:examLink,
                access_code: examAccessCode,
                expected_time_start: startTimeSelected,
                expected_time_end: endTimeSelected,
                date_start:startDateSelected,
                date_end:endDateSelected
              }).then(()=> {
                alert("Saved to database!");
              }).catch((err) => {
                console.log(("error with database" + err));
              })
            });

          }
       })//EOF signInWithCredential
      .catch(err =>{alert("SSO ended with an error" + err);})
  }) 

  alert('Exam Scheduled! The code is: ' + examAccessCode);

}

//function to view the list of all assessments
function viewFacultyAssessmentsList(facultyKeyValue){
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
            const assessmentRef = ref(db,`/scheduledAssessments/${facultyKeyValue}`);
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
                    const assessmentFIC = assessment.FacultyInChargeName;
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



