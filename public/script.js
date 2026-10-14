
const form = document.querySelector('#project-form');
const nameInput = document.querySelector('#name');
const statusInput = document.querySelector('#status');
const projectList = document.querySelector('#project-list');
const emptyState = document.querySelector('#empty-state');
const saveButton = document.querySelector('#save-button');
const cancelButton = document.querySelector('#cancel-button');
const message = document.querySelector('#message');

const validStatuses = ['Planned', 'In Progress', 'Completed'];

let projects = [];
let editingId = null;
let isBusy = false;
let hasLoaded = false;

function showMessage(text) {
    message.textContent = text;
}

function setBusy(value) {
    isBusy = value;
    saveButton.disabled = value;
    cancelButton.disabled = value;

    projectList.querySelectorAll('button').forEach(button => {
        button.disabled = value;
    });
}

async function getErrorMessage(response) {
    try {
        const data = await response.json();

        if (typeof data.error === 'string' && data.error.trim() !== '') {
            return data.error;
        }
    } catch (error) {
        // The server did not return a readable JSON error.
    }

    return `Request failed with HTTP status ${response.status}.`;
}

async function requestApi(url, options = {}) {
    let response;

    try {
        response = await fetch(url, options);
    } catch (error) {
        throw new Error(
            'Cannot connect to the server. Check that it is running and try again.'
        );
    }

    if (!response.ok) {
        throw new Error(await getErrorMessage(response));
    }

    return response.json();
}

function renderProjects() {
    projectList.replaceChildren();

    projects.forEach(project => {
        const listItem = document.createElement('li');
        const projectName = document.createElement('span');
        const projectStatus = document.createElement('span');
        const editButton = document.createElement('button');
        const deleteButton = document.createElement('button');

        // Display names safely as text, not HTML.
        projectName.textContent = project.name;
        projectStatus.textContent = ` — Status: ${project.status}`;

        editButton.textContent = 'Edit';
        editButton.type = 'button';
        editButton.disabled = isBusy;

        editButton.addEventListener('click', () => {
            startEditing(project.id);
        });

        deleteButton.textContent = 'Delete';
        deleteButton.type = 'button';
        deleteButton.disabled = isBusy;

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

    emptyState.hidden = projects.length > 0;

    if (projects.length === 0) {
        emptyState.textContent = 'No projects yet. Add your first project above.';
    }
}

async function loadProjects(successMessage = '') {
    if (!hasLoaded) {
        emptyState.hidden = true;
        showMessage('Loading projects...');
    }

    try {
        const data = await requestApi('/api/projects');

        if (!Array.isArray(data)) {
            throw new Error('The server returned an invalid project list.');
        }

        projects = data;
        hasLoaded = true;

        // If the deleted project was being edited, leave Edit mode.
        if (
            editingId !== null &&
            !projects.some(project => project.id === editingId)
        ) {
            resetFormToAddMode();
        }

        renderProjects();

        if (successMessage) {
            showMessage(successMessage);
        } else {
            showMessage('');
        }

        return true;
    } catch (error) {
        showMessage(`Could not load projects: ${error.message}`);

        // A failed initial load must not look like an empty list.
        if (!hasLoaded) {
            emptyState.hidden = true;
        }

        return false;
    }
}

function startEditing(id) {
    if (isBusy) return;

    const project = projects.find(item => item.id === id);

    if (!project) {
        showMessage('This project is no longer available. Reloading projects...');
        loadProjects();
        return;
    }

    editingId = project.id;
    nameInput.value = project.name;
    statusInput.value = project.status;

    saveButton.textContent = 'Save changes';
    cancelButton.hidden = false;

    showMessage(`Editing "${project.name}".`);
    nameInput.focus();
}

function resetFormToAddMode() {
    editingId = null;
    form.reset();

    saveButton.textContent = 'Save Project';
    cancelButton.hidden = true;
}

async function deleteProject(id) {
    if (isBusy) return;

    const project = projects.find(item => item.id === id);

    if (!project) return;

    const confirmed = window.confirm(
        `Are you sure you want to delete "${project.name}" ` +
        `(Status: ${project.status})?`
    );

    // Cancel means no API request is sent.
    if (!confirmed) return;

    setBusy(true);
    showMessage('Deleting project...');

    try {
        await requestApi(`/api/projects/${encodeURIComponent(id)}`, {
            method: 'DELETE'
        });

        if (editingId === id) {
            resetFormToAddMode();
        }

        await loadProjects('Project deleted successfully.');
    } catch (error) {
        showMessage(`Could not delete project: ${error.message}`);
    } finally {
        setBusy(false);
        renderProjects();
    }
}

form.addEventListener('submit', async event => {
    event.preventDefault();

    if (isBusy) return;

    const name = nameInput.value.trim();
    const status = statusInput.value;

    if (name === '') {
        showMessage('Please enter a project name.');
        nameInput.focus();
        return;
    }

    if (name.length > 80) {
        showMessage('Project name must be 80 characters or fewer.');
        nameInput.focus();
        return;
    }

    if (!validStatuses.includes(status)) {
        showMessage('Please select a valid project status.');
        return;
    }

    const wasEditing = editingId !== null;
    const targetId = editingId;

    // Use the server's existing ID when updating a project.
    if (wasEditing && !projects.some(project => project.id === targetId)) {
        showMessage('This project could not be found. Reloading projects...');
        await loadProjects();
        return;
    }

    const projectData = { name, status };

    setBusy(true);
    saveButton.textContent = wasEditing ? 'Saving...' : 'Saving project...';
    showMessage(wasEditing ? 'Saving changes...' : 'Saving new project...');

    try {
        const url = wasEditing
            ? `/api/projects/${encodeURIComponent(targetId)}`
            : '/api/projects';

        await requestApi(url, {
            method: wasEditing ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(projectData)
        });

        // Reset only after the server confirms the mutation succeeded.
        resetFormToAddMode();

        await loadProjects(
            wasEditing
                ? 'Project updated successfully.'
                : 'Project added successfully.'
        );
    } catch (error) {
        // Keep the user's input and Edit mode when the mutation fails.
        showMessage(
            `Could not ${wasEditing ? 'update' : 'add'} project: ${error.message}`
        );
    } finally {
        setBusy(false);
        saveButton.textContent =
            editingId !== null ? 'Save changes' : 'Save Project';
        renderProjects();
    }
});

cancelButton.addEventListener('click', () => {
    if (isBusy) return;

    resetFormToAddMode();
    showMessage('Edit cancelled. No changes were saved.');
    nameInput.focus();
});

// Start by loading records from SQLite through the API.
loadProjects();
