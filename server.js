const express = require("express")
const app = express();
const fs = require("fs");
const web = require('ws')
const serverConfig = require("./serverConfig")
var temp;
arr = [];
var bufferData = fs.readFileSync("./data.json");
var data = JSON.parse(bufferData.toString());
var pollValidate;
var a;
app.set("views", __dirname + "/views")
app.set("view engine", "ejs")
app.use("/public", express.static(__dirname + "/public"))

app.use("/admin", (req, res, next) => {
	pollValidate = req.query.id;
	a = data.filter((data) => data.poll_id == pollValidate)

	if ((a.length > 0) && (req.query.username == a[0].admin) && (req.query.passkey == a[0].admin_passkey)) {
		next()
	} else {
		console.log("unvalidate")
		res.render("error/error", { title: "ERROR!!" })
	}

})

app.use("/client", (req, res, next) => {

	if (a) {
		if ((req.query.id == a[0].poll_id) && (req.query.username == a[0].client_id) && (req.query.passkey == a[0].client_passkey)) {

			next()
		} else {
			res.render("error/error", { title: "ERROR!!" })
		}
	} else {
		res.render("error/pollstatus", { title: "ERROR!!" })
	}

})


app.listen(serverConfig.port, (req, res) => {
	console.log(serverConfig.message)
})

app.get("/", (req, res, next) => {
	res.render("home/home", { title: "Home" })
})

app.get("/admin", (req, res, next) => {
	res.render("admin/admin", { title: "Admin" })
})

app.get("/client", (req, res, next) => {
	res.render("client/client", { title: "Client" })
})
app.get("/fetch", (req, res) => {

	res.json(JSON.parse(JSON.stringify(arr)));

})
app.get("/*", (req, res, next) => {
	res.render("error/404", { title: "Page Not Found!!" })
})
//server send to all client
const wss = new web.WebSocketServer({ port: 8080 });
wss.on('connection', function connection(ws) {

	ws.on('error', console.error);
	ws.on('message', function message(data, isBinary) {
		arr = []

		wss.clients.forEach(function each(client) {

			client.send(data, { binary: isBinary });

		});
	});
});

//all client sending their data to server

const dt = new web.WebSocketServer({ port: 8081 });
dt.on('connection', function connection(ws) {

	ws.on('error', console.error);
	ws.on('message', function message(data, isBinary) {
		temp = data.toString();
		arr.push(temp)
	});
});
