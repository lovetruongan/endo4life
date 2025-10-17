import * as ReactDOM from 'react-dom/client';

import App from './app/app';
import moment from "moment";
import 'moment/dist/locale/vi';
moment().locale('vi');

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
    <App />
);
