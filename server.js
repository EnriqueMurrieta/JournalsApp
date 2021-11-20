//mongodb://<USERNAME>:<PASSWORD>@realm.mongodb.com:27020/?authMechanism=PLAIN&authSource=%24external&ssl=true&appName=journalsapp-fpmpj:mongodb-atlas:local-userpass
const Realm = require("realm");
const express = require('express');
cors = require("cors");
const fileUpload = require('express-fileupload');
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');
const { MongoClient } = require("mongodb");
const mongo = require("mongodb");
const path = require('path');

const app = express();
let port = process.env.PORT;
if (port == null || port == "") {
	port = 5000;
}

app.use(express.json())
app.use(cors());
app.use(fileUpload());
app.listen(port, () => console.log(`Server started on port ${port}`));

//const uri = "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000"
const uri = "mongodb+srv://enrique123:enrique123@cluster0.t8wvf.mongodb.net/mySecondDatabase?retryWrites=true&w=majority"
//const uri = "mongodb+srv://enrique123:<password>@cluster0.t8wvf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
//const client = new MongoClient(uri);

//Serve static assets if in production
if(process.env.NODE_ENV === 'production') {
	// Set static folder
	app.use(express.static('client/build'));

	app.get('*', (req, res) => {
		res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
	})
}

//***************** ENDPOINTS */

//By Feed
app.post('/retrieve/feed', (req, res) => {
	getSubs(req.body.currentID).then(subsIDs => {
		subsIDs.subscriptions ?
			getFeed(subsIDs.subscriptions).then(posts => {
				posts.map(post => {
					post.date = new Date(post.date)
				})
				res.send(posts)
			})
			:
			res.send("empty")
	})
})

//By Feed && YourPosts
app.post('/openPDF', (req, res) => {
	comeFile(req.body.postID).then(pdf => {
		fs.writeFile("output.pdf", pdf.data.buffer, (err) => {
			const pdfToSend = fs.createReadStream("./output.pdf");
			pdfToSend.pipe(res)
		})
	}).catch(console.dir)
})

//By YourPosts
app.post('/GetProfile', (req, res) => {
	getSubs(req.body.currentID).then(user => {
		res.send(user)
	})
})

//By YourPosts
app.post('/retrieve', (req, res) => {
	yourPosts(req.body.userID).then(info => {
		if (info == "empty"){
			res.send(info)
		} else {
			info.map(post => {
				post.date = new Date(post.date)
			})
			res.send(info)
		}
	}).catch(console.dir)
})

//By YourPosts
app.post('/RetrieveAnonPosts', (req, res) => {
	yourAnonPosts().then(info => {
		if (info == "empty"){
			res.send(info)
		} else {
			info.map(post => {
				post.date = new Date(post.date)
			})
			res.send(info)
		}
	}).catch(console.dir)
})

//By Users
app.post('/GetSubs/GetUsersTest', (req, res) => {
	getSubs(req.body.currentID).then(users1 => {
		getUsers().then(users2 => {
			if (users1.subscriptions) {
				users1.subscriptions.map(sub => {
					const sources = users2.filter(userInstance => {
						userInstance.loading = false;
						if (sub.id == userInstance._id) {
							return true
						} else {
							return false
						}
					}).map(subscribedTo => {
						subscribedTo.currentUserSubscribed = true;
					})
				})
			}
			res.send(users2)
		})
	}).catch(console.dir)
})

//By Subscriptions && Users
app.post('/Subscriptions/Add', (req, res) => {
	if (req.body.isCurrentlySubscribed) {
		deleteSubscription(req.body.currentID, req.body.subscribeToID)
			.then(subscriptionUpdated => {
				res.send(subscriptionUpdated)
			})
	} else {
		checkSubscription(req.body.currentID, req.body.subscribeToID).then(checked => {
			checked ? (
				console.log(checked)
			) : (
				addSubscription(req.body.currentID, req.body.subscribeToID, req.body.subscribeToName, req.body.subscribeToPicture)
					.then(subscriptionUpdated => {
						res.send(subscriptionUpdated)
					})
					.catch(console.dir)
			)
		})
	}
})

//By Subscriptions
app.post('/GetSubs', (req, res) => {
	getSubs(req.body.currentID).then(users => {
		users.subscriptions.map(user => {
			user.currentUserSubscribed = true;
			user.loading = false;
		})
		res.send(users.subscriptions)
	}).catch(console.dir)
})

//By Login
app.post('/AuthDB', (req, res) => {
	checkUser(req.body.auth.userInfo.email).then(received => {
		received ? (
			res.send(received)
		) : (
			registerUser(req.body.auth.userInfo).then(registeredUser => {
				res.send(registeredUser);
			})
		)
	})
})

//By UserDetail
app.post('/post/file', (req, res) => {
	let journal = {}
	journal = req.files.file
	if (req.body.randomUser == "true") {
		journal.randomUser = "true"
		journal.temporary = "true"
	}
	journal._id = uuidv4();
	journal._userID = req.body.userID
	journal._userName = req.body.userName
	journal._userPictureUrl = req.body.userPictureUrl
	journal.date = Date.now()
	//runFile(req.files.file).catch(console.dir);
	runFile(journal).catch(console.dir);
})

//By Login
app.post('/demoUser', (req, res) => {
	createDemoUser(req.body.currentID).then(thing => {
		res.send(thing)
	}).catch(console.dir)
})

//By SideBar
app.post('/LogOutDemo', (req, res) => {
	deleteUser(req.body.currentID).then(thing => {
		res.send(thing)
	}).catch(console.dir)
})

//*************************************************************************FUNCTIONS */



//By SideBar
async function deleteUser(userID) {
	const client = await new MongoClient(uri);
	try {
		await client.connect();
		const database = client.db('test1');
		const usersCollection = database.collection('users');
		const productsCollection = database.collection('products');
		const product = await usersCollection.deleteOne({_id: userID});
		const product2 = await productsCollection.deleteMany({temporary: "true" });
		return product
	} finally {
		await client.close();
	}
}

//By Login
async function createDemoUser(userID) {
	const setUser = {
		_id: userID,
		name: "Demo UserName",
		email: "this_is_your_email@email.com",
		pictureUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=870&q=80",
		subscriptions: [
			{
				id:"d8598b98-aaa2-4957-bcc5-8fb62c0e3d44",
				name: "Juliet Santiago",
				pictureUrl: "https://cdn.pixabay.com/photo/2018/01/15/07/51/woman-3083377_960_720.jpg"
			},
			{
				id:"faf2edfb-9c3c-4d71-85d1-0321d7ec9241",
				name: "Troy Schmidt",
				pictureUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=580&q=80"
			},
			{
				id:"ae967988-d81a-4bcb-a0be-e6065c71fee3",
				name: "Lainey Luna",
				pictureUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=870&q=80"
			},
			{
				id:"170692fb-7eef-4fa1-8246-1e4c028905ca",
				name: "Tamia Leblanc",
				pictureUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=580&q=80"
			},
			{
				id:"4201c4f9-4fec-466e-bdf1-7caed44cbb50",
				name: "Erica Rollins",
				pictureUrl: "https://images.unsplash.com/photo-1529758146491-1e11fd721f77?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=387&q=80"
			},
			{
				id:"2e205fdf-58e3-4a95-9afb-a98deb8308f1",
				name: "Cameron Stevens",
				pictureUrl: "https://images.unsplash.com/photo-1541290431335-1f4c2152e899?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=387&q=80"
			},
			{
				id:"192dc769-f93d-4b1b-a55d-a1eb7eb587aa",
				name: "Silas Owens",
				pictureUrl: "https://cdn.pixabay.com/photo/2020/05/09/13/29/photographer-5149664_960_720.jpg"
			},
			{
				id:"3def3996-1098-432f-9bd3-7fe31dc2507b",
				name: "Hudson Taylor",
				pictureUrl: "https://images.unsplash.com/photo-1532074205216-d0e1f4b87368?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=441&q=80"
			},
			{
				id:"adbc6c8b-efc8-4e3c-9092-c855dbf5e4af",
				name: "Jordan Haney",
				pictureUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=387&q=80"
			},
			{
				id:"ae642edf-401b-4c6c-98c6-1a52514a6ad2",
				name: "Terrence Glass",
				pictureUrl: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80"
			}
		]
	}
	const client = await new MongoClient(uri);
	try {
		await client.connect();
		const database = client.db('test1');
		const usersCollection = database.collection('users');
		//const filter = { email: "this_is_your_email@email.com" }
		//const change = { $set : { _id: userID }};
		//const options = {}
		//const product = await usersCollection.updateOne(filter, change, options);
		//console.log("lets go")
		//const product = await usersCollection.insertMany(createUsers)
		const product = await usersCollection.insertOne(setUser); 
		/*const productCollection = database.collection('products');
		const product2 = await productCollection.insertMany*/
		return product
	} finally {
		await client.close();
	}
}

//By Feed
async function getSubs(currentID) {
	const client = await new MongoClient(uri);
	try {
		await client.connect();
		const database = client.db('test1');
		const usersCollection = database.collection('users');
		let users = await usersCollection.findOne({ '_id': currentID });
		let usersReady = []
		users == undefined ? users = {} : null
		return (users)
	} finally {
		await client.close();
	}
}

//By Feed
async function getFeed(subs) {
	let subsID = subs.map(subscription => {
		return subscription.id
	})
	const client = await new MongoClient(uri);
	try {
		await client.connect();
		const database = client.db('test1');
		const products = database.collection('products');
		const product = await products.find({ _userID: { $in: subsID } })
		if ((await product.count()) === 0) {
		}
		let data = []
		await product.forEach(el => data.push(el));
		return data
	} finally {
		await client.close();
	}
}

//By Feed && YourPosts
//Used by /retrieve/file and both from Feed UI
async function comeFile(postID) {
	const client = await new MongoClient(uri);
	try {
		await client.connect();
		const database = client.db('test1');
		const products = database.collection('products');
		const product = await products.findOne({ _id: postID })
		return product;
	} finally {
		await client.close();
	}
}

//By YourPosts
async function yourPosts(userID) {
	const client = await new MongoClient(uri);
	try {
		await client.connect();
		const database = client.db('test1');
		const products = database.collection('products');
		const product = await products.find({ _userID: userID });
		if ((await product.count()) === 0) {
			return ("empty")
		}
		let data = []
		await product.forEach(el => data.push(el));
		return data
	} finally {
		await client.close();
	}
}

//By YourPosts
async function yourAnonPosts() {
	const client = await new MongoClient(uri);
	try {
		await client.connect();
		const database = client.db('test1');
		const products = database.collection('products');
		const product = await products.find({ randomUser: "true" });
		if ((await product.count()) === 0) {
			return ("empty")
		}
		let data = []
		await product.forEach(el => data.push(el));
		return data
	} finally {
		await client.close();
	}
}
//By Users
async function getUsers() {
	const client = await new MongoClient(uri);
	try {
		await client.connect();
		const database = client.db('test1');
		const usersCollection = database.collection('users');
		const users = await usersCollection.find();
		if ((await users.count()) === 0) {
		}
		let usersReady = []
		await users.forEach(el => usersReady.push(el));
		return usersReady
	} finally {
		await client.close();
	}
}

//By Subscriptions && Users
async function addSubscription(currentUser, subscribeToID, subscribeToName, subscribeToPicture) {
	const client = await new MongoClient(uri);
	try {
		await client.connect();
		const database = client.db('test1');
		const usersCollection = database.collection('users');
		const filter = { _id: currentUser }
		const add = { $push: { subscriptions: { "id": subscribeToID, "name": subscribeToName, "pictureUrl": subscribeToPicture } } };
		const options = {}
		const op = await usersCollection.updateOne(filter, add, options);
		return op
	} finally {
		await client.close();
	}
}

//By Subscriptions && Users
async function deleteSubscription(currentUser, UnsubscribeToID) {
	const client = await new MongoClient(uri);
	try {
		await client.connect();
		const database = client.db('test1');
		const usersCollection = database.collection('users');
		const filter = { _id: currentUser }
		const add = { $pull: { subscriptions: { "id": UnsubscribeToID } } };
		const options = {}
		const op = await usersCollection.updateOne(filter, add, options);
		return op
	} finally {
		await client.close();
	}
}

//By Subscriptions && Users
async function checkSubscription(currentUser, subscribeToID) {
	const client = await new MongoClient(uri);
	if (currentUser == subscribeToID) {
		return true
	}
	try {
		await client.connect();
		const database = client.db('test1');
		const products = database.collection('users');
		const product = await products.findOne({ '_id': currentUser, 'subscriptions.id': subscribeToID });
		if (product) {
			return product;
		} else {
			return false
		}
	} finally {
		await client.close();
	}
}

//By UserDetail
async function runFile(data) {
	const client = await new MongoClient(uri);
	try {
		await client.connect();
		const database = client.db('test1');
		const products = database.collection('products');
		const write = data;
		const product = await products.insertOne(write);
	} finally {
		await client.close();
	}
}

//By Login
async function checkUser(userEmail) {
	const client = await new MongoClient(uri);
	try {
		await client.connect();
		const database = client.db('test1');
		const products = database.collection('users');
		const product = await products.findOne({ "email": userEmail });
		if (product) {
			await client.close();
			return product
		} else {
			await client.close();
			return false
		}
	} catch (err) {
		await client.close();
		console.log(err)
	}
}

//By Login
async function registerUser(user) {
	const client = await new MongoClient(uri);
	try {
		await client.connect();
		const database = client.db('test1');
		const usersCollection = database.collection('users');
		const newUser = user;
		const product = await usersCollection.insertOne(newUser);
		return product
	} finally {
		await client.close();
	}
}

/*
const createUsers = [
	{
		_id: uuidv4(),
		name: "Silas Owens",
		pictureUrl: "https://cdn.pixabay.com/photo/2020/05/09/13/29/photographer-5149664_960_720.jpg",
		email: "Silas-Owens@email.com"
	},
	{
		_id: uuidv4(),
		name: "Juliet Santiago",
		pictureUrl: "https://cdn.pixabay.com/photo/2018/01/15/07/51/woman-3083377_960_720.jpg",
		email: "Juliet-Santiago@email.com"
	},
	{
		_id: uuidv4(),
		name: "Madilyn Cherry",
		pictureUrl: "https://cdn.pixabay.com/photo/2018/08/28/13/29/avatar-3637561_960_720.png",
		email: "Madilyn-Cherry@email.com"
	},
	{
		_id: uuidv4(),
		name: "Troy Schmidt",
		pictureUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=580&q=80",
		email: "Troy-Schmidt@email.com"
	},
	{
		_id: uuidv4(),
		name: "Camila Rubio",
		pictureUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=870&q=80",
		email: "Camila-Rubio@email.com"
	},
	{
		_id: uuidv4(),
		name: "Kayden Cunningham",
		pictureUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80",
		email: "Kayden-Cunningham@email.com"
	},
	{
		_id: uuidv4(),
		name: "Seamus Stanton",
		pictureUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=387&q=80",
		email: "Seamus-Stanton@email.com"
	},
	{
		_id: uuidv4(),
		name: "Jordan Haney",
		pictureUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=387&q=80",
		email: "Jordan-Haney@email.com"
	},
	{
		_id: uuidv4(),
		name: "Lainey Luna",
		pictureUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=870&q=80",
		email: "Lainey-Luna@email.com"
	},
	{
		_id: uuidv4(),
		name: "Terrence Glass",
		pictureUrl: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80",
		email: "Terrence-Glass@email.com"
	},
	{
		_id: uuidv4(),
		name: "Wesley Moreno",
		pictureUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=580&q=80",
		email: "Wesley-Moreno@email.com"
	},
	{
		_id: uuidv4(),
		name: "Tamia Leblanc",
		pictureUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=580&q=80",
		email: "Tamia-Leblanc@email.com"
	},
	{
		_id: uuidv4(),
		name: "Bryant Byrd",
		pictureUrl: "https://images.unsplash.com/photo-1528763380143-65b3ac89a3ff?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=389&q=80",
		email: "Bryant-Byrd@email.com"
	},
	{
		_id: uuidv4(),
		name: "Jorden Yates",
		pictureUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=870&q=80",
		email: "Jorden-Yates@email.com"
	},
	{
		_id: uuidv4(),
		name: "Tara Cochran",
		pictureUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=387&q=80",
		email: "Tara-Cochran@email.com"
	},
	{
		_id: uuidv4(),
		name: "Maxwell Franco",
		pictureUrl: "https://images.unsplash.com/photo-1474176857210-7287d38d27c6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
		email: "Maxwell-Franco@email.com"
	},
	{
		_id: uuidv4(),
		name: "Aryana Bradford",
		pictureUrl: "https://images.unsplash.com/photo-1531256456869-ce942a665e80?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=387&q=80",
		email: "Aryana-Bradford@email.com"
	},
	{
		_id: uuidv4(),
		name: "Dane Stein",
		pictureUrl: "https://images.unsplash.com/photo-1531727991582-cfd25ce79613?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80",
		email: "Dane-Stein@email.com"
	},
	{
		_id: uuidv4(),
		name: "Ally Marshall",
		pictureUrl: "https://images.unsplash.com/photo-1517070208541-6ddc4d3efbcb?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=387&q=80",
		email: "Ally-Marshall@email.com"
	},
	{
		_id: uuidv4(),
		name: "Cloe Walters",
		pictureUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=848&q=80",
		email: "Cloe-Walters@email.com"
	},
	{
		_id: uuidv4(),
		name: "Erica Rollins",
		pictureUrl: "https://images.unsplash.com/photo-1529758146491-1e11fd721f77?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=387&q=80",
		email: "Erica-Rollins@email.com"
	},
	{
		_id: uuidv4(),
		name: "Lamar Blanchard",
		pictureUrl: "https://images.unsplash.com/photo-1522228115018-d838bcce5c3a?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=387&q=80",
		email: "Lamar-Blanchard@email.com"
	},
	{
		_id: uuidv4(),
		name: "Cameron Stevens",
		pictureUrl: "https://images.unsplash.com/photo-1541290431335-1f4c2152e899?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=387&q=80",
		email: "Cameron-Stevens@email.com"
	},
	{
		_id: uuidv4(),
		name: "Jorge Gaines",
		pictureUrl: "https://images.unsplash.com/photo-1520223297779-95bbd1ea79b7?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=773&q=80",
		email: "Jorge-Gaines@email.com"
	},
	{
		_id: uuidv4(),
		name: "Hudson Taylor",
		pictureUrl: "https://images.unsplash.com/photo-1532074205216-d0e1f4b87368?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=441&q=80",
		email: "Hudson-Taylor@email.com"
	},
	{
		_id: uuidv4(),
		name: "Ibrahim Sims",
		pictureUrl: "https://images.unsplash.com/photo-1605993439219-9d09d2020fa5?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=387&q=80",
		email: "Ibrahim-Sims@email.com"
	},
	{
		_id: uuidv4(),
		name: "Diego Archer",
		pictureUrl: "https://images.unsplash.com/photo-1525357816819-392d2380d821?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=774&q=80",
		email: "Diego-Archer@email.com"
	},
	{
		_id: uuidv4(),
		name: "Brooklynn Lozano",
		pictureUrl: "https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=387&q=80",
		email: "Brooklynn-Lozano@email.com"
	},
	{
		_id: uuidv4(),
		name: "Kadyn Pope",
		pictureUrl: "https://images.unsplash.com/photo-1533689476487-034f57831a58?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=871&q=80",
		email: "Kadyn-Pope@email.com"
	},
	{
		_id: uuidv4(),
		name: "Micah Vincent",
		pictureUrl: "https://images.unsplash.com/photo-1520295187453-cd239786490c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=388&q=80",
		email: "Micah-Vincent@email.com"
	},
	{
		_id: uuidv4(),
		name: "Tara Sloan",
		pictureUrl: "https://images.unsplash.com/photo-1530268729831-4b0b9e170218?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
		email: "Tara-Sloan@email.com"
	}
]
const product = await usersCollection.insertMany(createUsers)
*/