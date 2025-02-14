import os
import time

import requests

# Directory to store logos
LOGO_DIR = "frontend/public/logos"
os.makedirs(LOGO_DIR, exist_ok=True)

# CoinGecko API Endpoint
API_URL = "https://api.coingecko.com/api/v3/coins/{}"

# List of cryptocurrencies
CRYPTO_LIST = [
    "bitcoin", "ethereum", "litecoin", "ripple", "bitcoin-cash", "usd-coin", "monero", "stellar", "tether", "qcad",
    "dogecoin", "chainlink", "matic-network", "uniswap", "compound-governance-token", "aave", "dai", "sushi",
    "synthetix-network-token", "curve-dao-token", "polkadot", "yearn-finance", "maker", "pax-gold", "cardano",
    "basic-attention-token", "enjincoin", "axie-infinity", "dash", "eos", "balancer", "kyber-network", "0x",
    "the-sandbox", "the-graph", "quant-network", "ethereum-classic", "ethereum-pow", "1inch", "chiliz", "chromia",
    "omisego", "fantom", "decentraland", "solana", "algorand", "zcash", "tezos", "shiba-inu", "avalanche-2",
    "cosmos", "dydx", "celo", "storj", "ethereum-name-service", "render-token", "mask-network", "apecoin",
    "superfarm", "aelf", "terra-luna", "terrausd", "amp-token", "ren", "uma", "loopring", "ankr",
    "hedera-hashgraph", "elrond", "harmony", "my-neighbor-alice", "skale", "cartesi", "band-protocol"
]

def download_logo(crypto_id):
    try:
        response = requests.get(API_URL.format(crypto_id))
        response.raise_for_status()
        data = response.json()
        logo_url = data["image"]["small"]

        # Save image
        img_data = requests.get(logo_url).content
        img_path = os.path.join(LOGO_DIR, f"{crypto_id}.png")
        with open(img_path, "wb") as img_file:
            img_file.write(img_data)

        print(f"✅ Saved: {crypto_id}.png")
        return True

    except requests.exceptions.RequestException as e:
        print(f"❌ Failed: {crypto_id} - {e}")
        return False

# Loop through and download all logos
for index, crypto in enumerate(CRYPTO_LIST):
    if download_logo(crypto):
        time.sleep(10)  # Sleep to avoid hitting rate limits

print("🎉 Done! All crypto logos downloaded into 'frontend/public/logos/' folder.")

