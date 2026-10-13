const form = document.querySelector('#project-form');
const nameInput = document.querySelector('#name');
const statusInput = document.querySelector('#status');
const projectList = document.querySelector('#project-list');
const emptyState = document.querySelector('#empty-state');
const saveButton = document.querySelector('#save-button');
const cancelButton = document.querySelector('#cancel-button');
const message = document.querySelector('#message');

const STORAGE_KEY = 'workshop-projects-v1';
const validStatuses = ['Planned', 'In Progress', 'Completed'];

const projects = [];

let editingId = null;
let storageBlocked = false;
let storageProblem = '';

function loadProjects() {
    try {
        const storedData = localStorage.getItem(STORAGE_KEY);

        if (storedData === null) {
            return;
        }

        const savedProjects = JSON.parse(storedData);

        if (!Array.isArray(savedProjects)) {
            throw new Error('Stored data is not an array.');
        }

        const ids = new Set();

        const validData = savedProjects.every(project => {
            if (
                project === null ||
                typeof project !== 'object' ||
                typeof project.id !== 'string' ||
                project.id.trim() === '' ||
                typeof project.name !== 'string' ||
                project.name.trim() === '' ||
                !validStatuses.includes(project.status) ||
                ids.has(project.id)
            ) {
                return false;
            }

            ids.add(project.id);
            return true;
        });

        if (!validData) {
            throw new Error('Stored project records are invalid.');
        }

        projects.push(...savedProjects);
    } catch (error) {
        storageBlocked = true;
        storageProblem =
            'Saved project data is invalid or cannot be read. ' +
            'It has not been overwritten. Check or clear the localStorage ' +
            'key "workshop-projects-v1" to continue saving.';

        if (message) {
            message.textContent = storageProblem;
        }
    }
}

function saveProjects() {
    if (storageBlocked) {
        if (message) {
            message.textContent =
                storageProblem ||
                'Changes could not be saved because stored data is invalid.';
        }

        return false;
    }

    try {
        const storedData = JSON.stringify(projects);
        localStorage.setItem(STORAGE_KEY, storedData);
        return true;
    } catch (error) {
        if (message) {
            message.textContent =
                'Changes could not be saved. Browser storage may be unavailable or full.';
        }

        return false;
    }
}

function renderProjects() {
    projectList.replaceChildren();

    if (emptyState) {
        if (projects.length > 0) {
            emptyState.hidden = true;
        } else {
            emptyState.textContent = storageProblem
                ? 'Projects could not be loaded from saved browser data.'
                : 'No projects yet. Add your first project above.';

            emptyState.hidden = false;
        }
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
        message.textContent = storageProblem;
    }

    nameInput.focus();
}

function resetFormToAddMode() {
    editingId = null;
    form.reset();

    saveButton.textContent = 'Save Project';
    cancelButton.hidden = true;

    if (message) {
        message.textContent = storageProblem;
    }
}

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

    if (!saveProjects()) {
        projects.splice(index, 0, project);
        renderProjects();
        return;
    }

    if (editingId === id) {
        resetFormToAddMode();
    }

    storageProblem = '';
    renderProjects();

    if (message) {
        message.textContent = '';
    }
}

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

    if (!validStatuses.includes(status)) {
        if (message) {
            message.textContent = 'Please select a valid project status.';
        }

        return;
    }

    if (editingId !== null) {
        const project = projects.find(item => item.id === editingId);

        if (!project) {
            resetFormToAddMode();
            renderProjects();
            return;
        }

        const oldName = project.name;
        const oldStatus = project.status;

        project.name = name;
        project.status = status;

        if (!saveProjects()) {
            project.name = oldName;
            project.status = oldStatus;
            renderProjects();
            return;
        }
    } else {
        const newProject = {
            id: crypto.randomUUID(),
            name: name,
            status: status
        };

        projects.push(newProject);

        if (!saveProjects()) {
            projects.pop();
            renderProjects();
            return;
        }
    }

    storageProblem = '';
    renderProjects();
    resetFormToAddMode();
    nameInput.focus();
});

cancelButton.addEventListener('click', () => {
    resetFormToAddMode();
    nameInput.focus();
});

resetFormToAddMode();
loadProjects();
renderProjects();