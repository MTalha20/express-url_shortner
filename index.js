require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require("body-parser");
const dns = require("dns");

// Basic Configuration
const port = process.env.PORT || 3000;
const urls = []

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint

app.use("/", function(req,res,next){
  let url = req.originalUrl;
  let method = req.method;
  console.log(`${method} -- ${url}`);
  next();
});

app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.use(bodyParser.urlencoded({extended: false}));

app.post("/api/shorturl",(req,res)=>{
  let url = req.body.url;
  console.log(`url: ${url}`);
  const REPLACE_REGEX = /^https?:\/\//i
  if(!REPLACE_REGEX.test(url)){
    return res.json({error: "invalid url"});
  }
  const new_url = new URL(url).href;
  
  dns.lookup(new URL(url).hostname, (err,address,family)=>{
    if(err){
      console.log(err);
      res.json({message: "invalid_url"});
      return;
    };
    console.log(`address is ${address} and family ${family}`);
    let url_length = urls.length;
    urls.push(new_url);
    console.log(urls);
    res.json({"original_url": url, "short_url": url_length});
  });
});

app.get("/api/shorturl/:short_url", (req,res)=>{
  let url = parseInt(req.params.short_url);
  console.log(`directed url: ${url}`);
  let url_length = urls.length;
  if(url > url_length){
    return res.json({error: "url not found"});
  } 
  let found_url = urls[url];
  console.log(found_url);
  return res.redirect(302, found_url);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
