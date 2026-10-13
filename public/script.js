
const form = document.querySelector('#project-form');
const nameInput = document.querySelector('#name');
const statusInput = document.querySelector('#status');
const projectList = document.querySelector('#project-list');
const emptyState = document.querySelector('#empty-state');

// Starts empty whenever the page loads.
const projects = [];

// Display all projects in the array.
function renderProjects() {
    // Clear the existing list to prevent duplicates.
    projectList.replaceChildren();

    // Show or hide the empty-state message.
    if (emptyState) {
        emptyState.hidden = projects.length > 0;
    }

    // Create a list item for every project.
    projects.forEach(project => {
        const listItem = document.createElement('li');
        const projectName = document.createElement('span');
        const projectStatus = document.createElement('span');

        // Display user-provided text safely.
        projectName.textContent = project.name;
        projectStatus.textContent = ` — Status: ${project.status}`;

        listItem.appendChild(projectName);
        listItem.appendChild(projectStatus);

        projectList.appendChild(listItem);
    });
}

// Handle form submission.
form.addEventListener('submit', event => {
    event.preventDefault();

    // Read the current form values.
    const name = nameInput.value.trim();
    const status = statusInput.value;

    // Reject an empty project name.
    if (name === '') {
        nameInput.focus();
        return;
    }

    // Create and add the new project.
    const newProject = {
        id: crypto.randomUUID(),
        name: name,
        status: status
    };

    projects.push(newProject);

    // Refresh the displayed list.
    renderProjects();

    // Clear the name field for the next project.
    form.reset();
    nameInput.focus();
});

// Display the initial empty state.
renderProjects();
