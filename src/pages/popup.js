// Let the background script know the popup is open
chrome.runtime.connect({ name: "popup" });

// Load student data for welcome message and profile section
document.addEventListener('DOMContentLoaded', () => {
  // Display welcome message with student name and set profile avatar initial
  loadStudentInfo();

  // Course evaluation slider
  let evaV;
  const slider = document.getElementById("evaRange");
  if (slider) {
    // Update the current slider value (each time you drag the slider handle)
    slider.oninput = function () {
      evaV = slider.value + "/" + slider.value;

      chrome.tabs.query({ currentWindow: true }, function (tabs) {
        // Loop through the tabs
        for (var i = 0; i < tabs.length; i++) {
          // Send the value to the JavaScript file running in the tab
          chrome.tabs.sendMessage(tabs[i].id, { value: evaV });
        }
      });

      console.log(evaV);
    };
  }

  // Auto-close notifications
  const AutoCN = document.getElementById("ACN");
  if (AutoCN) {
    if (localStorage.getItem("notifications") == 1) {
      AutoCN.checked = true;
    } else {
      AutoCN.checked = false;
    }

    AutoCN.addEventListener("click", function () {
      chrome.tabs.query({ currentWindow: true }, function (tabs) {
        var AutoCn_Check = AutoCN.checked;
        if (AutoCn_Check == true) {
          localStorage.setItem("notifications", 1);
        } else {
          localStorage.setItem("notifications", 0);
        }

        // Loop through the tabs
        for (var i = 0; i < tabs.length; i++) {
          // Send multiple values in the request object
          chrome.tabs.sendMessage(tabs[i].id, {
            AutoClose: AutoCn_Check
          });
        }
      });
    });
  }

  // Dark theme
  const Dark = document.getElementById("Darktheme");
  if (Dark) {
    if (localStorage.getItem("Dark") == 'E') {
      Dark.checked = true;
    } else {
      Dark.checked = false;
    }

    Dark.addEventListener("click", function () {
      chrome.tabs.query({ currentWindow: true }, function (tabs) {
        var Dark_Check = Dark.checked;
        if (Dark_Check == true) {
          localStorage.setItem("Dark", 'E'); // E from Enable
        } else {
          localStorage.setItem("Dark", 'D');  // D from Disable 
        }

        // Loop through the tabs
        for (var i = 0; i < tabs.length; i++) {
          // Send multiple values in the request object
          if (Dark_Check == true) {
            chrome.tabs.sendMessage(tabs[i].id, {
              Dark: 'E'
            });
          } else {
            chrome.tabs.sendMessage(tabs[i].id, {
              Dark: 'D'
            });
          }
        }
      });
    });
  }

  // RegHelper
  if (localStorage.getItem("regHelpCheck") == 1) {
    window.location.replace("RegHelper.html");
  }

  const regHelper = document.getElementById("RegHelper");
  if (regHelper) {
    regHelper.addEventListener("click", function () {
      localStorage.setItem("regHelpCheck", 1);
      window.location.replace("RegHelper.html");
    });
  }

  // GPA Calculator
  if (localStorage.getItem("regHelpCheck") == 2) {
    window.location.replace("Calculator.html");
  }

  const calcHelper = document.getElementById("calc");
  if (calcHelper) {
    calcHelper.addEventListener("click", function () {
      localStorage.setItem("regHelpCheck", 2);
      window.location.replace("Calculator.html");
    });
  }

  // Clear legacy state from the removed Export & Backup page
  if (localStorage.getItem("regHelpCheck") == 3) {
    localStorage.setItem("regHelpCheck", 0);
  }

  // Function to load and display student info in the profile section
  function loadStudentInfo() {
    chrome.storage.local.get('studentData', (result) => {
      const studentData = result.studentData;
      const welcomeNameElement = document.getElementById('welcomeStudentName');
      const profileInitial = document.getElementById('profileInitial');

      if (studentData && studentData.studentName) {
        // Display just the first name if possible
        const nameParts = studentData.studentName.split(' ');
        const firstName = nameParts[0] || studentData.studentName;
        welcomeNameElement.textContent = firstName;

        // Set the initial for the avatar
        profileInitial.textContent = firstName.charAt(0).toUpperCase();
      } else {
        welcomeNameElement.textContent = 'Student';
        profileInitial.textContent = 'S';
      }
    });
  }
});
