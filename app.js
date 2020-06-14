const express = require("express");
const fs = require("fs"); 
const axios = require("axios")
const ejs = require("ejs");
const parser = require('ua-parser-js');
let app = express();


let allow = (req , res , next) => {
	let ua = parser(req.headers['user-agent'])
	if (!ua.browser.name || !ua.os.name) res.status(400).send("FAIL")
	else next();
}


app.use(allow)

let header = fs.readFileSync("./head.html" , "utf8");

function setLetter(text){
	let s = "";
	if (text == undefined) return
	s += text[0].toUpperCase();
	for(let i = 1; i<text.length; i++){
		s += text[i].toLowerCase();
	}
	return s;
}
//apikey 49IHyG0NKyBbydz6hZ9YAN:4MnYcl5y7F2G7I6tpYvpVs
function combineWords(text){
	let s = "";
	let i = 0;
	while(i<text.length){
			if (text[i] == " ") {
				 i++; 
				continue;
			}
			s += text[i];

			i++;
	}
	return s;

}

function setURL(s){
	return combineWords(s).toLowerCase();
}


function render(responseObject , path , data) {
	ejs.renderFile("./Views/" + path + ".ejs" , data)
		.then(r => responseObject.send(r))
		.catch(e => console.log(e))
}

app.use("/public" , express.static("public"))

app.set("view engine" , "ejs");

var dataAttach = [];
var data;

var total;










app.get("/" , (req , res) => {
	
	axios.get("https://api.collectapi.com/corona/totalData" , {
		headers : {
			authorization: "apikey 49IHyG0NKyBbydz6hZ9YAN:4MnYcl5y7F2G7I6tpYvpVs"
		}
	}).then(response => {
		total = response.data.result;
		render(res , "rootIndex" , {
			totalCases : total.totalCases,
			totalDeaths : total.totalDeaths,
			activeCases : total.activeCases,
			Recovered : total.totalRecovered,
			newCases : total.newCases,
			newDeaths : total.newDeaths,
			header : header

		})
	}).catch(err => {
		console.log("HATA : " + err)
	})
		
})







app.get("/statistics" , (req ,res) => {
	axios.get("https://api.collectapi.com/corona/countriesData" , {
		headers : {
			authorization: "apikey 0Ctx6Fh5yZ84070d8XvedK:7N1ERgOQuQddEdVIzoVLv1"
		}
	}).then(response => {
		data = response.data.result
		render(res , "main" , {data : data , url : setURL , header:header})
	})

})




app.get("/statistics/:country" , (req , res) => {
	var country = req.params.country;
	
	axios.get("https://api.collectapi.com/corona/countriesData" , {
		headers : {
			authorization : "apikey 0Ctx6Fh5yZ84070d8XvedK:7N1ERgOQuQddEdVIzoVLv1"
		}
	}).then(reponse => {
		let data = reponse.data.result;
		let f;
		data.forEach(c => {
			if (setLetter(country) == c.country || country.toUpperCase() == c.country || country == setURL(c.country)) {
				f = true;
				render(res , "check" , {c : c   ,header : header})
			}
		})
		if (!f) res.send("ÜLKE BULUNAMADI")
	}).catch(err => console.log("CATCHED : "  + err))
})


app.get("/news" , (req , res) => {
	function getDay(d){
		new Date(d).getDay();
	}

	axios.get("https://api.collectapi.com/corona/coronaNews" , {
		headers : {
			authorization: "apikey 49IHyG0NKyBbydz6hZ9YAN:4MnYcl5y7F2G7I6tpYvpVs"
		}
	}).then(response => {
		
		
		render(res , "news" , {news : response.data.result , header : header , getDay : getDay});
	})

	// res.render(res , "news" , {news : news , header : header});
})


app.post("/log" , (req , res) => {
	let {path , ip} = req.body;
	let log = `
		ip : ${ip}
		path : ${path}
	`
	fs.appendFile(__dirname  + '/logs' , log);
})

app.get("/*" , (req , res) => {
	res.status(404).send("SAYFA BULUNAMADI...");
})

app.listen(process.env.PORT || 3000);
