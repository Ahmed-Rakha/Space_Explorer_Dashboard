// WRITE YOUR JS CODE HERE

// Global API Config
var api_key = "dLgfXTiRD1KeGl7APpPOpyLkhdFhOacJXSuL9gFw";

// Data Sources
async function ds_get_apod(date = "") {
  try {
    var response = await fetch(
      !date
        ? `https://api.nasa.gov/planetary/apod?api_key=${api_key}`
        : `https://api.nasa.gov/planetary/apod?api_key=${api_key}&date=${date}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    var data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      console.error("Network error:", error.message);
    } else {
      // HTTP error or other errors
      console.error("Fetch error:", error.message);
    }
  }
}

// async function ds_get_apod_by_date(date) {
//   try {
//     var response = await fetch(
//       `https://api.nasa.gov/planetary/apod?api_key=${api_key}&date=${date}`
//     );
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
//     var data = await response.json();
//     return data;
//   } catch (error) {
//     if (error instanceof TypeError) {
//       console.error("Network error:", error.message);
//     } else {
//       // HTTP error or other errors
//       console.error("Fetch error:", error.message);
//     }
//   }
// }
// Today in Space API
var DataSources = {
  ds_get_apod,
};
var apodDatePicker = document.getElementById("apod-date-input");
var apodDateLabel = apodDatePicker.nextElementSibling;
var apodLoading = document.getElementById("apod-loading");
var apodDate = document.getElementById("apod-date");
var apodTitle = document.getElementById("apod-title");
var apodDateDetail = document.getElementById("apod-date-detail");
var apodExplanation = document.getElementById("apod-explanation");
var apodCopyright = document.getElementById("apod-copyright");
var apodMediaType = document.getElementById("apod-media-type");
var apodImage = document.getElementById("apod-image");
var apodDateInfo = document.getElementById("apod-date-info");
var loadDateBtn = document.getElementById("load-date-btn");
var todayApodBtn = document.getElementById("today-apod-btn");
var isDateSelected = false;
var isTodayClicked = false;

apodDatePicker.addEventListener("change", (e) => {
  setDateSelectionStatus(true);
  setTodayClickedStatus(false);
  var formattedDate = formatDate(e.currentTarget.value);
  displayFormattedDate(formattedDate);
});

function displayFormattedDate(date) {
  apodDateLabel.textContent = date;
}

function formatDate(
  date,
  local = "en-US",
  options = { day: "numeric", month: "short", year: "numeric" }
) {
  var formattedDate = new Date(date).toLocaleDateString(local, options);
  return formattedDate;
}

function getTodayDate() {
  var todayDate = new Date().toISOString().split("T")[0];
  return todayDate;
}

todayApodBtn.addEventListener("click", () => {
  if (isTodayClicked) {
    showErrorFetchingDate();
    return;
  }

  var todayDate = getTodayDate();
  var formattedDate = formatDate(todayDate);
  displayFormattedDate(formattedDate);
  displayLoadingIndicator();
  DataSources.ds_get_apod(todayDate).then((data) => displayApod(data));
  setTodayClickedStatus(true);
});

document.addEventListener("DOMContentLoaded", () => {
  var result = null;

  if (!result) {
    displayLoadingIndicator();
  }

  DataSources.ds_get_apod().then((data) => displayApod(data));
  loadDateBtn.addEventListener("click", function (e) {
    if (!isDateSelected) {
      showErrorFetchingDate();
      return;
    }

    var date = apodDatePicker.value;
    console.log(date);
    displayLoadingIndicator();
    DataSources.ds_get_apod(date).then((data) => displayApod(data));
    setDateSelectionStatus(false);
  });
});

function displayLoadingIndicator() {
  apodDateLabel.textContent = "";
  apodDate.textContent = "Astronomy Picture of the Day - Loading...";
  apodLoading.classList.remove("hidden");
  apodImage.classList.add("hidden");
  apodTitle.textContent = "Loading...";
  apodDateDetail.textContent = "Loading...";
  apodExplanation.textContent = "Loading Description...";
  apodDateInfo.textContent = "Loading...";
  apodMediaType.textContent = "Loading...";
}

function displayApod(apodData) {
  if (!apodData) {
    showErrorFetchingData();
  }
  var formattedDate = formatDate(apodData?.date || getTodayDate(), undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  apodDateLabel.textContent = formattedDate;
  apodDate.textContent = `Astronomy Picture of the Day - ${formattedDate}`;
  apodLoading.classList.add("hidden");
  apodImage.classList.remove("hidden");
  apodTitle.textContent = apodData?.title || "The Rosette Nebula";
  apodDateDetail.textContent = `${formattedDate}`;
  apodExplanation.textContent =
    apodData?.explanation ||
    `The Rosette Nebula is a large spherical H II region located
                  near one end of a giant molecular cloud in the Monoceros
                  region of the Milky Way Galaxy. The open cluster NGC 2244
                  (Caldwell 50) is closely associated with the nebulosity, the
                  stars of the cluster having been formed from the nebula's
                  matter.`;
  apodCopyright.innerHTML = apodData?.copyright
    ? `&copy; ${apodData.copyright}`
    : "";
  apodDateInfo.textContent = `${formattedDate}`;
  apodMediaType.textContent = apodData?.media_type || "image";
  apodImage.src = apodData?.url || "./assets/images/placeholder.webp";
}

function showErrorFetchingData() {
  Swal.fire({
    title: "Error!",
    text: "Failed to fetch Astronomy. Please try again later.",
    icon: "error",
    confirmButtonText: "OK",
  });
}

function showErrorFetchingDate() {
  Swal.fire({
    title: "Error!",
    text: "Please select a date.",
    icon: "error",
    confirmButtonText: "OK",
  });
}
function setDateSelectionStatus(status) {
  isDateSelected = status;
}

function setTodayClickedStatus(status) {
  isTodayClicked = status;
}
