// canvas size
const SIZE = 0.80; // size of the canvas in relation to the screen (0 to 1)
let cnv;

const LONDON_LAT = "51.5073219";
const LONDON_LNG = "-0.1276474";
const LISBON_LAT = "38.736946";
const LISBON_LNG = "-9.142685";
const dates = ["2022-08-06", "2022-09-06", "2022-10-06", "2022-11-06", "2022-12-06", "2023-01-06", "2023-02-06"];

let offset = 50;

let londonColors;
let lisbonColors;
let alpha = 50;

let londonData = [];
let lisbonData = [];

let failedLoads = [];
let loaded = 0;

let maxTime = 28800; // == 8:00:00 PM   
let minTime = 10800; // == 3:00:00 PM

function setup() {
  updateCanvas();
  cnv.mouseClicked(handleMouseEvent);
  background(20);

  londonColors = [color(71, 18, 107, alpha), color(87, 16, 137, alpha), color(109, 35, 182, alpha), color(151, 58, 168, alpha),
                  color(172, 70, 161, alpha), color(192, 82, 153, alpha), color(213, 93, 146, alpha), color(234, 105, 139, alpha)]
  lisbonColors = [color(255, 123, 0, alpha), color(255, 136, 0, alpha), color(255, 149, 0, alpha), color(255, 162, 0, alpha),
                  color(255, 170, 0, alpha), color(255, 183, 0, alpha), color(255, 195, 0, alpha), color(255, 208, 0, alpha)]

  let londonURLs = getURLs(LONDON_LAT, LONDON_LNG);
  let lisbonURLs = getURLs(LISBON_LAT, LISBON_LNG);

  fetchData(londonURLs, 0, londonData);
  fetchData(lisbonURLs, 0, lisbonData);
}

function handleMouseEvent()
{
  background(20);
}
function fetchData(urls, index, array)
{
  if(index < urls.length)
  {
    let path = urls[index]; 

    fetch(path).then(function(response) {
      
      return response.json();

    }).then(function(data) {

      array.push(data.results.sunset);
      fetchData(urls, index+1, array)

    }).catch(function(err) {
      console.log(`Something went wrong: ${err}`);
    
      let failed = urls.splice(index,1);
      console.log(`Something went wrong with: ${failed}`);
      failedLoads.push(failed);// keep track of what failed
      fetchData(urls, index, array); // we do not increase by 1 because we spliced the failed one out of our array
    });
  
  }
  else
  {
    loaded++;
    if(loaded == 2)
      background(20)
    console.log(array);
  }
}

function getURLs(lat, lng)
{
  let url;
  let dataToFetch = [];
  for(date of dates){   
    url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=${date}`
    dataToFetch.push(url);
  }
  return dataToFetch; 
}

function draw() {
  
  if(loaded === 2)
  {
    if(random()>0.5)
    {
      drawSunset(lisbonData, getRandomFromArray(lisbonColors));
      drawSunset(londonData, getRandomFromArray(londonColors));
    }
    else 
    {
      drawSunset(londonData, getRandomFromArray(londonColors));
      drawSunset(lisbonData, getRandomFromArray(lisbonColors));
    }
      
  }
  else
  {
    // loading screen
    push();
    fill(255)
    textAlign(CENTER);
    textSize(30);
    text("Loading...", width/2, height/2);
    pop();
  }
}

function getRandomFromArray(array)
{
  let randomIndex = int(random(0, array.length));
  let randomValue = array[randomIndex];
  return randomValue;
}

function drawSunset(data, color)
{
  let convertedHours = convertHoursToSeconds(data);
  let randomTime = getRandomFromArray(convertedHours);

  let y = map(randomTime, minTime, maxTime, 0, height) + random(-offset, offset);

  push();
  stroke(color)
  strokeWeight(1)
  line(0, y, width, y);
  pop();
}

function convertHoursToSeconds(dataArray)
{
  let convertedArray = [];
  for(time of dataArray)
  {
    let onlyNumbers = time.split(" ")[0];
    let arrayOfTimes = onlyNumbers.split(":");
    let hours = int(arrayOfTimes[0]);
    let minutes = int(arrayOfTimes[1]);
    let seconds = int(arrayOfTimes[2]);
    convertedArray.push(hours*3600 + minutes*60 + seconds);
  }
  return convertedArray;
}

function convertSecondsToHour(number) { return number/3600; }

function updateCanvas() 
{
  cnv = createCanvas(windowWidth*SIZE, windowHeight*SIZE);
  cnv.parent("canvas-container");
  let x = (windowWidth - width) / 2;
  let y = (windowHeight - height) / 5 * 2;
  cnv.position(x, y);

  p5Div = document.getElementById("canvas-container");
  p5Div.setAttribute("style",`width:${width}px; height:${height}px`)
}

function windowResized() { updateCanvas(); }