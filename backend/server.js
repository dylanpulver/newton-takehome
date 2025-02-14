const WebSocket = require('ws');
const http = require('http');
const axios = require('axios');


// Configuration
const CONFIG = {
    PRICE_UPDATE_INTERVAL: 1000,  // Update prices every 1000ms (1 second)
    MAX_PRICE_CHANGE: 0.5,        // Maximum price change of 50% (arbitrary but prevents extreme fluctuations)
    RECONNECT_INTERVAL: 5000,     // Reconnect WebSocket every 5000ms (5 seconds) if needed
    MAX_CONNECTIONS: 1000,        // Limit WebSocket connections to 1000 clients to avoid server overload
};

// Supported channels
const CHANNELS = {
    RATES: 'rates'
};

// Market state management
class MarketState {
    constructor() {
        this.baselinePrices = {};
        this.lastPrices = {};
        this.assets = [
            "BTC", "ETH", "LTC", "XRP", "BCH", "USDC", "XMR", "XLM", "USDT", "QCAD",
            "DOGE", "LINK", "MATIC", "UNI", "COMP", "AAVE", "DAI", "SUSHI", "SNX",
            "CRV", "DOT", "YFI", "MKR", "PAXG", "ADA", "BAT", "ENJ", "AXS", "DASH",
            "EOS", "BAL", "KNC", "ZRX", "SAND", "GRT", "QNT", "ETC", "ETHW", "1INCH",
            "CHZ", "CHR", "SUPER", "ELF", "OMG", "FTM", "MANA", "SOL", "ALGO", "LUNC",
            "UST", "ZEC", "XTZ", "AMP", "REN", "UMA", "SHIB", "LRC", "ANKR", "HBAR",
            "EGLD", "AVAX", "ONE", "GALA", "ALICE", "ATOM", "DYDX", "CELO", "STORJ",
            "SKL", "CTSI", "BAND", "ENS", "RNDR", "MASK", "APE"
        ];

        this.coinGeckoIdMap = {
            'BTC': 'bitcoin', 'ETH': 'ethereum', 'LTC': 'litecoin', 'XRP': 'ripple',
            'BCH': 'bitcoin-cash', 'USDC': 'usd-coin', 'XMR': 'monero', 'XLM': 'stellar',
            'USDT': 'tether', 'QCAD': 'qcad', 'DOGE': 'dogecoin', 'LINK': 'chainlink',
            'MATIC': 'matic-network', 'UNI': 'uniswap', 'COMP': 'compound-governance-token',
            'AAVE': 'aave', 'DAI': 'dai', 'SUSHI': 'sushi', 'SNX': 'synthetix-network-token',
            'CRV': 'curve-dao-token', 'DOT': 'polkadot', 'YFI': 'yearn-finance', 'MKR': 'maker',
            'PAXG': 'pax-gold', 'ADA': 'cardano', 'BAT': 'basic-attention-token', 'ENJ': 'enjincoin',
            'AXS': 'axie-infinity', 'DASH': 'dash', 'EOS': 'eos', 'BAL': 'balancer', 'KNC': 'kyber-network',
            'ZRX': '0x', 'SAND': 'the-sandbox', 'GRT': 'the-graph', 'QNT': 'quant-network', 'ETC': 'ethereum-classic',
            'ETHW': 'ethereum-pow', '1INCH': '1inch', 'CHZ': 'chiliz', 'CHR': 'chromia', 'SUPER': 'superfarm',
            'ELF': 'aelf', 'OMG': 'omisego', 'FTM': 'fantom', 'MANA': 'decentraland', 'SOL': 'solana',
            'ALGO': 'algorand', 'LUNC': 'terra-luna', 'UST': 'terrausd', 'ZEC': 'zcash', 'XTZ': 'tezos',
            'AMP': 'amp-token', 'REN': 'ren', 'UMA': 'uma', 'SHIB': 'shiba-inu', 'LRC': 'loopring',
            'ANKR': 'ankr', 'HBAR': 'hedera-hashgraph', 'EGLD': 'elrond', 'AVAX': 'avalanche-2',
            'ONE': 'harmony', 'GALA': 'gala', 'ALICE': 'my-neighbor-alice', 'ATOM': 'cosmos',
            'DYDX': 'dydx', 'CELO': 'celo', 'STORJ': 'storj', 'SKL': 'skale', 'CTSI': 'cartesi',
            'BAND': 'band-protocol', 'ENS': 'ethereum-name-service', 'RNDR': 'render-token',
            'MASK': 'mask-network', 'APE': 'apecoin'
        };

        // Initialize prices
        this.initPrices();
    }

    async initPrices() {
        try {
            const prices = await this.fetchCurrentPrices();
            this.assets.forEach(asset => {
                this.baselinePrices[asset] = prices[asset] || Math.random() * 100; // Default random value in [0,100]
                this.lastPrices[asset] = this.baselinePrices[asset];
            });
            console.log("Initialized market prices from CoinGecko.");
        } catch (error) {
            console.error("Error fetching prices, using random:", error);
            this.assets.forEach(asset => {
                this.baselinePrices[asset] = Math.random() * 100; // Fallback random baseline price
                this.lastPrices[asset] = this.baselinePrices[asset];
            });
        }
    }

    async fetchCurrentPrices() {
        const ids = Object.values(this.coinGeckoIdMap).join(',');
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=cad`;

        const response = await axios.get(url);
        const prices = {};

        this.assets.forEach(asset => {
            const id = this.coinGeckoIdMap[asset];
            if (id && response.data[id]) {
                prices[asset] = response.data[id].cad;
            }
        });

        return prices;
    }

    generatePrice(asset) {
        const lastPrice = this.lastPrices[asset];
        const trend = Math.random() - 0.48;  // Bias towards upward movement (0.5 would be neutral)
        const volatility = this.getPriceVolatility(asset);
        let change = lastPrice * volatility * trend;
        let newPrice = lastPrice + change;

        // Ensure price stays within 50% to 150% of the baseline price
        const minPrice = this.baselinePrices[asset] * 0.9; // 90% lower bound
        const maxPrice = this.baselinePrices[asset] * 1.1; // 110% upper bound
        newPrice = Math.max(minPrice, Math.min(newPrice, maxPrice));

        this.lastPrices[asset] = newPrice;
        return newPrice;
    }

    getPriceVolatility(asset) {
        const volatilityMap = {
            'BTC': 0.02, // BTC has relatively low volatility (2%)
            'ETH': 0.025,
            'USDT': 0.001, // Stablecoin, very low volatility (0.1%)
            'DOGE': 0.05,  // Higher volatility (5%)
            'SOL': 0.04    // Higher volatility (4%)
        };
        return volatilityMap[asset] || 0.03; // Default volatility (3%) for other crypto assets
    }
}


// Logger utility
class Logger {
    static info(message, data = {}) {
        console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data);
    }

    static error(message, error = {}) {
        console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error);
    }
}

// Create HTTP server
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Crypto WebSocket server is running\n');
});

// Initialize market state
const marketState = new MarketState();

// Create WebSocket server
const wss = new WebSocket.Server({
    server,
    path: '/markets/ws',
    maxPayload: 1024 // Limit message payload size to 1024 bytes (1 KB)
});

// Connection tracking
let connectionCount = 0;

// Handle WebSocket connections
wss.on('connection', function connection(ws, req) {
    if (connectionCount >= CONFIG.MAX_CONNECTIONS) {
        Logger.error('Max connections reached, rejecting connection');
        ws.close(1013, 'Maximum connections reached'); // 1013: Try Again Later
        return;
    }

    connectionCount++;
    const clientIp = req.socket.remoteAddress;
    Logger.info(`New client connected`, { clientIp, totalConnections: connectionCount });

    let subscribed = false;
    let intervalId;

    // Handle incoming messages
    ws.on('message', function incoming(message) {
        try {
            const msg = JSON.parse(message);

            // Validate message format
            if (!msg.event || !msg.channel) {
                throw new Error('Invalid message format');
            }

            // Handle subscription
            if (msg.event === 'subscribe') {
                if (msg.channel === CHANNELS.RATES && !subscribed) {
                    subscribed = true;
                    Logger.info('Client subscribed to rates', { clientIp });

                    // Start sending updates
                    intervalId = setInterval(() => {
                        if (ws.readyState === WebSocket.OPEN) {
                            marketState.assets.forEach(asset => {
                                sendMarketData(ws, asset);
                            });
                        }
                    }, CONFIG.PRICE_UPDATE_INTERVAL);
                } else {
                    ws.send(JSON.stringify({
                        event: 'error',
                        message: 'Invalid channel or already subscribed'
                    }));
                }
            }
        } catch (error) {
            Logger.error('Error processing message', error);
            ws.send(JSON.stringify({
                event: 'error',
                message: 'Invalid message format'
            }));
        }
    });

    // Handle client disconnect
    ws.on('close', () => {
        connectionCount--;
        Logger.info('Client disconnected', { clientIp, totalConnections: connectionCount });
        if (intervalId) {
            clearInterval(intervalId);
        }
    });

    // Handle errors
    ws.on('error', (error) => {
        Logger.error('WebSocket error', { error: error.message });
    });
});

function sendMarketData(ws, asset) {
    const spot = marketState.generatePrice(asset);
    const data = {
        channel: CHANNELS.RATES,
        event: 'data',
        data: {
            symbol: `${asset}_CAD`,
            timestamp: Math.floor(Date.now() / 1000), // Unix timestamp
            bid: spot * 0.995, // 0.995 used to simulate a bid-ask spread
            ask: spot * 1.005, // 1.005 simulating slight price markup
            spot: spot,
            change: ((spot - marketState.baselinePrices[asset]) / marketState.baselinePrices[asset]) * 100
        }
    };

    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
    }
}

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    Logger.info(`Server is listening on port ${PORT}`);
});

// Handle process termination
process.on('SIGTERM', () => {
    Logger.info('SIGTERM received. Closing server...');
    wss.close(() => {
        Logger.info('Server closed');
        process.exit(0);
    });
});
