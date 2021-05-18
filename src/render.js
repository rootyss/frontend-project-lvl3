const renderErrors = (errors) => {
  const feedbackEl = document.querySelector('.feedback');
  const input = document.querySelector('input');

  if (!errors) {
    feedbackEl.classList.remove('text-danger');
    input.classList.remove('is-invalid');
    return;
  }
  feedbackEl.textContent = errors;
  feedbackEl.classList.add('text-danger');
  input.classList.add('is-invalid');
};

const genFeedsElements = (feeds) => {
  if (feeds.length < 1) return null;
  const h2El = document.createElement('H2');
  h2El.textContent = 'Фиды';
  const container = document.createElement('DIV');
  container.classList.add('col-md-10', 'col-lg-8', 'mx-auto', 'feeds');
  const ulEl = document.createElement('UL');
  const lis = feeds.map((feed) => {
    const { description, title } = feed;
    return `<li class="list-group-item"><h3>${title}</h3><p>${description}</p></li>`;
  });
  ulEl.innerHTML = lis.join('');
  ulEl.classList.add('list-group', 'mb-5');
  container.append(h2El, ulEl);
  return container;
};

const genPostsElements = (posts) => {
  console.log(posts);
  if (posts.length < 1) return null;
  const h2El = document.createElement('H2');
  h2El.textContent = 'Посты';
  const container = document.createElement('DIV');
  container.classList.add('col-md-10', 'col-lg-8', 'mx-auto', 'posts');
  const ulEl = document.createElement('UL');
  ulEl.classList.add('list-group');

  const lis = posts.map((post) => {
    const { link, title, id } = post;
    return `<li class="list-group-item d-flex justify-content-between align-items-start"><a href=${link} class="fw-bold text-decoration-none" data-id=${id} target="_blank" rel = "noopener noreferrer">${title}</a><button type="button" class="btn btn-primary btn-sm" data-id=${id} data-toggle="modal" data-target="#modal">Просмотр</button></li>`;
  });

  ulEl.innerHTML = lis.join('');
  container.append(h2El, ulEl);
  return container;
};

export default (state) => {
  const submitButton = document.querySelector('button');
  const feedbackEl = document.querySelector('.feedback');
  const feedsContainer = document.querySelector('.feeds');
  const postsContainer = document.querySelector('.posts');
  const input = document.querySelector('input');

  renderErrors(state.rssForm.errors);

  switch (state.rssForm.state) {
    case 'failed':
      submitButton.disabled = false;
      break;
    case 'filling':
      submitButton.disabled = false;
      break;
    case 'sending':
      submitButton.disabled = true;
      break;
    case 'finished':
      feedbackEl.textContent = 'Данные загружены';
      feedbackEl.classList.add('text-success');
      break;
    default:
      throw new Error('Unknown error');
  }
  if (!genFeedsElements(state.feeds)) {
    return;
  }
  feedsContainer.replaceWith(genFeedsElements(state.feeds));
  if (!genPostsElements(state.posts)) {
    return;
  }
  postsContainer.replaceWith(genPostsElements(state.posts));

  input.focus();
};
