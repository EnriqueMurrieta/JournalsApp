import React, { useState } from "react";
import axios from 'axios';
import SideBar from './SideBar';
import Home from './Home';

import '../Sidebar.css';
import '../UserDetail.css';

import { MDBBtn, MDBIcon, MDBRow, MDBCol } from 'mdb-react-ui-kit';

export default function UserDetail({ setUser, app, user }) {

	const [sideBar, setSideBar] = React.useState(true);

	const handleSideBar = () => {
		setSideBar(!sideBar)
	}

	const [verticalActive, setVerticalActive] = useState('home');

	const handleVerticalClick = (value) => {
		if (value === verticalActive) {
			return;
		}

		setVerticalActive(value);
	};

	const [selectedFile, setSelectedFile] = React.useState();
	const [isFilePicked, setIsFilePicked] = React.useState(false);

	const changeHandler = (event) => {
		setSelectedFile(event.target.files[0]);
		setIsFilePicked(true);
	}

	const handleSubmitFile = () => {
		const formData = new FormData();
		formData.append('file', selectedFile);
		formData.append('userID', app.currentUser.id);
		if (app.currentUser.providerType == "anon-user"){
			const rand = true
			const temp = true
			const anonName = "Demo UserName"
			const anonImage = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=870&q=80"
			formData.append('randomUser', rand);
			formData.append('userName', anonName);
			formData.append('userPictureUrl', anonImage);
			formData.append('temporary', temp);
		} else {
			formData.append('userName', app.currentUser._profile.data.name);
			formData.append('userPictureUrl', app.currentUser._profile.data.pictureUrl);
		}
		axios.post('/post/file', formData)
	}

	const displaySideBar =
		sideBar ?
			<SideBar app={app} setUser={setUser} handleSideBar={handleSideBar} handleVerticalClick={handleVerticalClick} verticalActive={verticalActive} />
			:
			<MDBCol size='3' sm='2' className='col-example'>
				<div className="sideBar">
					<MDBBtn className='text-dark' color='light' onClick={handleSideBar}>
						<MDBIcon fas icon="bars" />
					</MDBBtn>
				</div>
			</MDBCol>

	return (
		<MDBRow>
			<MDBRow className="sticky-top row-cols-1 row-cols-md-2 bg-light border-bottom">
				<MDBCol>
					<div className='p-1 text-start'>
						<MDBCol>
							<h1 className='mb-3'>Journal's App</h1>
						</MDBCol>
					</div>
				</MDBCol>
				<MDBCol>
					<div className='text-center'>
						<MDBCol >
							<label className="form-label" htmlFor="file"></label>
							<input type="file" className="form-control-md justify-content-center" id="file" onChange={changeHandler} role="button" />
							<button className="form-control-lg submitButton btn-primary" onClick={handleSubmitFile}>Post Journal</button>
						</MDBCol>
					</div>
				</MDBCol>
			</MDBRow>
			{displaySideBar}
			<Home sideBar={sideBar} verticalActive={verticalActive} user={user} app={app} />
		</MDBRow>
	);
}