// EVENTS DATA
const events = {
  quran: { name: "Quran Class", max: 15, ageGroup: "Children", participants: [] },
  tafsir: { name: "Tafsir Lesson", max: 10, ageGroup: "Youth", participants: [] },
  lecture: { name: "Community Lecture", max: 10, ageGroup: "Adults", participants: [] }
};

let selectedEvent = "quran";

// ELEMENTS
const registrationForm = document.getElementById("registrationForm");
const eventCards = document.querySelectorAll(".event-select");
const registerBtn = document.getElementById("button");
const inputs = document.querySelectorAll("#name, #age, #phone");

// INITIAL BUTTON STATE
registerBtn.disabled = true;

// EVENT CARD SELECTION
eventCards.forEach(card => {
  card.addEventListener("click", () => {
    eventCards.forEach(c => c.classList.remove("active"));
    card.classList.add("active");
    selectedEvent = card.dataset.event;
  });
});

// ENABLE BUTTON ONLY WHEN FORM VALID
inputs.forEach(input => input.addEventListener("input", checkFormValidity));

function checkFormValidity() {
  const name = document.getElementById("name").value.trim();
  const age = document.getElementById("age").value;
  const phone = document.getElementById("phone").value.trim();

  registerBtn.disabled = !(name && age && /^\d{9}$/.test(phone));
}

// LOAD FROM LOCALSTORAGE
window.addEventListener("load", () => {
  const stored = localStorage.getItem("mosqueEvents");
  if (stored) {
    const saved = JSON.parse(stored);
    for (let key in events) {
      if (saved[key]) events[key].participants = saved[key].participants;
      updateEventDisplay(key);
    }
  }
});

// FORM SUBMIT
registrationForm.addEventListener("submit", e => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const age = Number(document.getElementById("age").value);
  const phone = document.getElementById("phone").value.trim();
  const event = events[selectedEvent];

  if (isAlreadyRegistered(name, phone)) {
    alert("This person is already registered!");
    return;
  }

  if (event.participants.length >= event.max) {
    alert("This event is full!");
    return;
  }

  if (!ageAllowed(age, event.ageGroup)) {
    alert("Age not allowed for this event!");
    return;
  }

  event.participants.push({ name, age, phone });
  updateEventDisplay(selectedEvent);
  saveToLocalStorage();
  registrationForm.reset();
  registerBtn.disabled = true;
});

// AGE VALIDATION
function ageAllowed(age, group) {
  if (group === "Children") return age >= 5 && age <= 15;
  if (group === "Youth") return age >= 16 && age <= 25;
  if (group === "Adults") return age >= 26;
  return false;
}

// DUPLICATE CHECK
function isAlreadyRegistered(name, phone) {
  for (let key in events) {
    for (let p of events[key].participants) {
      if (p.name.toLowerCase() === name.toLowerCase() && p.phone === phone) {
        return true;
      }
    }
  }
  return false;
}

// UPDATE UI
function updateEventDisplay(eventKey) {
  const participants = events[eventKey].participants;
  const max = events[eventKey].max;

  const list = document.getElementById(eventKey + "-list");
  const count = document.getElementById(eventKey + "-count");
  const card = document.querySelector(`.event-select[data-event="${eventKey}"]`);
  const statusCard = count.closest(".status-card");
  const badge = statusCard.querySelector(".badge");
  const progressBar = statusCard.querySelector(".progress-bar");

  // COUNT
  count.textContent = `${participants.length} / ${max}`;
  card.querySelector("span").textContent = `${participants.length} / ${max} registered`;

  // PROGRESS
  let percent = Math.round((participants.length / max) * 100);
  if (percent > 100) percent = 100;
  progressBar.style.width = percent + "%";

  // OPEN / CLOSED
  if (participants.length >= max) {
    badge.textContent = "CLOSED";
    badge.classList.remove("open");
    badge.classList.add("closed");
  } else {
    badge.textContent = "OPEN";
    badge.classList.remove("closed");
    badge.classList.add("open");
  }

  function capitalizeName(name) {
  return name
    .toLowerCase()
    .split(" ")
    .filter(word => word !== "")
    .map(word => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}


  // LIST
  list.innerHTML = "";
  if (participants.length === 0) {
    list.innerHTML = "<li>No participants yet</li>";
  } else {
    participants.forEach((p, i) => {
      const li = document.createElement("li");
      li.innerHTML = `
      <span>${capitalizeName(p.name)} (${p.age}) | ${p.phone}</span>
        <button onclick="removeParticipant('${eventKey}', ${i})">Remove</button>
      `;
      list.appendChild(li);
    });
  }
}

// REMOVE
function removeParticipant(eventKey, index) {
  events[eventKey].participants.splice(index, 1);
  updateEventDisplay(eventKey);
  saveToLocalStorage();
}

// SAVE
function saveToLocalStorage() {
  localStorage.setItem("mosqueEvents", JSON.stringify(events));
}
