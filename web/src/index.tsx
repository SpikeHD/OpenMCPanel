import { render } from 'preact';
import Router, { CustomHistory } from 'preact-router';
import { HashHistory, createHashHistory } from 'history';

import { Deploy } from './pages/deploy/Deploy';
import { Manage } from './pages/manage/Manage';
import { ManageList } from './pages/manage/ManageList';
import { Sidebar } from './components/Sidebar';

import './style.css';
import { Monitor } from './pages/monitor/Monitor';
import { Home } from './pages/home/Home';

export function App() {
	return (
    <>
      <Sidebar />

      <div id="content">
        <Router history={createHashHistory() as unknown as CustomHistory}>
          <Home path="/" />
          <Deploy path="/deploy" />
          <Monitor path="/monitor/:id" />
          <ManageList path="/manage" />
          <Manage path="/manage/:id" />
        </Router>
      </div>
    </>
	);
}

render(<App />, document.getElementById('app'));
