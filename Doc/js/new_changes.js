var sitiBasket

class SitiBasket {
  constructor(data) {
    this.data = data;
    this.stateCityMap = this.getStateCityMap();
  }

  getStateCityMap() {
    const stateCityMap = {};
    this.data?.companies?.forEach((company) => {
      if (!stateCityMap[company.state]) {
        stateCityMap[company.state] = [];
      }
      stateCityMap[company.state].push(company.city);
    });
    return stateCityMap;
  }

  getDistinctCategories() {
    const categories = this.data?.companies?.map((company) => company.category);
    const distinctCategories = [...new Set(categories)];
    return distinctCategories;
  }

  searchByCategory(category) {
    return this.data?.companies?.filter(
      (company) => company.category === category
    );
  }

  searchByCategoryAndState(category, state) {
    return this.data?.companies?.filter(
      (company) => company.category === category && company.state === state
    );
  }

  searchByCategoryAndStateAndCity(category, state, city) {
    return this.data?.companies?.filter(
      (company) =>
        company.category === category &&
        company.state === state &&
        company.city === city
    );
  }

  getStates() {
    return Object.keys(this.stateCityMap);
  }

  getCityByState(state) {
    return this.stateCityMap[state];
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
  const resp = await fetch("/Doc/data/listing_data.json");
  const data = await resp.json();
  if (!data) return;

  sitiBasket = new SitiBasket(data);

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
      const listingsCounts = $(".listing-counts");
      listingsCounts?.text(companies.length);
    });

    // add city select change event
    const citySelect = $(".select-city");
    citySelect?.on("change", function () {
      const category = $(".select-category").val();
      const state = $(".select-state").val();
      const city = this.value;
      const companies = sitiBasket.searchByCategoryAndStateAndCity(
        category,
        state,
        city
      );
      const listingsCounts = $(".listing-counts");
      listingsCounts?.text(companies.length);
    });

    //category search button click event
    const searchButton = $(".category-search");
    searchButton?.on("click", function () {
      const category = $(".select-category").val();
      window.location.href = `/listing.html?category=${category}`;
    });

    if (window.location.pathname.endsWith('/listing.html')) {
      const params = new URLSearchParams(window.location.search);
      const category = params.get('category');
      const categorySelect = $(".select-category")
      categorySelect.val(category);
      categorySelect.niceSelect('update');
      const companies = sitiBasket.searchByCategory(category);
      const listingsCounts = $(".listing-counts");
      listingsCounts?.text(companies.length);
  }
  }
});
