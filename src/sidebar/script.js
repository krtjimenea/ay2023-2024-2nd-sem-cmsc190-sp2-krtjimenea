//contains listeners and functions
// Import the functions you need from the SDKs you need
import { FirebaseApp } from './firebase';
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
      console.log('path: ' + path);
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
          console.log("Data in storage: " + receivedAssessmentId);
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
          console.log("Data in storage: " + receivedAssessmentId);
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
           console.log("Data in storage: " + receivedAssessmentId);
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
          console.log("Data in storage: " + receivedAssessmentId);
          //get the student ID
          var receivedUserId;
          chrome.storage.local.get('currentUserId', function(data) {
            receivedUserId = data.currentUserId;
            //view the details of the assessment
            console.log("Data in storage: " + receivedUserId);
            var receivedSubmissionTime;
            chrome.storage.local.get('currentUserSubmitTime',function(data){
              receivedSubmissionTime = data.currentUserSubmitTime;
              console.log("Submission Time Data in storage: " + receivedSubmissionTime);
              saveProctoringReport(receivedAssessmentId, receivedUserId, receivedSubmissionTime);
            });
            
          });
        });

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
        console.log("Navigating back to:", backToPath );
        chrome.sidePanel.setOptions({path:backToPath});

      });
    } else {
      console.log("No history to navigate back");
    }
  });
}

window.addEventListener('DOMContentLoaded', function () {

  
  
  const headDiv = document.getElementById('AppBody'); // Replace with the actual ID

  headDiv.addEventListener('click', function (event) {
    console.log('Click event fired');

    const target = event.target;
    var currentUserId;

    // Check if the clicked element is the GoogleLoginBtn
    if (target.id === 'GoogleLoginBtn') {
      console.log('Clicked on GoogleLoginBtn');
      getChromeIdentity();
    }

    // Check if the clicked element is the SubmitIDBtn
    if (target.id === 'SubmitIDBtn') {
      console.log('Clicked on SubmitIDBtn');
      checkUser();
    }

    if (target.id === 'SignInAgain') {
      chrome.sidePanel.setOptions({path:landingPage});
    }

    //For faculty dashboard events
    if(target.id === 'ScheduleBtn'){
      console.log('Clicked on Schedule Assessment');
      chrome.sidePanel.setOptions({path:facultySchedulePage});

    }
    if(target.id === 'ManageBtn'){
      console.log('Clicked on Manage Assessment');
      chrome.sidePanel.setOptions({path:facultyViewAssessments});

    }

    //For student
    if(target.id==='SubmitBtn'){
      console.log('Clicked Submit Exam Code');
      //check if the exam code is valid then show the assessment details
      checkExamCode();
    }

    //student clicked get examlink
    if(target.id==='getExamLinkBtn'){
      console.log('Student Get Exam Link');
      chrome.sidePanel.setOptions({path:StudentReadyExam});
    }

    //STUDENT CLICKED THE EXAM LINK
    if(target.id==='output-student-examName'){
      console.log('Student Clicked Exam Link');
      chrome.sidePanel.setOptions({path:StudentActiveExam});
    }

    //student clicked to submit the exam
    if(target.id === 'submitExamBtn'){
      console.log('Student clicked Submit Exam');
       //get the current time and pass it
      //format for 12hr
      function formatAMPM(date) {
        // var month = date.getMonth();
        var month = date.toLocaleString('default', { month: 'long' });
        var day = date.getDay();
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
      chrome.sidePanel.setOptions({path:StudentDoneExam});


    }
    //student clicked log out
    if(target.id === 'LogOutStudentBtn'){
      console.log('Student Logged Out');
      studentSignOut();
    }

    //for routing
    if(target.id ===  'BackBtn' || target.id === 'BackIcon'){
      console.log('Back Clicked');
      navigateBack();
      
      
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
      console.log('Public IP is: ', ipAdd);
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
    }
  )

}
function getChromeIdentity(){
  //check if there is a logged in user
  chrome.identity.getAuthToken({ interactive: true }, token =>
    {
      if ( chrome.runtime.lastError || ! token ) {
        alert('SSO ended with an error: ${JSON.stringify(chrome.runtime.lastError)}')
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

    if(IDinput[0]=== '1' && Dropdowninput === 'Faculty' ){
      console.log('Faculty');
      //check the database first if that faculty exists
      isFacultyRegistered(IDinput);
    }else if(IDinput[0] === '2' && Dropdowninput === 'Student'){
      console.log('Student');
      isStudentRegistered(IDinput);
      //route to Student Dashboard
    }else if(IDinput === '001802885' && Dropdowninput === 'Admin'){
      //route to Admin Dashboard
      console.log('Admin')
      chrome.sidePanel.setOptions({path: AdminDashboard})
    }else{
      alert('Wrong Format');

    }

  }else{
    alert('Wrong Format');
  }
  

}


//function once student submitted all information
function getStudentDetails(IDnumber){
    //check if there is a logged in user
    chrome.identity.getAuthToken({ interactive: true }, token =>
      {
        if ( chrome.runtime.lastError || ! token ) {
          alert(`SSO ended with an error: ${JSON.stringify(chrome.runtime.lastError)}`)
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
          console.log('Google Chrome');
          studentBrowser = 'Google Chrome';
        }else if (userAgent.includes('Firefox')) {
          studentBrowser = 'Mozilla Firefox';
        } else if (userAgent.includes('Edge')) {
          studentBrowser = 'Microsoft Edge';
        } else {
          console.log('Browser: Unknown');
        }

        //get the display resolution
        var studentDisplay;
        chrome.system.display.getInfo(function(info){
          if(info){
            //loop through
            info.forEach(display => {
              // studentDisplay = info.bounds.width + 'x' + info.bounds.height;
              console.log('Bounds:', display.bounds);
              console.log('Width:', display.bounds.width);
              console.log('Height:', display.bounds.height);
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
                  let modal = document.getElementsByClassName("Alerts-Success-Modal")[0];
                  let overlay = document.getElementsByClassName("modal-success-Overlay")[0];
                  modal.style.display = "block";
                  overlay.style.display = "block";
                  let alertMessage = document.getElementById("ModalTextSuccess-labels");
                  alertMessage.textContent = 'Success in Registering Student with UID and Info';
                  // alert('Success in Registering Student with UID and Info');
                  // chrome.sidePanel.setOptions({path:StudentSuccessReg});
                })
                .catch((err) => {
                  console.log("Error with database: " + err);
                })

              }
            }) //EOF signInWithCredential
            .catch(err =>
            {
              alert("SSO ended with an error" + err);
            })
          }) //EOF geolocation
      })//EOF ipCallback

    })//EOF getAuthToken     
}

//function to check if faculty is already registered
function isFacultyRegistered(IDnumber){
  console.log(IDnumber);
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
            user.providerData.forEach((profile) => {
              const profileID = profile.uid;
              const email = profile.email;
              const db = getDatabase(); 
              const facultyRef = ref(db,'faculty-in-charge/' + IDnumber);
              //find if the faculty ID exists, already added by the admin
              get(facultyRef)
              .then((snapshot) => {
                if(snapshot.exists()){
                  alert("Success Firebase Access!");
                  //check the UID
                  const facultyData = snapshot.val();
                  if(facultyData.authProviderUID === ""){
                    //register the account
                    //check if it matches the email added by the admin
                    if(facultyData.email===email){
                      const updates = {};
                      updates[`/faculty-in-charge/${IDnumber}/authProviderUID`] = profileID;
                      update(ref(db), updates)
                        .then(()=>{
                          console.log('Success in Registering Email: ' + IDnumber);
                          alert('Success in Faculty Registration');
                          chrome.sidePanel.setOptions({path:FacultySuccessReg});
                        })
                        .catch((err) => {
                          console.log("Error with database: " + err);
                        })
                    }else{
                      //it means that the user is using a different email not registered
                      alert("Please use a valid Email");
                      //route to Faculty Dashboard
                      chrome.sidePanel.setOptions({path:landingPage})
                    }
                   
                  }else{
                    //user already registerd
                    alert("Your Faculty Number is already registered with an Email");
                    chrome.sidePanel.setOptions({path:facultyDashboardPage});
                  }
                  
                }else{
                  alert("You are not yet registered, Please contact the Admin");
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
        alert("SSO ended with an error" + err);
      });
  });

}

function isStudentRegistered(IDnumber){
   //check log in
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
            user.providerData.forEach((profile) => {
              const profileID = profile.uid;
              const email = profile.email;
              const db = getDatabase(); 
              const studentRef = ref(db,'students/' + IDnumber);
              //find if the profile UID exists
              get(studentRef)
              .then((snapshot) => {
                if (snapshot.exists()) {
                  alert("Success Firebase Access!");
                  //check the UID
                  const studentData = snapshot.val();
                  if(studentData.authProviderUID===""){
                    console.log("auth UID is empty");
                    //register
                    //check if it matches the email added by the admin
                    if(studentData.Email===email){
                      console.log("email is the same");
                      //register the student
                      //get the information of the student
                      getStudentDetails(IDnumber);
                    }else{
                      console.log(email + ' Email is not the same');
                      alert("Please use a valid email");
                    }
                  }else{
                    //student with the id num input has existing UID
                    //check now if they used the same email
                    if(studentData.Email===email){
                      //if correct proceed to input of exam code
                      chrome.sidePanel.setOptions({path:studentInputPage});
                    }else{
                      //email used is not registered
                      alert("Please use a valid email");
                    }
                  }
                  
                } else {
                  alert("ID does not exist, Student is NOT VALID");
                  //Register Process, Add to database, Add them to the course
                }
              })
              .catch((err) => {
                console.log("Error with database: " + err);
              });
          });
        }
      })
      .catch((err) => {
        alert("SSO ended with an error" + err);
      });
  });
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
                  if(examCodeInput===accessCode){
                    //there is an exam with the that code
                    console.log(accessCode);
                    console.log(assessmentId);
                    //find if that student should be taking that exams
                    const takingAssessmentRef = ref(db, `/takingAssessments/${assessmentId}/students/${IDnumber}`);
                    get(takingAssessmentRef)
                    .then((snapshot) =>{
                      if(snapshot.exists()){
                        //console.log(snapshot.val());
                        alert("Valid, Student is SET TO TAKE THIS ASSESSMENT");
                        //calculate first the risk score
                        compareAuthRiskScore(assessmentId);
                        // chrome.sidePanel.setOptions({path:StudentExamDetailsPage})

                      }else{
                        alert("You are not valid to take this assessment");
                        chrome.sidePanel.setOptions({path:landingPage})
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
        alert("SSO ended with an error" + err);
      });
  });
  // // examCodeInput.match('GHB456');
  // if(examCodeInput === 'GHB456'){
  //   //compute AuthRiskScore
  //   //move to next panel
  //   compareAuthRiskScore();
  // }else{
  //   alert('Wrong Exam Code Input');
  // }
      
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
        alert(`SSO ended with an error: ${JSON.stringify(chrome.runtime.lastError)}`)
        return
      }

      //get the background information of the student
     
      //get the os of the user
      var studentOS;
      chrome.runtime.getPlatformInfo(function(info){
        if(info){
          studentOS = info.os;
          // console.log(studentOS);
        }
      });

      //get the browser information
      var studentBrowser;
      const userAgent = window.navigator.userAgent;
      if (userAgent.includes('Chrome')){
        // console.log('Google Chrome');
        studentBrowser = 'Google Chrome';
      }else if (userAgent.includes('Firefox')) {
        studentBrowser = 'Mozilla Firefox';
      } else if (userAgent.includes('Edge')) {
        studentBrowser = 'Microsoft Edge';
      } else {
        console.log('Browser: Unknown');
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
                    console.log('Matched Geolocation Latitude');
                    if(geolocation.longitude === geolocationlong){
                      console.log('Matched Geolocation Longitude');
                      geolocation_lat_matched = true;
                      geolocation_long_matched = true;
                      //Current Total Matched Weight = 6
                      totalMatchedWeight = 6;
                    }else{
                      console.log('Did not match Geolocation Long');
                      geolocation_long_matched = false;
                      
                    }
                  }else{
                    console.log('Did not match Geolocation Lat');
                    geolocation_lat_matched = false;
                  }
                  console.log('Saved GeoLat'+ geolocationlat + ' Current Signin GeoLat:'+ geolocation.latitude);

                  //compare IP address
                  if(ipAddress===ipAddressStudent){
                    alert('IP Matched');
                    totalMatchedWeight = totalMatchedWeight + 5;
                    ipAddress_matched = true;
                  }else{
                    alert('IP Did not match');
                    ipAddress_matched = false;
                  }
                  console.log('Saved IP: ' + ipAddressStudent + ' Current IP: '+ ipAddress);

                  //compare system Display
                  if(studentDisplay===display){
                    alert('Display Matched');
                    totalMatchedWeight = totalMatchedWeight + 4;
                    display_matched = true;
                  }else{
                    display_matched = false;
                    alert('Display did not match');
                  }
                  console.log( 'Saved Display: ' + display + ' Current Display: ' + studentDisplay)

                  //compare system CPU
                  if(studentCPU===cpu){
                    alert('CPU Matched');
                    cpu_matched = true;
                    totalMatchedWeight = totalMatchedWeight + 3;
                  }else{
                    cpu_matched = false;
                    alert('CPU Did not match');
                  }
                  console.log('Saved CPU: ' + cpu + ' Current CPU: ' + studentCPU);

                  //compare system OS
                  if(studentOS===os){
                    alert('OS Matched');
                    os_matched = true;
                    totalMatchedWeight = totalMatchedWeight + 2;
                  }else{
                    os_matched = false;
                    alert('OS Did not match');
                  }
                  console.log('Saved OS: '+ os + ' Current OS: ' + studentOS);

                  //compare system browser
                  if(studentBrowser===browser){
                    browser_matched = true;
                    alert('Browser Matched');
                    totalMatchedWeight = totalMatchedWeight + 1;
                  }else{
                    alert('Browser Did not match');
                    browser_matched = false;
                  }
                  console.log('Saved Browser: ' + browser + ' Current Browser: ' + studentBrowser);

                  console.log('Total Matched Weight: ' + totalMatchedWeight);
                  //compute AuthRiskScore
                  var AuthRiskScore = getAuthRiskScore(totalMatchedWeight);
                  console.log('AuthRiskScore is = ' + AuthRiskScore);

                  //create an object to pass the identity that did not match
                  var studentIdentity_uponExam = {
                    geolocation_lat: {currentGeolocation_lat: geolocation.latitude , didMatch: geolocation_lat_matched },
                    geolocation_long: {currentGeolocation_long: geolocation.longitude , didMatch: geolocation_long_matched },
                    IP_address: {currentIpaddress: ipAddress , didMatch: ipAddress_matched },
                    display: {currentDisplay: display , didMatch: display_matched },
                    cpu:{currentCPU: cpu, didMatch: cpu_matched,
                    os: {currentOS: os , didMatch: os_matched },
                    browser: {currentBrowser: browser, didMatch: browser_matched}
                    }
                  }
                  //stringify json
                  var studentIdentityUponExam = JSON.stringify(studentIdentity_uponExam, null, 2);
                  
                  //if riskscore is 0.90 above go to next page
                  if(AuthRiskScore >= 1){
                    
                    console.log('SUCCESS: Auth Risk Score is: ' + AuthRiskScore);
                    //send the message first containing assessment ID
                    chrome.runtime.sendMessage({action: 'currentAssessment', value: assessmentId});
                    //send the risk score
                    chrome.runtime.sendMessage({action: 'authRiskScore', value: AuthRiskScore});
                    chrome.runtime.sendMessage({action: 'studentIdentity_uponExam', value: studentIdentityUponExam});
                    chrome.sidePanel.setOptions({path: StudentExamDetailsPage});
                    

                  }else{
                    console.log('FAILED: Auth Risk Score is: ' + AuthRiskScore);
                    alert('FAILED, You are not authenticated to take this assessment');
                    chrome.runtime.sendMessage({action: 'authRiskScore', value: AuthRiskScore});

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
            alert("SSO ended with an error" + err);
          })
        }) //EOF geolocation
    })//EOF ipCallback

  })//EOF getAuthToken     
}

//function to compute and return the auth risks score
function getAuthRiskScore(totalMatchedWeight){

  //weights
  // var geolocWeight = 6;
  // var ipAddrWeight = 5;
  // var displayWeight = 4;
  // var cpuWeight = 3;
  // var osWeight = 2;
  // var browserWeight =1;
  // var totalWeight = 21;

  var AuthRiskScore = totalMatchedWeight/7;

  return AuthRiskScore;
}

function viewStudentAssessmentDetails(assessmentId, IDnumber){

  //access the database
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
                    console.log(childData.FacultyInCharge);
                    var ExamDetailsDiv = document.getElementById('ExamDetailsStudent');
                    ExamDetailsDiv.innerHTML='';
      
                    // const assessmentFIC = childData.FacultyInCharge;
                    const assessmentName = childData.name;
                    const assessmentFIC = childData.FacultyInChargeName;
                    const assessmentCourseSection = childData.course;
                    const assessmentLink = childData.link;
                    const assessmentStartTime = childData.expected_time_start;
                    const assessmentEndTime = childData.expected_time_end;

                    ExamDetailsDiv.innerHTML += `<div class="cards">
                      <p class="cardHeader" id="ExamName">${assessmentName}</p>
                      <div class="cardDivText">
                          <div class="cardSubDiv">
                            <p id="card-labels">Faculty-in-Charge:</p>
                            <p class="cardText" id="CourseTitle">${assessmentFIC}</p>
                          </div> 
                          <div class="cardSubDiv">
                              <p id="card-labels">Assigned Course:</p>
                              <p class="cardText" id="ExamCourse">${assessmentCourseSection}</p>
                          </div>    
                          <div class="cardSubDiv">
                              <p id="card-labels">Start Time and Date:</p>
                              <p class="cardText" id="ExamStartTimeDate">${assessmentStartTime}</p>
                          </div>  
                          <div class="cardSubDiv">
                              <p id="card-labels">End Time and Date:</p>
                              <p class="cardText" id="ExamEndTimeDate">${assessmentEndTime}</p>
                          </div>  
                      </div>`
  

                    

                  }
                })
                

               
                        
                        

              }else{
                alert("Snapshot does not exist");
                        
              }
            }).catch((err) => {
              console.log("Error with database: " + err);
            });
                  
                
                 
                  
                  
                  
          
          }//EOF If User
      }).catch((err) => {
        alert("SSO ended with an error" + err);
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
                    console.log(childData.FacultyInCharge);
                    var ExamDetailsDiv = document.getElementById('ExamDetailsStudent');
                    ExamDetailsDiv.innerHTML='';
      
                    const assessmentFIC = childData.FacultyInChargeName;
                    const assessmentName = childData.name;
                    const assessmentCourseSection = childData.course;
                    const assessmentLink = childData.link;
                    const assessmentStartTime = childData.expected_time_start;
                    const assessmentEndTime = childData.expected_time_end;

                    ExamDetailsDiv.innerHTML += `
                    <div class="output-student-examLink">
                      <a href="${assessmentLink}" target="_blank" class="ExamLinkBtn" id="output-student-examName">${assessmentName}</a>
                    </div>
                      
                    <div class="studentDivText">
                      <p class="output-student-exam">Course: ${assessmentCourseSection}</p>
                      <p class="output-student-exam">Course: ${assessmentFIC}</p>
                      <p class="output-student-exam">Start Time and Date: ${assessmentStartTime}</p>
                      <p class="output-student-exam">End Time and Date: ${assessmentEndTime}</p>
                    </div>`

                  }
                })

              }else{
                alert("Snapshot does not exist");
                        
              }
            }).catch((err) => {
              console.log("Error with database: " + err);
            });
                  
          }//EOF If User
      }).catch((err) => {
        alert("SSO ended with an error" + err);
      });
  });


}


//function to flag that student is now taking the exam
function studentIsTakingExam(assessmentId, IDnumber){
  
  //render the information
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
                    console.log(childData.FacultyInCharge);
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
                    var timeRemaining = 0;

                    //time calculation
                    // console.log(assessmentEndDate);
                    // console.log(assessmentEndTime);
                    var countDownDate = new Date(assessmentEndDate + " " + assessmentEndTime).getTime();
                    //format for 12hr
                    function formatAMPM(date) {
                      // var month = date.getMonth();
                      var month = date.toLocaleString('default', { month: 'long' });
                      var day = date.getDay();
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

                    
                    // Update the count down every 1 second
                    var x = setInterval(function() {

                      // Get today's date and time
                      var now = new Date().getTime();

                      // Find the distance between now and the count down date
                      // console.log(countDownDate);
                      // console.log(now);
                      var distance = countDownDate - now;
                        
                      // Time calculations for days, hours, minutes and seconds
                      var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                      var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                      var seconds = Math.floor((distance % (1000 * 60)) / 1000);
                        
                      // Output the result in an element with id="demo"
                      timeRemaining = days + "d " + hours + "h " + minutes + "m " + seconds + "s ";
                      document.getElementById("student-current-examTimeLeft").innerHTML = "Time Left: " +  timeRemaining;
                      // console.log(timeRemaining);
                        
                      // If the count down is over, write some text 
                      if (distance < 0) {
                        clearInterval(x);
                        document.getElementById("student-current-examTimeLeft").innerHTML = "EXPIRED";
                      }


                    },1000);

                    ExamDetailsDiv.innerHTML += `
                    <p class="output-student-active-exam" id="student-current-examName">Exam: ${assessmentName}</p>
                    <p class="output-student-active-exam" id="student-current-examSection">Course & Section: ${assessmentCourseSection}</p>
                    <p class="output-student-active-exam" id="student-current-examFIC">Faculty-in-Charge: ${assessmentFIC}</p>                 
                  
    
                    <p class="output-student-active-time-exam" id="student-current-examTimeStarted">Time Started: ${startTime}</p>
                    <p class="output-student-active-time-exam" id="student-current-examTimeLeft">Time Left: ${timeRemaining}</p>
                    <p class="output-student-active-exam-record" id="recorded-message">BROWSER ACTIVITY IS RECORDED</p>
            
                    <div class="SubmitDiv">
                        <button type="button" class="greenBtn" id="submitExamBtn">SUBMIT EXAM</button>
                    </div`

                    //send and store messages
                    chrome.runtime.sendMessage({action: 'timeStarted', value: startTime});
                    isBrowserMinimized();
                    getActiveTabs();
                    isThereNewTab();
                    // didCopy();
                    didSwitchTabs();
                  }
                })

              }else{
                alert("Snapshot does not exist");
                        
              }
            }).catch((err) => {
              console.log("Error with database: " + err);
            });
                  
          }//EOF If User
      }).catch((err) => {
        alert("SSO ended with an error" + err);
      });
  });

}



//function to check if browser is minimized or out of focus
function isBrowserMinimized(){
  
  var timesBrowserOutofFocus = 0;
  chrome.windows.onFocusChanged.addListener(function(windowId) {
    //Check if the focus change, opened other windows or clicked on other windows
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
      console.log("Browser window is OUT OF FOCUS");
      timesBrowserOutofFocus+=1;
      console.log("Browser window is OUT OF FOCUS " + timesBrowserOutofFocus + " times!!!!!!!");
      chrome.runtime.sendMessage({action: 'timesBrowserOutOfFocus', value: timesBrowserOutofFocus});

    }else{
      console.log("BROWSER IS IN FOCUS");
    }
  });
  
}

//function to check what tabs are open
function getActiveTabs(){
  chrome.tabs.query({}, function(tabs) {
    var tabsList = [];
    // tabs is an array of Tab objects
    tabs.forEach(function(tab) {
        console.log("Tab ID:", tab.id);
        console.log("Tab URL:", tab.url);
        console.log("Tab Title:", tab.title);
        console.log("Is Tab Active:", tab.active);
        console.log("---");

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
function isThereNewTab(){
  chrome.tabs.onCreated.addListener(function(tab) {
    console.log("New tab created:", tab.id);
  });
  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if(changeInfo.status === 'complete' && tab.url && tab.title) {
        console.log("URL of the new tab:", tab.url);
        console.log("New Tab Title:", tab.title);
         //json for every new tab
         var newTabObject = {
          "id": tab.id,
          "url": tab.url,
          "title": tab.title,
        }
        //stringify json
        var NewtabsJson = JSON.stringify(newTabObject, null, 2);
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
      console.log("Tab switched. Tab ID:", tabId, "URL:", tabUrl);
  });
  console.log(tabSwitchCount);
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
            console.log('No Changes');
            numOfBrowserOutofFocus = 0;
          }else{
            numofFlaggedActivity+=1;
          }
          
          console.log('Time Started Exam: ' + timeStarted);
          console.log('Time Ended Exam: ' + submissionTime);
          console.log('Auth Risk Score: ' + authRiskScore);
          console.log('Student Changed Focus Times: ' + numOfBrowserOutofFocus);
        });
      }
    });
     
  });

  var tabsDataList;
  chrome.storage.local.get('currenttabsListData', function(data){
    tabsDataList = data.currenttabsListData;
    console.log('opened tabs data: ' + tabsDataList);
  });

  var newTabsData;
  chrome.storage.local.get('currentNewtabsData', function(data){
    newTabsData = data.currentNewtabsData;
    //undefined check
    if(newTabsData === undefined){
      console.log('No Changes');
      newTabsData = 0;
    }else{
      numofFlaggedActivity+=1;
      console.log('new tab opened data: ' + newTabsData);
    }
    
  });

  var numTabsSwitched;
  chrome.storage.local.get('currentNumTabsSwitched', function(data){
    numTabsSwitched = data.currentNumTabsSwitched;
    //undefined check
    if(numTabsSwitched === undefined){
      console.log('No Changes');
      numTabsSwitched = 0;
    }else{
      numofFlaggedActivity+=1;
      console.log('num of times tab switched: ' + numTabsSwitched);
    }
    
  });

  var countedCopyAction;
  chrome.storage.local.get('copyCounter', function(data) {
    countedCopyAction = data.copyCounter;
    if(countedCopyAction === 0){
      numofFlaggedActivity = numofFlaggedActivity;
    }else{
      numofFlaggedActivity+=1;
      console.log("Student copied " + countedCopyAction + " times");
    }
    
  });

  var countedPasteAction;
  chrome.storage.local.get('pasteCounter', function(data) {
    countedPasteAction = data.pasteCounter;
    if(countedPasteAction === 0){
      numofFlaggedActivity = numofFlaggedActivity;
    }else{
      numofFlaggedActivity+=1;
      console.log("Student pasted " + countedPasteAction + " times");
    }
    
  });

  var student_identity_UponExam;
  chrome.storage.local.get('currentStudentIdentity_uponExam', function(data){
    student_identity_UponExam = data.currentStudentIdentity_uponExam;
    console.log(student_identity_UponExam);
  })

  // var json_newTabsData = JSON.parse(newTabsData);
  // var json_tabsDataList = JSON.parse(tabsDataList);

  
  console.log(numOfBrowserOutofFocus + "Value");
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

                    

                    ExamDetailsDiv.innerHTML += `
                    
                      
                    <p class="output-student-done-exam" id="student-current-examName">Exam: ${assessmentName}</p>
                    <p class="output-student-done-exam" id="student-current-examSection">Course & Section: ${assessmentCourseSection}</p>
                    <p class="output-student-done-exam" id="student-current-examFIC">Faculty-in-Charge:${assessmentFIC} </p>                 
              

                    <p class="output-student-done-time-exam" id="student-current-examTimeStarted">Time Started: ${timeStarted}</p>
                    <p class="output-student-done-time-exam" id="student-current-examTimeStarted">Time Ended: ${submissionTime}</p>
                    

                    <p class="output-student-done-exam" id="student-current-examTimeLeft">Flagged Activity: ${numofFlaggedActivity} </p>

                    <div class="LogOutDiv">
                        <button type="button" class="LogOutBtn" id="LogOutStudentBtn">LOG OUT</button>
                    </div>`
                    
                    //Make proctoring report
                    //Details for /proctoringReportStudent
                    //Key: Student Number _ Exam Id
                    var studentPRKey = IDnumber + assessmentId;
                    
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
                      flagged_activities : {
                        student_total_flagged_activity: numofFlaggedActivity,
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
                    updates[`/proctoringReportStudent/${studentPRKey}/`] = newReportStudent;
                    update(ref(db), updates)
                      .then(()=>{
                        console.log('Success in Saving Student PR');
                        })
                      .catch((err) => {
                        console.log("Error with database: " + err);
                    })

                      }
                    })
                    

              }else{
                alert("Snapshot does not exist");
                        
              }
            }).catch((err) => {
              console.log("Error with database: " + err);
            });//EOF Rendering Exam Details UI

           
                  
          }//EOF If User
      }).catch((err) => {
        alert("SSO ended with an error" + err);
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
    alert('Sign out Success');
    chrome.sidePanel.setOptions({path:landingPage})
    }).catch((error) => {
      // An error happened.
      alert("Error: " + error);
    });
  });
  
}