import React from "react";
import * as Realm from 'realm-web';

export default function About() {
	Realm.handleAuthRedirect();
	return <h2>About</h2>;
}