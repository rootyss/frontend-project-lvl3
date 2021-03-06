import onChange from 'on-change';

const setAttr = (element, values) => Object.keys(values).forEach((attr) => {
  element.setAttribute(attr, values[attr]);
});

const processStateHandler = (state, elements, i18nInstance) => {
  const {
    submitButton, feedbackEl, input, form,
  } = elements;
  switch (state.rssForm.state) {
    case 'failed':
      input.readOnly = false;
      submitButton.disabled = false;
      break;
    case 'filling':
      input.readOnly = false;
      submitButton.disabled = false;
      break;
    case 'sending':
      input.readOnly = true;
      submitButton.disabled = true;
      break;
    case 'finished':
      submitButton.disabled = false;
      input.readOnly = false;
      feedbackEl.removeAttribute('class');
      feedbackEl.classList.add('text-success', 'feedback');
      input.classList.remove('is-invalid');
      feedbackEl.textContent = i18nInstance.t('result');
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
const buildLinkElement = (aElFont, option) => {
  const [font, fontForCheck] = aElFont;
  const { link, itemTitle, id } = option;
  const aEl = document.createElement('A');
  aEl.classList.add('text-decoration-none');
  aEl.classList.add(font);
  aEl.classList.add(fontForCheck);
  const aElAttributes = {
    href: link, 'data-id': id, target: '_blank', rel: 'noopener noreferrer',
  };
  setAttr(aEl, aElAttributes);
  aEl.textContent = itemTitle;
  return aEl;
};
const buildButtonElement = (text, id) => {
  const buttonEl = document.createElement('BUTTON');
  buttonEl.classList.add('btn', 'btn-primary', 'btn-sm');
  const buttonAttr = {
    type: 'button', 'data-id': id, 'data-bs-toggle': 'modal', 'data-bs-target': '#readme',
  };
  setAttr(buttonEl, buttonAttr);
  buttonEl.textContent = text;
  return buttonEl;
};
const renderPostsElements = (state, elements, i18nInstance) => {
  const { postsContainer } = elements;
  const h2El = document.createElement('H2');
  h2El.textContent = i18nInstance.t('posts');
  const ulEl = document.createElement('UL');
  ulEl.classList.add('list-group');
  state.posts.forEach(({ link, itemTitle, id }) => {
    const liEl = document.createElement('LI');
    liEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');

    const font = state.visitedPostsId.includes(String(id)) ? ['fw-normal', 'font-weight-normal'] : ['fw-bold', 'font-weight-bold'];
    const text = i18nInstance.t('view');

    const aEl = buildLinkElement(font, { link, itemTitle, id });
    const buttonEl = buildButtonElement(text, id);

    liEl.append(aEl, buttonEl);
    ulEl.append(liEl);
  });
  postsContainer.innerHTML = '';
  postsContainer.append(h2El, ulEl);
};

const renderModal = (state, elements, i18nInstance) => {
  const {
    modalTitle, modalBody, closeModal, readMore,
  } = elements;
  const targetPost = state.posts.find((el) => el.id === state.postId);
  modalTitle.textContent = targetPost.itemTitle;
  modalBody.textContent = targetPost.descriptionPost;
  closeModal.textContent = i18nInstance.t('modal.close');
  readMore.textContent = i18nInstance.t('modal.readMore');
  readMore.setAttribute('href', targetPost.link);
  const aEl = document.querySelector(`a[data-id="${state.postId}"]`);
  aEl.classList.remove('fw-bold', 'font-weight-bold');
  aEl.classList.add('fw-normal', 'font-weight-normal');
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
    case 'postId':
      renderModal(state, elements, i18nInstance);
      break;
    default:
      break;
  }
});
