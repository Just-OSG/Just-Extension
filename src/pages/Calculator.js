// Navigation handling
if (localStorage.getItem("regHelpCheck") == 0) window.location.replace("popup.html");
const regHelper = document.getElementById("RegHelper2");
regHelper.addEventListener("click", function () {
    localStorage.setItem("regHelpCheck", 0);
    window.location.replace("popup.html");
});

// DOM Elements
const gpaElement = document.getElementById("SGPA");
const cumulativeToggle = document.getElementById("cumulativeToggle");
const cumulativeSection = document.getElementById("cumulativeSection");
const prevGPAInput = document.getElementById("prevGPA");
const prevHoursInput = document.getElementById("prevHours");
const cgpaElement = document.getElementById("CGPA");
const addEntryButton = document.getElementById("addEntrie");
const entriesDiv = document.getElementById("Entries");
const courseNameInput = document.getElementById("CMarkName");
const hoursSelect = document.getElementById("hour");
const markInput = document.getElementById("mark");

// Grade Predictor Elements
const predictorToggle = document.getElementById("predictorToggle");
const predictorSection = document.getElementById("predictorSection");
const predictorTabs = document.querySelectorAll(".predictor-tab");
const predictorTabContents = document.querySelectorAll(".predictor-tab-content");
const predictFinalGPABtn = document.getElementById("predictFinalGPA");
const calculateTargetGradeBtn = document.getElementById("calculateTargetGrade");
const remainingHoursInput = document.getElementById("remainingHours");
const expectedGradeInput = document.getElementById("expectedGrade");
const targetGPAInput = document.getElementById("targetGPA");
const remainingHoursTargetInput = document.getElementById("remainingHoursTarget");
const predictedGPAElement = document.getElementById("predictedGPA");
const requiredGradeElement = document.getElementById("requiredGrade");
const gradeEquivalentElement = document.getElementById("gradeEquivalent");

// Toggle cumulative GPA section - automatically show it when student data exists
document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get('studentData', function (result) {
        if (result.studentData && result.studentData.gpa) {
            // Auto-show the cumulative section since we have data
            cumulativeSection.classList.remove("hidden");
            cumulativeToggle.innerHTML = 'Hide Cumulative GPA Calculator <span>&uarr;</span>';

            // Auto-fill previous GPA and hours
            if (prevGPAInput && result.studentData.gpa) {
                prevGPAInput.value = result.studentData.gpa;
                localStorage.setItem("prevGPA", result.studentData.gpa);
            }

            if (prevHoursInput && result.studentData.completedHours) {
                prevHoursInput.value = result.studentData.completedHours;
                localStorage.setItem("prevHours", result.studentData.completedHours);
            }

            // Recalculate GPA with new values
            calculateGPA();
        }
    });
});

// Toggle cumulative GPA section on click
cumulativeToggle.addEventListener("click", function () {
    cumulativeSection.classList.toggle("hidden");
    if (cumulativeSection.classList.contains("hidden")) {
        cumulativeToggle.innerHTML = 'Show Cumulative GPA Calculator <span>&darr;</span>';
    } else {
        cumulativeToggle.innerHTML = 'Hide Cumulative GPA Calculator <span>&uarr;</span>';
    }
});

// Toggle grade predictor section
predictorToggle.addEventListener("click", function () {
    predictorSection.classList.toggle("hidden");
    if (predictorSection.classList.contains("hidden")) {
        predictorToggle.innerHTML = 'Show Grade Predictor <span>&darr;</span>';
    } else {
        predictorToggle.innerHTML = 'Hide Grade Predictor <span>&uarr;</span>';
    }
});

// Grade predictor tab switching
predictorTabs.forEach(tab => {
    tab.addEventListener("click", function () {
        // Remove active class from all tabs
        predictorTabs.forEach(t => t.classList.remove("active"));
        // Add active class to clicked tab
        this.classList.add("active");

        // Hide all tab contents
        predictorTabContents.forEach(content => content.classList.remove("active"));
        // Show corresponding tab content
        const tabId = this.dataset.tab + "-tab";
        document.getElementById(tabId).classList.add("active");
    });
});

// Initialize previous GPA and hours from localStorage
if (localStorage.getItem("prevGPA")) {
    prevGPAInput.value = localStorage.getItem("prevGPA");
}
if (localStorage.getItem("prevHours")) {
    prevHoursInput.value = localStorage.getItem("prevHours");
}

// Load courses from localStorage
let counter = 0;
if (localStorage.getItem("numberOfCourses") > 0) {
    counter = parseInt(localStorage.getItem("numberOfCourses"));
    localStorage.setItem("GPA", 0);
} else {
    counter = 0;
    localStorage.setItem("GPA", 0);
}

// Function to convert GPA to letter grade
function gpaToLetter(gpa) {
    if (gpa >= 4.15) return "A+";
    if (gpa >= 3.85) return "A";
    if (gpa >= 3.5) return "A-";
    if (gpa >= 3.25) return "B+";
    if (gpa >= 3.0) return "B";
    if (gpa >= 2.75) return "B-";
    if (gpa >= 2.5) return "C+";
    if (gpa >= 2.25) return "C";
    if (gpa >= 2.0) return "C-";
    if (gpa >= 1.75) return "D+";
    if (gpa >= 1.5) return "D";
    if (gpa >= 1.25) return "D-";
    return "F";
}

// Predict final GPA based on current semester and remaining courses
function predictFinalGPA() {
    const remainingHours = parseFloat(remainingHoursInput.value) || 0;
    const expectedGrade = parseFloat(expectedGradeInput.value) || 0;

    if (remainingHours <= 0) {
        alert("Please enter remaining credit hours");
        return;
    }

    // Get current semester data
    const currentData = calculateGPA();
    const currentPoints = parseFloat(currentData.semesterGPA) * currentData.totalHours;
    const currentHours = currentData.totalHours;

    // Get previous data
    const prevGPA = parseFloat(prevGPAInput.value) || 0;
    const prevHours = parseFloat(prevHoursInput.value) || 0;
    const prevPoints = prevGPA * prevHours;

    // Calculate predicted final GPA
    const remainingPoints = expectedGrade * remainingHours;
    const totalPoints = currentPoints + prevPoints + remainingPoints;
    const totalHours = currentHours + prevHours + remainingHours;

    const predictedGPA = totalHours > 0 ? (totalPoints / totalHours).toFixed(2) : "0.00";

    predictedGPAElement.textContent = predictedGPA;
}

// Calculate required grade to achieve target GPA
function calculateTargetGrade() {
    const targetGPA = parseFloat(targetGPAInput.value) || 0;
    const remainingHours = parseFloat(remainingHoursTargetInput.value) || 0;

    if (remainingHours <= 0) {
        alert("Please enter remaining credit hours");
        return;
    }

    if (targetGPA <= 0 || targetGPA > 4.2) {
        alert("Please enter a valid target GPA (0.01 - 4.2)");
        return;
    }

    // Get current semester data
    const currentData = calculateGPA();
    const currentPoints = parseFloat(currentData.semesterGPA) * currentData.totalHours;
    const currentHours = currentData.totalHours;

    // Get previous data
    const prevGPA = parseFloat(prevGPAInput.value) || 0;
    const prevHours = parseFloat(prevHoursInput.value) || 0;
    const prevPoints = prevGPA * prevHours;

    // Calculate required points from remaining courses
    const totalCurrentPoints = currentPoints + prevPoints;
    const totalCurrentHours = currentHours + prevHours;
    const totalTargetPoints = targetGPA * (totalCurrentHours + remainingHours);

    const requiredPoints = totalTargetPoints - totalCurrentPoints;
    const requiredGPA = remainingHours > 0 ? (requiredPoints / remainingHours).toFixed(2) : "0.00";

    requiredGradeElement.textContent = requiredGPA;
    gradeEquivalentElement.textContent = `≈ ${gpaToLetter(parseFloat(requiredGPA))} grade`;

    // Check if required GPA is achievable
    if (parseFloat(requiredGPA) > 4.2) {
        gradeEquivalentElement.textContent = "Not achievable (max 4.2 GPA)";
        gradeEquivalentElement.style.color = "#e53935";
    } else if (parseFloat(requiredGPA) < 0) {
        gradeEquivalentElement.textContent = "Target already achieved!";
        gradeEquivalentElement.style.color = "#2ea400";
    } else {
        gradeEquivalentElement.style.color = "#f5b70a";
    }
}

// Render all saved courses
function renderCourses() {
    entriesDiv.innerHTML = "";

    for (let i = 0; i < counter; i++) {
        const courseName = localStorage.getItem(`${i}-name`);
        const courseHours = localStorage.getItem(`${i}-hour`);
        const courseMark = localStorage.getItem(`${i}-mark`);

        if (!courseName || !courseHours || !courseMark) continue;

        const courseDiv = document.createElement("div");
        courseDiv.id = `course-${i}`;

        // Course info container
        const infoDiv = document.createElement("div");
        infoDiv.className = "course-info";

        // Course name
        const nameSpan = document.createElement("span");
        nameSpan.className = "course-name";
        nameSpan.textContent = courseName;
        infoDiv.appendChild(nameSpan);

        // Course details
        const detailSpan = document.createElement("span");
        detailSpan.className = "course-detail";
        detailSpan.textContent = `${courseHours} credit hours | Grade: ${courseMark}`;
        infoDiv.appendChild(detailSpan);

        courseDiv.appendChild(infoDiv);

        // Delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "Delete";
        deleteBtn.dataset.index = i;
        deleteBtn.addEventListener("click", function () {
            deleteCourse(parseInt(this.dataset.index));
        });

        courseDiv.appendChild(deleteBtn);
        entriesDiv.appendChild(courseDiv);
    }
}

// Delete a specific course
function deleteCourse(index) {
    // Move all courses after the deleted one up by one index
    for (let i = index; i < counter - 1; i++) {
        localStorage.setItem(`${i}-name`, localStorage.getItem(`${i + 1}-name`));
        localStorage.setItem(`${i}-hour`, localStorage.getItem(`${i + 1}-hour`));
        localStorage.setItem(`${i}-mark`, localStorage.getItem(`${i + 1}-mark`));
    }

    // Remove the last course
    localStorage.removeItem(`${counter - 1}-name`);
    localStorage.removeItem(`${counter - 1}-hour`);
    localStorage.removeItem(`${counter - 1}-mark`);

    counter--;
    localStorage.setItem("numberOfCourses", counter);

    // Re-render the courses and update GPA
    renderCourses();
    calculateGPA();
}

// Calculate GPA
function calculateGPA() {
    let totalHours = 0;
    let totalPoints = 0;

    for (let i = 0; i < counter; i++) {
        const hours = parseFloat(localStorage.getItem(`${i}-hour`) || 0);
        let mark = localStorage.getItem(`${i}-mark`);

        if (!mark) continue;

        const gpaValue = letterToGPA(mark);
        totalPoints += gpaValue * hours;
        totalHours += hours;
    }

    const semesterGPA = totalHours > 0 ? (totalPoints / totalHours).toFixed(2) : "0.00";
    gpaElement.textContent = semesterGPA;

    // Calculate cumulative GPA
    calculateCumulativeGPA(semesterGPA, totalHours);

    return { semesterGPA, totalHours, totalPoints };
}

// Calculate cumulative GPA
function calculateCumulativeGPA(semesterGPA, semesterHours) {
    const prevGPA = parseFloat(prevGPAInput.value || 0);
    const prevHours = parseFloat(prevHoursInput.value || 0);

    // Save to localStorage
    localStorage.setItem("prevGPA", prevGPA);
    localStorage.setItem("prevHours", prevHours);

    if (prevHours > 0 || semesterHours > 0) {
        const prevPoints = prevGPA * prevHours;
        const semPoints = parseFloat(semesterGPA) * semesterHours;
        const totalPoints = prevPoints + semPoints;
        const totalHours = prevHours + semesterHours;

        const cumulativeGPA = (totalPoints / totalHours).toFixed(2);
        cgpaElement.textContent = cumulativeGPA;
    } else {
        cgpaElement.textContent = "0.00";
    }
}

// Initialize the page
renderCourses();
calculateGPA();

// Event listeners for previous GPA and hours input
prevGPAInput.addEventListener("input", function () {
    calculateGPA();
});

prevHoursInput.addEventListener("input", function () {
    calculateGPA();
});

// Grade predictor event listeners
predictFinalGPABtn.addEventListener("click", predictFinalGPA);
calculateTargetGradeBtn.addEventListener("click", calculateTargetGrade);

// Update predictions when inputs change
remainingHoursInput.addEventListener("input", function () {
    if (predictedGPAElement.textContent !== "--") {
        predictFinalGPA();
    }
});

expectedGradeInput.addEventListener("input", function () {
    if (predictedGPAElement.textContent !== "--") {
        predictFinalGPA();
    }
});

targetGPAInput.addEventListener("input", function () {
    if (requiredGradeElement.textContent !== "--") {
        calculateTargetGrade();
    }
});

remainingHoursTargetInput.addEventListener("input", function () {
    if (requiredGradeElement.textContent !== "--") {
        calculateTargetGrade();
    }
});

// Add a new course
addEntryButton.addEventListener("click", function (e) {
    e.preventDefault();

    const courseName = courseNameInput.value.trim();
    const courseHours = hoursSelect.value;
    const courseMark = markInput.value.trim();

    if (!courseName || !courseHours || !courseMark) {
        alert("Please fill all fields");
        return;
    }

    localStorage.setItem(`${counter}-name`, courseName);
    localStorage.setItem(`${counter}-hour`, courseHours);
    localStorage.setItem(`${counter}-mark`, courseMark);

    counter++;
    localStorage.setItem("numberOfCourses", counter);

    // Clear form
    courseNameInput.value = "";
    hoursSelect.selectedIndex = 0;
    markInput.value = "";

    // Update UI
    renderCourses();
    calculateGPA();
});