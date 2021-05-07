const renderErrors = (errors) => {
    if (!errors) return;
    const feedbackEl = document.querySelector('.feedback');
    const input = document.querySelector('input');

    feedbackEl.textContent = errors;
    feedbackEl.classList.add('text-danger');
    input.classList.add('is-invalid');
};

export default renderErrors;
