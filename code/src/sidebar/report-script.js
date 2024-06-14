
//Script for Admin Generating Reports

//import for SDKs
import { FirebaseApp } from './firebase';
import { getFirestore, doc, setDoc, addDoc,collection } from "firebase/firestore";
import {getAuth,signInWithCredential,GoogleAuthProvider} from 'firebase/auth';
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

      if(path === '/AdminStudentProctoringReportSummary.html'){
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
                              viewStudentProctoringReport(currentSection,currentExam,currentStudent);
                            }
                          });
                     
                    }
                  });
             
              
            }
          });
       
      }else if(path === '/AdminStudentAuthReport.html'){
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

      }
    });
  });
}


//gets the current path of the sidePanel
monitorSidePanelPath();


window.addEventListener('DOMContentLoaded', function () {
  
    const headDiv = document.getElementById('AppBody'); // Replace with the actual ID
    
    headDiv.addEventListener('click', function (event) {
      console.log('Click event fired');
  
      const target = event.target;

      //for routing
      if(target.id ===  'BackBtn' || target.id === 'BackIcon'){
        console.log('Back Clicked');
        navigateBack();
      }

      //for viewing auth reports per student
      if(target.id==='ViewAuthReportSummary'){
        //state the value
        var selectedSectionandExam = target.value;
        var currentKey = selectedSectionandExam.split("/");
        chrome.runtime.sendMessage({action: 'currentStudentSection_Report', value: currentKey[1]});
        chrome.runtime.sendMessage({action: 'currentStudentExam_Report', value: currentKey[0]});
        //change panel
        chrome.sidePanel.setOptions({path:AdminStudentAuthReport})
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


function viewStudentProctoringReport(currentCourseKey,currentExamKey,currentStudent){

 console.log(currentCourseKey,currentExamKey,currentStudent);
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
                    let headerCourseCode = document.getElementById('AdminHeaderDetails-CourseCode');
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
                                <p id="card-labels-PR-header">Faculty-in-Charge</p>                                            
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


//function to view students auth report
function viewStudentAuthReport(currentCourseKey,currentExamKey,currentStudent){
  console.log(currentCourseKey,currentExamKey,currentStudent);
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
                    const IdentityJSON = childData.identity_UponExam;
                    // var IdentityJSON = JSON.parse(stringIdentity);
                    console.log(IdentityJSON);

                    let authMessage = '';
                    if(authStatus === false){
                        authMessage = 'Warning: Authentication Factors Did Not Match'
                    }else{
                        authMessage = 'Passed: Most Authentication Factors Matched'
                    }
                    let headerCourseCode = document.getElementById('AdminHeaderDetails-CourseCode');
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
                                  <p id="card-labels-PR-header">Faculty-in-Charge</p>                                            
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