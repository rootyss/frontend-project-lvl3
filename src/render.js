import onChange from 'on-change';

const getAttr = (element, values) => Object.keys(values).forEach((attr) => {
  element.setAttribute(attr, values[attr]);
});

const processStateHandler = (state, elements, i18nInstance) => {
  const {
    submitButton, feedbackEl, input, form,
  } = elements;
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
      feedbackEl.textContent = i18nInstance.t('result');
      feedbackEl.removeAttribute('class');
      feedbackEl.classList.add('text-success', 'feedback');
      input.classList.remove('is-invalid');
      form.reset();
      input.focus();
      break;
    default:
      throw new Error('Unknown error');
  }
};

const renderErrors = (state, elements, i18nInstance) => {
  const { feedbackEl, input } = elements;
  feedbackEl.removeAttribute('class');
  feedbackEl.classList.add('feedback', 'text-danger');
  input.classList.add('is-invalid');
  feedbackEl.textContent = i18nInstance.t(`errors.${state.rssForm.error}`);
};

const renderFeedsElements = (state, elements, i18nInstance) => {
  const { feedsContainer } = elements;
  const h2El = document.createElement('H2');
  h2El.textContent = i18nInstance.t('feeds');
  const ulEl = document.createElement('UL');
  ulEl.classList.add('list-group', 'mb-5');
  state.feeds.forEach(({ description, title }) => {
    const liEl = document.createElement('LI');
    liEl.classList.add('list-group-item');
    const h3El = document.createElement('H3');
    h3El.textContent = title;
    const pEl = document.createElement('P');
    pEl.textContent = description;
    liEl.append(h3El, pEl);
    ulEl.append(liEl);
  });
  feedsContainer.innerHTML = '';
  feedsContainer.append(h2El, ulEl);
};

const renderPostsElements = (state, elements, i18nInstance) => {
  const { postsContainer } = elements;
  const h2El = document.createElement('H2');
  h2El.textContent = i18nInstance.t('posts');
  const ulEl = document.createElement('UL');
  ulEl.classList.add('list-group');
  state.posts.forEach(({ link, title, id }) => {
    const liEl = document.createElement('LI');
    liEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');

    const aEl = document.createElement('A');
    aEl.classList.add('fw-bold', 'text-decoration-none');

    const font = state.visitedPostsId.includes(String(id)) ? 'fw-normal' : 'fw-bold';
    const aElAttributes = {
      href: link, class: font, 'data-id': id, target: '_blank', rel: 'noopener noreferrer',
    };
    getAttr(aEl, aElAttributes);
    aEl.textContent = title;

    const buttonEl = document.createElement('BUTTON');
    buttonEl.classList.add('btn', 'btn-primary', 'btn-sm');
    const buttonAttr = {
      type: 'button', 'data-id': id, 'data-toggle': 'modal', 'data-target': '#modal',
    };
    getAttr(buttonEl, buttonAttr);
    buttonEl.textContent = i18nInstance.t('view');
    liEl.append(aEl, buttonEl);
    ulEl.append(liEl);
  });
  postsContainer.innerHTML = '';
  postsContainer.append(h2El, ulEl);
};

export default (state, elements, i18nInstance) => onChange(state, (path) => {
  switch (path) {
    case 'rssForm.state':
      processStateHandler(state, elements, i18nInstance);
      break;
    case 'rssForm.error':
      renderErrors(state, elements, i18nInstance);
      break;
    case 'feeds':
      renderFeedsElements(state, elements, i18nInstance);
      break;
    case 'posts':
      renderPostsElements(state, elements, i18nInstance);
      break;
    case 'visitedPostsId':
      renderPostsElements(state, elements, i18nInstance);
      break;
    default:
      break;
  }
});
