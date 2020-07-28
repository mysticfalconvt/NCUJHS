import axios from "axios";
import dompurify from "dompurify";

function searchResultsHTML(users) {
  return users
    .map((user) => {
      return `
			<a href="/user/${user._id}" class="search__result">
        <strong>${user.name}</strong>
      </a>
			`;
    })
    .join("");
}

// function fillId(search){
// 	console.log(search)
// 	const id = document.getElementById('id')
// 	axios
// 		.get(`/api/searchAll?q=${search.value}`)
// 		.then((res) => {
// 			console.log(res.data[0]._id);
// 			id.value = res.data[0]._id;
// 		})
// 		.catch((err) => {
// 			console.error(err);
// 		});
// };

function typeAheadUser(search) {
  if (!search) return;

  const searchInput = search.querySelector('input[name="userName"]');
  const searchResults = search.querySelector(".search__results");

  searchInput.on("input", function () {
    if (!this.value) {
      searchResults.style.display = "none";
      return;
    }
    searchResults.style.display = "block";
    searchResults.style.innerHTML = "";
    axios
      .get(`/api/searchUser?q=${this.value}`)
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

  //   Keyboard controls
  searchInput.on("keyup", (e) => {
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
    } else if (e.keyCode === 13 && current.href) {
      e.preventDefault();
      window.location = current.href;
      return;
    }
    if (current) {
      current.classList.remove(activeClass);
    }
    next.classList.add(activeClass);
  });
}

export default typeAheadUser;
