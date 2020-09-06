import axios from "axios";
import dompurify from "dompurify";

function searchResultsHTML(infos) {
  return infos
    .map((info) => {
      return `<p style="cursor: pointer" class="search__result">
               <a href="${info.link}">${info.title}</a>
        </p>`;
    })
    .join("");
}

// function fillId(search) {
//   const id = document.getElementById("infoSearch");
//   axios
//     .get(`/api/searchInfos?q=${search.value}`)
//     .then((res) => {
//       id.value = res.data[0]._id;
//     })
//     .catch((err) => {
//       console.error(err);
//     });
// }

function typeAheadInfo(search) {
  if (!search) return;

  const searchInput = search.querySelector('input[name="infoSearch"]');
  const searchResults = search.querySelector(".search__results");

  searchInput.on("input", function () {
    if (!this.value) {
      searchResults.style.display = "none";
      return;
    }
    searchResults.style.display = "block";
    searchResults.style.innerHTML = "";
    axios
      .get(`/api/searchInfos?q=${this.value}`)
      .then((res) => {
        if (res.data.length) {
          searchResults.innerHTML = dompurify.sanitize(
            searchResultsHTML(res.data),
          );
          return;
        }
        searchResults.innerHTML = dompurify.sanitize(
          `<div class="search__result">No results for ${this.value} found!</div>`,
        );
      })
      .catch((err) => {
        console.error(err);
      });
  });

  //handle keyboard input

  //stop enter on search
  document.getElementById("infoSearch").onkeypress = function (e) {
    var key = e.charCode || e.keyCode || 0;
    if (key == 13) {
      e.preventDefault();
    }
  };

  //   Keyboard controls
  searchInput.on("keyup", (e) => {
    const studentName = document.getElementById("search");
    if (![38, 40, 13].includes(e.keyCode)) {
      return;
    }
    const activeClass = "search__result--active";
    const current = search.querySelector(`.${activeClass}`);
    const items = search.querySelectorAll(".search__result");
    let next;

    if (e.keyCode === 40 && current) {
      next = current.nextElementSibling || items[0];
    } else if (e.keyCode === 40) {
      next = items[0];
    } else if (e.keyCode === 38 && current) {
      next = current.previousElementSibling || items[items.length - 1];
    } else if (e.keyCode === 38) {
      next = items[items.length - 1];
    } else if (e.keyCode === 13) {
      current.click();
      return;
    }
    if (current) {
      current.classList.remove(activeClass);
    }
    next.classList.add(activeClass);
  });
  // click on name to
  //   searchResults.on("click", (e) => {
  //     const studentName = document.getElementById("search");
  //     studentName.value = e.path[0].innerHTML.trim();
  //     searchResults.style.display = "none";
  //     fillId(searchInput);
  //   });
  // searchResults.on("tap", (e) => {
  //   const studentName = document.getElementById("search");
  //   studentName.value = e.path[0].innerHTML.trim();
  //   searchResults.style.display = "none";
  //   fillId(searchInput);
  // });
}

export default typeAheadInfo;
