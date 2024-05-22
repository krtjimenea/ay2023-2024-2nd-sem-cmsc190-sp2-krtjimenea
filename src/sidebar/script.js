//contains listeners and functions
// Import the functions you need from the SDKs you need
import { FirebaseApp } from './firebase';
import { getFirestore, doc, setDoc } from "firebase/firestore";
import {getAuth,signInWithCredential,GoogleAuthProvider, signOut} from 'firebase/auth';
import {getDatabase,ref,set,on, onValue, get, update,push, child, query,orderByChild,equalTo, orderByValue,setValue} from 'firebase/database';
import { nanoid } from 'nanoid';
import { customAlphabet } from 'nanoid';
//Initialize Firebase
const auth = getAuth(FirebaseApp);
//Initialize database
const database = getDatabase(FirebaseApp);



import '../stylesheet.css';
const landingPage = '/LandingPage.html';
const studentInputPage = '/StudentInputPage.html';
const InputNumberPage = '/RegistrationPage.html';
const FacultySuccessReg = '/FacultySuccessRegistration.html';
const facultyDashboardPage = '/FacultyDashboardPage.html';
const facultySchedulePage = '/FacultySchedulePage.html';
const StudentExamDetailsPage = '/StudentAssessmentDetails.html';
const StudentSuccessReg =  '/StudentSuccessReg.html';
const StudentReadyExam = '/StudentReadyExam.html';
const StudentActiveExam = '/StudentActiveTakingExam.html';
const StudentDoneExam = '/StudentSubmittedExam.html';
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
      // console.log('path: ' + path);
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

      }else if(path ==='/StudentAssessmentDetails.html'){
        //get the assessment ID
        var receivedAssessmentId;
        chrome.storage.local.get('currentAssessmentId', function(data) {
          receivedAssessmentId = data.currentAssessmentId;
          // console.log("Data in storage: " + receivedAssessmentId);
          //get the student ID
          var receivedUserId;
          chrome.storage.local.get('currentUserId', function(data) {
            receivedUserId = data.currentUserId;
            //view the details of the assessment
            viewStudentAssessmentDetails(receivedAssessmentId, receivedUserId);
          });
        });
              
      }else if(path === '/StudentReadyExam.html'){
        //student will get the exam link
        //get the assessment ID
        var receivedAssessmentId;
        chrome.storage.local.get('currentAssessmentId', function(data) {
          receivedAssessmentId = data.currentAssessmentId;
          // console.log("Data in storage: " + receivedAssessmentId);
          //get the student ID
          var receivedUserId;
          chrome.storage.local.get('currentUserId', function(data) {
            receivedUserId = data.currentUserId;
            //view the details of the assessment
            studentIsReadyExam(receivedAssessmentId, receivedUserId);
          });
        });

      }else if(path === '/StudentActiveTakingExam.html'){
        //Student is now taking the exam, monitor
         //get the assessment ID
         var receivedAssessmentId;
         chrome.storage.local.get('currentAssessmentId', function(data) {
           receivedAssessmentId = data.currentAssessmentId;
          //console.log("Data in storage: " + receivedAssessmentId);
           //get the student ID
           var receivedUserId;
           chrome.storage.local.get('currentUserId', function(data) {
             receivedUserId = data.currentUserId;
             //view the details of the assessment
             studentIsTakingExam(receivedAssessmentId, receivedUserId);
             
           });
         });
        
      }else if(path === '/StudentSubmittedExam.html'){
        //function to call the save to database
        //get the assessment ID
        var receivedAssessmentId;
        chrome.storage.local.get('currentAssessmentId', function(data) {
          receivedAssessmentId = data.currentAssessmentId;
          // console.log("Data in storage: " + receivedAssessmentId);
          //get the student ID
          var receivedUserId;
          chrome.storage.local.get('currentUserId', function(data) {
            receivedUserId = data.currentUserId;
            //view the details of the assessment
            // console.log("Data in storage: " + receivedUserId);
            var receivedSubmissionTime;
            chrome.storage.local.get('currentUserSubmitTime',function(data){
              receivedSubmissionTime = data.currentUserSubmitTime;
              // console.log("Submission Time Data in storage: " + receivedSubmissionTime);
              saveProctoringReport(receivedAssessmentId, receivedUserId, receivedSubmissionTime);
            });
            
          });
        });

      }else if(path === '/StudentSuccessReg.html'){
        //check if 
      }
      
    });
  });
};


//gets the current path of the sidePanel
monitorSidePanelPath();



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
        // console.log("Navigating back to:", backToPath);
        chrome.sidePanel.setOptions({path:backToPath});

      });
    } else {
      alert("Can't go back!");
    }
  });
}

window.addEventListener('DOMContentLoaded', function () {

  const headDiv = document.getElementById('AppBody'); // Replace with the actual ID

  headDiv.addEventListener('click', function (event) {
    //console.log('Click event fired');

    const target = event.target;
    var currentUserId;

    // Check if the clicked element is the GoogleLoginBtn
    if (target.id === 'GoogleLoginBtn') {
      // console.log('Clicked on GoogleLoginBtn');
      getChromeIdentity();
    }

    // Check if the clicked element is the SubmitIDBtn
    if (target.id === 'SubmitIDBtn') {
      // console.log('Clicked on SubmitIDBtn');
      checkUser();
    }

    if (target.id === 'SignInAgain') {
      chrome.sidePanel.setOptions({path:landingPage});
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

    //For student
    if(target.id==='SubmitBtn'){
      // console.log('Clicked Submit Exam Code');
      //check if the exam code is valid then show the assessment details
      checkExamCode();
    }

    //student clicked get examlink
    if(target.id==='getExamLinkBtn'){
      chrome.sidePanel.setOptions({path:StudentReadyExam});
    }

    //STUDENT CLICKED THE EXAM LINK
    if(target.id==='output-student-examName'){
      var assessmentLink = target.href;
      //console.log("Link: " + assessmentLink);
      // Get the current tab and update its URL
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.update(tabs[0].id, { url: assessmentLink});
        chrome.sidePanel.setOptions({path:StudentActiveExam});
      });
      
    }

    //student clicked to submit the exam
    if(target.id === 'submitExamBtn'){
      // console.log('Student clicked Submit Exam');
      //get the current time and pass it
      //format for 12hr
      function formatAMPM(date) {
        // var month = date.getMonth();
        var month = date.toLocaleString('default', { month: 'long' });
        var day = date.getDate();
        var year = date.getFullYear();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds(); 
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0'+minutes : minutes;
        var strTime = month + ' ' + day + ' ' + year + ' ' + hours + ':' + minutes + ':' + seconds + ' ' + ampm;
        return strTime;
      }
      
      var submissionTime = formatAMPM(new Date());
      chrome.runtime.sendMessage({action: 'submissionTime', value: submissionTime});
      // Get the current tab and update its URL
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.update(tabs[0].id, { url: 'https://www.google.com/'});
        chrome.sidePanel.setOptions({path:StudentDoneExam});
      });
      


    }
    //student clicked log out
    if(target.id === 'LogOutStudentBtn'){
      // console.log('Student Logged Out');
      studentSignOut();
    }

    //for routing
    if(target.id ===  'BackBtn' || target.id === 'BackIcon'){
      // console.log('Back Clicked');
      navigateBack();
    }

    if (target.className === 'ModalFailureCloseBtn'){
      // console.log('Clicked Close Modal');
      //closeModal();
      let modal = document.getElementsByClassName("Alerts-Failure-Modal")[0];
      let overlay = document.getElementsByClassName("modal-failure-Overlay")[0];
      modal.style.display = "none";
      overlay.style.display = "none";
    }

    //exam details were wrong
    if(target.id === 'wrongExamLinkBtn'){
      let modal = document.getElementsByClassName("Alerts-Failure-Modal")[0];
      let overlay = document.getElementsByClassName("modal-failure-Overlay")[0];
      modal.style.display = "block";
      overlay.style.display = "block";
      let alertMessage = document.getElementById("ModalTextFailure-labels");
      alertMessage.textContent = "Sign In and Enter your Exam Code AGAIN";
      let closeBtn = document.getElementsByClassName("ModalFailureCloseBtn")[0];
      closeBtn.addEventListener("click", function(){
        chrome.sidePanel.setOptions({path:landingPage})
      })
      
    }

    

  });
});


//callback function for getting IP address
function getIPAddress(callback){
  fetch('https://api.ipify.org?format=json')
    .then(res =>{
      if(!res.ok){
        throw new Error('Failed to fetch IP address');
      } return res.json(); //return the JSON format
    })
    .then(data => {
      const ipAdd = data.ip;
      // console.log('Public IP is: ', ipAdd);
      //callback
      callback(ipAdd);
    })
    .catch(error =>{
      console.error('Error: ', error);
    });
}

//callback function for getting geolocation
function getGeolocation(callback){
  navigator.geolocation.getCurrentPosition(
    position => {
      const {latitude, longitude} = position.coords;
      //callback
      callback({latitude, longitude});
     
    },
    error => {
      console.error('Error getting geolocation', error);
    },
    {
      enableHighAccuracy: true
    }
  )

}
function getChromeIdentity(){
  //check if there is a logged in user
  chrome.identity.getAuthToken({ interactive: true }, token =>
    {
      if ( chrome.runtime.lastError || ! token ) {
        console.log(`SSO ended with an error: ${JSON.stringify(chrome.runtime.lastError)}`)
        let modal = document.getElementsByClassName("Alerts-Failure-Modal")[0];
        let overlay = document.getElementsByClassName("modal-failure-Overlay")[0];
        modal.style.display = "block";
        overlay.style.display = "block";
        let alertMessage = document.getElementById("ModalTextFailure-labels");
        alertMessage.textContent = "This client is restricted to users within its organization";
        return
      }
     
      chrome.sidePanel.setOptions({path: InputNumberPage});
     
    })
}


//function after input of ID Number
function checkUser(){
  //get the input of the dropdown
  var Dropdowninput = document.getElementById('userlist').value;
  //get the input of Id Number
  var IDinput = document.getElementById('IDNumInput').value;
  //check if valid number format
  var IDNumFormat = /^[0-9]{9}$/;
  if(IDinput.match(IDNumFormat)){
    chrome.runtime.sendMessage({action: 'currentUser', value: IDinput});

    if(Dropdowninput === 'Faculty' ){
      // console.log('Faculty');
      //check the database first if that faculty exists
      isFacultyRegistered(IDinput);
    }else if(IDinput[0] === '2' && Dropdowninput === 'Student'){
      // console.log('Student');
      isStudentRegistered(IDinput);
      //route to Student Dashboard
    }else if(IDinput === '406942892' && Dropdowninput === 'Admin'){
      //route to Admin Dashboard
      // console.log('Admin')
      chrome.sidePanel.setOptions({path: AdminDashboard})
    }else{
      //alert('Wrong Format');
      // openFailedModal();
      let modal = document.getElementsByClassName("Alerts-Failure-Modal")[0];
      let overlay = document.getElementsByClassName("modal-failure-Overlay")[0];
      modal.style.display = "block";
      overlay.style.display = "block";
      let alertMessage = document.getElementById("ModalTextFailure-labels");
      alertMessage.textContent = "Wrong Format";

    }

  }else{
    //alert('Wrong Format');
    // openFailedModal();
    let modal = document.getElementsByClassName("Alerts-Failure-Modal")[0];
    let overlay = document.getElementsByClassName("modal-failure-Overlay")[0];
    modal.style.display = "block";
    overlay.style.display = "block";
    let alertMessage = document.getElementById("ModalTextFailure-labels");
    alertMessage.textContent = "Wrong Format";
  }
  

}


//function once student submitted all information
function getStudentDetails(IDnumber){
    //check if there is a logged in user
    chrome.identity.getAuthToken({ interactive: true }, token =>
      {
        if ( chrome.runtime.lastError || ! token ) {
          console.log(`SSO ended with an error: ${JSON.stringify(chrome.runtime.lastError)}`)
          return
        }

        //get the background information of the student
       
        //get the os of the user
        var studentOS;
        const userAgent = window.navigator.userAgent;
        if(userAgent.includes('Windows NT')){
          const windowsVersion = userAgent.match(/Windows NT (\d+\.\d+)/);
          if(windowsVersion) {
            const get_windowsVersion = windowsVersion[0];
            studentOS = get_windowsVersion;
          }
        }else if(userAgent.includes('Mac OS X')){
          const macOSVersion = userAgent.match(/Mac OS X (\d+[._]\d+[._]\d+)/);
          if(macOSVersion){
            const get_macOSVersion = macOSVersionMatch[0];
            studentOS = get_macOSVersion;
          }

        }else if(userAgent.includes("Ubuntu")){
          const linuxVersionMatch = userAgent.match(/Ubuntu\/(\d+\.\d+)/);
          if (linuxVersionMatch) {
            const get_linuxVersion = linuxVersionMatch[0];
            studentOS = get_linuxVersion;
          }
        }else{
          studentOS = "No OS Detected";
        }
        
        //get the browser information
        var studentBrowser;
        if (userAgent.includes('Chrome')){
          // console.log('Google Chrome');
          studentBrowser = 'Google Chrome';
        }else if (userAgent.includes('Firefox')) {
          studentBrowser = 'Mozilla Firefox';
        } else if (userAgent.includes('Edge')) {
          studentBrowser = 'Microsoft Edge';
        } else {
          studentBrowser = 'Unknown';
        }

        //get the display resolution
        var studentDisplay;
        chrome.system.display.getInfo(function(info){
          if(info){
            //loop through
            info.forEach(display => {
              // studentDisplay = info.bounds.width + 'x' + info.bounds.height;
              // console.log('Bounds:', display.bounds);
              // console.log('Width:', display.bounds.width);
              // console.log('Height:', display.bounds.height);
              studentDisplay = display.bounds.width + 'x' + display.bounds.height;

            })
          
          }
        })

        //get the system cpu info
        var studentCPU;
        chrome.system.cpu.getInfo(function(info){
          if(info){
            studentCPU = info.modelName;
          }
        })

        //get IP address, callback function
        getIPAddress(ipAddress => {
          //get the geolocation
          getGeolocation(geolocation => {
            //firebase authentication
            signInWithCredential(auth, GoogleAuthProvider.credential(null, token))
            .then(res =>
            {
              const user = auth.currentUser;
              
              if (user !== null) {
                const profileID = user.uid;
                const db = getDatabase(); 
                const studentRef = ref(db,'students/' + IDnumber);
           

                const updates = {};
                updates[`/students/${IDnumber}/authProviderUID`] = profileID;
                updates[`/students/${IDnumber}/OperatingSystem`] = studentOS;
                updates[`/students/${IDnumber}/IPAddress`] = ipAddress;
                updates[`/students/${IDnumber}/Geolocation_lat`]= geolocation.latitude;
                updates[`/students/${IDnumber}/Geolocation_long`]= geolocation.longitude;
                updates[`/students/${IDnumber}/UserAgentString`]= studentBrowser;
                updates[`/students/${IDnumber}/SystemDisplayResolution`]= studentDisplay;
                updates[`/students/${IDnumber}/SystemCPU`]= studentCPU;
                updates[`/students/${IDnumber}/Browser`]= studentBrowser;

                update(ref(db), updates)
                .then(()=>{
                  // openModal();
                  // alert('Success in Registering Student with UID and Info');
                  let modal = document.getElementsByClassName("Alerts-Success-Modal")[0];
                  let overlay = document.getElementsByClassName("modal-success-Overlay")[0];
                  modal.style.display = "block";
                  overlay.style.display = "block";
                  let alertMessage = document.getElementById("ModalTextSuccess-labels");
                  alertMessage.textContent = 'You are now Registered!';
                  let closeBtn = document.getElementsByClassName("ModalSuccessCloseBtn")[0];
                  closeBtn.addEventListener("click", function(){
                    chrome.sidePanel.setOptions({path:StudentSuccessReg});
                  })
                  
                })
                .catch((err) => {
                  // openFailedModal();
                  let modal = document.getElementsByClassName("Alerts-Failure-Modal")[0];
                  let overlay = document.getElementsByClassName("modal-failure-Overlay")[0];
                  modal.style.display = "block";
                  overlay.style.display = "block";
                  let alertMessage = document.getElementById("ModalTextFailure-labels");
                  alertMessage.textContent = "Error with database: " + err;
                  // console.log("Error with database: " + err);
                })

              }
            }) //EOF signInWithCredential
            .catch(err =>
            {
              // openFailedModal();
              let modal = document.getElementsByClassName("Alerts-Failure-Modal")[0];
              let overlay = document.getElementsByClassName("modal-failure-Overlay")[0];
              modal.style.display = "block";
              overlay.style.display = "block";
              let alertMessage = document.getElementById("ModalTextFailure-labels");
              alertMessage.textContent = "SSO ended with an error" + err;
              // console.log("Error with database: " + err);
              // alert("SSO ended with an error" + err);
            })
          }) //EOF geolocation
      })//EOF ipCallback

    })//EOF getAuthToken     
}

//function to check if faculty is already registered
function isFacultyRegistered(IDnumber){
  //console.log(IDnumber);
   //check if there is a logged in user
   chrome.identity.getAuthToken({ interactive: true }, token =>
    {
      if ( chrome.runtime.lastError || ! token ) {
        console.log(`SSO ended with an error: ${JSON.stringify(chrome.runtime.lastError)}`)
        return
      }

      //firebase authentication
      signInWithCredential(auth, GoogleAuthProvider.credential(null, token))
      .then(res =>{
          const user = auth.currentUser;
          //get profile uid
          if (user !== null) {
            user.providerData.forEach((profile) => {
              const profileID = profile.uid;
              const email = profile.email;
              const db = getDatabase(); 
              const facultyRef = ref(db,'faculty-in-charge/' + IDnumber);
              //find if the faculty ID exists, already added by the admin
              get(facultyRef)
              .then((snapshot) => {
                if(snapshot.exists()){
                  //console.log("Success Firebase Access!");
                  //check the UID
                  const facultyData = snapshot.val();
                  if(facultyData.authProviderUID === ""){
                    //register the account
                    //check if it matches the email added by the admin
                    if(facultyData.email===email){
                      if(facultyData.employeeNum===IDnumber){
                        const updates = {};
                        updates[`/faculty-in-charge/${IDnumber}/authProviderUID`] = profileID;
                        update(ref(db), updates)
                          .then(()=>{
                            // console.log('Success in Registering Email: ' + IDnumber);
                            // console.log('Success in Faculty Registration');
                            chrome.sidePanel.setOptions({path:FacultySuccessReg});
                          })
                          .catch((err) => {
                            console.log("Error with database: " + err);
                          })
                      }else{
                        //it means that the user is not registered
                          let modal = document.getElementsByClassName("Alerts-Failure-Modal")[0];
                          let overlay = document.getElementsByClassName("modal-failure-Overlay")[0];
                          modal.style.display = "block";
                          overlay.style.display = "block";
                          let alertMessage = document.getElementById("ModalTextFailure-labels");
                          alertMessage.textContent = "Please use a valid email";
                          //route to Faculty Dashboard
                          chrome.sidePanel.setOptions({path:landingPage})

                      }
                      
                    }else{
                      //it means that the user is using a different email not registered
                      let modal = document.getElementsByClassName("Alerts-Failure-Modal")[0];
                      let overlay = document.getElementsByClassName("modal-failure-Overlay")[0];
                      modal.style.display = "block";
                      overlay.style.display = "block";
                      let alertMessage = document.getElementById("ModalTextFailure-labels");
                      alertMessage.textContent = "Please use a valid email";
                      //route to Faculty Dashboard
                      chrome.sidePanel.setOptions({path:landingPage})
                    }
                   
                  }else{
                    //user already registerd
                    chrome.sidePanel.setOptions({path:facultyDashboardPage});
                  }
                  
                }else{
                  let modal = document.getElementsByClassName("Alerts-Failure-Modal")[0];
                  let overlay = document.getElementsByClassName("modal-failure-Overlay")[0];
                  modal.style.display = "block";
                  overlay.style.display = "block";
                  let alertMessage = document.getElementById("ModalTextFailure-labels");
                  alertMessage.textContent = "You are not yet registered, Please contact the Admin";
                  //route to Faculty Dashboard
                  chrome.sidePanel.setOptions({path:landingPage})
                }
              })
              .catch((err) => {
                console.log("Error with database: " + err);
              });
          });
        }
      })
      .catch((err) => {
        console.log("SSO ended with an error" + err);
      });
  });

}

function isStudentRegistered(IDnumber){
   //check log in
   //check if there is a logged in user
   chrome.identity.getAuthToken({ interactive: true }, token =>
    {
      if ( chrome.runtime.lastError || ! token ) {
        console.log(`SSO ended with an error: ${JSON.stringify(chrome.runtime.lastError)}`)
        return
      }

      //firebase authentication
      signInWithCredential(auth, GoogleAuthProvider.credential(null, token))
      .then(res =>{
          const user = auth.currentUser;
          //get profile uid
          if (user !== null) {
            user.providerData.forEach((profile) => {
              const profileID = profile.uid;
              const email = profile.email;
              const db = getDatabase(); 
              const studentRef = ref(db,'students/' + IDnumber);
              //find if the profile UID exists
              get(studentRef)
              .then((snapshot) => {
                if (snapshot.exists()) {
                  //console.log("Success Firebase Access!");
                  //check the UID
                  const studentData = snapshot.val();
                  if(studentData.authProviderUID===""){
                    //console.log("auth UID is empty");
                    //register
                    //check if it matches the email added by the admin
                    if(studentData.Email===email){
                      //console.log("email is the same");
                      //register the student
                      //get the information of the student
                      getStudentDetails(IDnumber);
                    }else{
                      //console.log(email + ' Email is not the same');
                      //alert("Please use a valid email");
                      // openFailedModal();
                      let modal = document.getElementsByClassName("Alerts-Failure-Modal")[0];
                      let overlay = document.getElementsByClassName("modal-failure-Overlay")[0];
                      modal.style.display = "block";
                      overlay.style.display = "block";
                      let alertMessage = document.getElementById("ModalTextFailure-labels");
                      alertMessage.textContent = "Please use a valid email";
                    }
                  }else{
                    //student with the id num input has existing UID
                    //check now if they used the same email
                    if(studentData.Email===email){
                      //if correct proceed to input of exam code
                      chrome.sidePanel.setOptions({path:studentInputPage});
                    }else{
                      //email used is not registered
                      // openFailedModal();
                      let modal = document.getElementsByClassName("Alerts-Failure-Modal")[0];
                      let overlay = document.getElementsByClassName("modal-failure-Overlay")[0];
                      modal.style.display = "block";
                      overlay.style.display = "block";
                      let alertMessage = document.getElementById("ModalTextFailure-labels");
                      alertMessage.textContent = "Please use a valid email";
                      
                    }
                  }
                  
                } else {
                  // alert("ID does not exist, Student is NOT VALID");
                  // openFailedModal();
                  let modal = document.getElementsByClassName("Alerts-Failure-Modal")[0];
                  let overlay = document.getElementsByClassName("modal-failure-Overlay")[0];
                  modal.style.display = "block";
                  overlay.style.display = "block";
                  let alertMessage = document.getElementById("ModalTextFailure-labels");
                  alertMessage.textContent = "ID does not exist, Contact your Admin";
                }
              })
              .catch((err) => {
                console.log("Error with database: " + err);
                // openFailedModal();
                let modal = document.getElementsByClassName("Alerts-Failure-Modal")[0];
                let overlay = document.getElementsByClassName("modal-failure-Overlay")[0];
                modal.style.display = "block";
                overlay.style.display = "block";
                let alertMessage = document.getElementById("ModalTextFailure-labels");
                alertMessage.textContent = "Error with database: " + err;
              });
          });
        }
      })
      .catch((err) => {
        //alert("SSO ended with an error" + err);
        // openFailedModal();
        let modal = document.getElementsByClassName("Alerts-Failure-Modal")[0];
        let overlay = document.getElementsByClassName("modal-failure-Overlay")[0];
        modal.style.display = "block";
        overlay.style.display = "block";
        let alertMessage = document.getElementById("ModalTextFailure-labels");
        alertMessage.textContent = "SSO ended with an error: " + err;
        
      });
  });
}

//format for date and time
function formatDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}

function formatTime(date) {
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  return `${hours}:${minutes} ${ampm}`;
}

//function to check exam code
function checkExamCode(){
  //check with database
  var IDnumber;
  chrome.storage.local.get('currentUserId', function(data) {
    IDnumber = data.currentUserId;
  });
  var examCodeInput = document.getElementById('assessmentCodeInput').value;
  //check if there is a logged in user
  chrome.identity.getAuthToken({ interactive: true }, token =>
    {
      if ( chrome.runtime.lastError || ! token ) {
        console.log(`SSO ended with an error: ${JSON.stringify(chrome.runtime.lastError)}`)
        return
      }

      //firebase authentication
      signInWithCredential(auth, GoogleAuthProvider.credential(null, token))
      .then(res =>{
          const user = auth.currentUser;
          //get profile uid
          if (user !== null) {
            const db = getDatabase(); 
            const assessmentRef = ref(db,'/assessments');
            //find if the profile UID exists
            get(assessmentRef)
            .then((snapshot) => {
              if(snapshot.exists()) {
                const assessmentData = snapshot.val();
                //loop through each assessment access code
                for(const assessmentId in assessmentData){
                  const assessment = assessmentData[assessmentId];
                  const accessCode = assessment.access_code;
                  const assessmentCourse = assessment.course;
                  //console.log(accessCode);
                  //console.log(examCodeInput);
                  if(examCodeInput===accessCode){
                    //there is an exam with the that code
                    //console.log(accessCode);
                    //console.log(assessmentId);
                    //find if that student should be taking that exams
                    const takingAssessmentRef = ref(db, `/takingAssessments/${assessmentId}/students/${IDnumber}`);
                    const AssessmentRef = ref(db, `/takingAssessments/${assessmentId}`);
                    const PRAssessmentRef = ref(db, `/proctoringReportStudent/${assessmentCourse}/${assessmentId}/${IDnumber}`);

                    //check first if student already generated a proctoring report (they took the exam already)
                    get(PRAssessmentRef)
                    .then((snapshotPR) => {
                      if(snapshotPR.exists()){
                        //student already generated a proctoring report (they took the exam already)
                        let modal = document.getElementsByClassName("Alerts-Failure-Modal")[0];
                        let overlay = document.getElementsByClassName("modal-failure-Overlay")[0];
                        modal.style.display = "block";
                        overlay.style.display = "block";
                        let alertMessage = document.getElementById("ModalTextFailure-labels");
                        alertMessage.textContent = "You’ve finished this exam. Access Denied.";
                        let closeBtn = document.getElementsByClassName("ModalFailureCloseBtn")[0];
                        closeBtn.addEventListener("click", function(){
                          chrome.sidePanel.setOptions({path:landingPage})
                        })
                       

                      }else{
                        //no report yet, proceed to take exam
                        get(takingAssessmentRef)
                        .then((snapshot) =>{
                          if(snapshot.exists()){
                            get(AssessmentRef)
                            .then((assessmentSnapshot) => {
                              if(assessmentSnapshot.exists()){
                                const assessmentData = assessmentSnapshot.val();
                               // console.log(assessmentData);
                            
                                //check if they can access the exam at access
                                const currentDate = new Date();
                                const formattedCurrentDate = formatDate(currentDate);
                                const formattedCurrentTime = formatTime(currentDate);
                                const assessmentStartTime = assessmentData.expected_time_start;
                                const assessmentEndTime = assessmentData.expected_time_end;
                                const assessmentStartDate = assessmentData.date_start;
                                const assessmentEndDate = assessmentData.date_end;
    
                                console.log("Current Date: " + formattedCurrentDate);
                                console.log("assessmentStartDate: " + assessmentStartDate);
                                console.log("formattedCurrentTime: " + formattedCurrentTime);
                                console.log("assessmentStartTime: " +  assessmentStartTime);
                                console.log("assessmentEndTime: " + assessmentEndTime);
                                
                                //check date range
                                const isWithinDateRange = (formattedCurrentDate >= assessmentStartDate) && (formattedCurrentDate <= assessmentEndDate);
                                let isWithinTimeRange = false;
                                //make sure that instances of the date and time are between the schedule
                                if(isWithinDateRange){
                                  isWithinTimeRange = (formattedCurrentTime >= assessmentStartTime) && (formattedCurrentTime <= assessmentEndTime);
                                }else{
                                  isWithinTimeRange = (formattedCurrentTime >= assessmentStartTime) && (formattedCurrentTime <= assessmentEndTime);
                                }

                                if (isWithinDateRange && isWithinTimeRange) {
                                  //calculate first the risk score
                                  let modal = document.getElementsByClassName("Alerts-Success-Modal")[0];
                                  let overlay = document.getElementsByClassName("modal-success-Overlay")[0];
                                  modal.style.display = "block";
                                  overlay.style.display = "block";
                                  let alertMessage = document.getElementById("ModalTextSuccess-labels");
                                  alertMessage.textContent = 'Valid, You are set to take this exam!';
                                  let closeBtn = document.getElementsByClassName("ModalSuccessCloseBtn")[0];
                                     closeBtn.addEventListener("click", function(){
                                       compareAuthRiskScore(assessmentId);
                                  })
                                 
                                }else{
                                  let modal = document.getElementsByClassName("Alerts-Failure-Modal")[0];
                                  let overlay = document.getElementsByClassName("modal-failure-Overlay")[0];
                                  modal.style.display = "block";
                                  overlay.style.display = "block";
                                  let alertMessage = document.getElementById("ModalTextFailure-labels");
                                  alertMessage.textContent = "This is not your exam schedule. Please check your email.";
                                  let closeBtn = document.getElementsByClassName("ModalFailureCloseBtn")[0];
                                  closeBtn.addEventListener("click", function(){
                                    chrome.sidePanel.setOptions({path:landingPage})
                                  })
                                }
                                   
                              }
    
                            })
                            
                          }else{
                            //alert("You are not valid to take this assessment");
                            //openFailedModal();
                            let modal = document.getElementsByClassName("Alerts-Failure-Modal")[0];
                            let overlay = document.getElementsByClassName("modal-failure-Overlay")[0];
                            modal.style.display = "block";
                            overlay.style.display = "block";
                            let alertMessage = document.getElementById("ModalTextFailure-labels");
                            alertMessage.textContent = "You are not valid to take this exam";
                            let closeBtn = document.getElementsByClassName("ModalFailureCloseBtn")[0];
                            closeBtn.addEventListener("click", function(){
                              chrome.sidePanel.setOptions({path:landingPage})
                            })
                            
                          }
                        })
                        .catch((err) => {
                          console.log("Error with database: " + err);
                        });
                      }
                    })
                    .catch((err) => {
                      console.log("Error with database: " + err);
                    });
                   
                  }
                }
                 
              }
            })
            .catch((err) => {
              console.log("Error with database: " + err);
            });
          
        }
      })
      .catch((err) => {
        console.log("SSO ended with an error" + err);
      });
  });
      
}

//function to compare Auth Risk Score
function compareAuthRiskScore(assessmentId){
  var IDnumber;
  chrome.storage.local.get('currentUserId', function(data) {
    IDnumber = data.currentUserId;
  });

  //check if there is a logged in user
  chrome.identity.getAuthToken({ interactive: true }, token =>
    {
      if ( chrome.runtime.lastError || ! token ) {
        console.log(`SSO ended with an error: ${JSON.stringify(chrome.runtime.lastError)}`)
        return
      }

      //get the background information of the student
     
      //get the os of the user
      var studentOS;
      const userAgent = window.navigator.userAgent;
        if(userAgent.includes('Windows NT')){
          const windowsVersion = userAgent.match(/Windows NT (\d+\.\d+)/);
          if(windowsVersion) {
            const get_windowsVersion = windowsVersion[0];
            studentOS = get_windowsVersion;
          }
        }else if(userAgent.includes('Mac OS X')){
          const macOSVersion = userAgent.match(/Mac OS X (\d+[._]\d+[._]\d+)/);
          if(macOSVersion){
            const get_macOSVersion = macOSVersionMatch[0];
            studentOS = get_macOSVersion;
          }

        }else if(userAgent.includes("Ubuntu")){
          const linuxVersionMatch = userAgent.match(/Ubuntu\/(\d+\.\d+)/);
          if (linuxVersionMatch) {
            const get_linuxVersion = linuxVersionMatch[0];
            studentOS = get_linuxVersion;
          }
        }else{
          studentOS = "No OS Detected";
        }
      

      //get the browser information
      var studentBrowser;
      if (userAgent.includes('Chrome')){
        // console.log('Google Chrome');
        studentBrowser = 'Google Chrome';
      }else if (userAgent.includes('Firefox')) {
        studentBrowser = 'Mozilla Firefox';
      } else if (userAgent.includes('Edge')) {
        studentBrowser = 'Microsoft Edge';
      } else {
        // console.log('Browser: Unknown');
        studentBrowser = 'Unknown'
      }

      //get the display resolution
      var studentDisplay;
      chrome.system.display.getInfo(function(info){
        if(info){
          //loop through
          info.forEach(display => {
            // studentDisplay = info.bounds.width + 'x' + info.bounds.height;
            // console.log('Bounds:', display.bounds);
            // console.log('Width:', display.bounds.width);
            // console.log('Height:', display.bounds.height);
            studentDisplay = display.bounds.width + 'x' + display.bounds.height;

          })
        
        }
      })

      //get the system cpu info
      var studentCPU;
      chrome.system.cpu.getInfo(function(info){
        if(info){
          studentCPU = info.modelName;
        }
      })

      var geolocation_lat_matched;
      var geolocation_long_matched;
      var ipAddress_matched;
      var os_matched; var cpu_matched;
      var display_matched;
      var browser_matched;

      //get IP address, callback function
      getIPAddress(ipAddress => {
        //get the geolocation
        getGeolocation(geolocation => {
          //firebase authentication
          signInWithCredential(auth, GoogleAuthProvider.credential(null, token))
          .then(res =>
          {
            const user = auth.currentUser;
            //get the student attribute from the database
            if (user !== null) {
              user.providerData.forEach((profile) => {
                const profileID = profile.uid;
                const db = getDatabase();
                const studentRef = ref(db,'students/' + IDnumber);
                
                get(studentRef)
                //get the snapshot of the database
                .then((snapshot)=> {
                  //get the gathered student attributes
                  const data = snapshot.val();
                  const geolocationlat = data.Geolocation_lat;
                  const geolocationlong = data.Geolocation_long;
                  const ipAddressStudent = data.IPAddress;
                  const display = data.SystemDisplayResolution;
                  const cpu = data.SystemCPU;
                  const os = data.OperatingSystem;
                  const browser = data.Browser;
                  let totalMatchedWeight = 0;
                  //compare geolocation
                  if(geolocation.latitude === geolocationlat){
                    //console.log('Matched Geolocation Latitude');
                    if(geolocation.longitude === geolocationlong){
                      //console.log('Matched Geolocation Longitude');
                      geolocation_lat_matched = true;
                      geolocation_long_matched = true;
                      //Current Total Matched Weight = 6
                      totalMatchedWeight = 5;
                    }else{
                      //console.log('Did not match Geolocation Long');
                      geolocation_long_matched = false;
                      
                    }
                  }else{
                    //console.log('Did not match Geolocation Lat');
                    geolocation_lat_matched = false;
                    if(geolocation.longitude === geolocationlong){
                      //console.log('Matched Geolocation Longitude');
                      geolocation_long_matched = true;
                    }else{
                      geolocation_long_matched = false;
                    }
                  }
                  //console.log('Saved GeoLat'+ geolocationlat + ' Current Signin GeoLat:'+ geolocation.latitude);

                  //compare IP address
                  if(ipAddress===ipAddressStudent){
                    //console.log('IP Matched');
                    totalMatchedWeight = totalMatchedWeight + 4;
                    ipAddress_matched = true;
                  }else{
                    //console.log('IP Did not match');
                    ipAddress_matched = false;
                  }
                  //console.log('Saved IP: ' + ipAddressStudent + ' Current IP: '+ ipAddress);

                  //compare system Display
                  if(studentDisplay===display){
                    //console.log('Display Matched');
                    totalMatchedWeight = totalMatchedWeight + 3;
                    display_matched = true;
                  }else{
                    display_matched = false;
                    //console.log('Display did not match');
                  }
                  //console.log( 'Saved Display: ' + display + ' Current Display: ' + studentDisplay)

                  //compare system CPU
                  if(studentCPU===cpu){
                    //console.log('CPU Matched');
                    cpu_matched = true;
                    totalMatchedWeight = totalMatchedWeight + 2;
                  }else{
                    cpu_matched = false;
                    //console.log('CPU Did not match');
                  }
                  //console.log('Saved CPU: ' + cpu + ' Current CPU: ' + studentCPU);

                  //compare system OS
                  if(studentOS===os){
                    //console.log('OS Matched');
                    os_matched = true;
                    totalMatchedWeight = totalMatchedWeight + 1;
                  }else{
                    os_matched = false;
                    //console.log('OS Did not match');
                  }
                  //console.log('Saved OS: '+ os + ' Current OS: ' + studentOS);

                  //compare system browser
                  if(studentBrowser===browser){
                    browser_matched = true;
                    //console.log('Browser Matched');
                    // totalMatchedWeight = totalMatchedWeight + 1;
                  }else{
                    //console.log('Browser Did not match');
                    browser_matched = false;
                  }
                  //console.log('Saved Browser: ' + browser + ' Current Browser: ' + studentBrowser);

                  //console.log('Total Matched Weight: ' + totalMatchedWeight);
                  //compute AuthRiskScore
                  var AuthRiskScore = getAuthRiskScore(totalMatchedWeight);
                  //console.log('AuthRiskScore is = ' + AuthRiskScore);

                  //create an object to pass the identity that did not match
                  var studentIdentity_uponExam = {
                    geolocation_lat: {currentGeolocation_lat: geolocation.latitude , didMatch: geolocation_lat_matched },
                    geolocation_long: {currentGeolocation_long: geolocation.longitude , didMatch: geolocation_long_matched},
                    IP_address: {currentIpaddress: ipAddress , didMatch: ipAddress_matched },
                    display: {currentDisplay: display , didMatch: display_matched },
                    cpu:{currentCPU: cpu, didMatch: cpu_matched},
                    os: {currentOS: studentOS , didMatch: os_matched },
                    browser: {currentBrowser: browser, didMatch: browser_matched}
                 }
                  
                  //stringify json
                  var studentIdentityUponExam = JSON.stringify(studentIdentity_uponExam, null, 2);
                  
                  //if riskscore is 0.90 above go to next page
                  if(AuthRiskScore >= 1){
                    //console.log('SUCCESS: Auth Risk Score is: ' + AuthRiskScore);
                    //send the message first containing assessment ID
                    chrome.runtime.sendMessage({action: 'currentAssessment', value: assessmentId});
                    //send the risk score
                    chrome.runtime.sendMessage({action: 'authRiskScore', value: AuthRiskScore});
                    chrome.runtime.sendMessage({action: 'studentIdentity_uponExam', value: studentIdentityUponExam});
                    // chrome.runtime.sendMessage({action: 'AuthFlagged', value: true});
                    // // chrome.sidePanel.setOptions({path: StudentExamDetailsPage});
                    chrome.runtime.sendMessage({action: 'AuthFlagged', value: true}, function(response) {
                      if (chrome.runtime.lastError) {
                          console.error('Error sending AuthFlagged message:', chrome.runtime.lastError);
                          return;
                      }
                        chrome.sidePanel.setOptions({path: StudentExamDetailsPage});
                  
                    });

                  }else{
                    //console.log('FAILED: Auth Risk Score is: ' + AuthRiskScore);
                    chrome.runtime.sendMessage({action: 'currentAssessment', value: assessmentId});
                    chrome.runtime.sendMessage({action: 'authRiskScore', value: AuthRiskScore});
                    chrome.runtime.sendMessage({action: 'studentIdentity_uponExam', value: studentIdentityUponExam});
                    chrome.runtime.sendMessage({action: 'AuthFlagged', value: false}, function(response) {
                      if (chrome.runtime.lastError) {
                          console.error('Error sending AuthFlagged message:', chrome.runtime.lastError);
                          return;
                      }
                        chrome.sidePanel.setOptions({path: StudentExamDetailsPage});
                  
                    });
                  }
                })
                .catch((err) => {
                  console.log(("error with database" + err));
                })
              });

            }
          }) //EOF signInWithCredential
          .catch(err =>
          {
            console.log("SSO ended with an error" + err);
          })
        }) //EOF geolocation
    })//EOF ipCallback

  })//EOF getAuthToken     
}

//function to compute and return the auth risks score
function getAuthRiskScore(totalMatchedWeight){

  //weights
  // var geolocWeight = 5;
  // var ipAddrWeight = 4;
  // var displayWeight = 3;
  // var cpuWeight = 2;
  // var osWeight = 1;
  var totalWeight = 15;

  var AuthRiskScore = totalMatchedWeight/totalWeight;

  return AuthRiskScore;
}

function viewStudentAssessmentDetails(assessmentId, IDnumber){

  //access the database
   //check if there is a logged in user
   chrome.identity.getAuthToken({ interactive: true }, token =>
    {
      if ( chrome.runtime.lastError || ! token ) {
        console.log(`SSO ended with an error: ${JSON.stringify(chrome.runtime.lastError)}`)
        return
      }

      //firebase authentication
      signInWithCredential(auth, GoogleAuthProvider.credential(null, token))
      .then(res =>{
          const user = auth.currentUser;
          //get profile uid
          if (user !== null) {
            const db = getDatabase(); 
            const takingAssessmentRef = ref(db, `/takingAssessments/${assessmentId}/students/${IDnumber}`);
            get(takingAssessmentRef)
            .then((snapshot) =>{
              if(snapshot.exists()){
                //loop through the information
                const AssessmentRef = ref(db, `/assessments/${assessmentId}`);
                get(AssessmentRef)
                .then((snapshot)=>{
                  if(snapshot.exists()){
                    var childData = snapshot.val();
                    //console.log(childData.FacultyInCharge);
                    var ExamDetailsDiv = document.getElementById('ExamDetailsStudent');
                    ExamDetailsDiv.innerHTML='';
      
                    // const assessmentFIC = childData.FacultyInCharge;
                    const assessmentName = childData.name;
                    const assessmentFIC = childData.FacultyInChargeName;
                    const assessmentCourseSection = childData.course;
                    const assessmentLink = childData.link;
                    const assessmentStartTime = childData.expected_time_start;
                    const assessmentEndTime = childData.expected_time_end;
                    const assessmentStartDate= childData.date_start;
                    const assessmentEndDate= childData.date_end;
                    const assessmentTimeLimit = childData.time_limit;

                    ExamDetailsDiv.innerHTML += `<div class="cards">
                      <p class="cardHeader" id="ExamName">${assessmentName}</p>
                      <div class="cardDivText">
                          <div class="cardSubDiv">
                            <p id="card-labels">Faculty:</p>
                            <p class="cardText" id="CourseTitle">${assessmentFIC}</p>
                          </div> 
                          <div class="cardSubDiv">
                              <p id="card-labels">Assigned Course:</p>
                              <p class="cardText" id="ExamCourse">${assessmentCourseSection}</p>
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
                      </div>`
  

                    

                  }
                })
                

               
                        
                        

              }else{
                console.log("Snapshot does not exist");
                        
              }
            }).catch((err) => {
              console.log("Error with database: " + err);
            });
                  
                
                 
                  
                  
                  
          
          }//EOF If User
      }).catch((err) => {
        console.log("SSO ended with an error" + err);
      });
  });

}

//function called when student is ready to take the exam
function studentIsReadyExam(assessmentId, IDnumber){

  //render the link first
  //check if there is a logged in user
  chrome.identity.getAuthToken({ interactive: true }, token =>
    {
      if ( chrome.runtime.lastError || ! token ) {
        console.log(`SSO ended with an error: ${JSON.stringify(chrome.runtime.lastError)}`)
        return
      }

      //firebase authentication
      signInWithCredential(auth, GoogleAuthProvider.credential(null, token))
      .then(res =>{
          const user = auth.currentUser;
          //get profile uid
          if (user !== null) {
            const db = getDatabase(); 
            const takingAssessmentRef = ref(db, `/takingAssessments/${assessmentId}/students/${IDnumber}`);
            get(takingAssessmentRef)
            .then((snapshot) =>{
              if(snapshot.exists()){
                //loop through the information
                const AssessmentRef = ref(db, `/assessments/${assessmentId}`);
                get(AssessmentRef)
                .then((snapshot)=>{
                  if(snapshot.exists()){
                    var childData = snapshot.val();
                    //console.log(childData.FacultyInCharge);
                    var ExamDetailsDiv = document.getElementById('ExamDetailsStudent');
                    ExamDetailsDiv.innerHTML='';
      
                    const assessmentFIC = childData.FacultyInChargeName;
                    const assessmentName = childData.name;
                    const assessmentCourseSection = childData.course;
                    const assessmentLink = childData.link;
                    const assessmentStartTime = childData.expected_time_start;
                    const assessmentEndTime = childData.expected_time_end;
                    const assessmentStartDate= childData.date_start;
                    const assessmentEndDate= childData.date_end;
                    const assessmentTimeLimit = childData.time_limit;

                    ExamDetailsDiv.innerHTML += `
                    <div class="output-student-examLink">
                      <a href="${assessmentLink}" class="ExamLinkBtn" id="output-student-examName">${assessmentName}</a>
                    </div>
                      
                    <div class="studentDivText">
                      <p id="output-labels-student">Course and Section</p>
                      <p class="output-student-exam">${assessmentCourseSection}</p>
                      <p id="output-labels-student">Faculty</p>
                      <p class="output-student-exam">${assessmentFIC}</p>
                      <p id="output-labels-student">Start Date</p>
                      <p class="output-student-exam">${assessmentStartDate}</p>
                      <p id="output-labels-student">Start Time</p>
                      <p class="output-student-exam">${assessmentStartTime}</p>
                      <p id="output-labels-student">End Date</p>
                      <p class="output-student-exam">${assessmentEndDate}</p>
                      <p id="output-labels-student">End Time</p>
                      <p class="output-student-exam">${assessmentEndTime}</p>
                      <p id="output-labels-student">Time Duration</p>
                      <p class="output-student-exam">${assessmentTimeLimit}</p>
                    </div>`

                  }
                })

              }else{
                console.log("Snapshot does not exist");
                        
              }
            }).catch((err) => {
              console.log("Error with database: " + err);
            });
                  
          }//EOF If User
      }).catch((err) => {
        console.log("SSO ended with an error" + err);
      });
  });


}


//function to flag that student is now taking the exam
function studentIsTakingExam(assessmentId, IDnumber){
  
  //render the information
  chrome.identity.getAuthToken({ interactive: true }, token =>
    {
      if ( chrome.runtime.lastError || ! token ) {
        console.log(`SSO ended with an error: ${JSON.stringify(chrome.runtime.lastError)}`)
        return
      }

      //firebase authentication
      signInWithCredential(auth, GoogleAuthProvider.credential(null, token))
      .then(res =>{
          const user = auth.currentUser;
          //get profile uid
          if (user !== null) {
            const db = getDatabase(); 
            const takingAssessmentRef = ref(db, `/takingAssessments/${assessmentId}/students/${IDnumber}`);
            get(takingAssessmentRef)
            .then((snapshot) =>{
              if(snapshot.exists()){
                //loop through the information
                const AssessmentRef = ref(db, `/assessments/${assessmentId}`);
                get(AssessmentRef)
                .then((snapshot)=>{
                  if(snapshot.exists()){
                    var childData = snapshot.val();
                    //console.log(childData.FacultyInCharge);
                    var ExamDetailsDiv = document.getElementById('ExamDetailsStudent');
                    ExamDetailsDiv.innerHTML='';
                    // const assessmentFIC = childData.FacultyInCharge;
                    const assessmentName = childData.name;
                    const assessmentFIC = childData.FacultyInChargeName;
                    const assessmentCourseSection = childData.course;
                    const assessmentLink = childData.link;
                    const assessmentStartTime = childData.expected_time_start;
                    const assessmentEndTime = childData.expected_time_end;
                    const assessmentStartDate = childData.date_start;
                    const assessmentEndDate = childData.date_end;
                    const assessmentTimeDuration = childData.time_limit;
                    var timeRemaining = 0;

                    //format for 12hr
                    function formatAMPM(date) {
                      // var month = date.getMonth();
                      var month = date.toLocaleString('default', { month: 'long' });
                      var day = date.getDate();
                      var year = date.getFullYear();
                      var hours = date.getHours();
                      var minutes = date.getMinutes();
                      var seconds = date.getSeconds(); 
                      var ampm = hours >= 12 ? 'pm' : 'am';
                      hours = hours % 12;
                      hours = hours ? hours : 12; // the hour '0' should be '12'
                      minutes = minutes < 10 ? '0'+minutes : minutes;
                      var strTime = month + ' ' + day + ' ' + year + ' ' + hours + ':' + minutes + ':' + seconds + ' ' + ampm;
                      return strTime;
                    }
                    
                    var startTime = formatAMPM(new Date());
                    // document.getElementById("student-current-examTimeStarted").innerHTML = "Time Started: " +  startTime;

                    //time calculation
                    var countDownDate = new Date(Date.now() + assessmentTimeDuration * 60000);
                    let countdownMessage = '';
                    // Update the count down every 1 second
                    var x = setInterval(function () {
                      const now = new Date();
                      
                      // Find the distance between now and the count down date
                      const timeRemaining = countDownDate - now;
                      //console.log("Time Remaining: " + timeRemaining);
                      if (timeRemaining > 0) {
                        const minutesRemaining = Math.floor(timeRemaining / 60000);
                        const secondsRemaining = Math.floor((timeRemaining % 60000) / 1000);
                        // countdownMessage = `${minutesRemaining} minutes ${secondsRemaining} seconds`;
                        document.getElementById("student-current-examTimeLeft").innerHTML = "Time Left: " + minutesRemaining + " minutes " + secondsRemaining + " seconds";
                      } else {
                        document.getElementById("student-current-examTimeLeft").innerHTML = "Time Left: 0 minutes 0 seconds";
                        let modal = document.getElementsByClassName("Alerts-Failure-Modal")[0];
                        let overlay = document.getElementsByClassName("modal-failure-Overlay")[0];
                        modal.style.display = "block";
                        overlay.style.display = "block";
                        let alertMessage = document.getElementById("ModalTextFailure-labels");
                        alertMessage.textContent = "THE TIMER HAS RUN OUT!";
                        let closeBtn = document.getElementsByClassName("ModalFailureCloseBtn")[0];
                        closeBtn.addEventListener("click", function(){
                           //get the current time and pass it
                            //format for 12hr
                            function formatAMPM(date) {
                              // var month = date.getMonth();
                              var month = date.toLocaleString('default', { month: 'long' });
                              var day = date.getDate();
                              var year = date.getFullYear();
                              var hours = date.getHours();
                              var minutes = date.getMinutes();
                              var seconds = date.getSeconds(); 
                              var ampm = hours >= 12 ? 'pm' : 'am';
                              hours = hours % 12;
                              hours = hours ? hours : 12; // the hour '0' should be '12'
                              minutes = minutes < 10 ? '0'+minutes : minutes;
                              var strTime = month + ' ' + day + ' ' + year + ' ' + hours + ':' + minutes + ':' + seconds + ' ' + ampm;
                              return strTime;
                            }
                            var submissionTime = formatAMPM(new Date());
                            chrome.runtime.sendMessage({action: 'submissionTime', value: submissionTime});

                            // Query the currently active tab in the current window
                            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                              if (tabs.length > 0) {
                                // Close the current active tab
                                chrome.tabs.remove(tabs[0].id, () => {
                                  //console.log(`Closed tab ${tabs[0].id}`);
                                });
                              }
                            });
                            chrome.sidePanel.setOptions({path:StudentDoneExam});
                        })
                        
                      }
                   
                    },1000);
          

                    ExamDetailsDiv.innerHTML += `
                    <p id="output-labels-student">Exam Name</p>
                    <p class="output-student-active-exam" id="student-current-examName">${assessmentName}</p>
                    <p id="output-labels-student">Course and Section</p>
                    <p class="output-student-active-exam" id="student-current-examSection">${assessmentCourseSection}</p>
                    <p id="output-labels-student">Faculty</p>
                    <p class="output-student-active-exam" id="student-current-examFIC">${assessmentFIC}</p>                 
                  
                    <p id="output-labels-student">Time and Date Started</p>
                    <p class="output-student-active-time-exam" id="student-current-examTimeStarted">${startTime}</p>
                    <p id="output-labels-student">Time Countdown:</p>
                    <p class="output-student-active-time-exam" id="student-current-examTimeLeft"></p>
                    <p class="output-student-active-exam-record" id="recorded-message">BROWSER ACTIVITY IS RECORDED</p>
                    <p class="output-student-active-exam-record" id="recorded-message">SUBMIT YOUR ONLINE EXAM IN YOUR LMS FIRST</p>
            
                    <div class="SubmitDiv">
                        <button type="button" class="greenBtn" id="submitExamBtn">SUBMIT EXAM</button>
                    </div`

                    //send and store messages
                    chrome.runtime.sendMessage({action: 'timeStarted', value: startTime});
                    isBrowserMinimized();
                    getActiveTabs();
                    isThereNewTab(assessmentLink);
                    didSwitchTabs();
                    
                    
                  }
                })

              }else{
                console.log("Snapshot does not exist");
                        
              }
            }).catch((err) => {
              console.log("Error with database: " + err);
            });
                  
          }//EOF If User
      }).catch((err) => {
        console.log("SSO ended with an error" + err);
      });
  });

}



//function to check if browser is minimized or out of focus
function isBrowserMinimized(){
  
  var timesBrowserOutofFocus = 0;
  chrome.windows.onFocusChanged.addListener(function(windowId) {
    //Check if the focus change, opened other windows or clicked on other windows
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
      //console.log("Browser window is OUT OF FOCUS");
      timesBrowserOutofFocus+=1;
      //console.log("Browser window is OUT OF FOCUS " + timesBrowserOutofFocus + " times!!!!!!!");
      chrome.runtime.sendMessage({action: 'timesBrowserOutOfFocus', value: timesBrowserOutofFocus});

    }else{
      //console.log("BROWSER IS IN FOCUS");
    }
  });
  
}

//function to check what tabs are open and were opened
function getActiveTabs(){
  chrome.tabs.query({}, function(tabs) {
    var tabsList = [];
    // tabs is an array of Tab objects
    tabs.forEach(function(tab) {
        // console.log("Tab ID:", tab.id);
        // console.log("Tab URL:", tab.url);
        // console.log("Tab Title:", tab.title);
        // console.log("Is Tab Active:", tab.active);
        // console.log("---");

        //json for every open tab
        var tabObject = {
          "id": tab.id,
          "url": tab.url,
          "title": tab.title,
          "active": tab.active
        }

        //push the tabObject to the tabsList
        tabsList.push(tabObject);
    });

    //stringify json
    var tabsJson = JSON.stringify(tabsList, null, 2);
    //send as message
    chrome.runtime.sendMessage({action: 'tabsData', value: tabsJson});


  });


}

//function to check if a new tab was opened
function isThereNewTab(assessmentLink){
  let newTabsList = [];
  chrome.tabs.onCreated.addListener(function(tab) {
    //console.log("New tab created:", tab.id);
    newTabsList.push({
      id: tab.id,
      url: '',
      title: ''
    });
  });

  //once tab is done loading
  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if(changeInfo.status === 'complete' && tab.url && tab.title) {
       if(tab.url === assessmentLink){
        //do not add the exam link
       }else{
         // console.log("New Tab Title:", tab.title);
        //update the initial tab opened, find it using the tabId added
        const tabIndex = newTabsList.findIndex(t=> t.id === tabId);
        if(tabIndex >-1){
          newTabsList[tabIndex].url = tab.url;
          newTabsList[tabIndex].title = tab.title;
        }else{
          //new tab not found in the list
          //json for every new tab
          newTabsList.push({
            id: tab.id,
            url: tab.url,
            title: tab.title
          });
        }
         
       }
       
        //also update the active tabs list
        getActiveTabs();
        //stringify json
        var NewtabsJson = JSON.stringify(newTabsList, null, 2);
        //send as message
        chrome.runtime.sendMessage({action: 'newTabData', value: NewtabsJson});

    }
  });

}

//function to monitor tab switching
function didSwitchTabs(){
  var tabSwitchCount = 0;
  chrome.tabs.onActivated.addListener(function(activeInfo) {
    //update tab switch count
    tabSwitchCount+=1;
    //get active tab
    var tabId = activeInfo.tabId;
    chrome.tabs.get(tabId, function(tab) {
      var tabUrl = tab.url;
      //console.log("Tab switched. Tab ID:", tabId, "URL:", tabUrl);
  });
  //console.log(tabSwitchCount);
  chrome.runtime.sendMessage({ action: "tabSwitched", value: tabSwitchCount });
   
});

}

//function that saves the proctoring report
function saveProctoringReport(assessmentId, IDnumber, submissionTime){

  //count for total flagged activities
  var numofFlaggedActivity = 0;
  //get the value from local storage
  var authRiskScore;
  var timeStarted;
  var numOfBrowserOutofFocus;
  chrome.storage.local.get('currentAuthRiskScore', function(data) {
    authRiskScore = data.currentAuthRiskScore;
    chrome.storage.local.get('currentTimeStarted', function(data) {
      if(data){
        timeStarted = data.currentTimeStarted;  
        chrome.storage.local.get('currentBrowserOutOfFocus', function(data){
          numOfBrowserOutofFocus = data.currentBrowserOutOfFocus;
          //undefined check
          if(numOfBrowserOutofFocus === undefined){
            //console.log('No Changes');
            numOfBrowserOutofFocus = 0;
          }else{
            numofFlaggedActivity+=1;
          }
          
          // console.log('Time Started Exam: ' + timeStarted);
          // console.log('Time Ended Exam: ' + submissionTime);
          // console.log('Auth Risk Score: ' + authRiskScore);
          // console.log('Student Changed Focus Times: ' + numOfBrowserOutofFocus);
        });
      }
    });
     
  });

  var tabsDataList;
  chrome.storage.local.get('currenttabsListData', function(data){
    tabsDataList = data.currenttabsListData;
    //console.log('opened tabs data: ' + tabsDataList);
  });

  var newTabsData;
  chrome.storage.local.get('currentNewtabsData', function(data){
    newTabsData = data.currentNewtabsData;
    //undefined check
    if(newTabsData === undefined || newTabsData === []){
      //console.log('No Changes');
      newTabsData = 0;
    }else{
      numofFlaggedActivity+=1;
      //console.log('new tab opened data: ' + newTabsData);
    }
    
  });

  var numTabsSwitched;
  chrome.storage.local.get('currentNumTabsSwitched', function(data){
    numTabsSwitched = data.currentNumTabsSwitched;
    //undefined check
    if(numTabsSwitched === undefined){
      //console.log('No Changes');
      numTabsSwitched = 0;
    }else{
      numofFlaggedActivity+=1;
      //console.log('num of times tab switched: ' + numTabsSwitched);
    }
    
  });

  var countedCopyAction;
  chrome.storage.local.get('copyCounter', function(data) {
    countedCopyAction = data.copyCounter;
    if(countedCopyAction === 0){
      numofFlaggedActivity = numofFlaggedActivity;
    }else{
      numofFlaggedActivity+=1;
      //console.log("Student copied " + countedCopyAction + " times");
    }
    
  });

  var countedPasteAction;
  chrome.storage.local.get('pasteCounter', function(data) {
    countedPasteAction = data.pasteCounter;
    if(countedPasteAction === 0){
      numofFlaggedActivity = numofFlaggedActivity;
    }else{
      numofFlaggedActivity+=1;
      //console.log("Student pasted " + countedPasteAction + " times");
    }
    
  });

  var student_identity_UponExam;
  chrome.storage.local.get('currentStudentIdentity_uponExam', function(data){
    student_identity_UponExam = data.currentStudentIdentity_uponExam;
    // console.log(student_identity_UponExam);
  })

  // var json_newTabsData = JSON.parse(newTabsData);
  // var json_tabsDataList = JSON.parse(tabsDataList);

  var AuthFlaggedValue;
  chrome.storage.local.get('currentAuthFlagged', function(data){
    AuthFlaggedValue = data.currentAuthFlagged;
    // console.log(student_identity_UponExam);
  })

  
  //console.log(numOfBrowserOutofFocus + "Value");
  //check if there is a logged in user
  chrome.identity.getAuthToken({ interactive: true }, token =>
    {
      if ( chrome.runtime.lastError || ! token ) {
        console.log(`SSO ended with an error: ${JSON.stringify(chrome.runtime.lastError)}`)
        return
      }

      //firebase authentication
      signInWithCredential(auth, GoogleAuthProvider.credential(null, token))
      .then(res =>{
          const user = auth.currentUser;
          //get profile uid
          if (user !== null) {
            const db = getDatabase(); 
            const takingAssessmentRef = ref(db, `/takingAssessments/${assessmentId}/students/${IDnumber}`);
            get(takingAssessmentRef)
            .then((snapshot) =>{
              if(snapshot.exists()){
                //loop through the information
                const studentData = snapshot.val();
                const Email = studentData.studentEmail;
                const AssessmentRef = ref(db, `/assessments/${assessmentId}`);
                get(AssessmentRef)
                .then((snapshot)=>{
                  if(snapshot.exists()){
                    var childData = snapshot.val();
                    // console.log(childData.FacultyInCharge);
                    var ExamDetailsDiv = document.getElementById('ExamDetailsStudent');
                    ExamDetailsDiv.innerHTML='';
                    
                    const assessmentFIC_ID = childData.FacultyInCharge;
                    const assessmentFIC = childData.FacultyInChargeName;
                    const assessmentName = childData.name;
                    const assessmentCourseSection = childData.course;
                    const assessmentLink = childData.link;
                    const assessmentCode = childData.access_code;
                    const assessmentStartTime = childData.expected_time_start;
                    const assessmentEndTime = childData.expected_time_end;
                    const assessmentStartDate = childData.date_start;
                    const assessmentEndDate = childData.date_end;
                    // const assessmentTimeLimit =  childData.time_limit;

                    ExamDetailsDiv.innerHTML += `
                    <p id="output-labels-student">Exam Name</p>
                    <p class="output-student-done-exam" id="student-current-examName">${assessmentName}</p>
                    <p id="output-labels-student">Course and Section</p>
                    <p class="output-student-done-exam" id="student-current-examSection">${assessmentCourseSection}</p>
                    <p id="output-labels-student">Faculty</p>
                    <p class="output-student-done-exam" id="student-current-examFIC">${assessmentFIC} </p>                 
                    
                    <p id="output-labels-student">Time Started</p>
                    <p class="output-student-done-time-exam" id="student-current-examTimeStarted">${timeStarted}</p>
                    <p id="output-labels-student">Time Ended</p>
                    <p class="output-student-done-time-exam" id="student-current-examTimeStarted">${submissionTime}</p>
                    
                    <p id="output-labels-student">FLAGGED ACTIVITY</p>
                    <p class="output-student-done-exam" id="student-current-examTimeLeft">${numofFlaggedActivity} </p>

                    <div class="LogOutDiv">
                        <button type="button" class="LogOutBtn" id="LogOutStudentBtn">LOG OUT</button>
                    </div>`
                    
                    //Make proctoring report
                    //Details for /proctoringReportStudent
                    //Student Name
                    //Student Number
                    //Exam Details
                    //Time Started
                    //Time Ended
                    //Auth Risk Score
                    var newReportStudent = {
                      studentEmail: Email,
                      studentNumber: IDnumber,
                      assessmentTaken: {
                        FacultyIDNumber: assessmentFIC_ID,
                        FacultyInChargeName: assessmentFIC ,
                        name: assessmentName,
                        courseSection:  assessmentCourseSection,
                        link:assessmentLink,
                        access_code: assessmentCode,
                        expected_time_start:  assessmentStartTime,
                        expected_time_end: assessmentEndTime,
                        date_start: assessmentStartDate,
                        date_end: assessmentEndDate
                      },
                      student_time_started: timeStarted,
                      student_time_submitted: submissionTime,
                      student_auth_risk_score: authRiskScore,
                      student_AuthFlagged: AuthFlaggedValue,
                      student_total_flagged_activity: numofFlaggedActivity,
                      flagged_activities : {
                        student_num_changed_windows: numOfBrowserOutofFocus,
                        student_open_tabs_data: tabsDataList,
                        student_new_opened_tabs_data: newTabsData,
                        student_num_tab_switched: numTabsSwitched,
                        student_num_of_copy_action: countedCopyAction,
                        student_num_of_paste_action: countedPasteAction
                      },
                      identity_UponExam : student_identity_UponExam


                    }
                    const proctoringReportKey = IDnumber + "_" + assessmentId;
                    const reportStudentRef = ref(db,'proctoringReportStudent');
                    const updates = {};
                    updates[`/proctoringReportStudent/${assessmentCourseSection}/${assessmentId}/${IDnumber}`] = newReportStudent;
                    update(ref(db), updates)
                      .then(()=>{
                        //console.log('Success in Saving Student PR');
                        })
                      .catch((err) => {
                        console.log("Error with database: " + err);
                    })

                      }
                    })
                    

              }else{
                console.log("Snapshot does not exist");
                        
              }
            }).catch((err) => {
              console.log("Error with database: " + err);
            });//EOF Rendering Exam Details UI

           
                  
          }//EOF If User
      }).catch((err) => {
        console.log("SSO ended with an error" + err);
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

function studentSignOut(){
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