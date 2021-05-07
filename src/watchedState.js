import onChange from 'on-change';
import state from './state.js';
import renderErrors from "./renderErrors.js";

const watchedState = onChange(state, (path, value) => {
    switch (path) {
        case 'rssForm.errors':
            renderErrors(value);
            break;
        default:
            break;
    }
});

export default watchedState;
