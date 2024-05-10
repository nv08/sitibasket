var sitiBasket;

class SitiBasket {
  constructor(data, placesData) {
    this.data = data;
    this.placesData = placesData;
    this.stateCityMap = this.getStateCityMap();
  }

  getStateCityMap() {
    return this.placesData;
  }

  getDistinctCategories() {
    const categories = this.data?.companies
      ?.map((company) => company.category)
      .sort();
    const distinctCategories = [...new Set(categories)];
    return distinctCategories;
  }

  searchByCategory(category) {
    const filteredCompanies = this.data?.companies?.filter(
      (company) => company.category === category
    );
    if (filteredCompanies.some((company) => company.name)) {
      return filteredCompanies;
    }
    return [];
  }

  searchByCategoryAndState(category, state) {
    const filteredCompanies = this.data?.companies?.filter(
      (company) => company.category === category && company.state === state
    );
    if (filteredCompanies.some((company) => company.name)) {
      return filteredCompanies;
    }
    return [];
  }

  searchByCategoryAndStateAndCity(category, state, city) {
    const filteredCompanies = this.data?.companies?.filter(
      (company) =>
        company.category === category &&
        company.state === state &&
        company.city === city
    );
    if (filteredCompanies.some((company) => company.name)) {
      return filteredCompanies;
    }
    return [];
  }

  searchByStateAndCity(state, city) {
    const filteredCompanies = this.data?.companies?.filter(
      (company) => company.state === state && company.city === city
    );
    if (filteredCompanies.some((company) => company.name)) {
      return filteredCompanies;
    }
    return [];
  }

  getStates() {
    return Object.keys(this.stateCityMap);
  }

  getCityByState(state) {
    return this.stateCityMap[state];
  }

  getTopFiveStatesByNumberOfListings() {
    const states = this.getStates();
    const statesToIncludeIfCountLessThanFive = [
      "Uttar Pradesh",
      "Maharashtra",
      "Delhi",
      "Gujarat",
    ];
    const statesWithCount = states
      .map((state) => {
        const count = this.data?.companies?.filter(
          (company) => company.state === state
        ).length;
        if (count === 0) return;
        return { name: state, count };
      })
      .filter(Boolean);

    if (statesWithCount.length < 5) {
      statesToIncludeIfCountLessThanFive.forEach((state) => {
        if (!statesWithCount.some((s) => s.name === state)) {
          const count = this.data?.companies?.filter(
            (company) => company.state === state
          ).length;
          statesWithCount.push({ name: state, count });
        }
      });
    }
    const sortedStates = statesWithCount.sort((a, b) => b.count - a.count);
    return sortedStates.slice(0, 5);
  }

  getListingCountString(count) {
    switch (count) {
      case 0:
        return "";
      case 1:
        return "1 Listing";
      default:
        return `${count} Listings`;
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const typed = document.getElementById("typed");
  if (!typed) return;
  new Typed("#typed", {
    strings: [
      "Lucknow",
      "Mumbai",
      "Delhi",
      "Bangalore",
      "Hyderabad",
      "Ahmedabad",
      "Chennai",
      "Kolkata",
      "Surat",
      "Pune",
      "Jaipur",
    ],
    typeSpeed: 60,
    backSpeed: 60,
    loop: true,
    loopCount: Infinity,
    showCursor: true,
    cursorChar: "|",
    autoInsertCss: true,
    backDelay: 2000,
  });
});

document.addEventListener("DOMContentLoaded", async function () {
  const listingResp = await fetch("/Doc/data/listing_data.json");
  const data = await listingResp.json();

  const placesResp = await fetch("/Doc/data/state_cities_listing.json");
  const placesData = await placesResp.json();

  if (!data) return;
  if (!placesData) return;

  sitiBasket = new SitiBasket(data, placesData);

  // add top cities
  const topCities = $(".top-cities");
  if (topCities) {
    const topFiveStates = sitiBasket.getTopFiveStatesByNumberOfListings();
    topFiveStates.forEach((state) => {
      const div = document.createElement("div");
      div.classList.add("col-lg-6", "col-md-6", "col-sm-6");
      modifiedStateNameForImage = state.name.split(" ").join("_").toLowerCase();
      div.innerHTML = `
        <div class="single-location mb-30">
          <div class="location-img">
            <img src='/Doc/data/images/States/${modifiedStateNameForImage}.jpeg' />
          </div>
          <div class="location-details">
            <p>${state.name}</p>
            ${
              sitiBasket.getListingCountString(state.count) === "" ? "" : (
                `<a href="#" class="location-btn">
                  ${sitiBasket.getListingCountString(state.count)}
                </a>`
              )
            }
          </div>
        </div>
      `;
      topCities.append(div);
    });
  }

  // add categories to select
  const select = $(".select-category");
  if (select) {
    const categories = sitiBasket.getDistinctCategories();
    categories.forEach((city) => {
      const option = document.createElement("option");
      option.value = city;
      option.text = city;
      select.append(option);
      select.niceSelect("update");
    });
  }

  const stateSelect = $(".select-state");
  if (stateSelect) {
    // add states to select
    const states = sitiBasket.getStates();
    states.forEach((state) => {
      const option = document.createElement("option");
      option.value = state;
      option.text = state;
      stateSelect.append(option);
      stateSelect.niceSelect("update");
    });

    // add select state change event
    stateSelect?.on("change", function () {
      const citySelect = $(".select-city");
      if (!citySelect) return;
      citySelect.empty();
      citySelect.append(
        '<option value="" disabled selected >Select a city</option>'
      );
      const cities = sitiBasket.getCityByState(this.value);
      cities?.forEach((city) => {
        const option = document.createElement("option");
        option.value = city;
        option.text = city;
        citySelect.append(option);
        citySelect.niceSelect("update");
      });
      const companies = sitiBasket.searchByCategoryAndState(
        $(".select-category").val(),
        this.value //refers to the value of the state select
      );
      updateCount(companies.length);
      renderListingCards(companies);
    });

    // add city select change event
    const citySelect = $(".select-city");
    citySelect?.on("change", function () {
      const category = $(".select-category").val();
      const state = $(".select-state").val();
      const city = this.value;
      let companies;
      if (!category) {
        companies = sitiBasket.searchByStateAndCity(state, city);
      } else {
        companies = sitiBasket.searchByCategoryAndStateAndCity(
          category,
          state,
          city
        );
      }
      updateCount(companies.length);
      renderListingCards(companies);
    });

    //category search button click event
    const searchButton = $(".category-search");
    searchButton?.on("click", function () {
      const category = $(".select-category").val();
      window.location.href = `/listing.html?category=${encodeURIComponent(
        category
      )}`;
    });

    if (window.location.pathname.endsWith("/listing.html")) {
      const params = new URLSearchParams(window.location.search);
      const category = params.get("category");
      const categorySelect = $(".select-category");
      categorySelect.val(category);
      categorySelect.niceSelect("update");
      const companies = sitiBasket.searchByCategory(category);
      updateCount(companies.length);
      renderListingCards(companies);
    }

    if (window.location.pathname.endsWith("/directory_details.html")) {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");
      const company = sitiBasket.data.companies.find(
        (company) => company.name === id
      );
      if (company) {
        updateListingDetails(company);
      } else {
        window.location.href = "/index.html";
      }
    }
  }
});

const updateCount = (count = 0) => {
  const listingsCounts = $(".listing-counts > span");
  listingsCounts.empty();
  listingsCounts.append(
    `<b>${count}</b> ${count === 1 ? "listing" : "listings"} found`
  );
};

const renderListingCards = (listings) => {
  const listingsContainer = $(".listings > .row");
  listingsContainer.empty();
  listings?.forEach((listing) => {
    const listingCard = renderListingCard(listing);
    listingsContainer.append(listingCard);
  });
};

const renderListingCard = (listing) => {
  const div = document.createElement("div");
  div.classList.add("col-lg-6");
  const onListingClickHandler = () => {
    window.location.href = `/directory_details.html?id=${listing.name}`;
  };
  div.innerHTML = `
      <div class="properties properties2 mb-30">
        <div class="properties__card">
          <div class="properties__img overlay1">
            <a>
              <img src=${listing.coverImage} alt="" />
            </a>
            <div class="icon">
              <img src="assets/img/gallery/categori_icon1.png" alt="" />
            </div>
          </div>
          <div class="properties__caption">
            <h3>
              <a>${listing.name}</a>
            </h3>
            <p>${listing.coverDescription}</p>
          </div>
          <div class="properties__footer d-flex justify-content-between align-items-center">
            <div class="restaurant-name">
              <img src="assets/img/gallery/restaurant-icon.png" alt="" />
              <h3>${listing.subCategory}</h3>
            </div>
          </div>
        </div>
      </div>
  `;
  div
    .querySelector(".properties__card")
    .addEventListener("click", onListingClickHandler);
  return div;
};

const updateListingDetails = (company) => {
  //update company name
  $(".company-name > h3 > a").text(company.name);

  // update company description
  $(".company-cover-description").text(company.coverDescription);

  // update company website
  $(".company-website").attr("href", company.website);

  //update company full description
  $(".company-full-description").html(company.fullDescription);

  //update images
  const imagesContainer = $(".company-images");
  imagesContainer.empty();
  const div = $('<div class="row"></div>');
  company.images.forEach((image) => {
    const el = `
      <div class="col-lg-6" style="overflow:hidden; border-radius: 12px; height: 320px">
        <img
        style="width: 100%; height: 100%; object-fit: cover;"
          src=${image}
          class="mb-30"
          alt=""
        />
      </div>
    `;
    div.append(el);
    imagesContainer.append(div);
  });
};
