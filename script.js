const API_BASE_URL =
    window.APP_CONFIG?.API_BASE_URL || "";

const TASKS_ENDPOINT =
    `${API_BASE_URL}/tasks`;


let tasks = [];

let deleteTaskId = null;

let toastTimer = null;


/* ================= DOM ================= */

const taskList =
    document.getElementById("taskList");

const emptyState =
    document.getElementById("emptyState");

const searchInput =
    document.getElementById("searchInput");

const statusFilter =
    document.getElementById("statusFilter");

const priorityFilter =
    document.getElementById("priorityFilter");

const resultCount =
    document.getElementById("resultCount");

const taskModal =
    document.getElementById("taskModal");

const viewModal =
    document.getElementById("viewModal");

const deleteModal =
    document.getElementById("deleteModal");

const taskForm =
    document.getElementById("taskForm");

const taskIdInput =
    document.getElementById("taskId");

const titleInput =
    document.getElementById("title");

const descriptionInput =
    document.getElementById("description");

const statusInput =
    document.getElementById("status");

const priorityInput =
    document.getElementById("priority");

const dueDateInput =
    document.getElementById("dueDate");

const modalTitle =
    document.getElementById("modalTitle");

const toast =
    document.getElementById("toast");

const toastMessage =
    document.getElementById("toastMessage");


/* ================= INIT ================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupEvents();

        loadTasks();

    }
);


/* ================= EVENTS ================= */

function setupEvents() {

    document
        .getElementById("newTaskBtn")
        .addEventListener(
            "click",
            () => openCreateModal()
        );


    document
        .getElementById("emptyCreateBtn")
        .addEventListener(
            "click",
            () => openCreateModal()
        );


    document
        .getElementById("refreshBtn")
        .addEventListener(
            "click",
            loadTasks
        );


    document
        .getElementById("closeModalBtn")
        .addEventListener(
            "click",
            closeTaskModal
        );


    document
        .getElementById("cancelModalBtn")
        .addEventListener(
            "click",
            closeTaskModal
        );


    document
        .getElementById("closeViewBtn")
        .addEventListener(
            "click",
            closeViewModal
        );


    document
        .getElementById("closeDeleteBtn")
        .addEventListener(
            "click",
            closeDeleteModal
        );


    document
        .getElementById("cancelDeleteBtn")
        .addEventListener(
            "click",
            closeDeleteModal
        );


    document
        .getElementById("confirmDeleteBtn")
        .addEventListener(
            "click",
            deleteTask
        );


    taskForm.addEventListener(
        "submit",
        handleFormSubmit
    );


    searchInput.addEventListener(
        "input",
        renderTasks
    );


    statusFilter.addEventListener(
        "change",
        renderTasks
    );


    priorityFilter.addEventListener(
        "change",
        renderTasks
    );


    document.addEventListener(
        "keydown",
        handleKeyboard
    );


    window.addEventListener(
        "click",
        handleOutsideClick
    );
}


/* ================= LOAD ================= */

async function loadTasks() {

    setApiStatus("loading");

    try {

        const response =
            await fetch(TASKS_ENDPOINT);

        if (!response.ok) {

            throw new Error(
                `API returned ${response.status}`
            );

        }

        const data =
            await response.json();

        tasks =
            Array.isArray(data)
                ? data
                : [];

        setApiStatus("online");

        renderTasks();

    } catch (error) {

        console.error(error);

        tasks = [];

        setApiStatus("offline");

        renderTasks();

        showToast(
            "Backend API could not be reached."
        );
    }
}


/* ================= RENDER ================= */

function renderTasks() {

    const filtered =
        getFilteredTasks();

    taskList.innerHTML = "";

    resultCount.textContent =
        `${filtered.length} ${
            filtered.length === 1
                ? "result"
                : "results"
        }`;


    updateStats();


    if (filtered.length === 0) {

        emptyState.classList.remove(
            "hidden"
        );

        return;
    }


    emptyState.classList.add(
        "hidden"
    );


    filtered.forEach(
        task => {

            taskList.appendChild(
                createTaskCard(task)
            );

        }
    );
}


/* ================= FILTER ================= */

function getFilteredTasks() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    const status =
        statusFilter.value;


    const priority =
        priorityFilter.value;


    return tasks.filter(
        task => {

            const title =
                String(
                    task.title || ""
                ).toLowerCase();


            const description =
                String(
                    task.description || ""
                ).toLowerCase();


            const matchesSearch =
                !search ||
                title.includes(search) ||
                description.includes(search);


            const matchesStatus =
                status === "all" ||
                normalizeStatus(task.status)
                    === status;


            const matchesPriority =
                priority === "all" ||
                normalizePriority(task.priority)
                    === priority;


            return (
                matchesSearch &&
                matchesStatus &&
                matchesPriority
            );
        }
    );
}


/* ================= CARD ================= */

function createTaskCard(task) {

    const card =
        document.createElement("article");

    card.className =
        "task-card";


    const status =
        normalizeStatus(task.status);

    const priority =
        normalizePriority(task.priority);


    const statusText =
        statusLabel(status);

    const priorityText =
        capitalize(priority);


    card.innerHTML = `

        <div class="task-main">

            <div class="task-title">
                ${escapeHTML(task.title)}
            </div>

            <div class="task-description">
                ${
                    escapeHTML(
                        task.description ||
                        "No description provided."
                    )
                }
            </div>

            <div class="task-meta">

                <span
                    class="badge ${badgeClass(status)}"
                >
                    ${statusText}
                </span>

                <span
                    class="badge ${priority}"
                >
                    ${priorityText}
                </span>

                <span class="task-date">
                    Due:
                    ${formatDate(task.due_date)}
                </span>

            </div>

        </div>


        <div class="task-actions">

            <button
                class="action-btn"
                data-action="view"
                data-id="${task.id}"
            >
                View
            </button>

            <button
                class="action-btn"
                data-action="edit"
                data-id="${task.id}"
            >
                Edit
            </button>

            <button
                class="action-btn delete"
                data-action="delete"
                data-id="${task.id}"
            >
                Delete
            </button>

        </div>

    `;


    card
        .querySelectorAll("[data-action]")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const action =
                            button.dataset.action;

                        const id =
                            Number(
                                button.dataset.id
                            );


                        if (action === "view") {

                            openViewModal(id);

                        }


                        if (action === "edit") {

                            openEditModal(id);

                        }


                        if (action === "delete") {

                            openDeleteModal(id);

                        }

                    }
                );

            }
        );


    return card;
}


/* ================= CREATE ================= */

function openCreateModal() {

    taskForm.reset();

    taskIdInput.value = "";

    statusInput.value = "todo";

    priorityInput.value = "medium";

    modalTitle.textContent =
        "Create Task";

    taskModal.classList.remove(
        "hidden"
    );

    setTimeout(
        () => titleInput.focus(),
        50
    );
}


/* ================= EDIT ================= */

function openEditModal(id) {

    const task =
        tasks.find(
            item => Number(item.id) === Number(id)
        );


    if (!task) {

        showToast(
            "Task not found."
        );

        return;
    }


    taskIdInput.value =
        task.id;

    titleInput.value =
        task.title || "";

    descriptionInput.value =
        task.description || "";

    statusInput.value =
        normalizeStatus(task.status);

    priorityInput.value =
        normalizePriority(task.priority);

    dueDateInput.value =
        task.due_date || "";


    modalTitle.textContent =
        "Edit Task";


    taskModal.classList.remove(
        "hidden"
    );


    setTimeout(
        () => titleInput.focus(),
        50
    );
}


/* ================= SAVE ================= */

async function handleFormSubmit(event) {

    event.preventDefault();


    const title =
        titleInput.value.trim();


    if (!title) {

        showToast(
            "Task title is required."
        );

        titleInput.focus();

        return;
    }


    const payload = {

        title,

        description:
            descriptionInput.value.trim(),

        status:
            statusInput.value,

        priority:
            priorityInput.value,

        due_date:
            dueDateInput.value || null

    };


    const id =
        taskIdInput.value;


    try {

        let response;


        if (id) {

            response =
                await fetch(
                    `${TASKS_ENDPOINT}/${id}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(payload)
                    }
                );

        } else {

            response =
                await fetch(
                    TASKS_ENDPOINT,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(payload)
                    }
                );

        }


        if (!response.ok) {

            throw new Error(
                await getApiError(response)
            );

        }


        closeTaskModal();


        showToast(
            id
                ? "Task updated successfully."
                : "Task created successfully."
        );


        await loadTasks();

    } catch (error) {

        console.error(error);

        showToast(
            error.message ||
            "Unable to save task."
        );
    }
}


/* ================= VIEW ================= */

function openViewModal(id) {

    const task =
        tasks.find(
            item => Number(item.id) === Number(id)
        );


    if (!task) return;


    document.getElementById(
        "viewTitle"
    ).textContent =
        task.title || "Untitled";


    document.getElementById(
        "viewDescription"
    ).textContent =
        task.description ||
        "No description provided.";


    document.getElementById(
        "viewDueDate"
    ).textContent =
        formatDate(task.due_date);


    document.getElementById(
        "viewCreated"
    ).textContent =
        formatDateTime(task.created_at);


    document.getElementById(
        "viewBadges"
    ).innerHTML = `

        <span
            class="badge ${badgeClass(
                normalizeStatus(task.status)
            )}"
        >
            ${statusLabel(
                normalizeStatus(task.status)
            )}
        </span>

        <span
            class="badge ${normalizePriority(
                task.priority
            )}"
        >
            ${capitalize(
                normalizePriority(task.priority)
            )}
        </span>

    `;


    viewModal.classList.remove(
        "hidden"
    );
}


/* ================= DELETE ================= */

function openDeleteModal(id) {

    deleteTaskId = id;

    deleteModal.classList.remove(
        "hidden"
    );
}


function closeDeleteModal() {

    deleteTaskId = null;

    deleteModal.classList.add(
        "hidden"
    );
}


async function deleteTask() {

    if (!deleteTaskId) return;


    try {

        const response =
            await fetch(
                `${TASKS_ENDPOINT}/${deleteTaskId}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            throw new Error(
                await getApiError(response)
            );

        }


        closeDeleteModal();


        showToast(
            "Task deleted successfully."
        );


        await loadTasks();

    } catch (error) {

        console.error(error);

        showToast(
            error.message ||
            "Unable to delete task."
        );
    }
}


/* ================= MODAL HELPERS ================= */

function closeTaskModal() {

    taskModal.classList.add(
        "hidden"
    );

    taskForm.reset();

    taskIdInput.value = "";
}


function closeViewModal() {

    viewModal.classList.add(
        "hidden"
    );
}


/* ================= API STATUS ================= */

function setApiStatus(status) {

    const indicator =
        document.getElementById(
            "apiIndicator"
        );

    const label =
        document.getElementById(
            "apiStatus"
        );


    indicator.className =
        "status-dot";


    if (status === "online") {

        indicator.classList.add(
            "online"
        );

        label.textContent =
            "API Connected";

        return;
    }


    if (status === "loading") {

        label.textContent =
            "Connecting...";

        return;
    }


    indicator.classList.add(
        "offline"
    );

    label.textContent =
        "API Offline";
}


/* ================= STATS ================= */

function updateStats() {

    const total =
        tasks.length;


    const todo =
        tasks.filter(
            task =>
                normalizeStatus(task.status)
                === "todo"
        ).length;


    const progress =
        tasks.filter(
            task =>
                normalizeStatus(task.status)
                === "in_progress"
        ).length;


    const completed =
        tasks.filter(
            task =>
                normalizeStatus(task.status)
                === "completed"
        ).length;


    document.getElementById(
        "totalCount"
    ).textContent = total;


    document.getElementById(
        "todoCount"
    ).textContent = todo;


    document.getElementById(
        "progressCount"
    ).textContent = progress;


    document.getElementById(
        "completedCount"
    ).textContent = completed;
}


/* ================= NORMALIZATION ================= */

function normalizeStatus(status) {

    if (!status) return "todo";

    const value =
        String(status)
            .trim()
            .toLowerCase()
            .replaceAll("-", "_")
            .replaceAll(" ", "_");


    if (
        value === "inprogress" ||
        value === "in_progress"
    ) {
        return "in_progress";
    }


    if (
        value === "completed" ||
        value === "complete" ||
        value === "done"
    ) {
        return "completed";
    }


    return "todo";
}


function normalizePriority(priority) {

    const value =
        String(
            priority || "medium"
        )
            .trim()
            .toLowerCase();


    if (
        ["low", "medium", "high"]
        .includes(value)
    ) {
        return value;
    }


    return "medium";
}


function statusLabel(status) {

    if (status === "in_progress") {
        return "In Progress";
    }


    if (status === "completed") {
        return "Completed";
    }


    return "To Do";
}


function badgeClass(status) {

    if (status === "in_progress") {
        return "in-progress";
    }


    return status;
}


/* ================= DATE ================= */

function formatDate(value) {

    if (!value) return "—";


    const date =
        new Date(value);


    if (Number.isNaN(date.getTime())) {
        return value;
    }


    return date.toLocaleDateString(
        undefined,
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );
}


function formatDateTime(value) {

    if (!value) return "—";


    const date =
        new Date(value);


    if (Number.isNaN(date.getTime())) {
        return value;
    }


    return date.toLocaleString(
        undefined,
        {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


/* ================= UTILITIES ================= */

function capitalize(value) {

    if (!value) return "";

    return value.charAt(0).toUpperCase()
        + value.slice(1);
}


function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


async function getApiError(response) {

    try {

        const data =
            await response.json();

        return (
            data.detail ||
            data.message ||
            `Request failed (${response.status})`
        );

    } catch {

        return `Request failed (${response.status})`;
    }
}


/* ================= TOAST ================= */

function showToast(message) {

    clearTimeout(toastTimer);


    toastMessage.textContent =
        message;


    toast.classList.add(
        "show"
    );


    toastTimer =
        setTimeout(
            () => {
                toast.classList.remove(
                    "show"
                );
            },
            3000
        );
}


/* ================= KEYBOARD ================= */

function handleKeyboard(event) {

    if (event.key !== "Escape") {
        return;
    }


    closeTaskModal();

    closeViewModal();

    closeDeleteModal();
}


/* ================= OUTSIDE CLICK ================= */

function handleOutsideClick(event) {

    if (event.target === taskModal) {
        closeTaskModal();
    }


    if (event.target === viewModal) {
        closeViewModal();
    }


    if (event.target === deleteMod
