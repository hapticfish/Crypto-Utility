package main

import (
	"encoding/json"
	"fmt"
	"github.com/PuerkitoBio/goquery"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"
)

const fetchTimeout = 30 * time.Second

var (
	lastFetchTimeCoinbase    time.Time
	lastFetchTimeTradingView time.Time
	lastFetchTimeBinanceUS   time.Time
	lastFetchTimeKraken      time.Time
	lastFetchTimeCUEX        time.Time
)

type FetchResult struct {
	Source string
	Price  float64
	Err    error
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func main() {
	http.HandleFunc("/ws", handleConnections)

	log.Println("HTTP server started on :8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
	}
	defer ws.Close()

	for {
		tickerData, err := fetchTickerData()
		if err != nil {
			log.Println("Error fetching ticker data:", err)
			continue
		}

		if err := ws.WriteJSON(tickerData); err != nil {
			log.Println("Error sending message:", err)
			break
		}

		time.Sleep(1 * time.Minute)
	}
}

func fetchTickerData() (map[string]float64, error) {
	resultsChan := make(chan FetchResult, 5)

	go fetchPrice("BTC-USD (Coinbase)", fetchFromCoinbase, resultsChan)
	go fetchPrice("BTC-USD (TradingView)", fetchFromTradingView, resultsChan)
	go fetchPrice("BTC-USD (BinanceUS)", fetchFromBinanceUS, resultsChan)
	go fetchPrice("BTC-USD (Kraken)", fetchFromKraken, resultsChan)
	go fetchPrice("ARS-USD (CUEX)", fetchFromCUEX, resultsChan)

	tickerData := make(map[string]float64)
	for i := 0; i < 5; i++ {
		result := <-resultsChan
		if result.Err != nil {
			log.Printf("Error fetching from %s: %v\n", result.Source, result.Err)
		} else if result.Price != 0 {
			tickerData[result.Source] = result.Price
		}
	}

	if len(tickerData) == 0 {
		return nil, fmt.Errorf("all data sources failed to fetch data")
	}

	return tickerData, nil
}

func fetchPrice(source string, fetchFunc func() (float64, error), resultsChan chan<- FetchResult) {
	timer := time.After(fetchTimeout)

	fetchChan := make(chan FetchResult, 1)
	go func() {
		price, err := fetchFunc()
		fetchChan <- FetchResult{Source: source, Price: price, Err: err}
	}()

	select {
	case result := <-fetchChan:
		resultsChan <- result
	case <-timer:
		resultsChan <- FetchResult{Source: source, Err: fmt.Errorf("fetch timed out")}
	}
}

func fetchFromCoinbase() (float64, error) {
	if time.Since(lastFetchTimeCoinbase) < 1*time.Minute {
		//Skip fetch if less than a min
		log.Println("INFO: Skipping fetch from Coinbase due to rate limit")
		return 0, nil
	}

	// Updated API endpoint for fetching the BTC-USD spot price
	url := "https://api.coinbase.com/v2/prices/BTC-USD/spot"

	// Make the HTTP GET request
	resp, err := http.Get(url)
	if err != nil {
		return 0, fmt.Errorf("error fetching from Coinbase: %v", err)
	}
	defer resp.Body.Close()

	// Check for non-200 status code
	if resp.StatusCode != http.StatusOK {
		return 0, fmt.Errorf("API request failed with status code: %d", resp.StatusCode)
	}

	// Updated struct to match the expected response format
	var result struct {
		Data struct {
			Amount string `json:"amount"`
		} `json:"data"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return 0, err
	}

	fmt.Println("Attempting to parse from CoinBase:", result.Data.Amount) // Example for Coinbase

	// Convert the string amount to a float
	amount, err := strconv.ParseFloat(result.Data.Amount, 64)
	if err != nil {
		return 0, err
	}

	lastFetchTimeCoinbase = time.Now()
	log.Println("Data successfully fetched from Coinbase")
	return amount, nil
}

func fetchFromTradingView() (float64, error) {

	if time.Since(lastFetchTimeTradingView) < 1*time.Minute {
		log.Println("INFO: Skipping fetch from TradingView due to rate limit")
		return 0, nil
	}

	url := "https://www.tradingview.com/symbols/BTCUSD/"

	// Make the HTTP GET request
	resp, err := http.Get(url)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	// Parse the HTML
	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return 0, err
	}

	// Find the price within the HTML
	var priceStr string
	doc.Find(".last-JWoJqCpY.js-symbol-last").Each(func(i int, s *goquery.Selection) {
		priceStr = s.Text()
		s.Children().Each(func(_ int, child *goquery.Selection) {
			priceStr += child.Text()
		})
	})
	if priceStr == "" {
		return 0, fmt.Errorf("unable to find price in TradingView response")
	}

	// Cleaning and converting the string to a float
	priceStr = strings.ReplaceAll(priceStr, ",", "")
	price, err := strconv.ParseFloat(priceStr, 64)
	if err != nil {
		return 0, fmt.Errorf("error parsing price '%s' from TradingView: %v", priceStr, err)
	}

	lastFetchTimeTradingView = time.Now()
	log.Println("Data successfully fetched from TradingView")
	return price, nil
}

func fetchFromBinanceUS() (float64, error) {

	if time.Since(lastFetchTimeBinanceUS) < 1*time.Minute {
		log.Println("INFO: Skipping fetch from binanceUS due to rate limit")
		return 0, nil
	}

	// Use the correct symbol as per Binance.US trading pairs
	url := "https://api.binance.us/api/v3/ticker/price?symbol=BTCUSD"

	// Make the HTTP GET request
	resp, err := http.Get(url)
	if err != nil {
		return 0, fmt.Errorf("error fetching from BinanceUS: %v", err)
	}
	defer resp.Body.Close()

	var result struct {
		Price string `json:"price"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return 0, err
	}

	if result.Price == "" {
		return 0, fmt.Errorf("empty price received from BinanceUS")
	}

	price, err := strconv.ParseFloat(result.Price, 64)
	if err != nil {
		return 0, fmt.Errorf("error parsing price '%s' from BinanceUS: %v", result.Price, err)
	}

	lastFetchTimeBinanceUS = time.Now()
	log.Println("Data successfully fetched from BinanceUS")
	return price, nil
}

func fetchFromKraken() (float64, error) {
	if time.Since(lastFetchTimeKraken) < 1*time.Minute {
		log.Println("INFO: Skipping fetch from Kraken due to rate limit")
		return 0, nil
	}

	// Kraken API endpoint for the BTC-USD ticker
	url := "https://api.kraken.com/0/public/Ticker?pair=XBTUSD"

	// Make the HTTP GET request
	resp, err := http.Get(url)
	if err != nil {
		return 0, fmt.Errorf("error fetching from Kraken: %v", err)
	}
	defer resp.Body.Close()

	// Define a struct to unmarshal the JSON data into
	var result struct {
		Result map[string]struct {
			C []string `json:"c"`
		} `json:"result"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return 0, err
	}

	if len(result.Result["XBTUSD"].C) == 0 || result.Result["XBTUSD"].C[0] == "" {
		return 0, fmt.Errorf("empty or invalid price data received from Kraken")
	}

	// Kraken returns the price in the first element of the 'c' array
	price, err := strconv.ParseFloat(result.Result["XBTUSD"].C[0], 64)
	if err != nil {
		return 0, fmt.Errorf("error parsing price '%s' from Kraken: %v", result.Result["XBTUSD"].C[0], err)
	}

	lastFetchTimeKraken = time.Now()
	log.Println("Data successfully fetched from Kraken")
	return price, nil
}

func fetchFromCUEX() (float64, error) {

	if time.Since(lastFetchTimeCUEX) < 1*time.Minute {
		log.Println("INFO: Skipping fetch from CUEX due to rate limit")
		return 0, nil
	}

	url := "https://cuex.com/en/usd-ars_pa"
	resp, err := http.Get(url)
	if err != nil {
		return 0, fmt.Errorf("error fetching from CUEX: %v", err)
	}
	defer resp.Body.Close()

	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return 0, err
	}

	var valueStr string
	// Use the classes from the button element to find the correct selector
	doc.Find("button.btn.btn-default.dropdown-toggle.exchange-dropdown.exchange-to-noborder").Each(func(i int, s *goquery.Selection) {
		valueStr = s.Text()
	})

	// The valueStr might contain additional text, so you need to extract just the numeric part
	re := regexp.MustCompile(`\d+\.\d+`)
	match := re.FindString(valueStr)
	if match == "" {
		return 0, fmt.Errorf("could not find a valid number in the string: %s", valueStr)
	}

	value, err := strconv.ParseFloat(match, 64)
	if err != nil {
		return 0, err
	}

	lastFetchTimeCUEX = time.Now()
	log.Println("Data successfully fetched from CUEX")
	return value, nil
}
