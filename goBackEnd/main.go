package goBackEnd

import (
	"encoding/json"
	_ "encoding/json"
	"github.com/PuerkitoBio/goquery"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
	"strconv"
	_ "strconv"
	"time"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	// Upgrade initial GET request to a websocket
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
	}
	defer ws.Close()

	// Main loop for websocket
	for {
		// Fetch ticker data
		tickerData, err := fetchTickerData()
		if err != nil {
			log.Println("Error fetching ticker data:", err)
			continue
		}

		// Send latest ticker data to client
		if err := ws.WriteJSON(tickerData); err != nil {
			log.Println("Error sending message:", err)
			break
		}

		// Sleep for a specified duration before fetching new data
		time.Sleep(1 * time.Minute)
	}
}

func main() {
	http.HandleFunc("/ws", handleConnections) // Corrected the path and function name

	// Start the server on localhost port 8080
	log.Println("HTTP server started on :8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

func fetchTickerData() (map[string]float64, error) {
	// Fetch data from each API
	btcUsdCoinbase, err := fetchFromCoinbase()
	if err != nil {
		return nil, err
	}

	btcUsdTradingView, err := fetchFromTradingView()
	if err != nil {
		return nil, err
	}

	btcUsdBinanceUS, err := fetchFromBinanceUS()
	if err != nil {
		return nil, err
	}

	btcUsdKraken, err := fetchFromKraken()
	if err != nil {
		return nil, err
	}

	USDARSCUEX, err := fetchFromCUEX()
	if err != nil {
		return nil, err
	}

	tickerData := map[string]float64{
		"BTC-USD (Coinbase)":    btcUsdCoinbase,
		"BTC-USD (TradingView)": btcUsdTradingView,
		"BTC-USD (BinanceUS)":   btcUsdBinanceUS,
		"BTC-USD (Kraken)":      btcUsdKraken,
		"ARS-USD (CUEX)":        USDARSCUEX,
	}

	return tickerData, nil
}

func fetchFromCoinbase() (float64, error) {
	// Define the URL for the Coinbase API endpoint
	url := "https://api.coinbase.com/v2/prices/BTC-USD/spot"
	// Make the HTTP GET request
	resp, err := http.Get(url)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	// Parse the JSON response
	var result struct {
		Data struct {
			Amount string `json:"amount"`
		} `json:"data"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return 0, err
	}

	// Convert the string amount to a float
	amount, err := strconv.ParseFloat(result.Data.Amount, 64)
	if err != nil {
		return 0, err
	}

	return amount, nil
}

func fetchFromTradingView(symbol string) (float64, error) {
	// API endpoint - replace with the actual TradingView API endpoint
	url := "https://api.tradingview.com/v1/some_endpoint?symbol=" + symbol

	// Make the HTTP GET request
	resp, err := http.Get(url)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	// Define a struct to unmarshal the JSON data into
	var result struct {
		Price float64 `json:"price"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return 0, err
	}

	return result.Price, nil
}

func fetchFromBinanceUS(symbol string) (float64, error) {
	// API endpoint - replace with the actual Binance API endpoint
	url := "https://api.binance.us/api/v3/ticker/price?symbol=" + symbol

	// Make the HTTP GET request
	resp, err := http.Get(url)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	var result struct {
		Price string `json:"price"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return 0, err
	}

	price, err := strconv.ParseFloat(result.Price, 64)
	if err != nil {
		return 0, err
	}

	return price, nil
}

func fetchFromKraken(pair string) (float64, error) {
	// API endpoint - replace with the actual Kraken API endpoint
	url := "https://api.kraken.com/0/public/Ticker?pair=" + pair

	// Make the HTTP GET request
	resp, err := http.Get(url)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	var result struct {
		Result map[string]struct {
			C []string `json:"c"`
		} `json:"result"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return 0, err
	}

	price, err := strconv.ParseFloat(result.Result[pair].C[0], 64)
	if err != nil {
		return 0, err
	}

	return price, nil
}

func fetchFromCUEX() (float64, error) {
	url := "https://cuex.com/en/usd-ars_pa"
	resp, err := http.Get(url)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return 0, err
	}

	var valueStr string
	// Replace "your-selector-here" with the actual CSS selector
	doc.Find("your-selector-here").Each(func(i int, s *goquery.Selection) {
		valueStr = s.Text()
	})

	value, err := strconv.ParseFloat(valueStr, 64)
	if err != nil {
		return 0, err
	}

	return value, nil
}
