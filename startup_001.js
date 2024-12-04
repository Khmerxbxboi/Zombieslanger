let stockPrice = 0;
let sentimentData = {
  positive: 0,
  negative: 0,
  neutral: 0
};

let stockSymbol = 'AAPL';  // Default stock symbol (Apple)
let apiKey = 'YOUR_ALPHAVANTAGE_API_KEY'; // API key for stock data
let sentimentAPI = 'YOUR_SENTIMENT_API_KEY'; // API for sentiment analysis (can be a dummy here)
let newsAPI = 'YOUR_NEWSAPI_KEY';  // News API key for fetching headlines

let input; // Input field for stock symbol
let submitButton; // Button to submit the stock symbol search
let newsArticles = []; // Array to store fetched news headlines
let priceHistory = []; // Array to store stock prices over time for charting

function setup() {
  createCanvas(800, 600);
  frameRate(30);  // Update every 30 frames
  textAlign(CENTER, CENTER);

  // Center input field and button
  let inputWidth = 150;
  let buttonWidth = 80;
  let centerX = width / 2 - (inputWidth + buttonWidth + 10) / 2;
  
  // Create input field for stock symbol
  input = createInput(stockSymbol);  // Default value is AAPL
  input.position(centerX, 60);
  input.size(inputWidth);

  // Create search button
  submitButton = createButton('Search');
  submitButton.position(input.x + input.width + 10, 60);
  submitButton.size(buttonWidth, 30);
  submitButton.mousePressed(onSearchButtonClicked);

  loadStockData();  // Load initial stock data
  loadTweets();     // Load initial tweets for sentiment analysis
  loadNews();       // Fetch news from Yahoo, CNN, etc.
}

function draw() {
  background(240);

  // Title
  textSize(32);
  fill(0);
  text('Data Market Sentiment', width / 2, 40);

  // Stock Price
  textSize(24);
  text(`Stock: ${stockSymbol}`, width / 2, 100);
  text(`Price: $${stockPrice.toFixed(2)}`, width / 2, 140);

  // Display News Sentiment
  displayNewsSentiment(newsArticles);

  // Display the 3D-like Stock Price Graph
  displayStockPriceGraph(priceHistory);

  // Display Emotion Bar
  displayEmotionBar();

  // Display Sentiment Text
  displaySentimentText(sentimentData);
}

function onSearchButtonClicked() {
  // Get the value from the input field
  let newStockSymbol = input.value().toUpperCase().trim();

  // If the user enters a valid stock symbol, update the stock data
  if (newStockSymbol && newStockSymbol !== stockSymbol) {
    stockSymbol = newStockSymbol;
    priceHistory = [];  // Reset price history
    loadStockData();  // Load stock data for the new symbol
    loadTweets();     // Load new tweets for sentiment analysis
    loadNews();       // Fetch new news for sentiment analysis
    sentimentData = { positive: 0, negative: 0, neutral: 0 }; // Reset sentiment counts
    newsArticles = []; // Reset news articles
  }
}

function loadStockData() {
  let url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${stockSymbol}&interval=5min&apikey=${apiKey}`;
  loadJSON(url, updateStockData);
}

function updateStockData(data) {
  if (data['Time Series (5min)']) {
    let timeSeries = data['Time Series (5min)'];
    let times = Object.keys(timeSeries);
    let latestTime = times[0];
    let price = float(timeSeries[latestTime]['4. close']);
    stockPrice = price;

    // Update price history (for graphing)
    if (priceHistory.length >= 20) {  // Keep last 20 points for smoother graph
      priceHistory.shift();
    }
    priceHistory.push(price);
  } else {
    stockPrice = 0; // Handle error or no data
    console.log("Error: Stock data not available");
  }
}

function loadTweets() {
  let query = `https://api.twitter.com/2/tweets/search/recent?query=${stockSymbol}`;
  fetch(query, {
    headers: {
      'Authorization': `Bearer ${sentimentAPI}`
    }
  })
  .then(response => response.json())
  .then(tweets => analyzeTweets(tweets))
  .catch(error => console.log("Error loading tweets: ", error));
}

function analyzeTweets(tweets) {
  sentimentData = { positive: 0, negative: 0, neutral: 0 }; // Reset sentiment counts
  if (tweets.data) {
    tweets.data.forEach(tweet => {
      let sentiment = analyzeSentiment(tweet.text);
      sentimentData[sentiment]++;
    });
  } else {
    console.log("No tweets found for sentiment analysis");
  }
}

function analyzeSentiment(text) {
  // Sentiment analysis logic (simple keyword matching)
  if (text.includes('good') || text.includes('up') || text.includes('positive')) {
    return 'positive';
  } else if (text.includes('bad') || text.includes('down') || text.includes('negative')) {
    return 'negative';
  } else {
    return 'neutral';
  }
}

function loadNews() {
  // Fetch news articles from NewsAPI
  let url = `https://newsapi.org/v2/everything?q=${stockSymbol}&apiKey=${newsAPI}`;
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.articles) {
        newsArticles = data.articles;
        analyzeNewsSentiment(newsArticles);
      }
    })
    .catch(error => console.log("Error loading news: ", error));
}

function analyzeNewsSentiment(articles) {
  sentimentData = { positive: 0, negative: 0, neutral: 0 }; // Reset sentiment counts
  articles.forEach(article => {
    let sentiment = analyzeSentiment(article.title);
    sentimentData[sentiment]++;
  });
}

function displayNewsSentiment(articles) {
  // Display the sentiment of each news headline
  textSize(18);
  let yPos = 200;
  
  articles.forEach((article, index) => {
    let sentiment = analyzeSentiment(article.title);
    let color;

    if (sentiment === 'positive') {
      color = color(0, 255, 0);  // Green for positive news
    } else if (sentiment === 'negative') {
      color = color(255, 0, 0);  // Red for negative news
    } else {
      color = color(150);  // Gray for neutral news
    }

    fill(color);
    text(article.title, width / 2, yPos + index * 40);
    displaySentimentBar(sentiment, yPos + index * 40);
  });
}

function displaySentimentBar(sentiment, yPos) {
  // Display a color bar based on sentiment
  let barWidth = 200;
  let barHeight = 20;
  let xPos = width / 2 - barWidth / 2;

  if (sentiment === 'positive') {
    fill(0, 255, 0); // Green for positive
  } else if (sentiment === 'negative') {
    fill(255, 0, 0); // Red for negative
  } else {
    fill(150); // Gray for neutral
  }

  rect(xPos, yPos + 20, barWidth, barHeight);
}

function displayEmotionBar() {
  // Display overall emotion bar based on sentimentData
  let totalSentiment = sentimentData.positive + sentimentData.negative + sentimentData.neutral;
  let positiveBarWidth = map(sentimentData.positive, 0, totalSentiment, 0, width);
  let negativeBarWidth = map(sentimentData.negative, 0, totalSentiment, 0, width);
  let neutralBarWidth = map(sentimentData.neutral, 0, totalSentiment, 0, width);

  // Position and size of the overall emotion bar
  let barHeight = 30;
  let yPos = height - 50;

  // Display positive, negative, and neutral bars
  fill(0, 255, 0);  // Green for positive
  rect(0, yPos, positiveBarWidth, barHeight);
  
  fill(255, 0, 0);  // Red for negative
  rect(positiveBarWidth, yPos, negativeBarWidth, barHeight);
  
  fill(150);  // Gray for neutral
  rect(positiveBarWidth + negativeBarWidth, yPos, neutralBarWidth, barHeight);
}

function displaySentimentText(data) {
  textSize(18);
  fill(0);
  text(`Positive: ${data.positive}`, width / 2, 400);
  text(`Negative: ${data.negative}`, width / 2, 430);
  text(`Neutral: ${data.neutral}`, width / 2, 460);
}

function displayStockPriceGraph(prices) {
  // 3D-style price graph visualization
  let graphWidth = 600;
  let graphHeight = 200;
  let xPos = (width - graphWidth) / 2;
  let yPos = height - 150;

  // Draw background grid
  stroke(200);
  for (let i = 0; i <= graphWidth; i += 50) {
    line(xPos + i, yPos, xPos + i, yPos - graphHeight);
  }

  // Draw 3D-like effect
  for (let i = 0; i < prices.length - 1; i++) {
    let x1 = map(i, 0, prices.length - 1, xPos, xPos + graphWidth);
    let x2 = map(i + 1, 0, prices.length - 1, xPos, xPos + graphWidth);

    let y1 = map(prices[i], min(prices), max(prices), yPos, yPos - graphHeight);
    let y2 = map(prices[i + 1], min(prices), max(prices), yPos, yPos - graphHeight);

    let depth = map(i, 0, prices.length - 1, 5, 0); // Simulate depth for 3D effect
    let alpha = map(depth, 0, 5, 255, 50);

    stroke(0, 0, 255, alpha);
    line(x1 + depth, y1 + depth, x2 + depth, y2 + depth);
  }
}
