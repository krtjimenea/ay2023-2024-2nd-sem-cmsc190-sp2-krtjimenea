
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
const AdminStudentProctoringReportSummary = '/AdminStudentProctoringReportSummary.html'



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
                                            <div class="subCard-Div">
                                                <p class="cardText-small" id="StudentEmail">${email}</p>
                                            </div>
                                            
                                        </div>
                                    </div>
                        </div>
                        

                        <div class="cardSubDiv-subCard-PR">
                                    <div class="subCard-PR-2">
                                        <div class="subCard-PR-Text">
                                            <p id="card-labels-PR-header">Time Started</p>                                            
                                            <div class="subCard-Div">
                                                <p class="cardText-small" id="TimeStartedExam">${timeStarted}</p>
                                            </div>
                                            
                                        </div>
                                    </div>
                            
                        </div>

                        <div class="cardSubDiv-subCard-PR">
                            <div class="subCard-PR-2">
                                <div class="subCard-PR-Text">
                                    <p id="card-labels-PR-header">Time Submitted</p>                                            
                                    <div class="subCard-Div">
                                        <p class="cardText-small" id="TimeSubmittedExam">${timeSubmitted}</p>
                                    </div>
                                
                                </div>
                            </div>
                        </div>
                       
                       
                        <div class="cardSubDiv-PR-neg">
                            <p id="card-labels-PR">Flagged Activity:</p>
                            <p class="cardText-small" id="TotalStudentFlaggedAct">${flaggedActivities}</p>
                        </div>
                        <div class="cardSubDiv-PR-neg">
                            <p id="card-labels-PR">Browser Window Changes:</p>
                            <p class="cardText-small" id="TotalWindowChange">${windowChanges}</p>
                        </div>

                        <div class="cardSubDiv-PR-neg">
                            <p id="card-labels-PR">No of Copy Action:</p>
                            <p class="cardText-small" id="TotalCopyAction">${copyAction}</p>
                        </div>

                        <div class="cardSubDiv-PR-neg">
                            <p id="card-labels-PR">No of Paste Action:</p>
                            <p class="cardText-small" id="TotalPasteAction">${pasteAction}</p>
                        </div>

                        <div class="cardSubDiv-PR-neg">
                            <p id="card-labels-PR">Tab Switches:</p>
                            <p class="cardText-small" id="TotalTabSwitchAction">${tabSwitches}</p>
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
                            <button class="cardText" id="ViewAuthReportSummary">Authentication Report</p>
                        </div>

                     
                    </div>
                </div>`
                   
                // console.log(openTabsJSON);
                var openTabsJSON = JSON.parse(openTabsString)
                var SubcardListDiv = document.getElementById('subCard-Div-List');
                SubcardListDiv.innerHTML='';
                for (const tab of openTabsJSON) {
                    SubcardListDiv.innerHTML +=`<div class="subCard-Div">
                                        <a href="${tab.url}" id="TabURL" class="cardText-small">${tab.title}</a>
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