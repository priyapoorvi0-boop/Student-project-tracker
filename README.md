# Student Project Tracker

A hands-on web app development workshop project. It adds, displays, edits and deletes engineering projects, with data stored in a local SQLite database.

## Run Locally

### Requirements
- Node.js 22.18 or later, but below version 23
- Git
- Visual Studio Code

### Start the application

Open a PowerShell terminal in the project folder and run:

```powershell
npm.cmd ci
npm.cmd start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To stop the server, press `Ctrl+C` in the terminal running it.

## How It Works

Browser HTML/CSS/JavaScript → HTTP requests → Express API → SQLite database → JSON response → updated webpage.

### File Structure
- `public/index.html` — webpage structure and form.
- `public/style.css` — appearance and layout.
- `public/script.js` — form handling, API requests, rendering and feedback.
- `server.js` — starts the local server.
- `app.js` — API routes, validation and responses.
- `database.js` — database operations and local SQLite setup.
- `data/projects.db` — local database file created when the application runs.

## API Endpoints

- `GET /api/health` — checks server health.
- `GET /api/projects` — retrieves projects.
- `POST /api/projects` — creates a project.
- `PUT /api/projects/:id` — updates a project.
- `DELETE /api/projects/:id` — deletes a project.

## Verification

Checks performed:
- [x] Add a project successfully.
- [x] Display projects after refreshing the page.
- [x] Handle a server-offline error with a clear message.
- [x] Preserve form data after a failed save.
- [x] Recover and save after restarting the server.
- [x] Cancel editing without saving changes.
- [x] Cancel deletion without removing the project.
- [x] Confirm rapid clicking creates only one project and sends only one POST request.
- [ ] Run automated tests, if `test/crud.test.js` is present.
- [ ] Test the webpage on a mobile-sized screen.

## Workshop Limitations

This is a local teaching application. It does not include sign-in or per-user permissions. Users accessing the same server share the same project collection.

The local SQLite database and `node_modules` folder are not uploaded to GitHub. Cloud hosting requires separate server and database configuration.