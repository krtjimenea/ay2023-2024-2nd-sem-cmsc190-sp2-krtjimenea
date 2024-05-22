
//Script for Admin 

//import for SDKs
import { FirebaseApp } from './firebase';
import { getFirestore, doc, setDoc, addDoc,collection } from "firebase/firestore";
import {getAuth,signInWithCredential,GoogleAuthProvider, signOut} from 'firebase/auth';
import {getDatabase,ref,set,on, onValue, get, update,push, child, query,orderByChild,equalTo, startAfter, orderByValue,setValue} from 'firebase/database';
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
const AdminManageFacultyCourses = '/AdminManageFacultyCourses.html';
const AdminViewFaculty = '/AdminViewFaculty.html';
const AdminManageAssessments = '/AdminManageAssessments.html';
const AdminSchedulePage = '/AdminSchedulePage.html';
const AdminViewAssessments = '/AdminViewAssessments.html';
const AdminManageStudents = '/AdminManageStudents.html';
const AdminViewAllCourses = '/AdminViewAllCourses.html';
const AdminViewCourseOnly = '/AdminViewCourseOnly.html';
const AdminManageStudentsInCourse = '/AdminManageStudentsInCourse.html';
const AdminManageExamsInCourse = '/AdminManageExamsInCourse.html';
const AdminViewProctoringReportSummary = '/AdminViewProctoringReportSummary.html';
const AdminViewStudentExams =  '/AdminViewStudentExams.html'
const AdminStudentProctoringReportSummary = '/AdminStudentProctoringReportSummary.html';
const AdminStudentAuthReport = '/AdminStudentAuthReport.html';

//display the faculty data
function displayFacultyList(){
 
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
                  //alert("Success Firebase Access!");
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
                                      <p id="card-labels">Email:</p>
                                      <p class="cardText" id="FacultyEmail">${facultyEmail}</p>
                                  </div>
                            </div>
                          </div>`;
                        
                      
                      // facultyDiv.innerHTML+=facultyHTML
                      
                  }

                } else {
                  var cardListDiv = document.getElementById('cardList');
                  cardListDiv.innerHTML=`<p class="DBisEmptyMssg">Collection is empty, Nothing to show</p>`;
                }
              })
              .catch((error) => {
                  console.log("Error with database: " + error);
              });
          }
      })
      .catch((error) => {
        alert("SSO ended with an error" + error);
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
      //this the current path, create an array of history in the service worker, pass as message
      chrome.runtime.sendMessage({action: 'sendCurrentPath', value: path});
      if(path === '/AdminManageFaculty.html'){
        displayFacultyList();

      }else if(path ==='/AdminManageCourses.html'){
        //access chrome storage for any passed value
        chrome.storage.local.get('value1', function(data) {
          //course
          var currentCourse = data.value1;
          //faculty
          chrome.storage.local.get('currentfacultyIDValue', function(data) {
            var currentFaculty = data.currentfacultyIDValue;
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
      }else if(path === '/AdminViewAllCourses.html'){
        viewCoursesList();

      }else if(path === '/AdminViewCourseOnly.html'){
       //access chrome storage for any passed value
       chrome.storage.local.get('value1', function(data) {
        var currentCourse = data.value1;
        if(currentCourse){
          viewOneCourseOnly(currentCourse);
        }
      
       });

      }else if(path === '/AdminManageFacultyCourses.html'){
          //call the function and pass the name value
          chrome.storage.local.get('currentfacultyKeyValue', function(data) {
            var currentFaculty = data.currentfacultyKeyValue;
            viewDetailsFaculty(currentFaculty);
          });

      }else if(path === '/AdminManageStudentsInCourse.html'){
        chrome.storage.local.get('value1', function(data) {
          var currentCourse = data.value1;
          if(currentCourse){
            viewClasslistOfCourse(currentCourse);
          }
        });

      }else if(path === '/AdminManageExamsInCourse.html'){
        chrome.storage.local.get('value1', function(data) {
          var currentCourse = data.value1;
          if(currentCourse){
            viewExamsOfCourse(currentCourse);
          }
        });
      }else if(path === '/AdminViewProctoringReportSummary.html'){
        chrome.storage.local.get('value1', function(data) {
          var currentCourse = data.value1;
          if(currentCourse){
            chrome.storage.local.get('currentExamKey', function(data) {
              var currentExam = data.currentExamKey;
              if(currentExam){
                chrome.storage.local.get('currentExamName', function(data) {
                  var currentExamName = data.currentExamName;
                  if(currentExamName){
                    ViewProctoringReportSummary(currentExam, currentCourse, currentExamName);
                  }
                });
               
              }
            });
          }
        });
      }else if(path === '/AdminViewStudentExams.html'){
        chrome.storage.local.get('currentstudentKey', function(data) {
          var currentStudent = data.currentstudentKey;
          if(currentStudent){
            viewStudentAssessmentsList(currentStudent);
            
          }
        });
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
    var facultyNameValue;
    
  
    headDiv.addEventListener('click', function (event) {
      console.log('Click event fired');
  
      const target = event.target;

      //for routing
      if(target.id ===  'BackBtn' || target.id === 'BackIcon'){
        console.log('Back Clicked');
        navigateBack();
      }
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

      //CSV Upload Faculty
      if(target.id==='Add-New-CSV-Faculty'){
        // openModal();
        let modal = document.getElementsByClassName("Add-Faculty-CSV-Modal")[0];
        let overlay = document.getElementsByClassName("modal-faculty-Overlay")[0];
        modal.style.display = "block";
        overlay.style.display = "block";

      }

      if (target.className === 'ModalCloseBtnCSV'){
        console.log('Clicked Close Modal');
        //closeModal();
        let modal = document.getElementsByClassName("Add-Faculty-CSV-Modal")[0];
        let overlay = document.getElementsByClassName("modal-faculty-Overlay")[0];
        modal.style.display = "none";
        overlay.style.display = "none";

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
        chrome.storage.local.get('currentfacultyIDValue', function(data) {
          var currentFaculty = data.currentfacultyIDValue;
          createNewCourse(currentFaculty);
        });
      }

      //for clicking the faculty card
      if(target.id==='FacultyName'){
        console.log('Clicked Faculty Card');
        //get the clicked FacultyName or ID
        var facultyKeyValue = target.textContent;
        // var facultyStringValue = facultyString.split(" ");
        // facultyKeyValue = facultyString[0];
        // facultyNameValue = facultyString[1];
        chrome.runtime.sendMessage({action: 'facultyKeyValue', value: facultyKeyValue});
        chrome.sidePanel.setOptions({path:AdminManageFacultyCourses})
        

      }

      //for clicking the course card
      if(target.id === 'CourseCode'){
        courseCodeValue = target.innerText;
        chrome.runtime.sendMessage({action: 'passValue1', value: courseCodeValue});
        chrome.sidePanel.setOptions({path:AdminManageCourse});
      }

      //for clicking the course card via courses only
      if(target.id === 'CourseCodeOnly'){
        courseCodeValue = target.innerText;
        chrome.runtime.sendMessage({action: 'passValue1', value: courseCodeValue});
        chrome.sidePanel.setOptions({path:AdminViewCourseOnly});

      }

      //for clicking the add new classlist button
      //add classlist csv modal and function
      if(target.id === 'Add-New-Classlist'){
        console.log("Clicked Add New Classlist CSV");
        var fileInput = document.querySelector('input[type="file"]');
        var file = fileInput.files[0];
        if(file){
          var reader = new FileReader();
          reader.addEventListener('error', function(event) {
            // Display error modal
            let modal = document.getElementsByClassName("Alerts-Failure-Modal")[0];
            let overlay = document.getElementsByClassName("modal-failure-Overlay")[0];
            modal.style.display = "block";
            overlay.style.display = "block";
            let alertMessage = document.getElementById("ModalTextFailure-labels");
            alertMessage.textContent = "No File Attached!!!";
          });

          reader.addEventListener('load', function() {
            if (this.result !== null) {
              // File was successfully loaded, proceed with processing
              uploadClasslistCSV(this.result);
            } else {
              // Display error modal
              let modal = document.getElementsByClassName("Alerts-Failure-Modal")[0];
              let overlay = document.getElementsByClassName("modal-failure-Overlay")[0];
              modal.style.display = "block";
              overlay.style.display = "block";
              let alertMessage = document.getElementById("ModalTextFailure-labels");
              alertMessage.textContent = "No File Attached!!!";
            }
          });

            reader.readAsText(file);
        }else{
          // Display error modal
          let modal = document.getElementsByClassName("Alerts-Failure-Modal")[0];
          let overlay = document.getElementsByClassName("modal-failure-Overlay")[0];
          modal.style.display = "block";
          overlay.style.display = "block";
          let alertMessage = document.getElementById("ModalTextFailure-labels");
          alertMessage.textContent = "No File Attached!!!";
        }
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
        chrome.storage.local.get('value3', function(data) {
          var currentFacultyName = data.value3;
          console.log("Passing: "+ currentFacultyName);
          //function add the exam to the database then generate a link
          createNewAssessment(currentFacultyName);
        });
      
      }

      //for viewing students enrolled in that course
      if(target.id=== 'View-New-Classlist'){
        chrome.sidePanel.setOptions({path:AdminManageStudentsInCourse});
      }

      //for viewing exams under that course
      if(target.id==='View-Exam-Course'){
        chrome.sidePanel.setOptions({path:AdminManageExamsInCourse});
      }

      //for viewing and generating proctoring report summary for that exam
      if(target.id === 'ViewProctoringReportSummary'){
        var assessmentKey = target.value;
        var keysList = assessmentKey.split("/");
        chrome.runtime.sendMessage({action: 'examKey', value: keysList[0]});
        chrome.runtime.sendMessage({action: 'examName', value: keysList[1]});
        chrome.sidePanel.setOptions({path:AdminViewProctoringReportSummary});
      }

      if(target.id === 'ViewProctoringReportSummaryExamOnly'){
        var dataKey = target.value;
        var keysList = dataKey.split("/");
        chrome.runtime.sendMessage({action: 'examKey', value: keysList[0]});
        chrome.runtime.sendMessage({action: 'passValue1', value: keysList[1]});
        chrome.runtime.sendMessage({action: 'examName', value: keysList[2]});
        chrome.sidePanel.setOptions({path:AdminViewProctoringReportSummary});
      }

      //for viewing student dashboard pass the student
      if(target.id === 'ViewStudentAssignedExam'){
        //find and get the key first
        var selectedStudentKey = target.value;
        chrome.runtime.sendMessage({action: 'studentKey', value: selectedStudentKey});
        chrome.sidePanel.setOptions({path: AdminViewStudentExams});


      }

      if(target.className === 'ModalFailureCloseBtn'){
        console.log('Clicked Close Modal');
        //closeModal();
        let modal = document.getElementsByClassName("Alerts-Failure-Modal")[0];
        let overlay = document.getElementsByClassName("modal-failure-Overlay")[0];
        modal.style.display = "none";
        overlay.style.display = "none";
      }

      //for viewing individual proctoring report
      if(target.id === 'ViewStudentAssignedExamReport'){
        //state the value
        var selectedSectionandExam = target.value;
        var currentKey = selectedSectionandExam.split("/");
        chrome.runtime.sendMessage({action: 'currentStudentSection_Report', value: currentKey[0]});
        chrome.runtime.sendMessage({action: 'currentStudentExam_Report', value: currentKey[1]});
        //change panel
        chrome.sidePanel.setOptions({path:AdminStudentProctoringReportSummary })
      }

      //for viewing auth reports per student
      if(target.id==='ViewAuthReportSummary'){
        //state the value
        var selectedSectionandExam = target.value;
        var currentKey = selectedSectionandExam.split("/");
        chrome.runtime.sendMessage({action: 'currentStudentSection_Report', value: currentKey[0]});
        chrome.runtime.sendMessage({action: 'currentStudentExam_Report', value: currentKey[1]});
        //change panel
        chrome.sidePanel.setOptions({path:AdminStudentAuthReport})
      }
      
      if(target.id === 'LogOutFacultyAdmin'){
        // console.log('Student Logged Out');
        AdminsignOut();
      }


    });
});

//to handle route changes
function navigateBack() {
  chrome.storage.local.get('historyStack', function(result) {
    var historyStack = result.historyStack || [];
    if (historyStack.length > 1) {
      // Pop the last item from the stack
      var lastItem = historyStack.pop();
      //save the updated stack back to chrome storage
      chrome.storage.local.set({'historyStack': historyStack}, function() {
        // Use the last item to navigate or perform the relevant action
        var backToPath = historyStack.slice(-1)[0];
        console.log("Navigating back to:", backToPath );
        chrome.sidePanel.setOptions({path:backToPath});

      });
    } else {
      console.log("No history to navigate back");
    }
  });
}

//function to render the exams of the student
function viewStudentAssessmentsList(currentStudentKey){
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
            const assessmentRef = ref(db,`/assignedAssessments/${currentStudentKey}`);
            
            get(assessmentRef)
              .then((snapshot) => {
                if (snapshot.exists()) {
                  //alert("Success Firebase Access!");
                  //checking for snapshot return
                  const childData = snapshot.val();
                 
                  for(const assessmentId in childData){
                    
                    const assessmentSpecificRef = ref(db,`/assessments/${assessmentId}`);
                    get(assessmentSpecificRef)
                      .then((snapshotAssessment) => {
                        if(snapshotAssessment.exists()){
                          var cardListDiv = document.getElementById('cardList');
                          const examData = snapshotAssessment.val();
                          const assessmentFIC = examData.FacultyInChargeName;
                          const assessmentName = examData.name;
                          
                          const assessmentCourseSection = examData.course;
                          const assessmentLink = examData.link;
                          const assessmentCode = examData.access_code;
                          const assessmentStartTime = examData.expected_time_start;
                          const assessmentEndTime = examData.expected_time_end;
                          cardListDiv.innerHTML += `<div class="cards">
                                  <p class="cardHeader" id="ExamName">${assessmentName}</p>
                                    <div class="cardDivText">
                                        <div class="cardSubDiv">
                                            <p id="card-labels">Assigned Course and Section:</p>
                                            <p class="cardText" id="CourseTitle">${assessmentCourseSection}</p>
                                        </div>
                                        <div class="cardSubDiv">
                                            <p id="card-labels">Faculty:</p>
                                            <p class="cardText" id="CourseTitle">${assessmentFIC}</p>
                                        </div>  
                                        <div class="cardSubDiv">
                                          <p id="card-labels">Link:</p>
                                          <a href="${assessmentLink}" id="TabURL" class="cardText">Click Here</a>
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

                                        <div class="cardSubDiv-Click">
                                      <button class="cardText" id="ViewStudentAssignedExamReport" value="${assessmentCourseSection}/${assessmentId}">View Proctoring Report</p>
                                    </div>
                                  </div>
                                </div>`;

                        }else{
                          var cardListDiv = document.getElementById('cardList');
                          cardListDiv.innerHTML=`<p class="DBisEmptyMssg">Collection is empty, Nothing to show</p>`;
                        }
                       


                      }).catch((error) =>{
                        console.log("Error with database: " + error);
                      })
                  }
               
                } else {
                  var cardListDiv = document.getElementById('cardList');
                  cardListDiv.innerHTML=`<p class="DBisEmptyMssg">Collection is empty, Nothing to show</p>`;
                }
              })
              .catch((error) => {
                  console.log("erroror with database: " + error);
              });
          }
      })
      .catch((error) => {
        alert("SSO ended with an erroror" + error);
      });
  });
  
}
//function to render the proctoring report for the exam
function ViewProctoringReportSummary(currentExamKey, currentCourseKey, currentExamName){
  
  //get the total number of prs under that exam
  //check if there is a logged in user
  chrome.identity.getAuthToken({ interactive: true }, token =>
    {
      if ( chrome.runtime.lasterroror || ! token ) {
        alert(`SSO ended with an erroror: ${JSON.stringify(chrome.runtime.lasterroror)}`)
        return
      }
      //firebase authentication
      signInWithCredential(auth, GoogleAuthProvider.credential(null, token))
      .then(res =>{
          const user = auth.currentUser;
          const db = getDatabase(); 
          //get profile uid
          if (user !== null) {
            const assessmentRef = ref(db,`/proctoringReportStudent/${currentCourseKey}/${currentExamKey}`);
            var numof_StudentsTookExam = 0;
            get(assessmentRef)
              .then((snapshot) => {
                if (snapshot.exists()) {
                  const childData = snapshot.val();
                  let headerCourseCode = document.getElementById('AdminHeaderDetails-CourseCode');
                  headerCourseCode.textContent =  currentExamName;
                  //get the count of how many proctoring reports (aka total of who took the exam)
                  numof_StudentsTookExam = snapshot.size;
                  let studentsTotal = document.getElementById('TotalStudents');
                  studentsTotal.textContent = numof_StudentsTookExam;
                  // console.log("Total Num of Students Taking the Exam: ", numof_StudentsTookExam);
                } else {
                  numof_StudentsTookExam = 0;
                  let studentsTotal = document.getElementById('TotalStudents');
                  studentsTotal.textContent = numof_StudentsTookExam;
                  let headerCourseCode = document.getElementById('AdminHeaderDetails-CourseCode');
                  headerCourseCode.textContent =  "No Data Yet";
                  //alert("errorOR: Doesnt Exist, Firebase Access!");
                }
              })
              .catch((error) => {
                  console.log("error with database: " + error);
              });

              //query for flagged activity
              var numof_FlaggedStudents = 0;
              const flaggedActivityQuery = query(assessmentRef, orderByChild('student_total_flagged_activity'), startAfter(0));
              get(flaggedActivityQuery)
                .then((snapshot) => {
                  if (snapshot.exists()) {
                    numof_FlaggedStudents = snapshot.size;
                    let studentsFlagged = document.getElementById('TotalFlagged');
                    studentsFlagged.textContent = numof_FlaggedStudents;
                    // const data = snapshot.val();
                    // console.log('Total Num of Students with flagged activity:', numof_FlaggedStudents);
                  } else {
                    numof_FlaggedStudents = 0;
                    let studentsFlagged = document.getElementById('TotalFlagged');
                    studentsFlagged.textContent = numof_FlaggedStudents;
                    // console.log('No students found with flagged activity');
                  }
                }).catch((erroror) => {
                  console.erroror('erroror fetching data:', erroror);
                });
              
              //query for NO flagged activity
              var numof_No_FlaggedStudents = 0;
              const no_flaggedActivityQuery = query(assessmentRef, orderByChild('student_total_flagged_activity'), equalTo(0));
              get(no_flaggedActivityQuery)
                .then((snapshot) => {
                  if (snapshot.exists()) {
                    numof_No_FlaggedStudents = snapshot.size;
                    let studentsNOTflagged = document.getElementById('TotalNoFlagged');
                    studentsNOTflagged.textContent = numof_No_FlaggedStudents;
                    // const data = snapshot.val();
                    // console.log('Total Num of Students with NO flagged activity:', numof_No_FlaggedStudents);
                  } else {
                    numof_No_FlaggedStudents = 0;
                    let studentsNOTflagged = document.getElementById('TotalNoFlagged');
                    studentsNOTflagged.textContent = numof_No_FlaggedStudents;
                    // console.log('No students found with NO flagged activity');
                  }
                }).catch((error) => {
                  console.error('Error fetching data:', error);
                });

              //query for did auth allow
              var numof_AuthAllowedStudents = 0;
              const AuthAllowedStudentsQuery = query(assessmentRef, orderByChild('student_AuthFlagged'), equalTo(true));
              get(AuthAllowedStudentsQuery)
                .then((snapshot) => {
                  if (snapshot.exists()) {
                    numof_AuthAllowedStudents = snapshot.size;
                    let studentTotalAuthenticated = document.getElementById('TotalAuthenticated');
                    studentTotalAuthenticated.textContent =numof_AuthAllowedStudents;
                    // const data = snapshot.val();
                    //console.log('Total Num of Students Allowed Authenticated:', numof_AuthAllowedStudents);
                  } else {
                    numof_AuthAllowedStudents = 0;
                    let studentTotalAuthenticated = document.getElementById('TotalAuthenticated');
                    studentTotalAuthenticated.textContent =numof_AuthAllowedStudents;
                    // console.log('No students found with Allowed Authenticated');
                  }
                }).catch((error) => {
                  console.error('Error fetching data:', error);
                });
              
              //query for did NOT auth allow
              var numof_NotAuthAllowedStudents = 0;
              const AuthNotAllowedStudentsQuery = query(assessmentRef, orderByChild('student_AuthFlagged'), equalTo(false));
              get(AuthNotAllowedStudentsQuery)
                .then((snapshot) => {
                  if (snapshot.exists()) {
                    numof_NotAuthAllowedStudents = snapshot.size;
                    let studentTotalNotAuthenticated = document.getElementById('TotalNotAuthenticated');
                    studentTotalNotAuthenticated.textContent = numof_NotAuthAllowedStudents;
                    // const data = snapshot.val();
                    //console.log('Total Num of Students NOT Authenticated:',  numof_NotAuthAllowedStudents);
                  } else {
                    numof_NotAuthAllowedStudents = 0;
                    let studentTotalNotAuthenticated = document.getElementById('TotalNotAuthenticated');
                    studentTotalNotAuthenticated.textContent = numof_NotAuthAllowedStudents;
                    //console.log('No students found with NOT Authenticated');
                  }
                }).catch((error) => {
                  console.error('Error fetching data:', error);
                });
              
          }
      })
      .catch((error) => {
        alert("SSO ended with an error" + error);
      });
  });

  


}
//function to view exams of the course selected
function viewExamsOfCourse(currentCourse){
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
            const assessmentRef = ref(db,`/courseAssessments/${currentCourse}`);
            get(assessmentRef)
              .then((snapshot) => {
                if (snapshot.exists()) {
                  //alert("Success Firebase Access!");
                  //checking for snapshot return
                  const childData = snapshot.val();
                  let headerCourseCode = document.getElementById('AdminHeaderDetails-CourseCode');
                  headerCourseCode.textContent = currentCourse;
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
                    const assessmentTimeLimit =  assessment.time_limit;

                    cardListDiv.innerHTML += `<div class="cards">
                                <p class="cardHeader" id="ExamName">${assessmentName}</p>
                                  <div class="cardDivText">
                                      <div class="cardSubDiv">
                                          <p id="card-labels">Faculty:</p>
                                          <p class="cardText" id="CourseTitle">${assessmentFIC}</p>
                                      </div>  

                                      <div class="cardSubDiv">
                                          <p id="card-labels">Link:</p>
                                          <a href="${assessmentLink}" id="TabURL" class="cardText">Click Here</a>
                                      </div>  
                                     
                                      <div class="cardSubDiv">
                                          <p id="card-labels">Start Time and Date:</p>
                                          <p class="cardText" id="CourseTitle">${assessmentStartTime}</p>
                                      </div>  
                                      <div class="cardSubDiv">
                                          <p id="card-labels">End Time and Date:</p>
                                          <p class="cardText" id="CourseTitle">${assessmentEndTime}</p>
                                      </div>  
                                      <div class="cardSubDiv">
                                        <p id="card-labels">Time Duration:</p>
                                        <p class="cardText" id="CourseTitle">${assessmentTimeLimit} mins</p>
                                      </div>  
                                      <div class="cardSubDiv-Click">
                                      <button class="cardText" id="ViewProctoringReportSummary" value="${assessmentId}/${assessmentName}">Click to View Proctoring Report</p>
                                    </div>
                                      
                                </div>
                              </div>`;

                  }
               
                } else {
                  var cardListDiv = document.getElementById('cardList');
                  cardListDiv.innerHTML=`<p class="DBisEmptyMssg">Collection is empty, Nothing to show</p>`;
                }
              })
              .catch((error) => {
                  console.log("Error with database: " + error);
              });
          }
      })
      .catch((error) => {
        alert("SSO ended with an error" + error);
      });
  });

}

//function to view classlist of course selected
function viewClasslistOfCourse(currentCourse){
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
              const studentRef = ref(db,`/takingClasses/${currentCourse}`);
              get(studentRef)
                .then((snapshot) => {
                  if (snapshot.exists()) {
                    //alert("Success Firebase Access!");
                    //checking for snapshot return
                    const childData = snapshot.val();
                    var cardListDiv = document.getElementById('cardList');
                    let headerCourseCode = document.getElementById('AdminHeaderDetails-CourseCode');
                    headerCourseCode.textContent = currentCourse;
                    cardListDiv.innerHTML='';
                    //loop through the snapshot
                    for(const studentId in childData){
                      const student = childData[studentId];
                      const studentEmail= student.Email;
                      const studentNumber = student.StudentNumber;
                      
  
                      cardListDiv.innerHTML += `<div class="cards">
                                  <p class="cardHeader" id="StudentFullName">${studentEmail}</p>
                                    <div class="cardDivText">
                                        <div class="cardSubDiv">
                                            <p id="card-labels">Student Number:</p>
                                            <p class="cardText" id="CourseTitle">${studentNumber}</p>
                                        </div>
                                       
                                    </div>
                                </div>`;
  
                    }
                 
                  } else {
                    var cardListDiv = document.getElementById('cardList');
                    cardListDiv.innerHTML=`<p class="DBisEmptyMssg">Collection is empty, Nothing to show</p>`;
                  }
                })
                .catch((error) => {
                    console.log("Error with database: " + error);
                });
            }
        })
        .catch((error) => {
          alert("SSO ended with an error" + error);
        });
    });

  
}
//function to update the path /takingAssessments/assessmentKey/Student
function updateTakingAssessmentsStudent(courseGivenAssessment, assessmentKey){

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
                  //alert("Success Firebase Access!");
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
                      console.log("Saved Exam to database!");
                    }).catch((error) => {
                      console.log(("error with database" + error));
                    })

                    //update path /assignedAssessment/studentkey/assessmentKey = true;
                    const updateAssignedAssessment = {}
                    updateAssignedAssessment[`/assignedAssessments/${studentId}/${assessmentKey}`] = true;
                    update(ref(db), updateAssignedAssessment)
                    .then(()=> {
                      console.log("Saved Assigned Exam to Student!");
                    }).catch((error) => {
                      console.log(("error with database" + error));
                    })
                    
                  }
                
                } else {
                  alert("Student data does not exist! Upload Classlist");
                  return;
                }
              })
              .catch((error) => {
                  console.log("Error with database: " + error);
              });
          }
       })//EOF signInWithCredential
      .catch(error =>{alert("SSO ended with an error" + error);})
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
  const data = studentData.trim().split(/\s*,\s*/);
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
              .catch((error) => {
                console.log("Error with database: " + error);
              })

              //update the Course and Student relationship
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
              .catch((error) => {
                console.log("Error with database: " + error);
              })

              //update Student and Course
              var updateCoursesofStudent = {};
              updateCoursesofStudent[`enrolledClasses/${newStudentKey}/${currentCourse}`] = true;
              update(ref(db), updateCoursesofStudent)
              .then(()=>{
                // console.log('Success in Adding new student to taking Classes');
              })
              .catch((error) => {
                console.log("Error with database: " + error);
              })
              
          }
         })//EOF signInWithCredential
        .catch(error =>{alert("SSO ended with an error" + error);})
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
    let modal = document.getElementsByClassName("Alerts-Success-Modal")[0];
    let overlay = document.getElementsByClassName("modal-success-Overlay")[0];
    modal.style.display = "block";
    overlay.style.display = "block";
    let alertMessage = document.getElementById("ModalTextSuccess-labels");
    alertMessage.textContent = 'Successfully Added Classlist!';
    let closeBtn = document.getElementsByClassName("ModalSuccessCloseBtn")[0];
    closeBtn.addEventListener("click", function(){
      modal.style.display = "none";
      overlay.style.display = "none";
      chrome.sidePanel.setOptions({path:AdminManageFacultyCourses})
    
    })
}
//function to view courses panel
function viewCoursePanel(currentFacultyKey,currentCourseKey){

  // console.log('Current FIC and Course Selection: ', currentFacultyKey + " " + currentCourseKey);
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
                //alert("Success Firebase Access!");
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
                      <div class="AdminInnerTextLabel">Upload Classlist CSV below:</div>
                      <div class="AdminAddButton">
                          <input id="csvFileInput" type="file"/>
                          <button type="button" class="Add-Buttons-Admin" id="Add-New-Classlist">Upload</button>
                          <button type="button" class="Add-Buttons-Admin" id="View-New-Classlist">View Classlist</button>
                      </div>`;
        
             
              } else {
                alert("Snapshot does not exist!");
              }
            })
            .catch((error) => {
                console.log("Error with database: " + error);
            });
        }
         
      }).catch((error) => {
        alert("SSO ended with an error" + error);
      });
  });
  
}

//function to view the faculty details panel
function viewDetailsFaculty(facultyKeyValue){
 
  //we need to have the name and key of the faculty
  var FacultyIDNumber;
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
                  snapshot.forEach(function(childSnapshot) {
                    //accessing data within the child node
                    var childData = childSnapshot.val();
                    //checking if the child node exists
                    if (childData.name === facultyKeyValue) {
                        FacultyIDNumber = childData.employeeNum;
                        console.log('Found a matching child:', childData.name + FacultyIDNumber);
                        chrome.runtime.sendMessage({action: 'facultyIDValue', value: FacultyIDNumber});
                        viewDetailsCourse(facultyKeyValue, FacultyIDNumber);

                     }
                  });

                } else {
                  alert("Data does not exist!");
                }
              })
              .catch((error) => {
                  console.log("Error with database: " + error);
              });
          }
      })
      .catch((error) => {
        alert("SSO ended with an error" + error);
      });
  });

  //manipulate the DOM
  // var currentHTML = document.getElementsByClassName("AppDiv-AdminManage");
  document.getElementsByClassName("AppDiv-AdminManage")[0].innerHTML ="";
  
  
  //change the button
  // document.getElementsByClassName("AdminAddButton").innerHTML = '';
  document.getElementsByClassName("AppDiv-AdminManage")[0].innerHTML = `<div class="AdminHeaderDetails">${facultyKeyValue}</div><div class="FacultySubHeader">Faculty Name</div><div class="AdminAddButton"> <button type="button" class="Add-Buttons-Admin" id="Add-New-Course">Add New Course</button> </div> <div id="cardList"></div>`;

  
  

}

//function to view the classes 
function viewDetailsCourse(facultyName, FacultyIDNumber){
  //manipulate AdminManageFaculty html panel
  //manipulate the DOM
  //check if there is a logged in user
  console.log(facultyName);
  console.log(FacultyIDNumber);
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
            const facultyRef = ref(db,`teachingClasses/${FacultyIDNumber}`);
            get(facultyRef)
              .then((snapshot) => {
                if (snapshot.exists() && snapshot.hasChildren()) {
                  //alert("Success Firebase Access!");
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
                  //alert("Snapshot does not exist! No courses to show");
                  var cardListDiv = document.getElementById('cardList');
                  cardListDiv.innerHTML=`<p class="DBisEmptyMssg">Collection is empty, Nothing to show</p>`;
                }
            
              })
              .catch((error) => {
                  console.log("Error with database: " + error);
              });
          }
      })
      .catch((error) => {
        alert("SSO ended with an error" + error);
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
                var Faculty = {
                  name: facultyName,
                  email: facultyEmail,
                  employeeNum: facultyID,
                  authProviderUID: ""
                }
                var newFaculty = JSON.parse(JSON.stringify(Faculty))
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
                    // alert('Success in Adding new Faculty');
                  })
                  .catch((error) => {
                    console.log("Error with database: " + error);
                  })

                //update teaching classes collection
                var newRelationship = {}
                const updatesRelation = {};
                updatesRelation['/teachingClasses/' + facultyID] = newRelationship;
                update(ref(db), updatesRelation)
                .then(()=>{
                  console.log('Success in Adding new Faculty to teaching Classes');
                  //alert('Success in Adding new Faculty to teaching Classes');
                  //automatic close modal
                  let modal = document.getElementsByClassName("Add-Faculty-Modal")[0];
                  let overlay = document.getElementsByClassName("modal-faculty-Overlay")[0];
                  modal.style.display = "none";
                  overlay.style.display = "none";
                  
                  //success alert
                  modal = document.getElementsByClassName("Alerts-Success-Modal")[0];
                  overlay = document.getElementsByClassName("modal-success-Overlay")[0];
                  modal.style.display = "block";
                  overlay.style.display = "block";
                  let alertMessage = document.getElementById("ModalTextSuccess-labels");
                  alertMessage.textContent = 'Success Adding New Faculty with ID: ' + facultyID;
                  let closeBtn = document.getElementsByClassName("ModalSuccessCloseBtn")[0];
                  closeBtn.addEventListener("click", function(){
  
                    modal.style.display = "none";
                    overlay.style.display = "none";
                    
                    //load the new database
                    monitorSidePanelPath();
                  })
                  
                })
                .catch((error) => {
                  console.log("Error with database: " + error);
                })

                
              }
           })//EOF signInWithCredential
          .catch(error =>{alert("SSO ended with an error" + error);})
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

   console.log("here: " + facultyKeyValue);

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
                    //alert('Success in Adding new course');  
                  }).catch((error) => {
                      console.log("Error with database: " + error);
                  })
                
                
                //update the Student and Course relationship
                var newRelationship = {}
                const updatesRelation = {};
                updatesRelation['/takingClasses/' + courseKey] = newRelationship;
                update(ref(db), updatesRelation)
                .then(()=>{
                  //console.log('Success in Adding new course to taking Classes');
                })
                .catch((error) => {
                  console.log("Error with database: " + error);
                })

                //update the FIC and Course relationship
                // var newRelationshipFaculty = { `${courseKey}`: newCourse};
                const updatesRelationFaculty = {};
                updatesRelationFaculty[`/teachingClasses/${facultyKeyValue}/${courseKey}`] = newCourse;
  
                update(ref(db), updatesRelationFaculty)
                .then(()=>{
                  console.log('Success in Adding new course to teaching Classes');
                   //close add course modal
                   let modal = document.getElementsByClassName("Add-Course-Modal")[0];
                   let overlay = document.getElementsByClassName("modal-course-Overlay")[0];
                   modal.style.display = "none";
                   overlay.style.display = "none";
                   let modalSuccess = document.getElementsByClassName("Alerts-Success-Modal")[0];
                   let overlaySuccess = document.getElementsByClassName("modal-success-Overlay")[0];
                   modalSuccess.style.display = "block";
                   overlaySuccess.style.display = "block";
                   let alertMessage = document.getElementById("ModalTextSuccess-labels");
                   alertMessage.textContent = 'Success in adding new course!';
                   let closeBtn = document.getElementsByClassName("ModalSuccessCloseBtn")[0];
                   closeBtn.addEventListener("click", function(){
                      //load the new database
                      location.reload();
                    })
                  
                })
                .catch((error) => {
                  console.log("Error with database: " + error);
                })
               
            }
        
            }).catch(error =>{alert("SSO ended with an error" + error);})
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
                  //alert("Success Firebase Access!");
                  // console.log(snapshot.val()); //checking for snapshot return
                  const childData = snapshot.val();
                  var courseDropdownDiv = document.getElementById('courselist');
                  courseDropdownDiv.innerHTML ='';
                  //loop through the snapshot
                  for(const courseId in childData){
                    
                    const course = childData[courseId];
                    const courseCode = course.code;
                    const courseSection = course.section;
                    //console.log("Course Key: " + courseCode);

                    const courseOption = document.createElement('option');
                    courseOption.value =courseId;
                    courseOption.textContent = courseCode + courseSection;
                    courseDropdownDiv.append(courseOption);
                  }
               
                
                } else {
                  // alert("Data does not exist!");
                  var courseDropdownDiv = document.getElementById('courselist');
                  courseDropdownDiv.innerHTML ='';
                  const courseOption = document.createElement('option');
                  courseOption.value = 'No Courses Yet';
                  courseOption.textContent = 'No Courses Yet';
                  courseDropdownDiv.append(courseOption);
                  
                }
              })
              .catch((error) => {
                  console.log("Error with database: " + error);
              });
          }
      })
      .catch((error) => {
        alert("SSO ended with an error" + error);
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
                  //alert("Success Firebase Access!");
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
                  alert("Data does not exist!");
                }
              })
              .catch((error) => {
                  console.log("Error with database: " + error);
              });
            
            //get the input faculty of the user
            var selectedFaculty;
            var selectedFacultyName;
            document.getElementById('facultylist').addEventListener('change', function(){
              selectedFacultyName = this.options[this.selectedIndex].text;
              //console.log("Selected Faculty Name: " + selectedFacultyName);
              chrome.runtime.sendMessage({action:'passValue3', value: selectedFacultyName});

            })
            document.getElementById('facultylist').addEventListener('change', function(){
              selectedFaculty = this.value;
              if(selectedFaculty === 'default'){
                //nothing selected
                viewFacultyCourses(selectedFaculty);
              }else{
                //console.log("Selected Faculty: " + selectedFaculty);
                //loop through the courses taught by the chosen faculty
                viewFacultyCourses(selectedFaculty);
              }
              
            })


           
          }
      })
      .catch((error) => {
        alert("SSO ended with an error" + error);
      });
  });
  
}

//function to generate a 6 digit code
function generateExamCode(){
  const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6)
  var ID = nanoid(6);
  return ID;
}

//function to convert time
function AMPMFormat(currentTime){

  const [hours, minutes] = currentTime.split(':');
  const period = hours >= 12 ? 'PM' : 'AM';
  //12-hour format
  const formattedHours = hours % 12 || 12;
  const formattedTime = `${formattedHours}:${minutes} ${period}`;

  return formattedTime;

}
//function to add the scheduled exam by the admin
function createNewAssessment(currentFacultyName){
  
  //get all the input
  var examName = document.getElementById('assessmentName').value;
  var facultySelected = document.getElementById('facultylist').value;
  var facultyNameSelected = currentFacultyName;
  var courseSelected = document.getElementById('courselist').value;
  //Date and Time
  var startDateSelected = document.getElementById('start-date').value;
  var startTimeSelected = document.getElementById('start-time').value;
  var endDateSelected = document.getElementById('end-date').value;
  var endTimeSelected = document.getElementById('end-time').value;
  //split time values
  const formattedStartTime = AMPMFormat(startTimeSelected);
  const formattedEndTime = AMPMFormat(endTimeSelected);

  var assessmentTimeDuration = document.getElementById('assessmentTimeDuration').value;
  var examLink = document.getElementById('assessmentLinkInput').value;
  if(!examLink.trim()) {
    // examLink is empty or  whitespace
    let modal = document.getElementsByClassName("Alerts-Failure-Modal")[0];
    let overlay = document.getElementsByClassName("modal-failure-Overlay")[0];
    modal.style.display = "block";
    overlay.style.display = "block";
    let alertMessage = document.getElementById("ModalTextFailure-labels");
    alertMessage.textContent = "Enter a Valid Exam Link!";
      return; 
  }
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
            //check first if there are students enrolled in that class
            const db = getDatabase();
            const takingClassesRef = ref(db,`takingClasses/${courseSelected}`);
            get(takingClassesRef)
              .then((snapshot) => {
                if (snapshot.exists()) {
                  //there are students
                  //adding the assessment to all the database /paths
                  user.providerData.forEach((profile) => {
                    const facultyName = profile.displayName;
                    update(ref(db,'assessments/' + assessmentKey),{
                      FacultyInCharge: receivedUserId,
                      FacultyInChargeName: facultyName,
                      name: examName,
                      course: courseSelected,
                      link:examLink,
                      access_code: examAccessCode,
                      expected_time_start: formattedStartTime,
                      expected_time_end: formattedEndTime,
                      date_start:startDateSelected,
                      date_end:endDateSelected,
                      time_limit: assessmentTimeDuration

                          
                    }).then(()=> {
                      //alert("Saved to database!");
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
                      expected_time_start: formattedStartTime,
                      expected_time_end: formattedEndTime,
                      date_start:startDateSelected,
                      date_end:endDateSelected,
                      time_limit: assessmentTimeDuration,
                      students: {}
                          
                    }).then(()=> {
                      //alert("Saved to database!");
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
                      expected_time_start: formattedStartTime,
                      expected_time_end: formattedEndTime,
                      date_start:startDateSelected,
                      date_end:endDateSelected,
                      time_limit: assessmentTimeDuration

                    }).then(()=> {
                      //alert("Saved to database!");
                    
                    }).catch((err) => {
                      console.log(("error with database" + err));
                    })
                    //update course assessments
                    update(ref(db,`courseAssessments/${courseSelected}/${assessmentKey}`),{
                      name: examName,
                      FacultyInChargeName: facultyName,
                      course: courseSelected,
                      link:examLink,
                      access_code: examAccessCode,
                      expected_time_start: formattedStartTime,
                      expected_time_end: formattedEndTime,
                      date_start:startDateSelected,
                      date_end:endDateSelected,
                      time_limit: assessmentTimeDuration
                    }).then(()=> {
                      //console.log("Saved to database!");
                      let modal = document.getElementsByClassName("Alerts-Success-Modal")[0];
                      let overlay = document.getElementsByClassName("modal-success-Overlay")[0];
                      modal.style.display = "block";
                      overlay.style.display = "block";
                      let alertMessage = document.getElementById("ModalTextSuccess-labels");
                      alertMessage.textContent = `Exam Code is: ${examAccessCode}`;
                      let closeBtn = document.getElementsByClassName("ModalSuccessCloseBtn")[0];
                      closeBtn.innerText = "Send Exam Code to Students";
                      closeBtn.addEventListener("click", function(){
                        modal.style.display = "none";
                        overlay.style.display = "none";
                        //Send Email
                        sendExamAccessCodeMailer(courseSelected, assessmentKey);
                      })
                    }).catch((error) => {
                      console.log(("error with database" + error));
                    })
                  });

                }else{
                  let modal = document.getElementsByClassName("Alerts-Failure-Modal")[0];
                  let overlay = document.getElementsByClassName("modal-failure-Overlay")[0];
                  modal.style.display = "block";
                  overlay.style.display = "block";
                  let alertMessage = document.getElementById("ModalTextFailure-labels");
                  alertMessage.textContent = "No Student Data, Upload Classlist";

                }
              }).catch((err) => {
                console.log(("error with database" + err));
              })
            

           
            
          }
       })//EOF signInWithCredential
      .catch(error =>{alert("SSO ended with an error" + error);})
  }) 

  //alert('Exam Scheduled! The code is: ' + examAccessCode);

}

//function to send the exam code to the students taking the exam
function sendExamAccessCodeMailer(courseSelected, assessmentKey){
  //before sending the email, we need to check if the student is already registered via auth
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
            const firestoreDB = getFirestore();
            const takingAssessmentsRef = ref(db,`/takingAssessments/${assessmentKey}/students/`);
            const detailsAssessmentsRef = ref(db,`/takingAssessments/${assessmentKey}/`);
            const studentsRef = ref(db, '/students');       
            
            get(detailsAssessmentsRef)
              .then((examSnapshot) => {
                const examData = examSnapshot.val();
                const assessmentFIC = examData.FacultyInChargeName;
                const assessmentName = examData.name;
                const assessmentCourseSection = examData.course;
                const assessmentCode = examData.access_code;
                const assessmentStartTime = examData.expected_time_start;
                const assessmentEndTime = examData.expected_time_end;
                const assessmentStartDate= examData.date_start;
                const assessmentEndDate= examData.date_end;
                const assessmentTimeDuration = examData.time_limit;
              
                get(takingAssessmentsRef)
                  .then((snapshot) => {
                    if (snapshot.exists()) {
                      const takingAssessmentsData = snapshot.val();
                      get(studentsRef)
                        .then((studentsSnapshot) => {
                          if (studentsSnapshot.exists()) {
                            const studentsData = studentsSnapshot.val();
                            const matches = [];
                            for(const studentId in takingAssessmentsData) {
                              //get assessment data
                              if(studentsData[studentId]) {
                                //check if that match has authProviderUID (registered)
                                if(studentsData[studentId].authProviderUID !== ""){
                                  matches.push(studentsData[studentId]);
                                  //Construct Email;
                                  const emailData = {
                                    to: [studentsData[studentId].Email],
                                    message: {
                                      subject: `Your Exam Code for ${assessmentName}`,
                                      html:`<p>Dear ${studentsData[studentId].FirstName} ${studentsData[studentId].LastName},</p>
                                      <p>As part of ${assessmentCourseSection}, you are required to take the following exam:</p>
                                      <ul>
                                          <li>Exam Name: ${assessmentName}</li>
                                          <li>Exam Faculty: ${assessmentFIC}</li>
                                          <li>Exam Start Date (yyyy-mm-dd): ${assessmentStartDate}</li>
                                          <li>Exam Start Time: ${assessmentStartTime}</li>
                                          <li>Exam End Date (yyyy-mm-dd): ${assessmentEndDate}</li>
                                          <li>Exam End Time: ${assessmentEndTime}</li>
                                          <li>Exam Duration: ${assessmentTimeDuration} minutes</li>
                                      </ul>
                                      <h3>Your unique exam code is: ${assessmentCode}</h3>
                                      <p>Please ensure you have the necessary equipment and a stable internet connection before the exam begins.</p>
                                      <p>If you have any questions or concerns, feel free to reach out to us.</p>
                                      <p>Good luck with your exam!</p>`
                                    }
                                  };
                                  addDoc(collection(firestoreDB, 'mail'), emailData);
                                  let modal = document.getElementsByClassName("Alerts-Success-Modal")[0];
                                  let overlay = document.getElementsByClassName("modal-success-Overlay")[0];
                                  modal.style.display = "block";
                                  overlay.style.display = "block";
                                  let alertMessage = document.getElementById("ModalTextSuccess-labels");
                                  alertMessage.textContent = 'Exam Code sent to students';
                                  let closeBtn = document.getElementsByClassName("ModalSuccessCloseBtn")[0];
                                  closeBtn.innerText = "Continue";
                                  closeBtn.addEventListener("click", function(){
                                    chrome.sidePanel.setOptions({path:AdminManageAssessments});
                                  })
                                  //After Emailing Students Go Back to Cour
                                }//EOF Checking if Registered

                              }//EOF Match
                                if(matches.length === 0){
                                  let modal = document.getElementsByClassName("Alerts-Failure-Modal")[0];
                                  let overlay = document.getElementsByClassName("modal-failure-Overlay")[0];
                                  modal.style.display = "block";
                                  overlay.style.display = "block";
                                  let alertMessage = document.getElementById("ModalTextFailure-labels");
                                  alertMessage.textContent = "Ask Students to register first before scheduling exam";
                                }

                            }//EOF Forloop
        
                          }else{
                            console.log('No student data available. Upload Classlist');
                          }
                        })
                        .catch((error) => {
                          console.log('Error fetching students data:', error);
                        });

                    }else{
                      alert('No student data available. Upload Classlist');
                    }
                  })
                  .catch((error) => {
                    console.log("Error with database: " + error);
                  });
              }).catch((error) => {
                console.log("Error with database: " + error);
              });
            }
       })//EOF signInWithCredential
      .catch(error =>{alert("SSO ended with an error" + error);})
  }) 


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
                  //alert("Success Firebase Access!");
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
                    const assessmentStartDate = assessment.date_start;
                    const assessmentEndDate = assessment.date_end;
                    const assessmentTimeLimit =  assessment.time_limit;

                    cardListDiv.innerHTML += `<div class="cards">
                                <p class="cardHeader" id="ExamName">${assessmentName}</p>
                                  <div class="cardDivText">
                                      <div class="cardSubDiv">
                                          <p id="card-labels">Course and Section:</p>
                                          <p class="cardText" id="CourseTitle">${assessmentCourseSection}</p>
                                      </div>
                                      <div class="cardSubDiv">
                                          <p id="card-labels">Faculty:</p>
                                          <p class="cardText" id="CourseTitle">${assessmentFIC}</p>
                                      </div>  
                                      <div class="cardSubDiv">
                                          <p id="card-labels">Link:</p>
                                          <a href="${assessmentLink}" id="TabURL" class="cardText">Click Here</a>
                                      </div>  
                                      <div class="cardSubDiv">
                                          <p id="card-labels">Access Code:</p>
                                          <p class="cardText" id="CourseTitle">${assessmentCode}</p>
                                      </div>  
                                      <div class="cardSubDiv">
                                          <p id="card-labels">Start Date:</p>
                                          <p class="cardText" id="CourseTitle">${assessmentStartDate}</p>
                                      </div>  
                                      <div class="cardSubDiv">
                                          <p id="card-labels">Start Time:</p>
                                          <p class="cardText" id="CourseTitle">${assessmentStartTime}</p>
                                      </div> 
                                      <div class="cardSubDiv">
                                          <p id="card-labels">End Date:</p>
                                          <p class="cardText" id="CourseTitle">${assessmentEndDate}</p>
                                      </div>  
                                      <div class="cardSubDiv">
                                          <p id="card-labels">End Time:</p>
                                          <p class="cardText" id="CourseTitle">${assessmentEndTime}</p>
                                      </div> 
                                      <div class="cardSubDiv">
                                        <p id="card-labels">Time Duration:</p>
                                        <p class="cardText" id="CourseTitle">${assessmentTimeLimit} mins</p>
                                      </div>  
                                      <div class="cardSubDiv-Click">
                                      <button class="cardText" id="ViewProctoringReportSummaryExamOnly" value="${assessmentId}/${assessmentCourseSection}/${assessmentName}">Click to View Proctoring Report</p>
                                    </div>
                                </div>
                              </div>`;

                  }
               
                } else {
                  var cardListDiv = document.getElementById('cardList');
                  cardListDiv.innerHTML=`<p class="DBisEmptyMssg">Collection is empty, Nothing to show</p>`;
                }
              })
              .catch((error) => {
                  console.log("Error with database: " + error);
              });
          }
      })
      .catch((error) => {
        alert("SSO ended with an error" + error);
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
                  //alert("Success Firebase Access!");
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
                                          <p id="card-labels">Student Number:</p>
                                          <p class="cardText" id="CourseTitle">${studentNumber}</p>
                                      </div>

                                      <div class="cardSubDiv-Click">
                                      <button class="cardText" id="ViewStudentAssignedExam" value="${studentNumber}">View Assigned Exams</p>
                                    </div>

                                  </div>
                              </div>`;

                  }
               
                } else {
                  alert("ERROR: Firebase Access!");
                }
              })
              .catch((error) => {
                  console.log("Error with database: " + error);
              });
          }
      })
      .catch((error) => {
        alert("SSO ended with an error" + error);
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
                    //alert("Success Firebase Access!");
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
                        <p class="cardHeader" id="CourseCodeOnly">${courseCode}${courseSection}</p>
                            <div class="cardDivText">
                            <div class="cardSubDiv">
                              <p id="card-labels">Course Title:</p>
                              <p class="cardText" id="CourseTitle">${courseTitle}</p>
                            </div>   
                            </div>
                        </div>`;
  
                    }
                 
                  } else {
                    alert("ERROR: Firebase Access!");
                  }
                })
                .catch((error) => {
                    console.log("Error with database: " + error);
                });
            }
        })
        .catch((error) => {
          alert("SSO ended with an error" + error);
        });
    });
}

//function to view one course/class only from viewCoursesList
function viewOneCourseOnly(currentCourseKey){
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
          const courseRef = ref(db,`classes/${currentCourseKey}`);
          get(courseRef)
            .then((snapshot) => {
              if (snapshot.exists()) {
                //alert("Success Firebase Access!");
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
                      </div>`;
        
             
              } else {
                alert("Snapshot does not exist!");
              }
            })
            .catch((error) => {
                console.log("Error with database: " + error);
            });
        }
         
      }).catch((error) => {
        alert("SSO ended with an error" + error);
      });
  });

}

function revokeAuthToken() {
  // Get the current authentication token
  chrome.identity.getAuthToken({ interactive: false }, token => {
    if (chrome.runtime.lastError || !token) {
      console.log(`No token to revoke: ${JSON.stringify(chrome.runtime.lastError)}`);
      return;
    }
    // Revoke the token
    chrome.identity.removeCachedAuthToken({ token: token }, () => {
      fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`)
        .then(response => {
          if (response.ok) {
            console.log('Token revoked successfully');
            //clearUserData();
          } else {
            console.log('Error revoking token:', response.statusText);
          }
        })
        .catch(error => console.error('Error during token revocation:', error));
    });
  });
}

function AdminsignOut(){
  chrome.storage.local.clear(function() {
    var error = chrome.runtime.lastError;
    if (error) {
        console.error("Error: " + error);
    }
    //after clearing local storage log out
    const auth = getAuth();
    signOut(auth).then(() => {
      // Sign-out successful.
      revokeAuthToken();
      //console.log('Sign out Success');
      chrome.sidePanel.setOptions({path:landingPage})
    }).catch((error) => {
      // An error happened.
      console.log("Error: " + error);
    });
  });
  
}