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

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements Declarations
  var mainSections = document.querySelectorAll("section");
  var navLinks = document.querySelectorAll(
    'a[data-section="launches"], a[data-section="planets"], a[data-section="today-in-space"]'
  );
  console.log(navLinks);
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
  var sidebar = document.getElementById("sidebar");
  var sidebarToggle = document.getElementById("sidebar-toggle");
  var isDateSelected = false;
  var isTodayClicked = false;
  // set fallback loading indicator
  displayLoadingIndicator();
  //   Fetch today's APOD
  DataSources.ds_get_apod().then((data) => displayApod(data));
  //   handle DatePicker
  apodDatePicker.addEventListener("change", (e) => {
    setDateSelectionStatus(true);
    setTodayClickedStatus(false);
    var formattedDate = formatDate(e.currentTarget.value);
    displayFormattedDate(formattedDate);
  });
  //   Fetch APOD by date
  loadDateBtn.addEventListener("click", function (e) {
    if (!isDateSelected) {
      showErrorFetchingDate();
      return;
    }
    var date = apodDatePicker.value;
    displayLoadingIndicator();
    DataSources.ds_get_apod(date).then((data) => displayApod(data));
    setDateSelectionStatus(false);
  });

  //   Set today's date

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

  //   handle Sidebar
  sidebarToggle.addEventListener("click", (e) => {
    sidebar.classList.toggle("sidebar-open");
    e.stopPropagation();
  });
  document.addEventListener("click", (e) => {
    console.log(sidebar.children[0]);

    if (
      !Array.from(sidebar.children).includes(e.target) &&
      !sidebar.children[0].contains(e.target) &&
      !sidebar.children[2].contains(e.target) &&
      sidebar.classList.contains("sidebar-open")
    ) {
      sidebar.classList.remove("sidebar-open");
    }
  });
  console.log(sidebar.children);
  // handle NaveLinks
  var activeClassList = ["text-blue-400", "bg-blue-500/10"];
  var nonActiveClassList = ["text-slate-300", "hover:bg-slate-800"];
  for (let i = 0; i < navLinks.length; i++) {
    navLinks[i].addEventListener("click", () => {
      for (let j = 0; j < mainSections.length; j++) {
        mainSections[j].classList.add("hidden");
      }

      for (var k = 0; k < navLinks.length; k++) {
        navLinks[k].classList.remove(...activeClassList);
        navLinks[k].classList.add(...nonActiveClassList);
      }
      mainSections[i].classList.remove("hidden");
      navLinks[i].classList.remove(...nonActiveClassList);
      navLinks[i].classList.add(...activeClassList);
    });
  }

  // Helpers functions
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
    var formattedDate = formatDate(
      apodData?.date || getTodayDate(),
      undefined,
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
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
});

//  non active classes

/*

*/

/*
active classes
sidebar-open

*/
