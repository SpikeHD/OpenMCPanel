import { render } from 'preact';

import './style.css';
import { Header } from './components/Header';
import Router from 'preact-router';
import { Deploy } from './pages/deploy/Deploy';
import { Manage } from './pages/manage/Manage';
import { ManageList } from './pages/manage/ManageList';

export function App() {
	return (
    <>
      <Header />

      <Router>
        <div path="/">Home</div>
        <Deploy path="/deploy" />
        <ManageList path="/manage" />
        <Manage path="/manage/:id" />
      </Router>
    </>
	);
}

render(<App />, document.getElementById('app'));
