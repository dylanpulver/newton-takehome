#!/bin/bash

# Directory containing the logos
LOGO_DIR="./logos"

# Function to get the correct filename
get_ticker_name() {
    case "$1" in
    "0x") echo "zrx" ;;
    "1inch") echo "1inch" ;;
    "aave") echo "aave" ;;
    "algorand") echo "algo" ;;
    "apecoin") echo "ape" ;;
    "avalanche-2") echo "avax" ;;
    "axie-infinity") echo "axs" ;;
    "balancer") echo "bal" ;;
    "basic-attention-token") echo "bat" ;;
    "bitcoin-cash") echo "bch" ;;
    "btc") echo "btc" ;;
    "cardano") echo "ada" ;;
    "celo") echo "celo" ;;
    "chainlink") echo "link" ;;
    "chiliz") echo "chz" ;;
    "chromia") echo "chr" ;;
    "compound-governance-token") echo "comp" ;;
    "cosmos") echo "atom" ;;
    "curve-dao-token") echo "crv" ;;
    "dai") echo "dai" ;;
    "dash") echo "dash" ;;
    "decentraland") echo "mana" ;;
    "dogecoin") echo "doge" ;;
    "dydx") echo "dydx" ;;
    "enjincoin") echo "enj" ;;
    "eos") echo "eos" ;;
    "ethereum-classic") echo "etc" ;;
    "ethereum-name-service") echo "ens" ;;
    "ethereum-pow") echo "ethw" ;;
    "ethereum") echo "eth" ;;
    "fantom") echo "ftm" ;;
    "kyber-network") echo "knc" ;;
    "litecoin") echo "ltc" ;;
    "maker") echo "mkr" ;;
    "mask-network") echo "mask" ;;
    "matic-network") echo "matic" ;;
    "monero") echo "xmr" ;;
    "omisego") echo "omg" ;;
    "pax-gold") echo "paxg" ;;
    "polkadot") echo "dot" ;;
    "qcad") echo "qcad" ;;
    "quant-network") echo "qnt" ;;
    "render-token") echo "rndr" ;;
    "ripple") echo "xrp" ;;
    "shiba-inu") echo "shib" ;;
    "solana") echo "sol" ;;
    "stellar") echo "xlm" ;;
    "storj") echo "storj" ;;
    "sushi") echo "sushi" ;;
    "synthetix-snx") echo "snx" ;;
    "tether") echo "usdt" ;;
    "tezos") echo "xtz" ;;
    "the-graph") echo "grt" ;;
    "the-sandbox") echo "sand" ;;
    "uniswap") echo "uni" ;;
    "usd-coin") echo "usdc" ;;
    "yearn-finance") echo "yfi" ;;
    "zcash") echo "zec" ;;
    "superfarm") echo "super" ;;
    "aelf") echo "elf" ;;
    "terra-luna") echo "lunc" ;;
    "terrausd") echo "ust" ;;
    "amp-token") echo "amp" ;;
    "ren") echo "ren" ;;
    "uma") echo "uma" ;;
    "loopring") echo "lrc" ;;
    "ankr") echo "ankr" ;;
    "hedera-hashgraph") echo "hbar" ;;
    "elrond") echo "egld" ;;
    "harmony") echo "one" ;;
    "my-neighbor-alice") echo "alice" ;;
    "skale") echo "skl" ;;
    "cartesi") echo "ctsi" ;;
    "band-protocol") echo "band" ;;
    *) echo "" ;; # Return empty string if not found
    esac
}

# Loop through and rename files
for file in "$LOGO_DIR"/*.png; do
    filename=$(basename -- "$file" .png)
    new_name=$(get_ticker_name "$filename")

    if [ -n "$new_name" ]; then
        mv "$file" "$LOGO_DIR/$new_name.png"
        echo "Renamed: $filename.png → $new_name.png"
    else
        echo "Skipping: $filename.png (No match found)"
    fi
done

echo "✅ All icons renamed successfully!"
