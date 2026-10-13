const form = document.querySelector('#project-form');
const nameInput = document.querySelector('#name');
const statusInput = document.querySelector('#status');
const projectList = document.querySelector('#project-list');
const emptyState = document.querySelector('#empty-state');
const saveButton = document.querySelector('#save-button');
const cancelButton = document.querySelector('#cancel-button');
const message = document.querySelector('#message');

// Store projects in browser memory.
const projects = [];

let editingId = null;

// Display all projects.
function renderProjects() {
    projectList.replaceChildren();

    if (emptyState) {
        emptyState.textContent =
            'No projects yet. Add your first project above.';
        emptyState.hidden = projects.length > 0;
    }

    projects.forEach(project => {
        const listItem = document.createElement('li');
        const projectName = document.createElement('span');
        const projectStatus = document.createElement('span');
        const editButton = document.createElement('button');
        const deleteButton = document.createElement('button');

        projectName.textContent = project.name;
        projectStatus.textContent = ` — Status: ${project.status}`;

        editButton.textContent = 'Edit';
        editButton.type = 'button';

        editButton.addEventListener('click', () => {
            startEditing(project.id);
        });

        deleteButton.textContent = 'Delete';
        deleteButton.type = 'button';

        deleteButton.addEventListener('click', () => {
            deleteProject(project.id);
        });

        listItem.appendChild(projectName);
        listItem.appendChild(projectStatus);
        listItem.appendChild(document.createTextNode(' '));
        listItem.appendChild(editButton);
        listItem.appendChild(document.createTextNode(' '));
        listItem.appendChild(deleteButton);

        projectList.appendChild(listItem);
    });
}

// Start editing a project.
function startEditing(id) {
    const project = projects.find(item => item.id === id);

    if (!project) {
        return;
    }

    editingId = project.id;
    nameInput.value = project.name;
    statusInput.value = project.status;

    saveButton.textContent = 'Save changes';
    cancelButton.hidden = false;

    if (message) {
        message.textContent = '';
    }

    nameInput.focus();
}

// Reset the form to Add mode.
function resetFormToAddMode() {
    editingId = null;
    form.reset();

    saveButton.textContent = 'Save Project';
    cancelButton.hidden = true;

    if (message) {
        message.textContent = '';
    }
}

// Delete a project after confirmation.
function deleteProject(id) {
    const index = projects.findIndex(item => item.id === id);

    if (index === -1) {
        return;
    }

    const project = projects[index];

    const confirmed = window.confirm(
        `Are you sure you want to delete "${project.name}" ` +
        `(Status: ${project.status})?`
    );

    if (!confirmed) {
        return;
    }

    projects.splice(index, 1);

    if (editingId === id) {
        resetFormToAddMode();
    }

    renderProjects();
}

// Add a new project or save changes.
form.addEventListener('submit', event => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const status = statusInput.value;

    if (name === '') {
        if (message) {
            message.textContent = 'Please enter a project name.';
        }

        nameInput.focus();
        return;
    }

    if (editingId !== null) {
        const project = projects.find(item => item.id === editingId);

        if (!project) {
            resetFormToAddMode();
            renderProjects();
            return;
        }

        project.name = name;
        project.status = status;
    } else {
        projects.push({
            id: crypto.randomUUID(),
            name: name,
            status: status
        });
    }

    renderProjects();
    resetFormToAddMode();
    nameInput.focus();
});

// Cancel editing.
cancelButton.addEventListener('click', () => {
    resetFormToAddMode();
    nameInput.focus();
});

// Initial setup.
resetFormToAddMode();
renderProjects();