// EVENTS DATA
const events = {
  quran: {
    name: "Quran Class",
    max: 30,
    ageGroup: "Children",
    participants: []
  },
  tafsir: {
    name: "Tafsir Lesson",
    max: 15,
    ageGroup: "Youth",
    participants: []
  },
  lecture: {
    name: "Community Lecture",
    max: 20,
    ageGroup: "Adults",
    participants: []
  }
};

// GET HTML ELEMENTS
const registrationForm = document.getElementById("registrationForm");
const eventSelect = document.getElementById("event");


// LOAD DATA FROM LOCALSTORAGE
window.addEventListener("load", function () {

  const stored = localStorage.getItem("mosqueEvents");

  if (stored) {

    const savedEvents = JSON.parse(stored);

    for (let key in events) {

      if (savedEvents[key]) {
        events[key].participants = savedEvents[key].participants;
      } else {
        events[key].participants = [];
      }

      updateEventDisplay(key);
    }

    checkFullEvents();
  }
});


// HANDLE FORM SUBMIT
registrationForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const age = Number(document.getElementById("age").value);
  const phone = document.getElementById("phone").value.trim();
  const eventKey = eventSelect.value;

  if (eventKey === "") {
    alert("Please select an event");
    return;
  }

  const event = events[eventKey];

  // CHECK DUPLICATE
  if (isAlreadyRegistered(name, phone)) {
    alert("This person is already registered in another event!");
    return;
  }

  // CHECK CAPACITY
  if (event.participants.length >= event.max) {
    alert("This event is already full!");
    return;
  }

  // CHECK AGE
  if (!ageAllowed(age, event.ageGroup)) {
    alert("Age not allowed for this event!");
    return;
  }

  // ADD PARTICIPANT
  event.participants.push({
    name: name,
    age: age,
    phone: phone
  });

  updateEventDisplay(eventKey);
  saveToLocalStorage();
  registrationForm.reset();
  checkFullEvents();
});


// AGE VALIDATION
function ageAllowed(age, group) {

  if (group === "Children") {
    return age >= 5 && age <= 15;
  }

  if (group === "Youth") {
    return age >= 16 && age <= 25;
  }

  if (group === "Adults") {
    return age >= 26;
  }

  return false;
}


// DUPLICATE CHECK
function isAlreadyRegistered(name, phone) {

  for (let key in events) {

    const participants = events[key].participants;

    for (let i = 0; i < participants.length; i++) {

      if (
        participants[i].name.toLowerCase() === name.toLowerCase() &&
        participants[i].phone === phone
      ) {
        return true;
      }
    }
  }

  return false;
}


// UPDATE EVENT DISPLAY + REMOVE BUTTON
function updateEventDisplay(eventKey) {

  const ul = document.getElementById(eventKey + "-list");
  const count = document.getElementById(eventKey + "-count");

  ul.innerHTML = "";

  const participants = events[eventKey].participants;

  if (participants.length === 0) {
    ul.innerHTML = "<li>No participants yet</li>";
  } else {

    for (let i = 0; i < participants.length; i++) {

      const li = document.createElement("li");
      li.style.display = "flex";
      li.style.justifyContent = "space-between";
      li.style.alignItems = "center";

      const text = document.createElement("span");
      text.textContent =
        participants[i].name +
        " | Age: " + participants[i].age +
        " | Phone: " + participants[i].phone;

      const btn = document.createElement("button");
      btn.textContent = "Remove";

      btn.onclick = function () {
        removeParticipant(eventKey, i);
      };

      li.appendChild(text);
      li.appendChild(btn);
      ul.appendChild(li);
    }
  }

  count.textContent =
    participants.length + " / " + events[eventKey].max;
}


// REMOVE PARTICIPANT
function removeParticipant(eventKey, index) {

  events[eventKey].participants.splice(index, 1);

  updateEventDisplay(eventKey); 
  saveToLocalStorage();
  checkFullEvents();
}


// DISABLE FULL EVENTS
function checkFullEvents() {

  for (let key in events) {

    const option = document.querySelector(
      'option[value="' + key + '"]'
    );

    if (events[key].participants.length >= events[key].max) {
      option.disabled = true;
    } else {
      option.disabled = false;
    }
  }
}


// SAVE TO LOCALSTORAGE
function saveToLocalStorage() {
  localStorage.setItem("mosqueEvents", JSON.stringify(events));
}
