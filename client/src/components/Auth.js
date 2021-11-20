import React from "react";
import Login from './Login';
import UserDetail from './UserDetail';
import * as Realm from 'realm-web';

import About from './About';

import {
	Routes,
	Route
} from "react-router-dom";

const REALM_APP_ID = "journalsapp-fpmpj";
const app = new Realm.App({ id: REALM_APP_ID });

export default function Auth() {
	const [user, setUser] = React.useState(app.currentUser);
	return (
		<div className="App">
			<div className="App-header">
				{user ? <UserDetail setUser={setUser} app={app} user={user} /> : <Login setUser={setUser} app={app} />}
			</div>
			<Routes>
				<Route path="/about" element={<About app={app} user={user} />} />
			</Routes>
		</div>
	);
}