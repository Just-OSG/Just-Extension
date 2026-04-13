// Handle the back button
document.getElementById('backButton').addEventListener('click', function() {
   window.location.replace('popup.html');
});

// Navigate to GPA Calculator with student data
document.getElementById('gpaCalculatorBtn').addEventListener('click', function() {
   localStorage.setItem("regHelpCheck", 2); // Set state for Calculator
   window.location.replace('Calculator.html');
});

// Navigate to Courses page
document.getElementById('viewCoursesBtn').addEventListener('click', function() {
   window.location.href = 'courses.html';
});

// Handle refresh data button
document.getElementById('refreshDataBtn').addEventListener('click', function() {
   this.textContent = 'Refreshing...';
   this.disabled = true;
   
   chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
       // Check if we're on a JUST website tab
       if (tabs[0] && tabs[0].url.includes('services.just.edu.jo')) {
           chrome.tabs.sendMessage(tabs[0].id, { action: "refreshStudentData" });
           setTimeout(function() {
               loadStudentData();
               document.getElementById('refreshDataBtn').textContent = 'Refresh';
               document.getElementById('refreshDataBtn').disabled = false;
           }, 1000);
       } else {
           alert('Please visit the JUST website to refresh student data');
           document.getElementById('refreshDataBtn').textContent = 'Refresh';
           document.getElementById('refreshDataBtn').disabled = false;
       }
   });
});

// Load and display student data
function loadStudentData() {
   chrome.storage.local.get('studentData', function(result) {
       const studentData = result.studentData;
       const dataContainer = document.getElementById('dataContainer');
       const noDataContainer = document.getElementById('noDataContainer');
       const viewCoursesBtn = document.getElementById('viewCoursesBtn');
       
       if (studentData && Object.keys(studentData).length > 0 && studentData.studentName) {
           // Show data container, hide no-data message
           dataContainer.style.display = 'block';
           noDataContainer.style.display = 'none';
           viewCoursesBtn.style.display = 'block';
           
           // Populate all fields with student data
           document.getElementById('studentName').textContent = studentData.studentName || 'Student';
           document.getElementById('studentId').textContent = studentData.studentId || '-';
           document.getElementById('department').textContent = studentData.department || '-';
           document.getElementById('gpa').textContent = studentData.gpa || '-';
           document.getElementById('completedHours').textContent = studentData.completedHours || '-';
           document.getElementById('passedHours').textContent = studentData.passedHours || '-';
           document.getElementById('planHours').textContent = studentData.planHours || '-';
           document.getElementById('studentStatus').textContent = studentData.studentStatus || '-';
           document.getElementById('planYear').textContent = studentData.planYear || '-';
       } else {
           // Show no-data message, hide data container
           dataContainer.style.display = 'none';
           noDataContainer.style.display = 'block';
           
           // Hide courses button since there's no data
           viewCoursesBtn.style.display = 'none';
       }
   });
}

// Load data when the page loads
document.addEventListener('DOMContentLoaded', loadStudentData);

// ── Export helpers ────────────────────────────────────────────────

function showExportStatus(message, type) {
    const el = document.getElementById('exportStatus');
    el.textContent = message;
    el.className = `export-status ${type}`;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 5000);
}

function getStoredStudentData() {
    return new Promise(resolve => {
        chrome.storage.local.get('studentData', result => {
            resolve(result.studentData || null);
        });
    });
}

function formatExportValue(value, fallback = 'N/A') {
    if (value === undefined || value === null) {
        return fallback;
    }

    const textValue = String(value).trim();
    return textValue || fallback;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function formatFetchedAt(value) {
    if (!value) {
        return 'N/A';
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? formatExportValue(value) : parsed.toLocaleString();
}

function getCourseStatusLabel(status) {
    const labels = {
        current_semester: 'Current Semester',
        not_required: 'Not Required',
        non_plan: 'Non Plan',
        failed: 'Failed',
        department_approval: 'Needs Approval'
    };

    return labels[status] || formatExportValue(status, 'Regular');
}

function getStudentInfoRows(studentData) {
    return [
        ['Student ID', formatExportValue(studentData.studentId)],
        ['Name', formatExportValue(studentData.studentName)],
        ['Nationality', formatExportValue(studentData.nationality)],
        ['Gender', formatExportValue(studentData.gender)],
        ['Department', formatExportValue(studentData.department)],
        ['Degree', formatExportValue(studentData.degree)],
        ['Plan Number', formatExportValue(studentData.planNo)],
        ['Plan Year', formatExportValue(studentData.planYear)],
        ['Status', formatExportValue(studentData.studentStatus)],
        ['GPA', formatExportValue(studentData.gpa)],
        ['Points', formatExportValue(studentData.points)],
        ['Completed Hours', formatExportValue(studentData.completedHours)],
        ['Passed Hours', formatExportValue(studentData.passedHours)],
        ['Plan Hours', formatExportValue(studentData.planHours)],
        ['Last Fetched', formatFetchedAt(studentData.fetchedAt)]
    ];
}

function getCourseExportRows(studentData) {
    if (!studentData || !Array.isArray(studentData.courses)) {
        return [];
    }

    return studentData.courses.map((course, index) => ([
        index + 1,
        formatExportValue(course.code, '-'),
        formatExportValue(course.name, '-'),
        formatExportValue(course.completedCourse, '-'),
        formatExportValue(course.planCourse, '-'),
        formatExportValue(course.grade, '-'),
        formatExportValue(course.points, '-'),
        getCourseStatusLabel(course.status),
        formatExportValue(course.planType, '-')
    ]));
}

async function htmlToPDF(htmlContent, filename) {
    const container = document.createElement('div');
    container.style.cssText = [
        'position:fixed', 'left:-9999px', 'top:0',
        'width:794px', 'padding:96px 112px',
        'background:#ffffff', 'color:#1a1a1a',
        "font-family:'Droid Arabic Kufi','Segoe UI',Tahoma,sans-serif",
        'font-size:14px', 'line-height:1.7', 'box-sizing:border-box'
    ].join(';');
    container.innerHTML = htmlContent;
    document.body.appendChild(container);

    try {
        container.querySelectorAll('*').forEach(el => {
            if (!el.style.color) el.style.color = '#1a1a1a';
        });

        if (document.fonts && document.fonts.ready) {
            await document.fonts.ready;
        }
        await new Promise(r => requestAnimationFrame(r));

        const canvas = await html2canvas(container, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();
        const pageMargin = 32;
        const imgW = pageW - (pageMargin * 2);
        const imgH = (canvas.height * imgW) / canvas.width;
        const usablePageH = pageH - (pageMargin * 2);
        const imgData = canvas.toDataURL('image/png');

        let yOffset = 0;
        while (yOffset < imgH) {
            if (yOffset > 0) doc.addPage();
            doc.addImage(imgData, 'PNG', pageMargin, pageMargin - yOffset, imgW, imgH);
            yOffset += usablePageH;
        }

        doc.save(filename);
    } finally {
        if (container.parentNode) {
            container.parentNode.removeChild(container);
        }
    }
}

function buildStudentHTML(studentData) {
    const date = new Date().toLocaleDateString('en-GB');
    const studentRows = [
        ...getStudentInfoRows(studentData),
        ['Saved Courses', getCourseExportRows(studentData).length]
    ];
    const courseRows = getCourseExportRows(studentData);

    return `
        <div style="text-align:center;margin-bottom:28px">
            <h1 style="color:#1857a4;font-size:22px;margin:0">JUST Student Academic Report</h1>
            <p style="color:#888;font-size:12px;margin:4px 0 0">Generated by Just Extension &mdash; ${date}</p>
        </div>
        <h2 style="color:#1857a4;border-bottom:2px solid #e0e0e0;padding-bottom:6px">Student Information</h2>
        <table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:10px">
            ${studentRows.map(([label, val], i) => `
                <tr style="background:${i % 2 === 0 ? '#f9f9f9' : 'white'}">
                    <td style="padding:7px 12px;font-weight:bold;width:40%;color:#1a1a1a">${escapeHtml(label)}</td>
                    <td style="padding:7px 12px;direction:auto;color:#1a1a1a">${escapeHtml(val)}</td>
                </tr>`).join('')}
        </table>
        <h2 style="color:#1857a4;border-bottom:2px solid #e0e0e0;padding-bottom:6px;margin-top:28px">Academic Courses</h2>
        ${courseRows.length > 0 ? `
            <table style="width:100%;border-collapse:collapse;font-size:11px;margin-top:10px">
                <thead>
                    <tr style="background:#1857a4;color:white">
                        <th style="padding:7px 6px;text-align:center;color:white">#</th>
                        <th style="padding:7px 6px;text-align:left;color:white">Code</th>
                        <th style="padding:7px 6px;text-align:left;color:white">Course</th>
                        <th style="padding:7px 6px;text-align:center;color:white">Grade</th>
                        <th style="padding:7px 6px;text-align:center;color:white">Points</th>
                        <th style="padding:7px 6px;text-align:left;color:white">Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${courseRows.map((row, i) => `
                        <tr style="background:${i % 2 === 0 ? '#f9f9f9' : 'white'}">
                            <td style="padding:6px;text-align:center">${escapeHtml(row[0])}</td>
                            <td style="padding:6px">${escapeHtml(row[1])}</td>
                            <td style="padding:6px;direction:auto">${escapeHtml(row[2])}</td>
                            <td style="padding:6px;text-align:center">${escapeHtml(row[5])}</td>
                            <td style="padding:6px;text-align:center">${escapeHtml(row[6])}</td>
                            <td style="padding:6px">${escapeHtml(row[7])}</td>
                        </tr>`).join('')}
                </tbody>
            </table>
        ` : `
            <p style="margin-top:10px;color:#666">No saved course data was found in the current student profile.</p>
        `}`;
}

document.getElementById('exportPdfBtn').addEventListener('click', async function () {
    const btn = this;
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '⏳ Exporting...';

    try {
        const studentData = await getStoredStudentData();

        if (!studentData || !studentData.studentName) {
            showExportStatus('No student data found. Visit the Student Card page first.', 'error');
            return;
        }

        await htmlToPDF(
            buildStudentHTML(studentData),
            `JUST_Student_Report_${new Date().toISOString().split('T')[0]}.pdf`
        );
        showExportStatus('PDF exported successfully!', 'success');
    } catch (err) {
        console.error(err);
        showExportStatus('Export failed: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = original;
    }
});

