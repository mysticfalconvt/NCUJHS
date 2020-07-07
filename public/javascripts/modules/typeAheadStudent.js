import axios from 'axios';
import dompurify from 'dompurify';

function searchResultsHTML(users) {
	return users
		.map((user) => {
			return `<p class="search__result">
               ${user.name}
        </p>`;
		})
		.join('');
}

function fillId(search){
	console.log(search.value)
	const id = document.getElementById('id')
	axios
		.get(`/api/searchuser?q=${search.value}`)
		.then((res) => {
			console.log(res.data[0]._id);
			id.value = res.data[0]._id;
		})
		.catch((err) => {
			console.error(err);
		});
};

function typeAheadStudent(search) {
	if (!search) return;

	const searchInput = search.querySelector('input[name="studentName"]');
	console.log(searchInput)
	const searchResults = search.querySelector('.search__results');
	
	searchInput.on('input', function() {
		if (!this.value) {
			
			searchResults.style.display = 'none';
			return;
		}
		searchResults.style.display = 'block';
		searchResults.style.innerHTML = '';
		axios
			.get(`/api/searchStudent?q=${this.value}`)
			.then((res) => {
				if (res.data.length) {
					searchResults.innerHTML = dompurify.sanitize(searchResultsHTML(res.data));
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
	document.getElementById("search").onkeypress = function(e) {
		var key = e.charCode || e.keyCode || 0;     
		if (key == 13) {
		  e.preventDefault();
		}
	  }

	//   Keyboard controls
	searchInput.on('keyup', (e) => {
		const studentName = document.getElementById('search')
		if (
			![
				38,
				40,
				13,
			].includes(e.keyCode)
			) {
				return;
			}
			const activeClass = 'search__result--active';
			const current = search.querySelector(`.${activeClass}`);
			const items = search.querySelectorAll('.search__result');
			let next;
			
			if (e.keyCode === 40 && current) {
			next = current.nextElementSibling || items[0];
		} else if (e.keyCode === 40) {
			next = items[0];
		} else if (e.keyCode === 38 && current) {
			next = current.previousElementSibling || items[items.length - 1];
		} else if (e.keyCode === 38) {
			next = items[items.length - 1];
		} else if (e.keyCode === 13 ) {
			studentName.value = current.innerHTML.trim();
			searchResults.style.display = 'none';
			fillId(searchInput)
			return;
		}
		if (current) {
			current.classList.remove(activeClass);
		}
		next.classList.add(activeClass);
	});
}

export default typeAheadStudent;
