import React from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route
} from "react-router-dom";
import Auth from './Auth';
import Users from './Users';
import About from './About';
import YourPosts from './YourPosts';
import Subscriptions from './Subscriptions';

export default function Routing() {
	return (
		<Router>
			<div>
				<Routes>
					<Route path="/about" element={<About />} />
					<Route path="/users" element={<Users />} />
					<Route path="/" element={<Auth />} />
					<Route path="/profile" element={<YourPosts />} />
					<Route path="/subscriptions" element={<Subscriptions />} />
				</Routes>
			</div>
		</Router>
	);
}