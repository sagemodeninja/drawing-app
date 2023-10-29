import '@/styles/main.scss';
import '@/components';

import { App } from '@/classes/app';

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.open();
})