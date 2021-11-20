import React from 'react';
import { MDBRow, MDBCol } from 'mdb-react-ui-kit';

import Users from './Users';
import Feed from './Feed';
import Subscriptions from './Subscriptions';
import YourPosts from './YourPosts';

import {
    Routes,
    Route
} from "react-router-dom";

export default function Home({ sideBar, user, app }) {
    return (
        <MDBCol size={sideBar ? '7' : '8'} sm={sideBar ? '9' : '10'} md={sideBar ? '10' : '10'} className='col-example'>
            <MDBRow>
                <MDBCol md='12 d-flex justify-content-center'>
                    <Routes>
                        <Route path="/" element={<Feed app={app} user={user} />} />
                        <Route path="/users" element={<Users app={app} />} />
                        <Route path="/profile" element={<YourPosts app={app} />} />
                        <Route path="/subscriptions" element={<Subscriptions app={app} />} />
                    </Routes>
                </MDBCol>
            </MDBRow>
        </MDBCol>
    );
}