const renderErrors = (errors) => {
  const feedbackEl = document.querySelector('.feedback');
  const input = document.querySelector('input');

  if (!errors) {
    feedbackEl.textContent = '';
    feedbackEl.classList.remove('text-danger');
    input.classList.remove('is-invalid');
    return;
  }
  feedbackEl.textContent = errors;
  feedbackEl.classList.add('text-danger');
  input.classList.add('is-invalid');
};

export default (state) => {
  renderErrors(state.rssForm.errors);
};
