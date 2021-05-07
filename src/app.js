import watchedState from './watchedState.js';
import validate from './validate.js';
import { getStream } from './utils.js';

const form = document.querySelector('form');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const inputUrl = formData.get('url');
  watchedState.rssForm.errors = validate(inputUrl);
  const data = getStream(inputUrl);
  data.then((response) => console.log(response.data.contents));
});
