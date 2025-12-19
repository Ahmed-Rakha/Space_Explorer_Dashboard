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

async function ds_get_upcoming_launches(limit = 5) {
  try {
    var response = await fetch(
      `https://ll.thespacedevs.com/2.3.0/launches/upcoming/?limit=${limit}`
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
// Today in Space API
var DataSources = {
  ds_get_apod,
  ds_get_upcoming_launches,
};

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements Declarations
  var mainSections = document.querySelectorAll("section");
  var navLinks = document.querySelectorAll(
    'a[data-section="launches"], a[data-section="planets"], a[data-section="today-in-space"]'
  );
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
  var featuredLaunchSection = document.getElementById("featured-launch");
  var launchGrid = document.getElementById("launches-grid");
  var isDateSelected = false;
  var isTodayClicked = false;
  // ===>  set fallback loading indicator
  displayLoadingIndicator();
  // ===>   Fetch today's APOD
  DataSources.ds_get_apod().then((data) => displayApod(data));
  // ===>   handle DatePicker
  apodDatePicker.addEventListener("change", (e) => {
    setDateSelectionStatus(true);
    setTodayClickedStatus(false);
    var formattedDate = formatDate(e.currentTarget.value);
    displayFormattedDate(formattedDate);
  });
  // ===>  Fetch APOD by date
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

  //  ===>  Set today's date

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

  // ===>  handle Sidebar
  sidebarToggle.addEventListener("click", (e) => {
    sidebar.classList.toggle("sidebar-open");
    e.stopPropagation();
  });
  document.addEventListener("click", (e) => {
    if (
      !Array.from(sidebar.children).includes(e.target) &&
      !sidebar.children[0].contains(e.target) &&
      !sidebar.children[2].contains(e.target) &&
      sidebar.classList.contains("sidebar-open")
    ) {
      sidebar.classList.remove("sidebar-open");
    }
  });
  // ===>  handle NaveLinks
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

  // ===>  handle Launches section
  DataSources.ds_get_upcoming_launches().then((data) => {
    displayFeaturedLaunch(data.results[0]);
    displayUpcomingLaunches(data.results);
  });

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
  function displayFeaturedLaunch(featuredLaunch) {
    featuredLaunchSection.innerHTML = createFeaturedLaunchCard(featuredLaunch);
  }

  function displayUpcomingLaunches(upcomingLaunches) {
    console.log("upcomingLaunches", upcomingLaunches);
    console.log("launchGrid", launchGrid);
    var box = "";
    for (var i = 0; i < upcomingLaunches.length; i++) {
      launchGrid.insertAdjacentHTML(
        "beforeend",
        createLaunchCard(upcomingLaunches[i])
      );
    }
  }

  function createLaunchCard(upcomingLaunch) {
    return `
    <div class="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all group cursor-pointer">
      <div class="relative h-48 bg-slate-900/50 flex items-center justify-center">
  ${
    upcomingLaunch?.image?.image_url || upcomingLaunch?.image?.thumbnail_url
      ? `<img src=${
          upcomingLaunch?.image?.image_url ||
          upcomingLaunch?.image?.thumbnail_url
        } class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Astronomy Picture of the Day"/>`
      : `<i class="fas fa-space-shuttle text-5xl text-slate-700"></i>`
  }
        <div class="absolute top-3 right-3">
          <span class="px-3 py-1 bg-green-500/90 text-white backdrop-blur-sm rounded-full text-xs font-semibold">
            ${upcomingLaunch?.status?.abbrev ?? "unknown"}
          </span>
        </div>
      </div>
      <div class="p-5">
        <div class="mb-3">
          <h4 class="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
            ${upcomingLaunch?.name ?? "Unknown"}
          </h4>
          <p class="text-sm text-slate-400 flex items-center gap-2">
            <i class="fas fa-building text-xs"></i>${
              upcomingLaunch?.launch_service_provider.name ?? "Unknown"
            }
          </p>
        </div>
        <div class="space-y-2 mb-4">
          <div class="flex items-center gap-2 text-sm">
            <i class="fas fa-calendar text-slate-500 w-4"></i>
            <span class="text-slate-300">
              ${formatDate(upcomingLaunch?.net, undefined, {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <i class="fas fa-clock text-slate-500 w-4"></i>
            <span class="text-slate-300">
              ${formatTime(upcomingLaunch?.net)}
            </span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <i class="fas fa-rocket text-slate-500 w-4"></i>
            <span class="text-slate-300">${
              upcomingLaunch?.rocket?.configuration?.name ?? "Unknown"
            }</span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <i class="fas fa-map-marker-alt text-slate-500 w-4"></i>
            <span class="text-slate-300 line-clamp-1">${
              upcomingLaunch?.pad?.location?.name ?? "Unknown"
            }</span>
          </div>
        </div>
        <div class="flex items-center gap-2 pt-4 border-t border-slate-700">
          <button class="flex-1 px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors text-sm font-semibold">
            Details
          </button>
          <button class="px-3 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
            <i class="far fa-heart"></i>
          </button>
        </div>
      </div>
    </div>`;
  }

  function createFeaturedLaunchCard(featuredLaunch) {
    return `
     <div
              class="relative bg-slate-800/30 border border-slate-700 rounded-3xl overflow-hidden group hover:border-blue-500/50 transition-all"
            >
              <div
                class="absolute inset-0 bg-linear-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
              ></div>
              <div class="relative grid grid-cols-1 lg:grid-cols-2 gap-6 p-8">
                <div class="flex flex-col justify-between">
                  <div>
                    <div class="flex items-center gap-3 mb-4">
                      <span
                        class="px-4 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold flex items-center gap-2"
                      >
                        <i class="fas fa-star"></i>
                        Featured Launch
                      </span>
                      <span
                        class="px-4 py-1.5 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold"
                      >
                        ${featuredLaunch?.status?.abbrev ?? "unknown"}
                      </span>
                    </div>
                    <h3 class="text-3xl font-bold mb-3 leading-tight">
                      ${featuredLaunch?.name ?? "unknown"}
                    </h3>
                    <div
                      class="flex flex-col xl:flex-row xl:items-center gap-4 mb-6 text-slate-400"
                    >
                      <div class="flex items-center gap-2">
                        <i class="fas fa-building"></i>
                        <span>${
                          featuredLaunch?.launch_service_provider?.name ??
                          "unknown"
                        }</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <i class="fas fa-rocket"></i>
                        <span>${
                          featuredLaunch?.rocket?.configuration?.name ??
                          "unknown"
                        }</span>
                      </div>
                    </div>
                    ${
                      getLeftDaysForLaunch(featuredLaunch?.net) > 0
                        ? `<div
                      class="inline-flex items-center gap-3 px-6 py-3 bg-linear-to-r from-blue-500/20 to-purple-500/20 rounded-xl mb-6"
                    >
                      <i class="fas fa-clock text-2xl text-blue-400"></i>
                      <div>
                        <p class="text-2xl font-bold text-blue-400">2</p>
                        <p class="text-xs text-slate-400">Days Until Launch</p>
                      </div>
                    </div>`
                        : ""
                    }
                    <div class="grid xl:grid-cols-2 gap-4 mb-6">
                      <div class="bg-slate-900/50 rounded-xl p-4">
                        <p
                          class="text-xs text-slate-400 mb-1 flex items-center gap-2"
                        >
                          <i class="fas fa-calendar"></i>
                          Launch Date
                        </p>
                        <p class="font-semibold">${formatDate(
                          featuredLaunch?.net,
                          undefined,
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            weekday: "long",
                          }
                        )}</p>
                      </div>
                      <div class="bg-slate-900/50 rounded-xl p-4">
                        <p
                          class="text-xs text-slate-400 mb-1 flex items-center gap-2"
                        >
                          <i class="fas fa-clock"></i>
                          Launch Time
                        </p>
                        <p class="font-semibold">${formatTime(
                          featuredLaunch?.net
                        )}</p>
                      </div>
                      <div class="bg-slate-900/50 rounded-xl p-4">
                        <p
                          class="text-xs text-slate-400 mb-1 flex items-center gap-2"
                        >
                          <i class="fas fa-map-marker-alt"></i>
                          Location
                        </p>
                        <p class="font-semibold text-sm">${
                          featuredLaunch?.pad?.location?.name ?? "unknown"
                        }</p>
                      </div>
                      <div class="bg-slate-900/50 rounded-xl p-4">
                        <p
                          class="text-xs text-slate-400 mb-1 flex items-center gap-2"
                        >
                          <i class="fas fa-globe"></i>
                          Country
                        </p>
                        <p class="font-semibold">${
                          featuredLaunch?.pad?.location?.country?.name ??
                          "Unknown"
                        }</p>
                      </div>
                    </div>
                    <p class="text-slate-300 leading-relaxed mb-6">
                     ${
                       featuredLaunch.mission?.description ??
                       "Mission details will be available closer to launch date."
                     }
                    </p>
                  </div>
                  <div class="flex flex-col md:flex-row gap-3">
                    <button
                      class="flex-1 self-start md:self-center px-6 py-3 bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center gap-2"
                    >
                      <i class="fas fa-info-circle"></i>
                      View Full Details
                    </button>
                    <div class="icons self-end md:self-center">
                      <button
                        class="px-4 py-3 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors"
                      >
                        <i class="far fa-heart"></i>
                      </button>
                      <button
                        class="px-4 py-3 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors"
                      >
                        <i class="fas fa-bell"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <div class="relative">
                    ${
                      featuredLaunch?.image?.image_url ||
                      featuredLaunch?.image?.thumbnail_url
                        ? `<div
                    class="relative h-full min-h-[400px] rounded-2xl overflow-hidden bg-slate-900/50"
                  >
                    <!-- Placeholder image/icon since we can't load external images reliably without correct URLs -->
                    <div
                      class="flex items-center justify-center h-full min-h-[400px] bg-slate-800"
                    >
                      <img src=${
                        featuredLaunch?.image?.image_url ||
                        featuredLaunch?.image?.thumbnail_url
                      } alt="Astronomy Picture of the Day"/>
                    </div>
                    <div
                      class="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent"
                    ></div>
                  </div>`
                        : `
                         <div class="flex items-center justify-center h-full min-h-[400px] bg-slate-900/50 rounded-2xl">
                        <div class="text-center">
                            <i class="fas fa-rocket text-6xl text-slate-700 mb-4"></i>
                            <p class="text-slate-500">No image available</p>
                        </div>
                    </div>
                        `
                    }
                </div>
              </div>
            </div>
            `;
  }
  function formatTime(
    date,
    local = "en-US",
    options = {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
      timeZoneName: "short",
    }
  ) {
    var date = new Date(date);
    return date.toLocaleTimeString(local, options);
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
  function getLeftDaysForLaunch(launchDate) {
    var leftDays = 0;
    var expectedLaunchDate = new Date(launchDate).getTime();
    var todayTime = new Date().getTime();
    if (expectedLaunchDate > todayTime) {
      leftDays = Math.floor(
        (expectedLaunchDate - todayTime) / (1000 * 60 * 60 * 24)
      );
      return leftDays;
    }
    return leftDays;
  }
});

//  non active classes

/*

*/

/*
active classes
sidebar-open

*/

var date = new Date();

console.log(
  date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
    timeZoneName: "short",
  })
);
