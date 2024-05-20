//contains listeners and functions
// Import the functions you need from the SDKs you need
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


import '../stylesheet.css';
const landingPage = '/LandingPage.html';
const facultyDashboardPage = '/FacultyDashboardPage.html';
const facultySchedulePage = '/FacultySchedulePage.html';
const StudentExamDetailsPage = '/StudentAssessmentDetails.html';
//Admin Routes
const AdminDashboard = '/AdminDashboard.html';
const facultyViewAssessments = '/FacultyManageAssessments.html';
const facultyViewScheduledExam = '/FacultyAssessmentDetails.html';
const FacultyViewProctoringReportSummary = '/FacultyViewProctoringReportSummary.html';
const FacultyViewClasslist = '/FacultyViewClasslist.html';
const FacultyViewStudentProctoringReport = '/FacultyViewStudentProctoringReportSummary.html';
const FacultyStudentAuthReport = '/FacultyStudentAuthReport.html';


//Function to get SidePanel path
function monitorSidePanelPath() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    //get the current tab information
    const tabId = tabs[0].id;
    //get the sidepanel information
    chrome.sidePanel.getOptions({ tabId }, function(options) {
      const path = options.path;
      //console.log('path: ' + path);
      //this the current path, create an array of history in the service worker, pass as message
      chrome.runtime.sendMessage({action: 'sendCurrentPath', value: path});
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

      }else if(path === '/FacultyViewProctoringReportSummary.html'){
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
      }else if(path==='/FacultyViewClasslist.html'){
        chrome.storage.local.get('value1', function(data) {
          var currentCourse = data.value1;
          if(currentCourse){
            viewClasslistOfCourse(currentCourse)
          }
                
        });
        

      }else if(path==='/FacultyViewStudentProctoringReportSummary.html'){
        //get the student, course and section of the exams
        chrome.storage.local.get('currentstudentKey', function(data) {
            var currentStudent = data.currentstudentKey;
            if(currentStudent){
                chrome.storage.local.get('value1', function(data) {
                    var currentSection= data.value1;
                    if(currentSection){
                        chrome.storage.local.get('currentExamKey', function(data) {
                            var currentExam = data.currentExamKey;
                            if(currentExam){
                              viewStudentProctoringReport(currentSection,currentExam,currentStudent);
                            }
                          });
                     
                    }
                  });
             
              
            }
          });
       
      }else if(path === '/FacultyStudentAuthReport.html'){
        //get the student, course and section of the exams
        chrome.storage.local.get('currentstudentKey', function(data) {
          var currentStudent = data.currentstudentKey;
          if(currentStudent){
              chrome.storage.local.get('currentSectionKey', function(data) {
                  var currentSection= data.currentSectionKey;
                  if(currentSection){
                      chrome.storage.local.get('currentExamReportKey', function(data) {
                          var currentExam = data.currentExamReportKey;
                          if(currentExam){
                            viewStudentAuthReport(currentSection,currentExam,currentStudent);
                          }
                        });
                   
                  }
                });
           
            
          }
        });

      }else if(path === '/FacultyAssessmentDetails.html'){
        var receivedUserId;
        chrome.storage.local.get('currentUserId', function(data) {
          receivedUserId = data.currentUserId;
          if(receivedUserId){
            chrome.storage.local.get('currentExamKey', function(data){
              var currentExam = data.currentExamKey;
                if(currentExam){
                  viewScheduledExam(receivedUserId,currentExam);
                }
            });
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

  headDiv.addEventListener('click', function (event) {
    //console.log('Click event fired');

    const target = event.target;
    var currentUserId;

    //for routing
    if(target.id ===  'BackBtn' || target.id === 'BackIcon'){
      //console.log('Back Clicked');
      navigateBack();
    }

    //For faculty dashboard events
    if(target.id === 'ScheduleBtn'){
      //console.log('Clicked on Schedule Assessment');
      chrome.sidePanel.setOptions({path:facultySchedulePage});

    }
    if(target.id === 'ManageBtn'){
      //console.log('Clicked on Manage Assessment');
      chrome.sidePanel.setOptions({path:facultyViewAssessments});

    }

    if(target.id === 'SubmitExamSchedBtn'){
      //console.log('Clicked Submit Exam Sched');
      scheduleExam(currentUserId);
     
    }

    if(target.id === 'ViewProctoringReportSummaryExamOnly'){
      var dataKey = target.value;
      var keysList = dataKey.split("/");
      chrome.runtime.sendMessage({action: 'examKey', value: keysList[0]});
      chrome.runtime.sendMessage({action: 'passValue1', value: keysList[1]});
      chrome.runtime.sendMessage({action: 'examName', value: keysList[2]});
      chrome.sidePanel.setOptions({path:FacultyViewProctoringReportSummary});
    }

    if(target.id === 'ViewStudentList'){
      var dataKey = target.value;
      var keysList = dataKey.split("/");
      chrome.runtime.sendMessage({action: 'examKey', value: keysList[0]});
      chrome.runtime.sendMessage({action: 'passValue1', value: keysList[1]});
      chrome.runtime.sendMessage({action: 'examName', value: keysList[2]});
      chrome.sidePanel.setOptions({path:FacultyViewClasslist});

    }

    if(target.id === 'ViewStudentAssignedExamReport'){
      var dataKey = target.value;
      chrome.runtime.sendMessage({action: 'studentKey', value: dataKey});
      chrome.sidePanel.setOptions({path: FacultyViewStudentProctoringReport});

    }

    //for viewing auth reports per student
    if(target.id === 'ViewAuthReportSummary'){
      //state the value
      var selectedSectionandExam = target.value;
      var currentKey = selectedSectionandExam.split("/");
      chrome.runtime.sendMessage({action: 'currentStudentSection_Report', value: currentKey[1]});
      chrome.runtime.sendMessage({action: 'currentStudentExam_Report', value: currentKey[0]});
      //change panel
      chrome.sidePanel.setOptions({path:FacultyStudentAuthReport})
    }

    if(target.className === 'ModalFailureCloseBtn'){
      //console.log('Clicked Close Modal');
      //closeModal();
      let modal = document.getElementsByClassName("Alerts-Failure-Modal")[0];
      let overlay = document.getElementsByClassName("modal-failure-Overlay")[0];
      modal.style.display = "none";
      overlay.style.display = "none";
    }

    if(target.id === 'LogOutFacultyAdmin'){
      // console.log('Student Logged Out');
      FacultysignOut();
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
        //console.log("Navigating back to:", backToPath );
        chrome.sidePanel.setOptions({path:backToPath});

      });
    } else {
      //console.log("No history to navigate back");
    }
  });
}

//function to view students auth report
function viewStudentAuthReport(currentCourseKey,currentExamKey,currentStudent){
  //console.log(currentCourseKey,currentExamKey,currentStudent);
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
            const assessmentRef = ref(db,`/proctoringReportStudent/${currentCourseKey}/${currentExamKey}/${currentStudent}`);
            
            get(assessmentRef)
              .then((snapshot) => {

                if (snapshot.exists()) {
                    const childData = snapshot.val();
                 
                    var cardListDiv = document.getElementById('cardList');
                    cardListDiv.innerHTML='';

                    const email = childData.studentEmail;
                    const timeStarted = childData.student_time_started;
                    const timeSubmitted = childData.student_time_submitted;
                    const flaggedActivities = childData.student_total_flagged_activity;
                    const activity = childData.flagged_activities;
                    const authScore = childData.student_auth_risk_score;
                    const authStatus = childData.student_AuthFlagged;
                    const examTakenName = childData.assessmentTaken.name;
                    const examCourseSection = childData.assessmentTaken.courseSection;
                    const examFIC = childData.assessmentTaken.FacultyInChargeName;
                    const stringIdentity = childData.identity_UponExam;
                    var IdentityJSON = JSON.parse(stringIdentity);
                    // console.log(IdentityJSON);
                    let authMessage = '';
                    if(authStatus === false){
                        authMessage = 'Warning: Authentication Factors Did Not Match'
                    }else{
                        authMessage = 'Passed: Most Authentication Factors Matched'
                    }
                    let headerCourseCode = document.getElementById('FacultyHeaderDetails-CourseCode');
                    headerCourseCode.textContent =  examTakenName;
                    //iterate over each property of the identity
                    let geolocation_lat_object, geolocation_long_object, IP_address_object, display_object, cpu_object, os_object, browser_object;
                    for (let key in IdentityJSON) {
                        if (IdentityJSON.hasOwnProperty(key)) {
                            switch (key) {
                                case "geolocation_lat":
                                    geolocation_lat_object = IdentityJSON[key];
                                    break;
                                case "geolocation_long":
                                    geolocation_long_object = IdentityJSON[key];
                                    break;
                                case "IP_address":
                                    IP_address_object = IdentityJSON[key];
                                    break;
                                case "display":
                                    display_object = IdentityJSON[key];
                                    break;
                                case "cpu":
                                    cpu_object = IdentityJSON[key];
                                    break;
                                case "os":
                                    os_object = IdentityJSON[key];
                                    break;
                                case "browser":
                                    browser_object = IdentityJSON[key];
                                    break;

                            }
                        }
                    }


                   
                    cardListDiv.innerHTML+= ` <div class="cards-PR-Students">
                    <div class="cardDivText">
                    <div class="cardSubDiv-subCard-PR">
                    <div class="subCard-PR-2">
                        <div class="subCard-PR-Text">
                            <p id="card-labels-PR-header">Student Email</p>                                            
                            <div class="subCard-Div-info">
                                <p class="cardText-small" id="StudentEmail">${email}</p>
                            </div>
                            
                        </div>
                    </div>
                          </div>

                          

                          <div class="cardSubDiv-subCard-PR">
                                      <div class="subCard-PR-2">
                                          <div class="subCard-PR-Text">
                                              <p id="card-labels-PR-header">Course and Section</p>                                            
                                              <div class="subCard-Div-info">
                                                  <p class="cardText-small" id="StudentCourseSection">${examCourseSection}</p>
                                              </div>
                                              
                                          </div>
                                      </div>
                          </div>

                          <div class="cardSubDiv-subCard-PR">
                          <div class="subCard-PR-2">
                              <div class="subCard-PR-Text">
                                  <p id="card-labels-PR-header">Faculty</p>                                            
                                  <div class="subCard-Div-info">
                                      <p class="cardText-small" id="StudentCourseSection">${examFIC}</p>
                                  </div>
                                  
                              </div>
                          </div>
                        </div>
                                        
                        <div class="cardSubDiv-subCard-PR">
                                    <div class="subCard-PR-2">
                                        <div class="subCard-PR-Text">
                                            <p id="card-labels-PR-header">Auth Risk Score</p>                                            
                                            <div class="subCard-Div-info">
                                                <p class="cardText-small" id="StudentAuthRiskScore">${authScore}</p>
                                            </div>
                                            
                                        </div>
                                    </div>
                            
                        </div>

                        <div class="cardSubDiv-subCard-PR">
                            <div class="subCard-PR-2">
                                <div class="subCard-PR-Text">
                                    <p id="card-labels-PR-header">Authentication Status</p>                                            
                                    <div class="subCard-Div-info">
                                        <p class="cardText-small" id="StudentAuthRiskBool">${authMessage}</p>
                                    </div>
                                
                                </div>
                            </div>
                        </div>
                        <div class="cardSubDiv-subCard">
                            <div class="subCard-PR-1">
                                <div class="subCard-PR-Text">
                                    <p id="card-labels-PR-header">IP Address</p>                                            
                                    <div class="subCard-Div">
                                        <p id="card-labels-PR">Matched:</p>
                                        <p class="cardText" id="matchedValue">${IP_address_object.didMatch}</p>
                                    </div>
                                    
                                </div>
                            </div>
                        </div>
                        <div class="cardSubDiv-subCard">
                            <div class="subCard-PR-1">
                                <div class="subCard-PR-Text">
                                    <p id="card-labels-PR-header">Geolocation Latitude</p>                                            
                                    <div class="subCard-Div">
                                        <p id="card-labels-PR">Matched:</p>
                                        <p class="cardText" id="matchedValue">${geolocation_lat_object.didMatch}</p>
                                    </div>
                                    
                                </div>
                            </div>
                        </div>
                        <div class="cardSubDiv-subCard">
                            <div class="subCard-PR-1">
                                <div class="subCard-PR-Text">
                                    <p id="card-labels-PR-header">Geolocation Longitude</p>                                            
                                    <div class="subCard-Div">
                                        <p id="card-labels-PR">Matched:</p>
                                        <p class="cardText" id="matchedValue">${geolocation_long_object.didMatch}</p>
                                    </div>
                                    
                                </div>
                            </div>
                        </div>
                        <div class="cardSubDiv-subCard">
                            <div class="subCard-PR-1">
                                <div class="subCard-PR-Text">
                                    <p id="card-labels-PR-header">Display</p>                                            
                                    <div class="subCard-Div">
                                        <p id="card-labels-PR">Matched:</p>
                                        <p class="cardText" id="matchedValue">${display_object.didMatch}</p>
                                    </div>
                                    
                                </div>
                            </div>
                        </div>
                        <div class="cardSubDiv-subCard">
                            <div class="subCard-PR-1">
                                <div class="subCard-PR-Text">
                                    <p id="card-labels-PR-header">CPU</p>                                            
                                    <div class="subCard-Div">
                                        <p id="card-labels-PR">Matched:</p>
                                        <p class="cardText" id="matchedValue">${cpu_object.didMatch}</p>
                                    </div>
                                    
                                </div>
                            </div>
                        </div>
                        <div class="cardSubDiv-subCard">
                            <div class="subCard-PR-1">
                                <div class="subCard-PR-Text">
                                    <p id="card-labels-PR-header">Operating System</p>                                            
                                    <div class="subCard-Div">
                                        <p id="card-labels-PR">Matched:</p>
                                        <p class="cardText" id="matchedValue">${os_object.didMatch}</p>
                                    </div>
                                    
                                </div>
                            </div>
                        </div>
                        <div class="cardSubDiv-subCard">
                            <div class="subCard-PR-1">
                                <div class="subCard-PR-Text">
                                    <p id="card-labels-PR-header">Browser</p>                                            
                                    <div class="subCard-Div">
                                        <p id="card-labels-PR">Matched:</p>
                                        <p class="cardText" id="matchedValue">${browser_object.didMatch}</p>
                                    </div>
                                    
                                </div>
                            </div>
                        </div>
                        
                       

                     
                       
                      
                    </div>
                </div>`
                   
              }else{
                var cardListDiv = document.getElementById('cardList');
                cardListDiv.innerHTML=`<p class="DBisEmptyMssg">Collection is empty, Nothing to show</p>`;
              }
            })
            .catch((error) => {
              console.log("error with database: " + error);
            });

          }
      })
      .catch((error) => {
        alert("SSO ended with an error" + error);
      });
  });


}


function viewStudentProctoringReport(currentCourseKey,currentExamKey,currentStudent){

  //console.log(currentCourseKey,currentExamKey,currentStudent);
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
             const assessmentRef = ref(db,`/proctoringReportStudent/${currentCourseKey}/${currentExamKey}/${currentStudent}`);
             
             get(assessmentRef)
               .then((snapshot) => {
 
                 if (snapshot.exists()) {
                     const childData = snapshot.val();
                  
                     var cardListDiv = document.getElementById('cardList');
                     cardListDiv.innerHTML='';
 
                     const email = childData.studentEmail;
                     const timeStarted = childData.student_time_started;
                     const timeSubmitted = childData.student_time_submitted;
                     const flaggedActivities = childData.student_total_flagged_activity;
                     const examTakenName = childData.assessmentTaken.name;
                     const examCourseSection = childData.assessmentTaken.courseSection;
                     const examFIC = childData.assessmentTaken.FacultyInChargeName;
                     let headerCourseCode = document.getElementById('FacultyHeaderDetails-CourseCode');
                     headerCourseCode.textContent =  examTakenName;
                     
                     const activity = childData.flagged_activities;
                    
                     //flagged activities
                     const windowChanges = activity.student_num_changed_windows;
                     const tabSwitches = activity.student_num_tab_switched;
                     const copyAction = activity.student_num_of_copy_action;
                     const pasteAction = activity.student_num_of_paste_action;
                     const newTabsString = activity.student_new_opened_tabs_data;
                     const openTabsString = activity.student_open_tabs_data;
                     
                   
 
                     cardListDiv.innerHTML+= `
                     <div class="cards-PR-Students">
                    
                         <div class="cardSubDiv-subCard-PR">
                                     <div class="subCard-PR-2">
                                         <div class="subCard-PR-Text">
                                             <p id="card-labels-PR-header">Student Email</p>                                            
                                             <div class="subCard-Div-info">
                                                 <p class="cardText-small" id="StudentEmail">${email}</p>
                                             </div>
                                             
                                         </div>
                                     </div>
                         </div>
 
                         <div class="cardSubDiv-subCard-PR">
                                     <div class="subCard-PR-2">
                                         <div class="subCard-PR-Text">
                                             <p id="card-labels-PR-header">Course and Section</p>                                            
                                             <div class="subCard-Div-info">
                                                 <p class="cardText-small" id="StudentCourseSection">${examCourseSection}</p>
                                             </div>
                                             
                                         </div>
                                     </div>
                         </div>
 
                         <div class="cardSubDiv-subCard-PR">
                         <div class="subCard-PR-2">
                             <div class="subCard-PR-Text">
                                 <p id="card-labels-PR-header">Faculty</p>                                            
                                 <div class="subCard-Div-info">
                                     <p class="cardText-small" id="StudentCourseSection">${examFIC}</p>
                                 </div>
                                 
                             </div>
                         </div>
                       </div>
                         
 
                         <div class="cardSubDiv-subCard-PR">
                                     <div class="subCard-PR-2">
                                         <div class="subCard-PR-Text">
                                             <p id="card-labels-PR-header">Time Started</p>                                            
                                             <div class="subCard-Div-info">
                                                 <p class="cardText-small" id="TimeStartedExam">${timeStarted}</p>
                                             </div>
                                             
                                         </div>
                                     </div>
                             
                         </div>
 
                         <div class="cardSubDiv-subCard-PR">
                             <div class="subCard-PR-2">
                                 <div class="subCard-PR-Text">
                                     <p id="card-labels-PR-header">Time Submitted</p>                                            
                                     <div class="subCard-Div-info">
                                         <p class="cardText-small" id="TimeSubmittedExam">${timeSubmitted}</p>
                                     </div>
                                 
                                 </div>
                             </div>
                         </div>
                        
                         <div class="cardSubDiv-subCard-PR">
                             <div class="subCard-PR-neg">
                                 <div class="subCard-PR-Text">
                                     <p id="card-labels-PR-header">Flagged Activity</p>                                            
                                     <div class="subCard-Div-info">
                                       <p class="cardText-small" id="TotalStudentFlaggedAct">${flaggedActivities} found</p>
                                     </div>
                                 
                                 </div>
                             </div>
                         </div>
 
                         <div class="cardSubDiv-subCard-PR">
                             <div class="subCard-PR-neg">
                                 <div class="subCard-PR-Text">
                                     <p id="card-labels-PR-header">Browser Window Changed</p>                                            
                                     <div class="subCard-Div-info">
                                     <p class="cardText-small" id="TotalWindowChange">${windowChanges} time(s)</p>
                                     </div>
                                 
                                 </div>
                             </div>
                         </div>
 
                         <div class="cardSubDiv-subCard-PR">
                             <div class="subCard-PR-neg">
                                 <div class="subCard-PR-Text">
                                     <p id="card-labels-PR-header">Tab Switched</p>                                            
                                     <div class="subCard-Div-info">
                                     <p class="cardText-small" id="TotalWindowChange">${tabSwitches} time(s)</p>
                                     </div>
                                 
                                 </div>
                             </div>
                         </div>
 
                         <div class="cardSubDiv-subCard-PR">
                             <div class="subCard-PR-neg">
                                 <div class="subCard-PR-Text">
                                     <p id="card-labels-PR-header">Copy Action Detected:</p>                                            
                                     <div class="subCard-Div-info">
                                     <p class="cardText-small" id="TotalCopyAction">${copyAction} time(s)</p>
                                     </div>
                                 
                                 </div>
                             </div>
                         </div>
 
                         <div class="cardSubDiv-subCard-PR">
                         <div class="subCard-PR-neg">
                             <div class="subCard-PR-Text">
                                 <p id="card-labels-PR-header">Paste Action Detected:</p>                                            
                                 <div class="subCard-Div-info">
                                 <p class="cardText-small" id="TotalCopyAction">${pasteAction} time(s)</p>
                                 </div>
                             
                             </div>
                         </div>
                     </div>
 
                         <!--Card within a card-->
                         <div class="cardSubDiv-subCard-PR">
                             <div class="subCard-PR-2">
                                 <div class="subCard-PR-Text">
                                     <p id="card-labels-PR-header">Tabs Open During Session:</p> 
                                     <div id="subCard-Div-List">                                           
                                         
                                     </div>
                                 
                                 </div>
                             </div>
                         </div>
                        
 
                         <div class="cardSubDiv-subCard-PR">
                         <div class="subCard-PR-2">
                             <div class="subCard-PR-Text">
                                 <p id="card-labels-PR-header">New Tabs Opened:</p> 
                                 <div id="subCard-Div-List-New-Tabs">                                           
                                     
                                 </div>
                             
                             </div>
                         </div>
                     </div>
 
                         <div class="cardSubDiv-Click">
                             <button class="cardText" id="ViewAuthReportSummary" value="${currentExamKey}/${currentCourseKey}">Authentication Report</p>
                         </div>
 
                      
                     </div>
                 </div>`
                    
                 // console.log(openTabsJSON);
                 var openTabsJSON = JSON.parse(openTabsString)
                 var SubcardListDiv = document.getElementById('subCard-Div-List');
                 SubcardListDiv.innerHTML='';
                 for (const tab of openTabsJSON) {
                     SubcardListDiv.innerHTML +=`<div class="subCard-Div">
                                         <a href="${tab.url}" target="_blank" id="TabURL" class="cardText-small">${tab.title}</a>
                                      </div>`
                 }
 
                 //render new tabs
                 var newTabsJSON = JSON.parse(newTabsString)
                 var newTabsSubcardListDiv = document.getElementById('subCard-Div-List-New-Tabs');
                 newTabsSubcardListDiv.innerHTML='';
                 for (const tab of newTabsJSON) {
                     newTabsSubcardListDiv.innerHTML +=`<div class="subCard-Div">
                                       <a href="${tab.url}" target="_blank" id="TabURL" class="cardText-small">${tab.title}</a>
                                      </div>`
                 }
 
 
                 } else {
                     var cardListDiv = document.getElementById('cardList');
                     cardListDiv.innerHTML=`<p class="DBisEmptyMssg">Collection is empty, Nothing to show</p>`;
                 }
               })
               .catch((error) => {
                   console.log("error with database: " + error);
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
                    let headerCourseCode = document.getElementById('FacultyHeaderDetails-CourseCode');
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
                                        <div class="cardSubDiv-Click">
                                      <button class="cardText" id="ViewStudentAssignedExamReport" value="${studentNumber}">Proctoring Report</p>
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
                  let headerCourseCode = document.getElementById('FacultyHeaderDetails-CourseCode');
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
                  //alert("error: Doesnt Exist, Firebase Access!");
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
                    studentTotaNotlAuthenticated.textContent = numof_NotAuthAllowedStudents;
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

//function to generate a 6 digit code
function generateExamCode(){
  const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6)
  var ID = nanoid(6);
  return ID;
}
//function to update the path /takingAssessments/assessmentKey/Student
function updateTakingAssessmentsStudent(courseGivenAssessment, assessmentKey){

  //console.log("FIC - Update the path !!!");
  //console.log(courseGivenAssessment);
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
                      //alert("Saved Exam to database!");
                    }).catch((err) => {
                      console.log(("error with database" + err));
                    })

                    //update path /assignedAssessment/studentkey/assessmentKey = true;
                    const updateAssignedAssessment = {}
                    updateAssignedAssessment[`/assignedAssessments/${studentId}/${assessmentKey}`] = true;
                    update(ref(db), updateAssignedAssessment)
                    .then(()=> {
                      //console.log("Saved Assigned Exam to Student!");
                    }).catch((error) => {
                      console.log(("error with database" + error));
                    })
                    
                  }
                
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
  //console.log("curr: " + facultyKeyValue);
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

//function to convert time
function AMPMFormat(currentTime){

  const [hours, minutes] = currentTime.split(':');
  const period = hours >= 12 ? 'PM' : 'AM';
  //12-hour format
  const formattedHours = hours % 12 || 12;
  const formattedTime = `${formattedHours}:${minutes} ${period}`;

  return formattedTime;

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
  
  var assessmentKeyGenerator = examName+courseSelected+examAccessCode;
  var assessmentKey =  assessmentKeyGenerator.split(" ").join("");
  chrome.runtime.sendMessage({action: 'examKey', value: assessmentKey});
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

            
          }
       })//EOF signInWithCredential
      .catch(err =>{alert("SSO ended with an error" + err);})
  }) 

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
                                    chrome.sidePanel.setOptions({path:facultyViewScheduledExam});
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
                    const assessmentStartDate= assessment.date_start;
                    const assessmentEndDate= assessment.date_end;
                    const assessmentTimeLimit = assessment.time_limit;
                  


                    cardListDiv.innerHTML += `<div class="cards">
                                <p class="cardHeader" id="ExamName">${assessmentName}</p>
                                  <div class="cardDivText">
                                      <div class="cardSubDiv">
                                          <p id="card-labels">Course & Section:</p>
                                          <p class="cardText" id="CourseTitle">${assessmentCourseSection}</p>
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
                                      <button class="cardText" id="ViewProctoringReportSummaryExamOnly" value="${assessmentId}/${assessmentCourseSection}/${assessmentName}">View Proctoring Report</p>
                                    </div>
                                    <div class="cardSubDiv-Click" >
                                    <button class="cardText" id="ViewStudentList" value="${assessmentId}/${assessmentCourseSection}/${assessmentName}">View Classlist</p>
                                  </div>
                                </div>
                              </div>`;

                  }
               
                } else {
                  var cardListDiv = document.getElementById('cardList');
                  cardListDiv.innerHTML=`<p class="DBisEmptyMssg">Collection is empty, Nothing to show</p>`;
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

//function to view the scheduled exam after scheduling
function viewScheduledExam(facultyKeyValue, examKeyValue){
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
            const assessmentRef = ref(db,`/scheduledAssessments/${facultyKeyValue}/${examKeyValue}`);
            get(assessmentRef)
              .then((snapshot) => {
                if (snapshot.exists()) {
                  //alert("Success Firebase Access!");
                  //checking for snapshot return
                  const childData = snapshot.val();
                  var cardListDiv = document.getElementById('cardList');
                  cardListDiv.innerHTML='';
                  //loop through the snapshot
                  // const assessment = childData[assessmentId];
                  const assessmentFIC = childData.FacultyInChargeName;
                  const assessmentName = childData.name;
                  const assessmentCourseSection = childData.course;
                  const assessmentLink = childData.link;
                  const assessmentCode = childData.access_code;
                  const assessmentStartTime = childData.expected_time_start;
                  const assessmentEndTime = childData.expected_time_end;
                  const assessmentStartDate= childData.date_start;
                  const assessmentEndDate= childData.date_end;
                  const assessmentTimeLimit = childData.time_limit;
                  


                  cardListDiv.innerHTML += `<div class="cards">
                                <p class="cardHeader" id="ExamName">${assessmentName}</p>
                                  <div class="cardDivText">
                                      <div class="cardSubDiv">
                                          <p id="card-labels">Course & Section:</p>
                                          <p class="cardText" id="CourseTitle">${assessmentCourseSection}</p>
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
                                </div>
                              </div>`;

                } else {
                  var cardListDiv = document.getElementById('cardList');
                  cardListDiv.innerHTML=`<p class="DBisEmptyMssg">Collection is empty, Nothing to show</p>`;
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

function FacultysignOut(){
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