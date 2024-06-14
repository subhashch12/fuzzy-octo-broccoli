document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const subjectForm = document.getElementById('subject-form');
    const tableBody = document.querySelector('#subjects-table tbody');
    const totalCreditsElement = document.getElementById('total-credits');
    const cgpaElement = document.getElementById('cgpa');
    const downloadBtn = document.getElementById('download-btn');
    const pagination = document.getElementById('pagination');
    const authDiv = document.getElementById('auth');
    const calculatorDiv = document.getElementById('calculator');

    const ITEMS_PER_PAGE = 10;
    let currentPage = 1;
    let currentUserId = null;
    let subjects = [];

    registerForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;

        fetch('register.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `username=${username}&password=${password}`
        })
        .then(response => response.text())
        .then(data => {
            alert(data);
        });
    });

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        fetch('login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `username=${username}&password=${password}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.user_id) {
                currentUserId = data.user_id;
                authDiv.style.display = 'none';
                calculatorDiv.style.display = 'block';
                loadSubjects();
            } else {
                alert(data);
            }
        });
    });

    subjectForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const courseCode = document.getElementById('course-code').value;
        const courseTitle = document.getElementById('course-title').value;
        const credits = parseInt(document.getElementById('credits').value);
        const grade = parseInt(document.getElementById('grade').value);

        const subject = { courseCode, courseTitle, credits, grade };

        fetch('add_subject.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `user_id=${currentUserId}&course_code=${courseCode}&course_title=${courseTitle}&credits=${credits}&grade=${grade}`
        })
        .then(response => response.text())
        .then(data => {
            alert(data);
            loadSubjects();
        });

        subjectForm.reset();
    });

    downloadBtn.addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(subjects));
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", "subjects.json");
        dlAnchorElem.click();
    });

    function addSubjectToTable(subject, index) {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${subject.course_code}</td>
            <td>${subject.course_title}</td>
            <td>${subject.credits}</td>
            <td>${getGradeLetter(subject.grade)}</td>
            <td><button class="delete-btn" data-id="${subject.id}">Delete</button></td>
        `;

        row.querySelector('.delete-btn').addEventListener('click', (event) => {
            const id = event.target.getAttribute('data-id');

            fetch('delete_subject.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `id=${id}`
            })
            .then(response => response.text())
            .then(data => {
                alert(data);
                loadSubjects();
            });
        });

        tableBody.appendChild(row);
    }

    function getGradeLetter(grade) {
        switch (grade) {
            case 10: return 'S';
            case 9: return 'A';
            case 8: return 'B';
            case 7: return 'C';
            case 6: return 'D';
            case 5: return 'E';
            default: return '';
        }
    }

    function updateResults() {
        const totalCredits = subjects.reduce((sum, subject) => sum + subject.credits, 0);
        const totalPoints = subjects.reduce((sum, subject) => sum + (subject.credits * subject.grade), 0);
        const cgpa = totalCredits ? (totalPoints / totalCredits).toFixed(2) : 0;

        totalCreditsElement.textContent = totalCredits;
        cgpaElement.textContent = cgpa;
    }

    function updateTable() {
        tableBody.innerHTML = '';
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        subjects.slice(start, end).forEach(addSubjectToTable);

        updatePagination();
    }

    function updatePagination() {
        pagination.innerHTML = '';
        const totalPages = Math.ceil(subjects.length / ITEMS_PER_PAGE);

        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            if (i === currentPage) {
                button.classList.add('disabled');
            }
            button.addEventListener('click', () => {
                currentPage = i;
                updateTable();
            });
            pagination.appendChild(button);
        }
    }

    function loadSubjects() {
        fetch(`get_subjects.php?user_id=${currentUserId}`)
            .then(response => response.json())
            .then(data => {
                subjects = data;
                updateTable();
                updateResults();
            });
    }
});
