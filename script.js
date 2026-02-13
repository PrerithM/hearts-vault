/* ==================================================
   Configuration (REQUIRED TO EDIT)
================================================== */

/*
  You MUST replace the following placeholders
  before deployment.
*/

const GITHUB_USERNAME = "YOUR_GITHUB_USERNAME";
const REPO_NAME = "YOUR_REPOSITORY_NAME";
const FILE_PATH = "names.txt";

/*
  Generate a GitHub Personal Access Token (PAT)
  with "repo" scope and paste here.

  ⚠️ For security: In real systems, this should
  never be exposed in frontend code.
*/

const GITHUB_TOKEN = "YOUR_PERSONAL_ACCESS_TOKEN";


/* ==================================================
   DOM Elements
================================================== */

const form = document.getElementById("nameForm");
const input = document.getElementById("nameInput");
const statusMessage = document.getElementById("statusMessage");


/* ==================================================
   Helpers
================================================== */

function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = type;
}


/* ==================================================
   GitHub API Logic
================================================== */

/*
  Step 1: Fetch existing file content
*/

async function getExistingFile() {

  const url = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json"
    }
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to fetch file.");
  }

  return response.json();
}


/*
  Step 2: Update / Create file
*/

async function updateFile(newName) {

  const existingFile = await getExistingFile();

  let content = "";
  let sha = null;

  if (existingFile) {

    const decoded = atob(existingFile.content);
    content = decoded;
    sha = existingFile.sha;
  }

  // Append name
  content += newName + "\n";

  const encodedContent = btoa(content);

  const url = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`;

  const body = {
    message: "Add new name entry",
    content: encodedContent
  };

  if (sha) {
    body.sha = sha;
  }

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error("Failed to write file.");
  }

  return response.json();
}


/* ==================================================
   Event Handling
================================================== */

form.addEventListener("submit", async (e) => {

  e.preventDefault();

  const name = input.value.trim();

  if (!name) {
    showStatus("Please enter a valid name.", "error");
    return;
  }

  showStatus("Saving...", "");

  try {

    await updateFile(name);

    showStatus("Name saved successfully ❤️", "success");

    input.value = "";

  } catch (error) {

    console.error(error);

    showStatus("Failed to save. Check configuration.", "error");
  }

});
